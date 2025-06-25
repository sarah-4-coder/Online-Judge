import jwt from 'jsonwebtoken';


// Middleware to verify JWT token and attach user info to request
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// Middleware to verify if user is an admin
export const verifyAdmin = (req, res, next) => {
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access Denied: Admins only' });
  }
  next();
};
