// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import CommentsController from '../Controllers/CommentsController.js';

export default class CommentsRouter {
    static createRouter() {
        const router = Router();

        // GET routes
        router.get('/', CommentsController.getAllComments);
        router.get('/:id', CommentsController.getCommentById);

        // POST routes
        router.post('/', CommentsController.createComment);

        // PATCH routes
        router.patch('/:id', CommentsController.updateComment);

        // DELETE routes
        router.delete('/:id', CommentsController.deleteComment);

        return router;
    }
}
