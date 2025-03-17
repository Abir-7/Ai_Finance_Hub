import AppError from "../../errors/AppError";
export const parseDataField = (fieldName) => (req, res, next) => {
    try {
        if (req.body[fieldName]) {
            req.body = JSON.parse(req.body[fieldName]);
            next();
        }
        else {
            next();
        }
    }
    catch (error) {
        throw new AppError(500, "Invalid JSON string");
    }
};
