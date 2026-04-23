const express = require('express');
const taskController = require('../controllers/taskController');
const { authenticate, authorize } = require('../middlewares/auth');
const prisma = require('../../db');
const router = express.Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.get('/stats', taskController.getStats);

// Audit Logs (Admin Only)
router.get('/audit', authorize(['ADMIN']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { user: { organizationId: req.orgId } },
      include: { user: { select: { email: true } } },
      orderBy: { timestamp: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
