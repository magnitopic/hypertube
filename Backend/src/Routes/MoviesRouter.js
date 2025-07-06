// Third-Party Imports:
import { Router } from 'express';
import fs from 'fs';

// Local Imports:
import LibraryController from '../Controllers/LibraryController.js';
import CommentsController from '../Controllers/CommentsController.js';
import MovieController from '../Controllers/MovieController.js';
import { allowCorsForStatic } from '../Middlewares/allowCorsForStatic.js';

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
        router.get(
            '/:movie_id/comments',
            CommentsController.getCommentsByMovieId
        );
        router.post(
            '/:movie_id/comments',
            CommentsController.createCommentForMovie
        );

        // Subtitles: serve .vtt protected with session & CORS
        router.get('/:id/subs/:file', allowCorsForStatic, (req, res) => {
            if (!req.session || !req.session.user) {
                return res.status(401).json({ msg: 'Unauthorized' });
            }
            const MOVIES_PATH = process.env.MOVIES_PATH || './downloads/movies';
            const absPath = `${MOVIES_PATH}/${req.params.id}/subs/${req.params.file}`;
            if (!fs.existsSync(absPath)) {
                return res.status(404).send('Subtitle not found');
            }
            res.sendFile(absPath, { headers: { 'Content-Type': 'text/vtt' } });
        });

        return router;
    }
}
