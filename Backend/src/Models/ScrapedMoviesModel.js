// Local Imports:
import Model from '../Core/Model.js';

class ScrapedMoviesModel extends Model {
    constructor() {
        super('scraped_movies');
    }
}

const scrapedMoviesModel = new ScrapedMoviesModel();
export default scrapedMoviesModel;
