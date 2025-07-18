// Local Imports:
import Model from '../Core/Model.js';
import {
    getSearchValues,
    getMoviesOrder,
    getOrderType,
} from '../Utils/moviesUtils.js';

class MoviesModel extends Model {
    constructor() {
        super('movies');
    }

    async searchMovies(page, limit, userQuery) {
        const offset = (page - 1) * limit;
        const orderedBy = getMoviesOrder(userQuery.orderedBy);
        const orderType = getOrderType(userQuery.orderType);

        const result = getSearchValues(userQuery);
        const searchQueries = result.searchQueries;
        let values = result.values;
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

        values.push(offset);
        const offsetReference = `$${values.length}`;

        const query = {
            text: `SELECT ${fields} FROM ${this.table} WHERE ${searchQueries} ORDER BY ${orderedBy} ${orderType} LIMIT ${limit} OFFSET ${offsetReference};`,
            values: values,
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

    async isDuplicatedMovie(tmdbId) {
        const query = {
            text: `SELECT * FROM ${this.table} WHERE tmdb_id = $1;`,
            values: [tmdbId],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return false;
            return true;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async getRandomMovie() {
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

        const query = {
            text: `SELECT ${fields} FROM ${this.table} ORDER BY RANDOM() LIMIT 1;`,
            values: [],
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return null;
            return result.rows[0];
        } catch (error) {
            console.error('Error getting random movie: ', error.message);
            return null;
        }
    }
}

const moviesModel = new MoviesModel();
export default moviesModel;
