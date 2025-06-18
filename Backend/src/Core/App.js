// Third-Party Imports:
import express, { json } from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// Local Imports:
import SocketHandler from '../Sockets/SocketHandler.js'; // TODO: Remove if not used by the end of the project

// Middleware Imports:
import { corsMiddleware } from '../Middlewares/corsMiddleware.js';
import { sessionMiddleware } from '../Middlewares/sessionMiddleware.js';
import { refreshTokenMiddleware } from '../Middlewares/refreshTokenMiddleware.js';
import { invalidJSONMiddleware } from '../Middlewares/invalidJSONMiddleware.js';
import { captureResponseDataMiddleware } from '../Middlewares/captureResponseDataMiddleware.js';
import { checkAuthStatusMiddleware } from '../Middlewares/checkAuthStatusMiddleware.js';

// Router Imports:
import AuthRouter from '../Routes/AuthRouter.js';
import UsersRouter from '../Routes/UsersRouter.js';
import MoviesRouter from '../Routes/MoviesRouter.js';

export default class App {
    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        //this.socketHandler = SocketHandler.getInstance(this.server); // TODO: Remove if not used by the end of the project
        this.HOST = process.env.API_HOST ?? 'localhost';
        this.PORT = process.env.API_PORT ?? 3001;
        this.API_VERSION = process.env.API_VERSION;
        this.API_PREFIX = `/api/v${this.API_VERSION}`;
        this.IGNORED_ROUTES = [
            `${this.API_PREFIX}/auth/login`,
            `${this.API_PREFIX}/auth/register`,
            `${this.API_PREFIX}/auth/status`,
            `${this.API_PREFIX}/auth/confirm`,
            `${this.API_PREFIX}/auth/password/reset`,
            `${this.API_PREFIX}/auth/oauth/*`,
            //`${this.API_PREFIX}/movies/*/*`, // TODO: Remove after testing
        ];

        this.#setupMiddleware();
        this.#setupRoutes();
    }

    startApp() {
        this.server.listen(this.PORT, () => {
            console.info(
                `Server listening on http://${this.HOST}:${this.PORT}`
            );
        });
    }

    #setupMiddleware() {
        this.app.disable('x-powered-by'); // Disable 'x-powered-by' header
        this.app.use(json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(corsMiddleware());
        this.app.use(cookieParser());
        this.app.use(sessionMiddleware());
        this.app.use(refreshTokenMiddleware(this.IGNORED_ROUTES));
        this.app.use(checkAuthStatusMiddleware(this.IGNORED_ROUTES));
        this.app.use(invalidJSONMiddleware());
        this.app.use(captureResponseDataMiddleware);
    }

    #setupRoutes() {
        this.app.use(`${this.API_PREFIX}/auth`, AuthRouter.createRouter());
        this.app.use(`${this.API_PREFIX}/users`, UsersRouter.createRouter());
        this.app.use(`${this.API_PREFIX}/movies`, MoviesRouter.createRouter());
    }
}
