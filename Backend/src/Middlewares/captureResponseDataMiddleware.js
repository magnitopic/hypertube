export function captureResponseDataMiddleware(req, res, next) {
    const originalJson = res.json;

    res.json = function (data) {
        res.responseData = data;
        return originalJson.call(res, data);
    };

    next();
}
