const jwt = require("jsonwebtoken");

require("dotenv").config();

const jwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "24h",

  //  sign a token
  signToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  },

  //  verify a token
  verifyToken: (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtConfig.secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  },
};

module.exports = jwtConfig;
