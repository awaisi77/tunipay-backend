const jwt = require("jsonwebtoken");

function generateToken(user) {
    const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: '1d'
    });
    return token;
}

module.exports = generateToken;
