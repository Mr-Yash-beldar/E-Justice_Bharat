const jwtConfig = require("../config/jwtConfig");

const verifyAuthToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = await jwtConfig.verifyToken(token);
    req.user = decoded;
    // console.log("decoded",decoded);

    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyAuthToken;
