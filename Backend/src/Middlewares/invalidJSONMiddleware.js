// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

export const invalidJSONMiddleware = () => (error, req, res, next) => {
    if (
        error instanceof SyntaxError &&
        error.status === 400 &&
        'body' in error
    ) {
        console.error('Invalid JSON:', error.message);
        return res.status(400).json({ msg: StatusMessage.INVALID_JSON });
    }
    next();
};
