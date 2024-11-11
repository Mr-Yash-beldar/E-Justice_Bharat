const jwtConfig = require('../config/jwtConfig');

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ error: 'Token missing' }); // No token provided
  }

  try {
    const decoded = await jwtConfig.verifyToken(token); // Verify token
    req.user = decoded; // Attach decoded payload to request (e.g., litigant_id)
    // console.log("decoded",decoded);
    
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' }); // Invalid token
  }
};

module.exports = verifyAuthToken;
