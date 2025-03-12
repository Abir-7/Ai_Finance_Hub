/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { appConfig } from "../config";

export const globalErrorHandler = async (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = 500;
  const message = "Something went wrong!";
  const errors: {
    path: string;
    message: string;
  }[] = [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length ? errors : undefined,
    ...(appConfig.server.node_env === "development" && { stack: error.stack }),
  });
};
