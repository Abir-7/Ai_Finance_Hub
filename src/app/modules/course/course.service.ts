/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import AppError from "../../errors/AppError";
import { ICourse } from "./course.interface";
import Course from "./course.model";

const createCourse = async (payload: ICourse) => {
  const result = await Course.create(payload);
  return result;
};

const getAllCourses = async (limit: number) => {
  const query = Course.find().sort({ createdAt: -1 });
  console.log(limit);
  if (limit) {
    query.limit(limit);
  }
  const result = await query;
  return result;
};

const getSingleCourse = async (id: string) => {
  const result = await Course.findById(id);
  return result;
};

const updateCourse = async (id: string, payload: Partial<ICourse>) => {
  const result = await Course.findByIdAndUpdate(id, payload, { new: true });

  if (!result) {
    throw new AppError(500, "Course not found or update failed");
  }

  return result;
};

const deleteCourse = async (id: string) => {
  const result = await Course.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(500, "Course not found or delete failed");
  }
  return result;
};

export const CourseService = {
  createCourse,
  getAllCourses,
  getSingleCourse,
  updateCourse,
  deleteCourse,
};
