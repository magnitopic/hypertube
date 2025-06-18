// Third-Party Imports:
import path from 'path';

// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

export const imagesValidationMiddleware = () => (req, res, next) => {
    if (!req.files || req.files.length === 0)
        return res.status(400).json({ msg: StatusMessage.NO_IMAGE_UPLOADED });
    for (const image of req.files) {
        if (!validExtension(image.originalname)) {
            res.status(400).json({
                msg: StatusMessage.INVALID_IMAGE_EXTENSION,
            });
            return next(new Error(StatusMessage.INVALID_IMAGE_EXTENSION));
        }
        if (!validMimeType(image.mimetype)) {
            res.status(400).json({ msg: StatusMessage.INVALID_MIME_TYPE });
            return next(new Error(StatusMessage.INVALID_MIME_TYPE));
        }
        if (image.size > 5242880) {
            res.status(400).json({ msg: StatusMessage.INVALID_IMAGE_SIZE });
            return next(new Error(StatusMessage.INVALID_IMAGE_SIZE));
        }
        if (image.size === 0) {
            res.status(400).json({ msg: StatusMessage.IMAGE_IS_EMPTY });
            return next(new Error(StatusMessage.IMAGE_IS_EMPTY));
        }
    }
    next();
};

function validExtension(fileName) {
    const VALID_EXTENSIONS = ['jpeg', 'jpg', 'png'];

    const extension = path.extname(fileName).slice(1).toLowerCase();

    if (!VALID_EXTENSIONS.includes(extension)) return false;
    return true;
}

function validMimeType(mimeType) {
    const VALID_MIME_TYPE = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!VALID_MIME_TYPE.includes(mimeType)) return false;
    return true;
}
