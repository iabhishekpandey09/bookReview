const jwt  = require("jsonwebtoken");
const User = require("../models/user.model");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Please log in to continue" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found, please log in again" });
    }

    req.user = user;

    next(); 
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session, please log in again" });
  }
}






module.exports = authMiddleware;