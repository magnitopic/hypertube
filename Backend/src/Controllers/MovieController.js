import mime from 'mime-types';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import likedMoviesModel from '../Models/LikedMoviesModel.js';
import { getMovieGenres } from '../Utils/moviesUtils.js';
import TorrentClient from '../Core/TorrentClient.js';

export default class MovieController {
  static async moviePage(req, res) {
    const userId = req.session.user.id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
    }

    const movie = await moviesModel.getById({ id });
    if (!movie || movie.length === 0) {
      return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });
    }

    const isLiked = await likedMoviesModel.isMovieLiked(userId, movie.id);
    movie.isLiked = isLiked;

    return res.json({ msg: movie });
  }

  static async getGenres(req, res) {
    const movieGenres = await getMovieGenres();
    if (!movieGenres) {
      return res.status(502).json({ msg: StatusMessage.ERROR_GETTING_GENRES });
    }
    return res.json({ msg: movieGenres });
  }

  static async streamMovie(req, res) {
    const { id } = req.params;
    const range = req.headers.range;
    if (!range) {
      return res.status(400).send('Requires Range header');
    }

    const movie = await moviesModel.getById({ id });
    if (!movie || !movie.torrent_url) {
      return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });
    }

    const client = new TorrentClient(id, movie.torrent_url);
    const torrent = await client.openTorrent();
    if (!torrent) {
      return res.status(500).send('Failed to load torrent');
    }

    const webSeeds = client.getWebSeeds(torrent);
    if (!webSeeds.length) {
      return res.status(404).send('No web seeds found :(');
    }

    let filePathInTorrent;
    const videoExtensions = ['.mkv', '.avi', '.mov', '.webm'];
    if (torrent.info.files) {
      // Look for .mp4 first
      let preferred = torrent.info.files.find(f => {
        const fullPath = f.path.map(p => p.toString()).join('/');
        return fullPath.toLowerCase().endsWith('.mp4');
      });
      if (!preferred) {
        preferred = torrent.info.files.find(f => {
          const fullPath = f.path.map(p => p.toString()).join('/');
          return videoExtensions.some(ext => fullPath.toLowerCase().endsWith(ext));
        });
      }
      filePathInTorrent = (preferred || torrent.info.files[0]).path.map(p => p.toString()).join('/');
    } else {
      filePathInTorrent = torrent.info.name.toString();
    }

    const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
    const originalFilePath = path.resolve(MOVIES_PATH, torrent.info.name.toString(), filePathInTorrent);
    const mp4LocalPath = path.resolve(MOVIES_PATH, `${id}.mp4`);
    const ext = path.extname(filePathInTorrent).toLowerCase();

    const baseUrl = webSeeds[0].endsWith('/') ? webSeeds[0] : webSeeds[0] + '/';
    const streamingUrl = `${baseUrl}${torrent.info.name.toString()}/${filePathInTorrent}`;

    try {
      const start = Number(range.replace(/\D/g, ''));
      const CHUNK_SIZE = 1_000_000;
      const end = start + CHUNK_SIZE - 1;

      // Size of remote file (torrent web seed)
      const remoteSize = await client.getRemoteFileSize(streamingUrl);
      const safeEnd = Math.min(end, remoteSize - 1);
      const contentLength = safeEnd - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${safeEnd}/${remoteSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': mime.lookup('.mp4') || 'video/mp4',
      });

      if (ext !== '.mp4') {
        // Start downloading original partially
        client.streamAndDownload(streamingUrl, originalFilePath, start, safeEnd)
        .catch(err => console.error('[Download error]', err));

        // If ffmpeg process not started yet, start it:
        if (!this.ffmpegProcess) {
          console.log(`[CONVERT] Starting ffmpeg to convert ${originalFilePath} -> ${mp4LocalPath}`);
          this.ffmpegProcess = ffmpeg(originalFilePath)
            .outputOptions('-movflags frag_keyframe+empty_moov')
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
            .on('error', err => {
              console.error('[FFMPEG ERROR]', err);
              this.ffmpegProcess = null;
            })
            .on('end', () => {
              console.log('[FFMPEG] Conversion finished');
              this.ffmpegProcess = null;
            })
            .save(mp4LocalPath);
        }

        // Wait until the mp4 local file has enough bytes to serve this chunk
        //await waitForLocalFile(mp4LocalPath, safeEnd + 1, 10000);

        // Stream from mp4 local file
        const stream = fs.createReadStream(mp4LocalPath, { start, end: safeEnd });
        stream.pipe(res);
      } else {
        // File is .mp4 already
        const stats = fs.existsSync(mp4LocalPath) ? fs.statSync(mp4LocalPath) : null;

        if (stats && stats.size >= safeEnd + 1) {
          // local stream when enought data
          const stream = fs.createReadStream(mp4LocalPath, { start, end: safeEnd });
          stream.pipe(res);
        } else {
          // download partialy & stream
          const stream = await client.streamAndDownload(streamingUrl, mp4LocalPath, start, safeEnd);
          stream.pipe(res);
        }
      }
    } catch (error) {
      console.error('Streaming error:', error.message);
      return res.status(500).send('Error streaming video');
    }
  }
}

function waitForLocalFile(filePath, size, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      fs.stat(filePath, (err, stats) => {
        if (!err && stats.size >= size) return resolve();
        if (Date.now() - start > timeoutMs) return reject(new Error('Timeout waiting bytes'));
        setTimeout(check, 50);
      });
    })();
  });
}
