// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  // Retrieve token from the request header (or other location as needed)
  const token = req.headers["authorization"]?.split(" ")[1]; // e.g., "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret

    // Attach the user data to the request object for use in the next middleware/controller
    req.user = decoded;
    
    // Proceed to the next middleware/controller
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
