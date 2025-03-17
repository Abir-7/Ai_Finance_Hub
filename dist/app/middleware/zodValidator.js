import catchAsync from "../utils/catchAsync";
const zodValidator = (schema) => catchAsync(async (req, res, next) => {
    await schema.parseAsync({ body: req.body });
    next();
});
export default zodValidator;
