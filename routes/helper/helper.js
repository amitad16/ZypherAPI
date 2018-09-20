let responseHandler = (res, status, successBool, msgObj) =>
  res.status(status).send({
    success: successBool,
    msg: msgObj
  });

module.exports = { responseHandler };
