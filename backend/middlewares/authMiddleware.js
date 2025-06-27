import jwt from 'jsonwebtoken';

// Middleware to verify JWT from HttpOnly cookie
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info (id, role) to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if logged-in user is an admin
export const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access Denied: Admins only' });
  }
  next();
};
