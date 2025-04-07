import { Router } from "express";
import { upload } from "../../middleware/fileUpload/fileUploadHandler";
import { CourseController } from "./course.controller";
import { auth } from "../../middleware/auth/auth";
import { parseDataField } from "../../middleware/fileUpload/parseDataField";

const router = Router();

router.get("/", auth("ADMIN", "USER"), CourseController.getAllCourses);

router.post(
  "/add-course",
  auth("USER"), // need to make admin
  upload.single("image"),
  parseDataField("data"),
  CourseController.createCourse
);
router.delete(
  "/:id",
  auth("USER"), // need to make admin
  CourseController.deleteCourse
);
export const CourseRouter = router;
