// Third-Party Imports:
import fsExtra from 'fs-extra';

// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';

export async function removeImageOnFailureMiddleware(err, req, res, next) {
    for (const image of req.files) {
        try {
            await fsExtra.remove(image.path);
            console.info(
                `Image with path '${image.path}' has been removed successfully!`
            );
        } catch (error) {
            console.error(`Error deleting file ${image.path}: ${error}`);
        }
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ msg: StatusMessage.EXCEEDS_IMAGE_LIMIT });
        return next();
    }
    next(err);
}
