//Middleware Response types whether give an error or not

const successResp = (res, data, code = 200) => {
    res.status(code).json(data);
};

const errorResp = (res, err, code = 400) => {
    res.status(code).json({
        error: err,
        message: err.message,
    });
};

export {successResp, errorResp};

//enc