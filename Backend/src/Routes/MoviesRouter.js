// Third-Party Imports:
import { Router } from 'express';
import fs from 'fs';

// Local Imports:
import LibraryController from '../Controllers/LibraryController.js';
import MovieController from '../Controllers/MovieController.js';

export default class MoviesRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/genres', MovieController.getGenres);
        router.get('/:id', MovieController.moviePage);
        router.get('/stream/:id', MovieController.streamMovie);
        router.get('/:id/subtitles', MovieController.fetchSubtitles);
        router.get('/library/:page?', LibraryController.library);
        router.get('/search/:page?', LibraryController.search);
        router.get('/:id/subs/:file', MovieController.serveSubtitleFile);

        return router;
    }
}
