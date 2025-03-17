const sendResponse = (res, data) => {
    res.status(data.statusCode).send({
        success: data.success,
        message: data.message,
        statusCode: data.statusCode,
        data: data.data,
        meta: data.meta,
    });
};
export default sendResponse;
