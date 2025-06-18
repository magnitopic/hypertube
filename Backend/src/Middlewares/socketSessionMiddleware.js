// Third-Party Imports:
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import { handleError, refreshAccessToken } from '../Utils/socketUtils.js';

export const socketSessionMiddleware = () => (socket, next) => {
    const cookies = socket.request.headers.cookie;
    let parsedCookies = null;
    try {
        parsedCookies = cookie.parse(cookies);
    } catch (error) {
        console.error('ERROR:', error);
        handleError(socket, StatusMessage.ERROR_PARSING_COOKIES);
    }

    let accessToken = parsedCookies?.access_token;
    const refreshToken = parsedCookies?.refreshToken;
    if (!accessToken) {
        if (!refreshToken) {
            console.error('ERROR:', StatusMessage.NOT_LOGGED_IN);
            console.info(
                `INFO: User connected to socket '${socket.id}' got an error.`
            );
            return next(new Error(StatusMessage.NOT_LOGGED_IN));
        }

        accessToken = refreshAccessToken(socket, refreshToken);
    }

    socket.request.session = { user: null };
    try {
        const { JWT_SECRET_KEY } = process.env;
        const data = jwt.verify(accessToken, JWT_SECRET_KEY);
        data.refreshToken = refreshToken;
        socket.request.session.user = data;
        console.info(
            `INFO: User connected to socket '${socket.id}' is logged in.`
        );
    } catch {
        console.info(
            `INFO: User connected to socket '${socket.id}' is not logged in.`
        );
    }

    next(); // Go to the next route or middleware
};
