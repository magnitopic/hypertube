// Third-Party Imports:
import { Router } from 'express';

// Local Imports:
import OAuthController from '../Controllers/OAuthController.js';

export default class OauthRouter {
    static createRouter() {
        const router = Router();

        router.post('/token', OAuthController.getOAuthToken);

        return router;
    }
}
