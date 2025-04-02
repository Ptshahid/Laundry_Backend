const jwt = require("jsonwebtoken");
require("dotenv").config();

// Authentication Middleware
module.exports = (req, res, next) => {
  const token = req.headers.authorization;
  // const token = req.get("Authorization");
  if (!token) {
    console.log("🔴 No token provided");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ Authentication successful, moving to next middleware");
    next();
  } catch (error) {
    console.log("🔴 Invalid token:", error.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};


// Admin Middleware
module.exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("🔴 Access Denied: User is not an admin");
    return res.status(403).json({ error: "Access Denied: Admins only" });
  }
  console.log("✅ Admin check passed");
  next();
};


// Role-based access middleware
module.exports.authRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      console.log(`🔴 Access Denied: User is not a ${role}`);
      return res.status(403).json({ error: `Access Denied: ${role} only` });
    }
    console.log(`✅ Role check passed: User is a ${role}`);
    next();
  };
};

