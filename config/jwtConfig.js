const jwt = require('jsonwebtoken');

// Load environment variables from a .env file
require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET , // Use environment variable or fallback to a default secret
  expiresIn: '24h', // Token expiration time, 

  // Method to sign a token
  signToken: (payload) => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
  },

  // Method to verify a token
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
