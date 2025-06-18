// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import moviesModel from '../Models/MoviesModel.js';
import {
    getWatchAndLikeStatus,
    invalidSearchQuery,
} from '../Utils/moviesUtils.js';

export default class LibraryController {
    static async search(req, res) {
        const userId = req.session.user.id;
        const { page } = req.params;
        if (isNaN(page))
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        if (invalidSearchQuery(req.query))
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const movies = await moviesModel.searchMovies(page, 8, req.query);
        if (!movies)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        await getWatchAndLikeStatus(userId, movies);

        return res.json({ msg: movies });
    }

    static async library(req, res) {
        const userId = req.session.user.id;
        const { page } = req.params;
        if (isNaN(page))
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const fields = [
            'id',
            'title',
            'year',
            'rating',
            'thumbnail',
            'popularity',
            'language',
            'genres',
        ];
        const movies = await moviesModel.getPaginatedRecords(
            page,
            8,
            'popularity',
            'DESC',
            fields
        );
        if (!movies)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

        await getWatchAndLikeStatus(userId, movies);

        return res.json({ msg: movies });
    }
}
