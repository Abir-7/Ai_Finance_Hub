export const noRouteFound = (req, res, next) => {
    res.status(404).send({
        success: false,
        statusCode: 404,
        message: "Api not found!",
    });
};
