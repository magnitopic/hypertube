// Third-Party Imports:
import jwt from 'jsonwebtoken';

// Local Imports:
import { checkAuthStatus, isIgnored, setSession } from '../Utils/authUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { createAccessToken } from '../Utils/jsonWebTokenUtils.js';
import userModel from '../Models/UserModel.js';

export const refreshTokenMiddleware =
    (IGNORED_ROUTES = []) =>
    async (req, res, next) => {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized) return next();

        if (isIgnored(IGNORED_ROUTES, req.path)) return next();

        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) return next();
        try {
            const { JWT_SECRET_KEY } = process.env;
            const data = jwt.verify(refreshToken, JWT_SECRET_KEY);
            const user = await userModel.getById(data);
            if (!user)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            if (user.length === 0)
                return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

            if (refreshToken !== user.refresh_token)
                return res
                    .status(401)
                    .clearCookie('access_token')
                    .clearCookie('refresh_token')
                    .json({ msg: StatusMessage.REFRESH_TOKEN_REVOKED });

            const accessToken = createAccessToken(data);
            setSession(req, accessToken);

            res.cookie('access_token', accessToken, {
                httpOnly: true, // Cookie only accessible from the server
                secure: process.env.BACKEND_NODE_ENV === 'production', // Only accessible via https
                sameSite: 'strict', // Cookie only accessible from the same domain
                maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_COOKIE),
            });

            return next(); // Go to the next route or middleware
        } catch {
            if (req.path.split('/').pop() === 'logout')
                return res
                    .status(400)
                    .json({ msg: StatusMessage.NOT_LOGGED_IN });
            return res
                .status(401)
                .clearCookie('refresh_token')
                .clearCookie('access_token')
                .json({ msg: StatusMessage.REFRESH_TOKEN_EXPIRED });
        }
    };
