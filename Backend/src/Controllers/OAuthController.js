// Third-Party Imports:
import axios from 'axios';

// Local Imports:
import userModel from '../Models/UserModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import {
    registerUser,
    createAuthTokens,
    checkAuthStatus,
} from '../Utils/authUtils.js';
import { validatePartialUser } from '../Schemas/userSchema.js';
import { returnErrorStatus } from '../Utils/errorUtils.js';

export default class OAuthController {
    static OAUTH_STRATEGIES = {
        'twitch': OAuthController.getTwitchOAuthUserData,
        'google': OAuthController.getGoogleOAuthUserData,
        'github': OAuthController.getGitHubOAuthUserData,
        '42': OAuthController.get42OAuthUserData,
    };

    static async handleOAuth(req, res) {
        const authStatus = await checkAuthStatus(req);
        if (authStatus.isAuthorized)
            return res
                .status(400)
                .json({ msg: StatusMessage.ALREADY_LOGGED_IN });

        const { provider } = req.params;
        if (!provider || !(provider in OAuthController.OAUTH_STRATEGIES))
            return res
                .status(404)
                .json({ msg: StatusMessage.OAUTH_PROVIDER_NOT_FOUND });

        const data = await OAuthController.OAUTH_STRATEGIES[provider](req, res);
        if (!data) return res;

        const validatedUser = await validatePartialUser(data);
        if (!validatedUser.success) {
            const errorMessage = validatedUser.error.errors[0].message;
            return res.status(400).json({ msg: errorMessage });
        }
        validatedUser.data.active_account = true;
        validatedUser.data.oauth = true;

        const isUserRegistered = await OAuthController.loginOAuth(
            res,
            validatedUser
        );
        if (isUserRegistered || isUserRegistered === null) return res;
        return await registerUser(res, validatedUser, true);
    }

    static async get42OAuthUserData(req, res) {
        const {
            OAUTH_42_CLIENT_ID,
            OAUTH_42_SECRET_KEY,
            TOKEN_ENDPOINT_42,
            USER_INFO_ENDPOINT_42,
            CALLBACK_ROUTE_42,
        } = process.env;

        const { code } = req.body;

        try {
            const userInfo = await OAuthController.getUserInfo(
                OAUTH_42_CLIENT_ID,
                OAUTH_42_SECRET_KEY,
                code,
                TOKEN_ENDPOINT_42,
                USER_INFO_ENDPOINT_42,
                CALLBACK_ROUTE_42
            );

            const data = {
                email: userInfo.email,
                username: userInfo.login,
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getGoogleOAuthUserData(req, res) {
        const {
            OAUTH_GOOGLE_CLIENT_ID,
            OAUTH_GOOGLE_SECRET_KEY,
            TOKEN_ENDPOINT_GOOGLE,
            USER_INFO_ENDPOINT_GOOGLE,
            CALLBACK_ROUTE_GOOGLE,
        } = process.env;

        const { code } = req.body;

        try {
            const userInfo = await OAuthController.getUserInfo(
                OAUTH_GOOGLE_CLIENT_ID,
                OAUTH_GOOGLE_SECRET_KEY,
                code,
                TOKEN_ENDPOINT_GOOGLE,
                USER_INFO_ENDPOINT_GOOGLE,
                CALLBACK_ROUTE_GOOGLE
            );

            const username = userInfo.email.split('@')[0];

            const data = {
                email: userInfo.email,
                username: username,
                first_name: userInfo.given_name,
                last_name: userInfo.family_name,
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getTwitchOAuthUserData(req, res) {
        const {
            OAUTH_TWITCH_CLIENT_ID,
            OAUTH_TWITCH_SECRET_KEY,
            TOKEN_ENDPOINT_TWITCH,
            USER_INFO_ENDPOINT_TWITCH,
            CALLBACK_ROUTE_TWITCH,
        } = process.env;

        const { code } = req.body;

        try {
            const userInfo = await OAuthController.getUserInfo(
                OAUTH_TWITCH_CLIENT_ID,
                OAUTH_TWITCH_SECRET_KEY,
                code,
                TOKEN_ENDPOINT_TWITCH,
                USER_INFO_ENDPOINT_TWITCH,
                CALLBACK_ROUTE_TWITCH
            );

            const data = {
                email: userInfo.data[0].email,
                username: userInfo.data[0].login,
                first_name: userInfo.data[0].display_name
                    ? userInfo.data[0].display_name
                    : userInfo.data[0].login,
                last_name: userInfo.data[0].login,
                biography: userInfo.data[0].description
                    ? userInfo.data[0].description
                    : null,
            };

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getGitHubOAuthUserData(req, res) {
        const {
            OAUTH_GITHUB_CLIENT_ID,
            OAUTH_GITHUB_SECRET_KEY,
            TOKEN_ENDPOINT_GITHUB,
            USER_INFO_ENDPOINT_GITHUB,
            CALLBACK_ROUTE_GITHUB,
        } = process.env;

        const { code } = req.body;

        try {
            const userInfo = await OAuthController.getUserInfo(
                OAUTH_GITHUB_CLIENT_ID,
                OAUTH_GITHUB_SECRET_KEY,
                code,
                TOKEN_ENDPOINT_GITHUB,
                USER_INFO_ENDPOINT_GITHUB,
                CALLBACK_ROUTE_GITHUB
            );

            const data = {
                email: userInfo.email,
                username: userInfo.login,
                first_name: userInfo.name ? userInfo.name : userInfo.login,
                last_name: userInfo.name ? userInfo.name : userInfo.login,
                biography: userInfo.bio ? userInfo.bio : null,
            };

            if (!data.biography) delete data.biography;

            return data;
        } catch (error) {
            console.error(
                'ERROR:',
                error.response?.data?.error_description ?? error
            );
            if (error.response?.status === 401)
                return returnErrorStatus(
                    res,
                    401,
                    error.response.data.error_description
                );
            return returnErrorStatus(
                res,
                500,
                StatusMessage.INTERNAL_SERVER_ERROR
            );
        }
    }

    static async getUserInfo(
        clientId,
        secretKey,
        code,
        tokenEndpoint,
        userInfoEndpoint,
        callbackRoute
    ) {
        const tokenResponse = await axios.post(
            tokenEndpoint,
            {
                grant_type: 'authorization_code',
                client_id: clientId,
                client_secret: secretKey,
                code: code,
                redirect_uri: callbackRoute,
            },
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;
        const userInfo = await axios.get(userInfoEndpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Client-ID': clientId,
            },
        });

        return userInfo.data;
    }

    static async loginOAuth(res, validatedUser) {
        const reference = {
            username: validatedUser.data.username,
        };

        const user = await userModel.getByReference(reference, true);
        if (!user) {
            res.status(500).json({ msg: StatusMessage.INTERNAL_SERVER_ERROR });
            return null;
        }
        if (user.length === 0) return false;

        if (user.oauth) {
            await createAuthTokens(res, user);
            if (!('set-cookie' in res.getHeaders())) return res;
            res.json({ msg: StatusMessage.LOGIN_SUCCESS });
            return true;
        }

        return false;
    }
}
