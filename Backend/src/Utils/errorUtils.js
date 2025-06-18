export function returnErrorWithNext(res, next, statusCode, errorMessage) {
    if (!res.responseData) res.status(statusCode).json({ msg: errorMessage });
    return next(new Error(errorMessage));
}

export function returnErrorStatus(res, statusCode, errorMsg) {
    res.status(statusCode).json({ msg: errorMsg });
    return false;
}

export function emitErrorAndReturnNull(socket, errorMessage) {
    socket.emit('error-info', { msg: errorMessage });
    return null;
}
