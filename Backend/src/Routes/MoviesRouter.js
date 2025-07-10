// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import LibraryController from '../Controllers/LibraryController.js';
import CommentsController from '../Controllers/CommentsController.js';
import MovieController from '../Controllers/MovieController.js';
import WatchedMoviesController from '../Controllers/WatchedMoviesController.js';

export default class MoviesRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/genres', MovieController.getGenres);
        router.get('/:id', MovieController.moviePage);
        router.get('/stream/:id', MovieController.streamMovie);
        router.get('/:id/subtitles', MovieController.fetchSubtitles);
        router.get('/:id/subs/:file', MovieController.serveSubtitleFile);
        router.get('/library/:page?', LibraryController.library);
        router.get('/search/:page?', LibraryController.search);
        router.get('/:movie_id/comments', CommentsController.getCommentsByMovieId);

        // POST:
        router.post('/:movie_id/comments', CommentsController.createCommentForMovie);
        router.post('/:id/watched', WatchedMoviesController.createOrUpdateWatchedMovie);
        router.post('/:id/like', MovieController.toggleLike);

        return router;
    }
}
