const jwt = require('jsonwebtoken');
const prisma = require('../../db');

// Multi-Tenant Isolation Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Always fetch user to ensure they still exist and check their organization
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { organization: true }
    });

    if (!user) return res.status(401).json({ error: 'User no longer exists' });

    // CRITICAL: Inject organizationId and user into request
    req.user = user;
    req.orgId = user.organizationId;
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    res.status(401).json({ error: 'Invalid authentication' });
  }
};

// RBAC Middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
