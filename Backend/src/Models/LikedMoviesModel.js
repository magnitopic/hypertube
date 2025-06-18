// Local Imports:
import Model from '../Core/Model.js';

class LikedMoviesModel extends Model {
    constructor() {
        super('liked_movies');
    }

    async isMovieLiked(userId, movieId) {
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

const likedMoviesModel = new LikedMoviesModel();
export default likedMoviesModel;
