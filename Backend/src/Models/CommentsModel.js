import Model from '../Core/Model.js';

class CommentsModel extends Model {
    constructor() {
        super('comments');
    }

    async getCommentsWithUsernames(limit = 50) {
        const query = {
            text: `
                SELECT 
                    c.id,
                    c.content,
                    c.movie_id,
                    c.created_at,
                    u.username
                FROM ${this.table} c
                JOIN users u ON c.user_id = u.id
                ORDER BY c.created_at DESC
                LIMIT $1;
            `,
            values: [limit],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];
            return result.rows;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async getCommentWithUsername(commentId) {
        const query = {
            text: `
            SELECT 
                c.id,
                c.content,
                c.movie_id,
                c.created_at,
                u.username,
                u.id as user_id
            FROM ${this.table} c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = $1;
        `,
            values: [commentId],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];

            const comment = result.rows[0];
            const { API_HOST, API_PORT, API_VERSION } = process.env;
            comment.profilePicture = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${comment.user_id}/profile-picture`;

            return comment;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async getCommentsByMovieId(movieId, limit = 20) {
        const query = {
            text: `
            SELECT 
                c.id,
                c.content,
                c.movie_id,
                c.created_at,
                u.username,
                u.id as user_id
            FROM ${this.table} c
            JOIN users u ON c.user_id = u.id
            WHERE c.movie_id = $1
            ORDER BY c.created_at DESC
            LIMIT $2;
        `,
            values: [movieId, limit],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];

            const { API_HOST, API_PORT, API_VERSION } = process.env;
            const commentsWithProfilePictures = result.rows.map((comment) => ({
                ...comment,
                profilePicture: `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${comment.user_id}/profile-picture`,
            }));

            return commentsWithProfilePictures;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async getCommentCountByMovieId(movieId) {
        const query = {
            text: `
                SELECT COUNT(*) as comment_count
                FROM ${this.table}
                WHERE movie_id = $1;
            `,
            values: [movieId],
        };

        try {
            const result = await this.db.query(query);
            return parseInt(result.rows[0].comment_count) || 0;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return 0;
        }
    }

    async updateComment(commentId, userId, content) {
        const query = {
            text: `
                UPDATE ${this.table} 
                SET content = $1, updated_at = NOW()
                WHERE id = $2 AND user_id = $3
                RETURNING *;
            `,
            values: [content, commentId, userId],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];
            return result.rows[0];
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async deleteComment(commentId, userId) {
        const query = {
            text: `
                DELETE FROM ${this.table} 
                WHERE id = $1 AND user_id = $2
                RETURNING *;
            `,
            values: [commentId, userId],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows[0] === undefined) return false;
            return true;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }
}

const commentsModel = new CommentsModel();
export default commentsModel;
