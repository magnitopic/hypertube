// Local Imports:
import Model from '../Core/Model.js';

class WatchedMoviesModel extends Model {
    constructor() {
        super('watched_movies');
    }

    async isMovieWatched(userId, movieId) {
        const result = await this.getByReference(
            {
                user_id: userId,
                movie_id: movieId,
            },
            false
        );
        if (!result) return false;

        if (result.length === 0) return false;

        return true;
    }
}

const watchedMoviesModel = new WatchedMoviesModel();
export default watchedMoviesModel;
