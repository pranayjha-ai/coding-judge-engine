
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
            };
        }
    }
}

export const authenticate: RequestHandler = (req, res, next) => {
    const authorization = req.get("authorization");
    const bearerMatch = authorization?.match(/^Bearer ([^\s]+)$/i);

    if (!bearerMatch) {
        return res.status(401).json({
            message: "A bearer token is required"
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("JWT_SECRET is missing from environment variables");

        return res.status(500).json({
            message: "Server configuration error"
        });
    }

    try {
        const payload = jwt.verify(bearerMatch[1], jwtSecret, {
            algorithms: ["HS256"]
        });
        const userId =
            typeof payload === "object" && payload !== null
                ? payload.userId
                : undefined;

        if (
            typeof userId !== "string" ||
            !/^[1-9]\d*$/.test(userId)
        ) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = {
            userId
        };

        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("Token verification error:", error);

        return res.status(500).json({
            message: "Could not verify authentication"
        });
    }
};
