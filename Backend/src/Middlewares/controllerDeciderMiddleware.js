import AuthController from '../Controllers/AuthController.js';

export const controllerDeciderMiddleware = () => (req, res, next) => {
    if (Object.keys(req.query).length > 0) {
        return AuthController.resetPassword(req, res, next);
    }
    return AuthController.sendResetPasswordLink(req, res, next);
};
