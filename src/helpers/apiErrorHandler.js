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

module.exports = { apiServerError };