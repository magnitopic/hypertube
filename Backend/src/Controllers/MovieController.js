import mime from 'mime-types';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs';
import path from 'path';
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import likedMoviesModel from '../Models/LikedMoviesModel.js';
import commentsModel from '../Models/CommentsModel.js';
import { getMovieGenres } from '../Utils/moviesUtils.js';
import TorrentClient from '../Core/TorrentClient.js';

// fluent-ffmpeg
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
} else {
    console.error(
        '[FFMPEG] ffmpeg-static not found. Subtitle/video conversion will fail.'
    );
}

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
        const totalLikes = await likedMoviesModel.getTotalLikes(movie.id);
        const commentCount = await commentsModel.getCommentCountByMovieId(
            movie.id
        );
        const subtitles = await MovieController.getSubtitlesList(movie.id);

        movie.isLiked = isLiked;
        movie.totalLikes = totalLikes;
        movie.commentCount = commentCount;
        movie.subtitles = subtitles;

        return res.json({ msg: movie });
    }

    static async getAllMovies(req, res) {
        try {
            const movies = await moviesModel.getAll();

            if (movies === null) {
                return res
                    .status(500)
                    .json({ message: 'Internal server error' });
            }

            return res.status(200).json(movies);
        } catch (error) {
            console.error('Error in getAllMovies:', error.message);
            return res.status(500).json({ message: 'Something went wrong' });
        }
    }

    static async getGenres(req, res) {
        const movieGenres = await getMovieGenres();
        if (!movieGenres) {
            return res
                .status(502)
                .json({ msg: StatusMessage.ERROR_GETTING_GENRES });
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
            let preferred = torrent.info.files.find((f) => {
                const fullPath = f.path.map((p) => p.toString()).join('/');
                return fullPath.toLowerCase().endsWith('.mp4');
            });
            if (!preferred) {
                preferred = torrent.info.files.find((f) => {
                    const fullPath = f.path.map((p) => p.toString()).join('/');
                    return videoExtensions.some((ext) =>
                        fullPath.toLowerCase().endsWith(ext)
                    );
                });
            }
            filePathInTorrent = (preferred || torrent.info.files[0]).path
                .map((p) => p.toString())
                .join('/');
        } else {
            filePathInTorrent = torrent.info.name.toString();
        }

        const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
        const originalFilePath = path.resolve(
            MOVIES_PATH,
            torrent.info.name.toString(),
            filePathInTorrent
        );
        const mp4LocalPath = path.resolve(MOVIES_PATH, `${id}.mp4`);
        const ext = path.extname(filePathInTorrent).toLowerCase();

        const baseUrl = webSeeds[0].endsWith('/')
            ? webSeeds[0]
            : webSeeds[0] + '/';
        const streamingUrl = `${baseUrl}${torrent.info.name.toString()}/${filePathInTorrent}`;

        try {
            const start = Number(range.replace(/\D/g, ''));
            const CHUNK_SIZE = 1_000_000;
            const end = start + CHUNK_SIZE - 1;

            // Size of remote file (torrent web seed)
            const remoteSize = await client.getRemoteFileSize(streamingUrl);
            if (!remoteSize || isNaN(remoteSize)) {
                return res.status(500).send('Failed to get remote file size');
            }
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
                client
                    .streamAndDownload(
                        streamingUrl,
                        originalFilePath,
                        start,
                        safeEnd
                    )
                    .catch((err) => console.error('[Download error]', err));

                // If ffmpeg process not started yet, start it:
                if (!this.ffmpegProcess) {
                    console.log(
                        `[CONVERT] Starting ffmpeg to convert ${originalFilePath} -> ${mp4LocalPath}`
                    );
                    this.ffmpegProcess = ffmpeg(originalFilePath)
                        .outputOptions('-movflags frag_keyframe+empty_moov')
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .format('mp4')
                        .on('error', (err) => {
                            console.error('[FFMPEG ERROR]', err);
                            this.ffmpegProcess = null;
                        })
                        .on('end', () => {
                            console.log('[FFMPEG] Conversion finished');
                            this.ffmpegProcess = null;
                        })
                        .save(mp4LocalPath);
                }

                // Stream from mp4 local file
                const stream = fs.createReadStream(mp4LocalPath, {
                    start,
                    end: safeEnd,
                });
                stream.pipe(res);
            } else {
                // File is .mp4 already
                const stats = fs.existsSync(mp4LocalPath)
                    ? fs.statSync(mp4LocalPath)
                    : null;

                if (stats && stats.size >= safeEnd + 1) {
                    // local stream when enought data
                    const stream = fs.createReadStream(mp4LocalPath, {
                        start,
                        end: safeEnd,
                    });
                    stream.pipe(res);
                } else {
                    // download partialy & stream
                    const stream = await client.streamAndDownload(
                        streamingUrl,
                        mp4LocalPath,
                        start,
                        safeEnd
                    );
                    stream.pipe(res);
                }
            }
        } catch (error) {
            console.error('Streaming error:', error.message);
            return res.status(500).send('Error streaming video');
        }
    }

    // Helper method to convert subtitle file to VTT
    static async convertToVtt(sourcePath, targetPath) {
        return new Promise((resolve, reject) => {
            console.log(
                `[SUB] Starting conversion ${sourcePath} -> ${targetPath}`
            );
            ffmpeg(sourcePath)
                .toFormat('webvtt')
                .on('end', async () => {
                    try {
                        let vttContent = fs.readFileSync(targetPath, 'utf8');
                        if (!vttContent.startsWith('WEBVTT')) {
                            vttContent = 'WEBVTT\n\n' + vttContent;
                            fs.writeFileSync(targetPath, vttContent, 'utf8');
                        }
                        console.log(
                            `[SUB] Successfully converted ${sourcePath} -> ${targetPath}`
                        );
                        resolve();
                    } catch (err) {
                        console.error(
                            '[SUB] Failed to validate VTT:',
                            err.message
                        );
                        reject(err);
                    }
                })
                .on('error', (err) => {
                    console.error(
                        `[FFMPEG Sub Error] (${sourcePath} -> ${targetPath}):`,
                        err.message
                    );
                    reject(err);
                })
                .save(targetPath);
        });
    }

    static async getSubtitles(torrent, baseUrl, movieId, client) {
        const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
        const subtitleExtensions = ['.srt', '.ass', '.vtt'];

        if (!torrent.info.files) return;

        const subtitleFiles = torrent.info.files
            .filter((f) =>
                subtitleExtensions.some((ext) =>
                    f.path
                        .map((p) => p.toString())
                        .join('/')
                        .toLowerCase()
                        .endsWith(ext)
                )
            )
            .map((f) => f.path.map((p) => p.toString()).join('/'));

        const tasks = subtitleFiles.map(async (subFilePath) => {
            const fullSubUrl = `${baseUrl}${torrent.info.name.toString()}/${subFilePath}`;
            const subExt = path.extname(subFilePath).toLowerCase();

            let lang = 'unknown';
            const lower = subFilePath.toLowerCase();
            if (lower.match(/(\.|_|-|\/)en(\.|_|-|\/|$)/)) lang = 'en';
            else if (lower.match(/(\.|_|-|\/)es(\.|_|-|\/|$)/)) lang = 'es';
            else if (lower.match(/(\.|_|-|\/)de(\.|_|-|\/|$)/)) lang = 'de';
            else {
                lang = 'auto';
            }
            const subDir = path.resolve(MOVIES_PATH, movieId, 'subs');
            const subPath = path.resolve(subDir, lang + subExt);
            const vttPath = path.resolve(subDir, lang + '.vtt');

            if (!fs.existsSync(subDir)) {
                fs.mkdirSync(subDir, { recursive: true });
            }

            let needDownload = false;
            if (!fs.existsSync(subPath)) {
                needDownload = true;
            } else {
                const stats = fs.statSync(subPath);
                if (stats.size < 100) {
                    needDownload = true;
                    console.log(
                        `[SUB] .srt found but too small (${stats.size} bytes), will re-download: ${subPath}`
                    );
                }
            }
            if (needDownload) {
                await client.streamAndDownload(
                    fullSubUrl,
                    subPath,
                    0,
                    1_000_000,
                    true
                );
                console.log(`[SUB] Download finished: ${subPath}`);
            } else {
                console.log(
                    `[SUB] Subtitle already exists and is valid: ${subPath}`
                );
            }

            // Check if we need to convert to VTT
            let needsVtt = false;
            if (!fs.existsSync(vttPath)) {
                needsVtt = true;
                console.log(`[SUB] .vtt not found, will convert: ${vttPath}`);
            } else {
                try {
                    const vttContent = fs.readFileSync(vttPath, 'utf8');
                    if (
                        !vttContent.trim().startsWith('WEBVTT') ||
                        vttContent.trim().length < 10
                    ) {
                        needsVtt = true;
                        console.warn(
                            `[SUB] Invalid or empty .vtt file, forcing reconversion: ${vttPath}`
                        );
                    }
                } catch (e) {
                    needsVtt = true;
                }
            }

            // Convert if needed
            if (subExt !== '.vtt' && needsVtt) {
                try {
                    await MovieController.convertToVtt(subPath, vttPath);
                    console.log(`[SUB] Conversion to VTT finished: ${vttPath}`);
                } catch (error) {
                    console.error(
                        `[FFMPEG Sub Critical Error] Failed to convert subtitle: ${error.message}`
                    );
                }
            } else if (subExt !== '.vtt') {
                console.log(
                    `[SUB] VTT already exists and is valid: ${vttPath}`
                );
            }
        });

        await Promise.all(tasks);
    }

    static async getSubtitlesList(movieId) {
        const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
        const subsDir = path.resolve(MOVIES_PATH, movieId, 'subs');

        try {
            let subtitles = [];
            if (fs.existsSync(subsDir)) {
                const files = fs.readdirSync(subsDir);
                subtitles = files
                    .filter((f) => f.endsWith('.vtt'))
                    .map((f) => {
                        const lang = path.basename(f, '.vtt');
                        return {
                            lang,
                            label:
                                lang === 'en'
                                    ? 'English'
                                    : lang === 'es'
                                      ? 'Español'
                                      : lang === 'de'
                                        ? 'German'
                                        : lang,
                            url: `/movies/${movieId}/subs/${f}`,
                        };
                    });
            }
            return subtitles;
        } catch (error) {
            console.error('Error getting subtitles list:', error);
            return [];
        }
    }

    static async fetchSubtitles(req, res) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ msg: 'Missing movie ID' });
        }

        // download/conversion in background (no await)
        try {
            const movie = await moviesModel.getById({ id });
            if (!movie || !movie.torrent_url) return;
            const client = new TorrentClient(id, movie.torrent_url);
            const torrent = await client.openTorrent();
            if (!torrent) return;
            const webSeeds = client.getWebSeeds(torrent);
            if (!webSeeds.length) return;
            const baseUrl = webSeeds[0].endsWith('/')
                ? webSeeds[0]
                : webSeeds[0] + '/';
            await MovieController.getSubtitles(torrent, baseUrl, id, client);

            const subtitles = await MovieController.getSubtitlesList(id);
            return res.json({ subtitles });
        } catch (err) {
            console.error('[SUBTITLE FETCH ERROR - background]', err.message);
        }
    }

    static serveSubtitleFile(req, res) {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const { id, file } = req.params;
        const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
        const absPath = path.resolve(MOVIES_PATH, id, 'subs', file);

        if (!fs.existsSync(absPath)) {
            return res.status(404).send('Subtitle not found');
        }

        res.setHeader('Content-Type', 'text/vtt');
        res.sendFile(absPath);
    }

    static async toggleLike(req, res) {
        const userId = req.session.user.id;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
        }

        // Check if movie exists
        const movie = await moviesModel.getById({ id });
        if (!movie || movie.length === 0) {
            return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });
        }

        try {
            const result = await likedMoviesModel.toggleLike(userId, id);

            if (result.success) {
                return res.json({
                    msg: 'Like status updated successfully',
                    liked: result.liked,
                    totalLikes: result.totalLikes,
                });
            } else {
                return res
                    .status(500)
                    .json({ msg: 'Failed to update like status' });
            }
        } catch (error) {
            console.error('Error toggling like:', error.message);
            return res.status(500).json({ msg: 'Internal server error' });
        }
    }
}
