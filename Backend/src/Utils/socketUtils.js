// Third-Party Imports:
import jwt from 'jsonwebtoken';

// Local Imports:
import userModel from '../Models/UserModel.js';
import StatusMessage from './StatusMessage.js';
import { createAccessToken } from './jsonWebTokenUtils.js';

export async function refreshAccessToken(socket, refreshToken) {
    try {
        const { JWT_SECRET_KEY } = process.env;
        const data = jwt.verify(refreshToken, JWT_SECRET_KEY);
        const user = await userModel.getById(data);
        if (!user)
            return handleError(
                socket,
                StatusMessage.ERROR_REFRESHING_ACCESS_TOKEN
            );
        if (user.length === 0)
            return handleError(socket, StatusMessage.USER_NOT_FOUND);

        const accessToken = createAccessToken(data);
        return accessToken;
    } catch (error) {
        console.error('ERROR:', error);
        return handleError(socket, StatusMessage.ERROR_REFRESHING_ACCESS_TOKEN);
    }
}

export function handleError(socket, errorMessage) {
    console.log('INFO:', errorMessage);
    socket.emit('error-info', { msg: errorMessage });
    socket.disconnect();
    return;
}
