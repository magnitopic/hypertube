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

    async getTotalLikes(movieId) {
        const count = await this.countRecordsByReference({
            movie_id: movieId,
        });
        return count || 0;
    }

    async toggleLike(userId, movieId) {
        const isLiked = await this.isMovieLiked(userId, movieId);

        if (isLiked) {
            // Unlike the movie
            const result = await this.deleteByReference({
                user_id: userId,
                movie_id: movieId,
            });
            const totalLikes = await this.getTotalLikes(movieId);
            return { liked: false, success: result, totalLikes };
        } else {
            // Like the movie
            const result = await this.create({
                input: {
                    user_id: userId,
                    movie_id: movieId,
                },
            });
            const totalLikes = await this.getTotalLikes(movieId);
            return { liked: true, success: result !== null, totalLikes };
        }
    }
}

const likedMoviesModel = new LikedMoviesModel();
export default likedMoviesModel;
