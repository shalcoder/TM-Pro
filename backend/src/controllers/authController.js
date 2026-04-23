const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../db');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

exports.generateTokens = generateTokens;

exports.register = async (req, res) => {
  const { email, password, organizationName } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Atomically create Org + Admin User
    const result = await prisma.$transaction(async (tx) => {
      let org = await tx.organization.findFirst({ where: { name: organizationName } });
      if (!org) {
        org = await tx.organization.create({ data: { name: organizationName } });
      }

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN', // First user in org is Admin
          organizationId: org.id
        }
      });
      return user;
    });

    const { accessToken, refreshToken } = generateTokens(result.id);
    
    // Save refresh token to DB
    await prisma.user.update({
      where: { id: result.id },
      data: { refreshToken }
    });

    res.status(201).json({ 
      accessToken, 
      refreshToken, 
      user: { 
        email: result.email, 
        role: result.role, 
        organizationId: result.organizationId,
        organizationName: organizationName 
      } 
    });
  } catch (err) {
    res.status(400).json({ error: 'Registration failed: ' + err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.id },
      include: { organization: true }
    });

    res.json({ 
      accessToken, 
      refreshToken, 
      user: { 
        email: user.email, 
        role: user.role, 
        organizationId: user.organizationId,
        organizationName: userWithOrg.organization.name
      } 
    });
  } catch (err) {
    res.status(400).json({ error: 'Login failed' });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken }
    });

    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

exports.oauthSuccess = async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user.id);
  
  await prisma.user.update({
    where: { id: req.user.id },
    data: { refreshToken }
  });

  const userWithOrg = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { organization: true }
  });

  const userData = JSON.stringify({ 
    email: req.user.email, 
    role: req.user.role, 
    organizationId: req.user.organizationId,
    organizationName: userWithOrg.organization.name
  });

  // Redirect back to frontend with tokens
  res.redirect(`http://localhost:3000/login?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(userData)}`);
};
