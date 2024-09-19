// Utility function to send standardized responses
const sendResponse = (res, statusCode, status, message, payload = null) => {
    res.status(statusCode).json({
        statusCode,
        status,
        message,
        payload
    });
};

module.exports = sendResponse;