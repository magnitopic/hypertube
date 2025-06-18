// Third-Party Imports:
import jwt from 'jsonwebtoken';

// Local Imports:
import userModel from '../Models/UserModel.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';
import { validateUser } from '../Schemas/userSchema.js';
import {
    validatePasswords,
    validatePartialPasswords,
} from '../Schemas/changePasswordSchema.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { createResetPasswordToken } from '../Utils/jsonWebTokenUtils.js';
import {
    checkAuthStatus,
    sendConfirmationEmail,
    sendResetPasswordEmail,
    hashPassword,
    createAuthTokens,
    registerUser,
} from '../Utils/authUtils.js';
import {
    confirmAccountValidations,
    passwordValidations,
    loginValidations,
} from '../Validations/authValidations.js';

export default class AuthController {
    static async login(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        // Validations
        const { user } = await loginValidations(req.body, res);
        if (!user) return res;

        // Create JWT
        await createAuthTokens(res, user);
        if (!('set-cookie' in res.getHeaders())) return res;

        return res.json({ msg: StatusMessage.LOGIN_SUCCESS });
    }

    static async register(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        // Validate and clean input
        let validatedUser = await validateUser(req.body);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        return await registerUser(res, validatedUser);
    }

    static async logout(req, res) {
        return res
            .clearCookie('access_token')
            .clearCookie('refresh_token')
            .json({ msg: StatusMessage.LOGOUT_SUCCESS });
    }

    static async status(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized) {
            delete authStatus.user.iat;
            delete authStatus.user.exp;
            return res.status(200).json({ msg: authStatus.user });
        }
        return res.status(401).json();
    }

    static async confirm(req, res) {
        // Check if user is logged in
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        try {
            const { JWT_SECRET_KEY } = process.env;
            const confirmationToken = req.query.token;
            const tokenData = jwt.verify(confirmationToken, JWT_SECRET_KEY);

            // Validations
            const validationResult = await confirmAccountValidations(
                res,
                tokenData
            );
            if (!validationResult) return res;

            const result = await userModel.update({
                input: { active_account: true },
                id: tokenData.id,
            });
            if (!result)
                return res
                    .status(500)
                    .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            if (result.length === 0)
                return res
                    .status(400)
                    .json({ msg: StatusMessage.USER_NOT_FOUND });

            await createAuthTokens(res, tokenData);
            if (!('set-cookie' in res.getHeaders())) return res;

            return res.json({ msg: StatusMessage.ACC_SUCCESSFULLY_CONFIRMED });
        } catch (error) {
            console.error('ERROR:', error);
            if (error.name === 'TokenExpiredError') {
                const confirmationToken = req.query.token;
                const tokenData = jwt.decode(confirmationToken);

                const user = await userModel.findOne({ id: tokenData.id });
                if (!user)
                    return res
                        .status(500)
                        .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
                if (user.length === 0)
                    return res
                        .status(400)
                        .json({ msg: StatusMessage.USER_NOT_FOUND });
                await sendConfirmationEmail(tokenData);
                return res
                    .status(403)
                    .json({ msg: StatusMessage.CONFIRM_ACC_TOKEN_EXPIRED });
            }
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
        }
    }

    static async sendResetPasswordLink(req, res) {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const user = await userModel.getByReference({ email: email }, true);
        if (!user)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (user.length === 0)
            return res.status(400).json({ msg: StatusMessage.INVALID_EMAIL });
        if (!user.active_account)
            return res
                .status(403)
                .json({ msg: StatusMessage.CONFIRM_ACC_FIRST });
        if (user.oauth)
            return res
                .status(403)
                .json({ msg: StatusMessage.CANNOT_CHANGE_PASS });

        const resetPasswordToken = createResetPasswordToken(user);
        const updatedUser = await userModel.update({
            input: { reset_pass_token: resetPasswordToken },
            id: user.id,
        });
        if (!updatedUser)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        if (updatedUser.length === 0)
            return res.status(400).json({ msg: StatusMessage.USER_NOT_FOUND });

        await sendResetPasswordEmail(updatedUser);

        return res.json({ msg: StatusMessage.RESET_PASS_EMAIL_SENT });
    }

    static async resetPassword(req, res) {
        const { JWT_SECRET_KEY } = process.env;
        const { token } = req.query;
        if (!token)
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });

        const validationResult = await validatePartialPasswords(req.body);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        try {
            const tokenData = jwt.verify(token, JWT_SECRET_KEY);

            const data = {
                res: res,
                token: token,
                id: tokenData.id,
                newPassword: validationResult.data.new_password,
            };

            const result = await AuthController.#updatePassword(data);
            if (!result) return res;

            return res.json({ msg: StatusMessage.PASSWORD_UPDATED });
        } catch (error) {
            console.error('ERROR:', error);
            if (error.name === 'TokenExpiredError') {
                return res
                    .status(403)
                    .json({ msg: StatusMessage.RESET_PASS_TOKEN_EXPIRED });
            }
            return res.status(400).json({ msg: StatusMessage.BAD_REQUEST });
        }
    }

    static async changePassword(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.user.oauth)
            return res
                .status(403)
                .json({ msg: StatusMessage.CANNOT_CHANGE_PASS });

        const validationResult = await validatePasswords(req.body);
        if (!validationResult.success) {
            const errorMessage = validationResult.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }

        const data = {
            res: res,
            id: req.session.user.id,
            newPassword: validationResult.data.new_password,
            oldPassword: validationResult.data.old_password,
        };

        const result = await AuthController.#updatePassword(data);
        if (!result) return res;

        return res.json({ msg: StatusMessage.PASSWORD_UPDATED });
    }

    static async #updatePassword(data) {
        const { id, newPassword } = data;

        const validationResult = await passwordValidations(data);
        if (!validationResult) return false;

        const newPasswordHashed = await hashPassword(newPassword);
        const updatedUser = await userModel.update({
            input: { password: newPasswordHashed },
            id: id,
        });
        if (!updatedUser)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        if (updatedUser.length === 0)
            return returnErrorStatus(res, 400, StatusMessage.USER_NOT_FOUND);

        return true;
    }
}
