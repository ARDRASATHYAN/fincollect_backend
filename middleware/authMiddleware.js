// middleware/auth.js
const jwt = require("jsonwebtoken");
const ACCESS_TOKEN_SECRET = "access_secret"; // same secret as in controller

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: "Access token expired" });
    req.user = user; // attach user info to request
    next();
  });
};

module.exports = authenticateToken;
