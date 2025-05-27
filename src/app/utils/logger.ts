/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

const env = process.env.NODE_ENV || "development";
const logDir = path.join(process.cwd(), "logs");
const successLogDir = path.join(logDir, "success");
const errorLogDir = path.join(logDir, "error");

// Create directories if they don't exist
[logDir, successLogDir, errorLogDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Filter to allow only info and below (success logs)
const successFilter = format((info) =>
  ["info", "http", "verbose", "debug", "silly"].includes(info.level)
    ? info
    : false
);

// Filter to allow only error level logs
const errorFilter = format((info) => (info.level === "error" ? info : false));

// Success/info logs transport
const successTransport = new DailyRotateFile({
  filename: path.join(successLogDir, "%DATE%-success.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "info",
  format: format.combine(successFilter(), format.timestamp(), format.json()),
});

// Error logs transport
const errorTransport = new DailyRotateFile({
  filename: path.join(errorLogDir, "%DATE%-error.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "30d",
  level: "error",
  format: format.combine(errorFilter(), format.timestamp(), format.json()),
});

// Exception handler (write to error folder)
const exceptionHandlers = [
  new DailyRotateFile({
    filename: path.join(errorLogDir, "%DATE%-exceptions.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: format.combine(format.timestamp(), format.json()),
  }),
];

// Rejection handler (write to error folder)
const rejectionHandlers = [
  new DailyRotateFile({
    filename: path.join(errorLogDir, "%DATE%-rejections.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
    format: format.combine(format.timestamp(), format.json()),
  }),
];

const logger = createLogger({
  level: env === "development" ? "debug" : "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "your-service-name" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    }),
    successTransport,
    errorTransport,
  ],
  exceptionHandlers,
  rejectionHandlers,
});

export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export default logger;
