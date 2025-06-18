// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

export const checkValidUserIdMiddleware = () => (req, res, next) => {
    const { id } = req.params;
    if (req.session.user.id !== id)
        return res
            .status(403)
            .json({ msg: StatusMessage.CANNOT_EDIT_OTHER_PROFILE });
    next();
};
