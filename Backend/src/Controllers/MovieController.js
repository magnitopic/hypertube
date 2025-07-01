import mime from 'mime-types';
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

    // Determine main file path inside torrent (.mp4)
    let filePathInTorrent;
    if (torrent.info.files) {
      const preferred = torrent.info.files.find(f =>
        f.path.map(p => p.toString()).join('/').endsWith('.mp4')
      );
      filePathInTorrent = (preferred || torrent.info.files[0]).path.map(p => p.toString()).join('/');
    } else {
      filePathInTorrent = torrent.info.name.toString();
    }

    const baseUrl = webSeeds[0].endsWith('/') ? webSeeds[0] : webSeeds[0] + '/';
    const torrentFolder = torrent.info.name.toString();
    const streamingUrl = `${baseUrl}${torrentFolder}/${filePathInTorrent}`;

    const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
    const localPath = path.resolve(MOVIES_PATH, `${id}.mp4`);

    const start = Number(range.replace(/\D/g, ''));
    const CHUNK_SIZE = 1_000_000;
    const end = start + CHUNK_SIZE - 1;

    try {
      // Wait range to be completly downloaded and serve it
      const remoteSize = await client.getRemoteFileSize(streamingUrl);
      const safeEnd = Math.min(end, remoteSize - 1);
      const contentLength = safeEnd - start + 1;

      // TODO: stream logs
      console.log(`[STREAM] id=${id}`);
      console.log(`[STREAM] streamingUrl: ${streamingUrl}`);
      console.log(`[STREAM] localPath: ${localPath}`);
      console.log(`[STREAM] start: ${start}, safeEnd: ${safeEnd}, contentLength: ${contentLength}`);
      if (!fs.existsSync(localPath)) {
        console.log(`[STREAM] local file does not exist, should start downloading...`);
      } else {
        const stats = fs.statSync(localPath);
        console.log(`[STREAM] local file exists, size: ${stats.size}`);
      }

      // Start download
      const downloadPromise = client.streamAndDownload(streamingUrl, localPath, start, safeEnd);

      // Wait local file size = 10s 
      await waitForLocalFile(localPath, safeEnd + 1, 10000);

      const statsAfter = fs.existsSync(localPath) ? fs.statSync(localPath) : null;
      if (!statsAfter || statsAfter.size < safeEnd + 1) {
        console.error(`[STREAM][ERROR] Not enought bytes. size=${statsAfter ? statsAfter.size : 0}, waiting=${safeEnd + 1}`);
        return res.status(503).send('Video not ready, try again');
      } else {
        console.log(`[STREAM] local file size after wait: ${statsAfter.size}`);
      }

      const stream = fs.createReadStream(localPath, { start, end: safeEnd });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${safeEnd}/${remoteSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': mime.lookup(filePathInTorrent) || 'application/octet-stream',
      });

      stream.pipe(res);
    } catch (error) {
      console.error('Streaming error:', error.message);
      if (error.message && error.message.includes('Timeout esperando bytes locales')) {
        if (fs.existsSync(localPath)) {
          const stats = fs.statSync(localPath);
          console.error(`[STREAM][TIMEOUT] local file size: ${stats.size}`);
        } else {
          console.error(`[STREAM][TIMEOUT] local file does not exist`);
        }
        console.error(`[STREAM][TIMEOUT] streamingUrl: ${streamingUrl}`);
      }
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
