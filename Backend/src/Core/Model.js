// Local Imports:
import db from '../Utils/dataBaseConnection.js';

export default class Model {
    constructor(table) {
        this.db = db;
        this.table = table;
    }

    async getAll() {
        const query = {
            text: `SELECT * FROM ${this.table};`,
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

    async getById({ id }) {
        const query = {
            text: `SELECT * FROM ${this.table} WHERE id = $1;`,
            values: [id],
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

    async create({ input }) {
        const fields = Object.keys(input).join(', ');
        const values = Object.values(input);
        const placeholders = values
            .map((_, index) => `$${index + 1}`)
            .join(', ');

        const query = {
            text: `INSERT INTO ${this.table} (${fields}) VALUES (${placeholders}) RETURNING *;`,
            values: values,
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

    async update({ input, id }) {
        const fields = Object.keys(input)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values = Object.values(input);
        values.push(id);

        const query = {
            text: `UPDATE ${this.table} SET ${fields} WHERE id = $${values.length} RETURNING *;`,
            values: values,
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

    async createOrUpdate({ input, keyName }) {
        const createFields = Object.keys(input).join(', ');
        const updateFields = Object.keys(input)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        const values = Object.values(input);
        const createPlaceholders = values
            .map((_, index) => `$${index + 1}`)
            .join(', ');

        const query = {
            text: `INSERT INTO ${this.table} (${createFields}) VALUES (${createPlaceholders})
                ON CONFLICT (${keyName})
                DO UPDATE SET ${updateFields}
                RETURNING *;`,
            values: values,
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

    async updateByReference(input, reference) {
        const fields = Object.keys(input)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        let values = Object.values(input);

        const references = Object.keys(reference)
            .map(
                (key, index) =>
                    `${key} = $${Object.keys(input).length + index + 1}`
            )
            .join(' AND ');
        values.push(...Object.values(reference));

        const query = {
            text: `UPDATE ${this.table} SET ${fields} WHERE ${references} RETURNING *;`,
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

    async delete({ id }) {
        const query = {
            text: `DELETE FROM ${this.table} WHERE id = $1 RETURNING *;`,
            values: [id],
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

    async deleteByReference(reference) {
        const fields = Object.keys(reference)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(reference);

        const query = {
            text: `DELETE FROM ${this.table} WHERE ${fields} RETURNING *;`,
            values: values,
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

    async getByReference(reference, onlyOneRecord) {
        const fields = Object.keys(reference)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(reference);

        const query = {
            text: `SELECT * FROM ${this.table} WHERE ${fields};`,
            values: values,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return [];
            if (onlyOneRecord) return result.rows[0];
            return result.rows;
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async findOne(input) {
        const fields = Object.keys(input)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' OR ');
        const values = Object.values(input);

        const query = {
            text: `SELECT * FROM ${this.table} WHERE ${fields};`,
            values: values,
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

    async countRecordsByReference(reference) {
        const fields = Object.keys(reference)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(reference);

        const query = {
            text: `SELECT COUNT(*) AS matching_records FROM ${this.table} WHERE ${fields};`,
            values: values,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return 0;
            return parseInt(result.rows[0].matching_records);
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async countRecordsInTable() {
        const query = {
            text: `SELECT COUNT(*) FROM ${this.table};`,
        };

        try {
            const result = await this.db.query(query);
            if (result.rows.length === 0) return 0;
            return parseInt(result.rows[0].count);
        } catch (error) {
            console.error('Error making the query: ', error.message);
            return null;
        }
    }

    async getPaginatedRecords(page, limit, orderedBy, order, fields) {
        const offset = (page - 1) * limit;
        const selectedFields = fields ? fields.join(', ') : '*';

        const query = {
            text: `SELECT ${selectedFields} FROM ${this.table} ORDER BY ${orderedBy} ${order} LIMIT ${limit} OFFSET $1;`,
            values: [offset],
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
}
