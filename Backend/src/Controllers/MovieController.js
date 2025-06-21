// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import likedMoviesModel from '../Models/LikedMoviesModel.js';
import { getMovieGenres } from '../Utils/moviesUtils.js';
import TorrentClient from '../Core/TorrentClient.js';
import WebTorrent from 'webtorrent';


export default class MovieController {
    static async moviePage(req, res) {
        const userId = req.session.user.id;
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const movie = await moviesModel.getById({ id });
        if (!movie)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (movie.length === 0)
            return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });

        const isLiked = await likedMoviesModel.isMovieLiked(userId, movie.id);
        movie.isLiked = isLiked;

        return res.json({ msg: movie });
    }

    static async getGenres(req, res) {
        const movieGenres = await getMovieGenres();
        if (!movieGenres)
            return res
                .status(502)
                .json({ msg: StatusMessage.ERROR_GETTING_GENRES });

        return res.json({ msg: movieGenres });
    }

    static async streamMovie(req, res) {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const movie = await moviesModel.getById({ id });
        if (!movie || !movie.torrent_url)
            return res.status(404).json({ msg: StatusMessage.MOVIE_NOT_FOUND });

        const client = new WebTorrent();
        let responded = false;

        client.add(movie.torrent_url, (torrent) => {
            const file = torrent.files.find(f => f.name.endsWith('.mp4')) || torrent.files[0];
            if (!file) {
                if (!responded) {
                    responded = true;
                    res.status(404).json({ msg: 'No video file found in torrent.' });
                }
                client.destroy();
                return;
            }
            res.writeHead(200, {
                'Content-Length': file.length,
                'Content-Type': 'video/mp4',
            });
            const stream = file.createReadStream();
            stream.pipe(res);

            stream.on('error', (err) => {
                if (!responded) {
                    responded = true;
                    res.status(500).json({ msg: 'Error streaming video.' });
                }
                if (!client.destroyed) client.destroy();
            });
            res.on('close', () => {
                if (!client.destroyed) client.destroy();
            });
        });

        setTimeout(() => {
            if (!responded) {
                responded = true;
                if (!res.headersSent) {
                    res.status(504).json({ msg: 'No seeds or slow torrent.' });
                }
                if (!client.destroyed) client.destroy();
            }
        }, 20000); // 20 seconds
    }
}
