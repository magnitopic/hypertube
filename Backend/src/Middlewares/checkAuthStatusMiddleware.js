// Local Imports:
import { checkAuthStatus, isIgnored } from '../Utils/authUtils.js';
import StatusMessage from '../Utils/StatusMessage.js';

export const checkAuthStatusMiddleware =
    (ignoredRoutes) => async (req, res, next) => {
        if (isIgnored(ignoredRoutes, req.path)) return next();

        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized) return next();

        return res.status(401).json({ msg: StatusMessage.NOT_LOGGED_IN });
    };
