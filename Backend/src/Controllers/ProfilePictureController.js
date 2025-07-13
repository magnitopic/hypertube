// Third-Party Imports:
import fsExtra from 'fs-extra';
import path from 'path';

// Local Imports:
import userModel from '../Models/UserModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorWithNext, returnErrorStatus } from '../Utils/errorUtils.js';

export default class ProfilePictureController {
    static async getProfilePicture(req, res) {
        const { id } = req.params;
        const user = await userModel.getById({ id });
        if (!user)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        // If profile picture is a URL, redirect to it
        if (user.profile_picture_is_url && user.profile_picture) {
            return res.redirect(user.profile_picture);
        }

        let profilePicturePath = user.profile_picture;
        if (!profilePicturePath)
            profilePicturePath =
                '/backend/static/images/default-profile-picture.png';
        const imagePath = path.join(profilePicturePath);

        res.sendFile(imagePath, (error) => {
            if (error) {
                console.error('ERROR:', error);
                if (!res.headersSent) {
                    res.status(404).json({
                        msg: StatusMessage.IMAGE_NOT_FOUND,
                    });
                }
            }
        });
    }

    static async changeProfilePicture(req, res, next) {
        const { API_HOST, API_PORT, API_VERSION } = process.env;

        try {
            const { id } = req.params;

            if (req.files.length !== 1)
                return returnErrorWithNext(
                    res,
                    next,
                    400,
                    StatusMessage.BAD_REQUEST
                );

            const deleteResult =
                await ProfilePictureController.deletePreviousProfilePicture(
                    res,
                    id
                );
            if (!deleteResult)
                return returnErrorWithNext(
                    res,
                    next,
                    res.statusCode,
                    res.responseData.body
                );

            const input = { profile_picture: req.files[0].path };
            const updateResult = await userModel.update({ input, id });
            if (!updateResult)
                return returnErrorWithNext(
                    res,
                    next,
                    500,
                    StatusMessage.INTERNAL_SERVER_ERROR
                );
            if (updateResult.length === 0)
                return returnErrorWithNext(
                    res,
                    next,
                    404,
                    StatusMessage.USER_NOT_FOUND
                );

            // Reset the URL flag since user uploaded a file
            const resetUrlFlag = { profile_picture_is_url: false };
            await userModel.update({ input: resetUrlFlag, id });

            return res.json({
                msg: `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${id}/profile-picture`,
            });
        } catch (error) {
            console.error('Error uploading file: ', error);
            return returnErrorWithNext(
                res,
                next,
                400,
                StatusMessage.ERROR_UPLOADING_IMAGE
            );
        }
    }

    static async deletePreviousProfilePicture(res, id) {
        const user = await userModel.getById({ id });
        if (!user)
            return returnErrorStatus(res, 500, StatusMessage.QUERY_ERROR);
        if (user.length === 0)
            return returnErrorStatus(res, 404, StatusMessage.USER_NOT_FOUND);
        if (!user.profile_picture) return true;

        // If the profile picture is a URL, we don't need to delete a file
        if (user.profile_picture_is_url) return true;

        try {
            await fsExtra.remove(user.profile_picture);
            return true;
        } catch (error) {
            console.error('Error deleting file: ', error);
            return false;
        }
    }
}
