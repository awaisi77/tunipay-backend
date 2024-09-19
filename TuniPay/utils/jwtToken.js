const sendToken = (user, statusCode, res, msg, token ) => {
    res.status(statusCode).json({
        statusCode: statusCode,
        status: true,
        message: msg,
        payload: {
            user,
            token,
        }
    })
}

module.exports = sendToken;