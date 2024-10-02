const jwtConfig = require('../config/jwtConfig');

const authenticateLitigant = async (req, res, next) => {
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


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Unauthorized access" });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is not valid" });
    req.user = user; // Attach user data to req.user
    next();
  });
};

module.exports = authenticateToken;
module.exports = authenticateLitigant;
