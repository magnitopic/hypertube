// Third-Party Imports:
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Local Imports:
import { createConfirmationToken } from './jsonWebTokenUtils.js';
import userModel from '../Models/UserModel.js';
import getPublicUser from './getPublicUser.js';
import { createAccessToken, createRefreshToken } from './jsonWebTokenUtils.js';
import StatusMessage from './StatusMessage.js';

export async function checkAuthStatus(req) {
    try {
        const { user } = req.session;
        if (user) {
            const userExist = await userModel.findOne({ id: user.id });
            if (userExist && userExist.length !== 0)
                return { isAuthorized: true, user: user };
        }
        return { isAuthorized: false };
    } catch (error) {
        return { isAuthorized: false };
    }
}

export async function sendConfirmationEmail({
    id,
    email,
    username,
    first_name,
}) {
    const { CONFIRM_ACCOUNT_LINK } = process.env;

    const confirmationToken = createConfirmationToken({
        id,
        email,
        username,
        first_name,
    });

    const confirmationLink = `${CONFIRM_ACCOUNT_LINK}${confirmationToken}`;
    const subject = '42 Hypertube Confirmation Email';
    const body = `Hello ${first_name},\n\nPlease click on the link below to confirm your account:\n\n${confirmationLink}`;

    await sendEmail(email, subject, body);
}

export async function sendResetPasswordEmail({
    email,
    first_name,
    reset_pass_token,
}) {
    const { RESET_PASSWORD_LINK } = process.env;

    const resetPasswordLink = `${RESET_PASSWORD_LINK}${reset_pass_token}`;
    const subject = '42 Hypertube Reset Password Email';
    const body = `Hello ${first_name},\n\nPlease click on the link below to reset your password:\n\n${resetPasswordLink}`;

    await sendEmail(email, subject, body);
}

export async function sendEmail(email, subject, body) {
    const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: parseInt(EMAIL_PORT),
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD,
        },
    });

    const mail = {
        from: EMAIL_USER,
        to: email,
        subject: subject,
        text: body,
    };

    const info = await transporter.sendMail(mail);
    console.info('Email info: ', info);
}

export async function hashPassword(password) {
    const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return encryptedPassword;
}

export function isIgnored(ignoredRoutes, path) {
    return ignoredRoutes.some((pattern) => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '$');
        return regex.test(path);
    });
}

export function setSession(req, accessToken) {
    req.session = { user: null };
    try {
        const { JWT_SECRET_KEY } = process.env;
        const data = jwt.verify(accessToken, JWT_SECRET_KEY);
        req.session.user = data;
    } catch {}
}

export async function createAuthTokens(res, data) {
    const accessToken = createAccessToken(data);
    const refreshToken = createRefreshToken(data);
    const result = await userModel.update({
        input: { refresh_token: refreshToken },
        id: data.id,
    });
    if (!result)
        return res
            .status(500)
            .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
    if (result.length === 0)
        return res.status(400).json({ msg: StatusMessage.USER_NOT_FOUND });

    return res
        .cookie('access_token', accessToken, {
            httpOnly: true, // Cookie only accessible from the server
            secure: process.env.BACKEND_NODE_ENV === 'production', // Only accessible via https
            sameSite: 'strict', // Cookie only accessible from the same domain
            maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRY_COOKIE), // Cookie only valid for 1h
        })
        .cookie('refresh_token', refreshToken, {
            httpOnly: true, // Cookie only accessible from the server
            secure: process.env.BACKEND_NODE_ENV === 'production', // Only accessible via https
            sameSite: 'strict', // Cookie only accessible from the same domain
            maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRY_COOKIE), // Cookie only valid for 30d
        });
}

export async function registerUser(res, validatedUser, oauth = false) {
    const { email, username, password } = validatedUser.data;
    const isUnique = await userModel.isUnique({ email, username });
    if (isUnique) {
        // Encrypt password
        if (!oauth) validatedUser.data.password = await hashPassword(password);

        const { location } = validatedUser.data;
        delete validatedUser.data.location;

        const user = await userModel.create({ input: validatedUser.data });
        if (user === null) {
            return res
                .status(500)
                .json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
        } else if (user.length === 0) {
            return res
                .status(400)
                .json({ error: StatusMessage.USER_NOT_FOUND });
        }

        if (!oauth) await sendConfirmationEmail(user);

        if (oauth) {
            await createAuthTokens(res, user);
            if (!('set-cookie' in res.getHeaders())) return res;
        }

        // Returns public user info:
        const publicUser = await getPublicUser(user);
        if (!publicUser)
            return res
                .status(500)
                .json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
        return res.status(201).json({ msg: publicUser });
    }

    return res
        .status(400)
        .json({ msg: StatusMessage.DUPLICATE_USERNAME_OR_EMAIL });
}
