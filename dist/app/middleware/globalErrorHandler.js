import AppError from "../errors/AppError";
import mongoose from "mongoose";
import { handleZodError } from "../errors/zodErrorHandler";
import { handleMongooseError } from "../errors/mongooseErrorHandler";
import { ZodError } from "zod";
import multer from "multer";
import multerErrorHandler from "../errors/MulterErrorHandler";
import logger from "../utils/logger";
export const globalErrorHandler = async (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Something went wrong!";
    let errors = [];
    if (err instanceof mongoose.Error) {
        const mongooseError = handleMongooseError(err);
        statusCode = mongooseError.statusCode;
        message = mongooseError.message;
        errors = mongooseError.errors;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "ValidationError") {
        const mongooseError = handleMongooseError(err);
        statusCode = mongooseError.statusCode;
        message = mongooseError.message;
        errors = mongooseError.errors;
    }
    else if (err instanceof ZodError) {
        const zodError = handleZodError(err);
        statusCode = zodError.statusCode;
        message = zodError.message;
        errors = zodError.errors;
    }
    else if ((err === null || err === void 0 ? void 0 : err.name) === "TokenExpiredError") {
        statusCode = 401;
        message = "Your session has expired. Please login again.";
        errors = [
            {
                path: "token",
                message: message,
            },
        ];
    }
    else if (err instanceof multer.MulterError) {
        const multerError = multerErrorHandler(err);
        statusCode = multerError.statusCode;
        message = multerError.message;
        errors = multerError.errors;
    }
    else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = [
            {
                path: "",
                message: err.message,
            },
        ];
    }
    else if (err instanceof Error) {
        message = err.message;
        errors = [
            {
                path: "",
                message: err.message,
            },
        ];
    }
    logger.error(message);
    res.status(statusCode).json(Object.assign({ success: false, status: statusCode, message, errors: errors.length ? errors : undefined }, (process.env.NODE_ENV === "development" && { stack: err.stack })));
};
