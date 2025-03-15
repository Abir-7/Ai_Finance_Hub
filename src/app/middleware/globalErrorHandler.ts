/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { appConfig } from "../config";
import AppError from "../errors/AppError";

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  const errors: {
    path: string;
    message: string;
  }[] = [{ path: "", message: "" }];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors,
    ...(appConfig.server.node_env === "development" && { stack: error.stack }),
  });
};
