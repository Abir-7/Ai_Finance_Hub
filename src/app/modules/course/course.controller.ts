import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { CourseService } from "./course.service";
import sendResponse from "../../utils/sendResponse";
import status from "http-status";
import { getRelativePath } from "../../utils/helper/getRelativeFilePath";
import AppError from "../../errors/AppError";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req?.file?.path) {
    throw new AppError(404, "Image not found! Try again");
  }
  const image = getRelativePath(req.file.path);
  const result = await CourseService.createCourse({ ...req.body, image });
  sendResponse(res, {
    success: true,
    statusCode: status.CREATED,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getAllCourses(Number(req?.query?.limit));
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Courses fetched successfully",
    data: result,
  });
});

const getSingleCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseService.getSingleCourse(id);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Course fetched successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseService.updateCourse(id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseService.deleteCourse(id);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Course deleted successfully",
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
