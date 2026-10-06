import jwt from "jsonwebtoken";

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            const error = new Error("Authentication token is required");
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.userId,
            email: decoded.email,
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            error.statusCode = 401;
            error.message = "Authentication token has expired";
        } else if (error.name === "JsonWebTokenError") {
            error.statusCode = 401;
            error.message = "Invalid authentication token";
        }

        next(error);
    }
};

export { authenticate };
export default authenticate;