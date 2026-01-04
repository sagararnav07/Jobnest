const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {

  try {
    const authHeader = req.headers["authorization"];
    // Check header exists
    if (!authHeader) {
      return res.status(401).json({ msg: "Authorization header missing" });
    }
    // Must be in the format: Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ msg: "Invalid authorization format"});
    }
    const token = parts[1];
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('ln 19 ', decoded);
    req.userId = decoded._id; // attach decoded user to request
    req.userType = decoded.userType
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ msg: "Token expired" });
    }
    return res.status(403).json({ msg: "Invalid token" });
  }
};