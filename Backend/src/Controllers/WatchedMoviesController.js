// Local imports
import watchedMoviesModel from "../Models/WatchedMoviesModel.js";
import StatusMessage from '../Utils/StatusMessage.js';

export default class WatchedMoviesController {
    static async createOrUpdateWatchedMovie(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized'})
            }

            const alreadyWatched = await watchedMoviesModel.isMovieWatched(userId, id);

            if (alreadyWatched) // if already exists: update
            {
                await watchedMoviesModel.update(
                    { watched_at: 'NOW()' },
                    { user_id: userId, movie_id: id }
                );
            } else { // if not exists: create new one
                await watchedMoviesModel.create(
                    { user_id: userId, movie_id: id }
                );
            }

            return res.status(200).json({ success: true });
        } catch (err) {
            console.error('Error creating/updating watched movie:', err);
            return res.status(500).json({ error: 'Server error' });
        }
    }

    static async getLatestWatchedMovies(req, res) {
        try {
            const { userId } = req.params;
            const limit = parseInt(req.query.limit) || 5;

            if (!userId) {
                return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
            }

            const watchedMovies = await watchedMoviesModel.getLatestWatchedMoviesByUser(userId, limit);

            if (watchedMovies === null) {
                return res.status(500).json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            }

            return res.json({ msg: watchedMovies });
        } catch (error) {
            console.error('Error getting latest watched movies:', error);
            return res.status(500).json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        }
    }
}