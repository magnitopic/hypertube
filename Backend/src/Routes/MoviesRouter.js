// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import LibraryController from '../Controllers/LibraryController.js';
import MovieController from '../Controllers/MovieController.js';

export default class MoviesRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/genres', MovieController.getGenres);
        router.get('/:id', MovieController.moviePage);
        router.get('/library/:page?', LibraryController.library);
        router.get('/search/:page?', LibraryController.search);

        return router;
    }
}
