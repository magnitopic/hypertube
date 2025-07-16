// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import UsersController from '../Controllers/UsersController.js';
import ProfilePictureController from '../Controllers/ProfilePictureController.js';
import WatchedMoviesController from '../Controllers/WatchedMoviesController.js';
import { checkValidUserIdMiddleware } from '../Middlewares/checkValidUserIdMiddleware.js';
import { imageUploadMiddleware } from '../Middlewares/imageUploadMiddleware.js';
import { imagesValidationMiddleware } from '../Middlewares/imagesValidationMiddleware.js';
import { removeImageOnFailureMiddleware } from '../Middlewares/removeImageOnFailureMiddleware.js';

export default class UsersRouter {
    static createRouter() {
        const router = Router();

        // GET:
        router.get('/', UsersController.getAllUsers);
        router.get('/me', UsersController.getMe);
        router.get('/profile/:username', UsersController.getUserProfile);
        router.get('/:id', UsersController.getUserById);
        router.get(
            '/:id/profile-picture',
            ProfilePictureController.getProfilePicture
        );
        router.get(
            '/:userId/watched-movies',
            WatchedMoviesController.getLatestWatchedMovies
        );

        // PATCH:
        router.patch('/:id', UsersController.updateUser);

        // PUT:
        router.put(
            '/:id/profile-picture',
            checkValidUserIdMiddleware(),
            imageUploadMiddleware(),
            imagesValidationMiddleware(),
            ProfilePictureController.changeProfilePicture,
            removeImageOnFailureMiddleware
        );

        return router;
    }
}
