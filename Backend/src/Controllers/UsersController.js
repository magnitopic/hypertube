// Local Imports:
import userModel from '../Models/UserModel.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import getPublicUser from '../Utils/getPublicUser.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';

export default class UsersController {
    static async getAllUsers(req, res) {
        const users = await userModel.getAll();
        if (users) {
            const publicUsers = [];
            for (const user of users) {
                const publicUser = await getPublicUser(user);
                if (!publicUser)
                    return res
                        .status(500)
                        .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
                publicUsers.push(publicUser);
            }
            return res.json({ msg: publicUsers });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getMe(req, res) {
        const { id } = req.session.user;

        const user = await userModel.getById({ id });
        if (!user)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const me = await UsersController.getPrivateUser(res, user);
        if (!me) return res;

        return res.json({ msg: me });
    }

    static async getUserById(req, res) {
        const { id } = req.params;

        const user = await userModel.getById({ id });
        if (user) {
            if (user.length === 0)
                return res
                    .status(404)
                    .json({ msg: StatusMessage.NOT_FOUND_BY_ID });
            const publicUser = getPublicUser(user);
            if (!publicUser)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            return res.json({ msg: publicUser });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async getUserProfile(req, res) {
        const { username } = req.params;

        const user = await userModel.getByReference(
            { username: username },
            true
        );
        if (user) {
            if (user.length === 0)
                return res
                    .status(404)
                    .json({ msg: StatusMessage.USER_NOT_FOUND });
            const publicUser = await getPublicUser(user);
            if (!publicUser)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });

            return res.json({ msg: publicUser });
        }
        return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
    }

    static async updateUser(req, res) {
        const isValidData = await UsersController.validateData(req, res);
        if (!isValidData) return res;

        const { id } = req.params;
        const { input, inputHasNoContent } = isValidData;

        let user = null;
        if (!inputHasNoContent) {
            user = await userModel.update({ input, id });
        } else {
            user = await userModel.getById({ id });
        }
        if (!user)
            return res.status(500).json({ msg: StatusMessage.QUERY_ERROR });
        if (user.length === 0)
            return res.status(404).json({ msg: StatusMessage.USER_NOT_FOUND });

        const privateUser = await UsersController.getPrivateUser(res, user);
        if (!privateUser) return res;
        return res.json({ msg: privateUser });
    }

    static async validateData(req, res) {
        const validatedUser = await validatePartialUser(req.body);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return returnErrorStatus(res, 400, errorMessage);
        }

        const input = validatedUser.data;
        const inputHasNoContent = Object.keys(input).length === 0;
        if (inputHasNoContent)
            return returnErrorStatus(
                res,
                400,
                StatusMessage.NO_PROFILE_INFO_TO_EDIT
            );

        if (input.username)
            return returnErrorStatus(
                res,
                403,
                StatusMessage.CANNOT_CHANGE_USERNAME
            );
        if (input.email && req.session.user.oauth)
            return returnErrorStatus(
                res,
                403,
                StatusMessage.CANNOT_CHANGE_EMAIL
            );

        const { email, username } = input;
        const isUnique = await userModel.isUnique({ email, username });
        if (!isUnique) {
            if (email)
                return returnErrorStatus(
                    res,
                    400,
                    StatusMessage.DUPLICATE_EMAIL
                );
            return returnErrorStatus(
                res,
                400,
                StatusMessage.DUPLICATE_USERNAME
            );
        }
        return { input, inputHasNoContent };
    }

    static async getPrivateUser(res, user) {
        const privateUser = await getPublicUser(user);
        if (!privateUser)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );

        privateUser.email = user.email;
        privateUser.prefered_language = user.prefered_language;

        return privateUser;
    }
}
