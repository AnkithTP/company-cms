const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    // Ensure CORS headers are attached on error responses so frontend does not get CORS error
    const origin = req.headers.origin;
    if (origin && !res.getHeader("Access-Control-Allow-Origin")) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    const statusCode = err.statusCode || 500;

    const response = {
        success: false,
        message: err.message || "Internal server error",
    };

    if (err.details) {
        response.errors = err.details;
    }

    res.status(statusCode).json(response);
};

export { errorMiddleware };
export default errorMiddleware;