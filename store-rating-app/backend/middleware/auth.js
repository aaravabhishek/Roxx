const jwt = require('jsonwebtoken');

// Verifies the JWT sent in the Authorization header ("Bearer <token>").
// Attaches the decoded payload (id, role, email) to req.user.
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is missing.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

// Restricts a route to one or more roles. Must be used after authenticate().
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to access this resource.' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
