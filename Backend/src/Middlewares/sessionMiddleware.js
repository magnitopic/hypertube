// Local Imports:
import { setSession } from '../Utils/authUtils.js';

export const sessionMiddleware = () => (req, res, next) => {
    const accessToken = req.cookies.access_token;

    setSession(req, accessToken);

    next(); // Go to the next route or middleware
};
