// Third-Party Imports:
import bcrypt from 'bcryptjs';
import wordlist from 'wordlist-english';
import { pwnedPassword } from 'hibp';
import { Filter } from 'bad-words';

// Local Imports:
import userModel from '../Models/UserModel.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import StatusMessage from '../Utils/StatusMessage.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';

export async function passwordValidations(data) {
    const { res, token, id, newPassword, oldPassword } = data;
    // Get the user and check if the account is active
    const user = await userModel.getById({ id });
    if (!user)
        return returnErrorStatus(res, 500, StatusMessage.INTERNAL_SERVER_ERROR);
    else if (user.length === 0)
        returnErrorStatus(res, 400, StatusMessage.USER_NOT_FOUND);

    if (!user.active_account)
        return returnErrorStatus(
            res,
            403,
            StatusMessage.ACC_CONFIRMATION_REQUIRED
        );

    // Check if the new password and old password are the same
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword)
        return returnErrorStatus(res, 400, StatusMessage.SAME_PASSWORD);

    // Checks if old password is valid
    if (oldPassword) {
        const isValidPassword = await bcrypt.compare(
            oldPassword,
            user.password
        );
        if (!isValidPassword)
            return returnErrorStatus(res, 401, StatusMessage.WRONG_PASSWORD);
    }

    if (token && !oldPassword && user.reset_pass_token === token) {
        const result = await userModel.update({
            input: { reset_pass_token: null },
            id: id,
        });
        if (!result)
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        if (result.length === 0)
            return returnErrorStatus(res, 400, StatusMessage.USER_NOT_FOUND);
    } else if (!user.reset_pass_token && !oldPassword)
        return returnErrorStatus(res, 400, StatusMessage.RESET_PASS_TOKEN_USED);

    // If everything is valid, returns true
    return true;
}

export async function loginValidations(reqBody, res) {
    // Validate and clean input
    const validatedUser = await validatePartialUser(reqBody);
    if (!validatedUser.success) {
        const errorMessage = validatedUser.error.errors[0].message;
        return res.status(400).json({ msg: errorMessage });
    }

    // Checks if the user exists
    const { username, password } = validatedUser.data;
    const user = await userModel.findOne({ username });
    if (user.length === 0)
        return res.status(401).json({ msg: StatusMessage.WRONG_USERNAME });

    if (!user.password)
        return res
            .status(403)
            .json({ msg: StatusMessage.CANNOT_LOGIN_WITH_PASS });

    // Validates password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
        return res.status(401).json({ msg: StatusMessage.WRONG_PASSWORD });

    if (!user.active_account)
        return res
            .status(403)
            .json({ msg: StatusMessage.ACC_CONFIRMATION_REQUIRED });

    // Returns user
    return { user };
}

export async function confirmAccountValidations(res, tokenData) {
    const user = await userModel.getById(tokenData);
    if (!user)
        return returnErrorStatus(res, 500, StatusMessage.INTERNAL_SERVER_ERROR);
    if (user.length === 0)
        return returnErrorStatus(res, 400, StatusMessage.USER_NOT_FOUND);
    if (user.active_account)
        return returnErrorStatus(res, 400, StatusMessage.ACC_ALREADY_CONFIRMED);

    return true;
}

export async function checkPasswordVulnerabilities(password) {
    const commonWords = wordlist['english/10'];

    const containsWord = commonWords.some(
        (word) => password.toLowerCase().includes(word) && word.length > 2
    );
    if (containsWord)
        return {
            success: false,
            message: StatusMessage.COMMON_ENGLISH_WORDS_FOUND,
        };

    try {
        const isBadPassword = await pwnedPassword(password);
        if (isBadPassword !== 0)
            return { success: false, message: StatusMessage.PWNED_PASSWORD };
    } catch (error) {
        console.error('ERROR:', error);
        return {
            success: false,
            message: StatusMessage.ERROR_VALIDATING_PASSWORD,
        };
    }

    return { success: true };
}

export function checkBadWords(str, field) {
    const filter = new Filter();

    if (filter.isProfane(str))
        return {
            success: false,
            message: `${field} cannot contain profane words. Please change it and try again.`,
        };

    return { success: true };
}
