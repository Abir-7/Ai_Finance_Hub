/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Schema } from "zod";
import catchAsync from "../utils/catchAsync";

const zodValidator = async (schema: Schema) =>
  catchAsync(async (req, res, next) => {
    await schema.parseAsync({ body: req.body });
    next();
  });
export default zodValidator;
