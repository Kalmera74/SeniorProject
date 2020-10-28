function successResp(res, data, code = 200) {
  res.status(code).json(data);
}

function errorResp(res, err, code = 400) {
  res.status(code).json({
    error: err,
    message: err.message,
  });
}

export { successResp, errorResp };
