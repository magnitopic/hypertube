// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import likedMoviesModel from '../Models/LikedMoviesModel.js';
import { getMovieGenres } from '../Utils/moviesUtils.js';

export default class LibraryController {
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
}
