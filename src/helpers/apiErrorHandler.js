function apiServerError(req, res, error){
    res.status(500).json(
        {
            method: req.method,
            error: true,
            code: 500,
            message: "Internal Server Error",
            data: !error ? [] : error,
        }
    );
}

function apiClientError(req, res, error, message, http_status){
    res.status(http_status).json(
        {
            method: req.method,
            error: true,
            code: http_status,
            message: message,
            data: !error ? [] : error,
        }
    );
}

module.exports = { apiServerError, apiClientError };