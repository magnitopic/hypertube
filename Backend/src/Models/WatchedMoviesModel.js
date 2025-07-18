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

    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
        const columns = keys.join(', ');

        const query = `
            INSERT INTO ${this.table} (${columns})
            VALUES (${placeholders})
            RETURNING *;
        `;

        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async update(data, conditions) {
        const setKeys = Object.keys(data);
        const conditionKeys = Object.keys(conditions);

        const setClause = setKeys
        .map((key, idx) => `${key} = $${idx + 1}`)
        .join(', ');

        const conditionClause = conditionKeys
        .map((key, idx) => `${key} = $${setKeys.length + idx + 1}`)
        .join(' AND ');

        const values = [
        ...Object.values(data),
        ...Object.values(conditions),
        ];

        const query = `
            UPDATE ${this.table}
            SET ${setClause}
            WHERE ${conditionClause}
            RETURNING *;
        `;

        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async getLatestWatchedMoviesByUser(userId, limit = 5) {
        const query = {
            text: `
                SELECT 
                    m.id,
                    m.title,
                    m.year,
                    m.thumbnail,
                    m.rating,
                    wm.watched_at
                FROM ${this.table} wm
                JOIN movies m ON wm.movie_id = m.id
                WHERE wm.user_id = $1
                ORDER BY wm.watched_at DESC
                LIMIT $2;
            `,
            values: [userId, limit],
        };

        try {
            const result = await this.db.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error getting latest watched movies:', error.message);
            return null;
        }
    }
}

const watchedMoviesModel = new WatchedMoviesModel();
export default watchedMoviesModel;
