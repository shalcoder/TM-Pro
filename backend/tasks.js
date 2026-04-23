const express = require('express');
const prisma = require('./db');
const { authenticate, authorize } = require('./middleware');
const router = express.Router();

// Create Task
router.post('/', authenticate, async (req, res) => {
  const { title, description, priority, dueDate, category } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || 'General',
        userId: req.user.id,
        organizationId: req.user.organizationId
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        details: `Task created: ${title}`,
        userId: req.user.id,
        taskId: task.id
      }
    });

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create task' });
  }
});

// Get Tasks (Tenant Isolation)
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId: req.user.organizationId },
      include: { user: { select: { email: true } } }
    });
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch tasks' });
  }
});

// Update Task (RBAC: Admin can update any in org, Member only their own)
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, category } = req.body;
  try {
    const task = await prisma.task.findFirst({
      where: { id, organizationId: req.user.organizationId }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
        title, 
        description, 
        status, 
        priority, 
        dueDate: dueDate ? new Date(dueDate) : undefined, 
        category 
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        details: `Task updated: ${title || task.title}`,
        userId: req.user.id,
        taskId: id
      }
    });

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update task' });
  }
});

// Delete Task (RBAC: Admin can delete any in org, Member only their own)
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findFirst({
      where: { id, organizationId: req.user.organizationId }
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this task' });
    }

    await prisma.task.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        details: `Task deleted: ${task.title}`,
        userId: req.user.id
      }
    });

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete task' });
  }
});

// Audit Logs
router.get('/logs', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { user: { organizationId: req.user.organizationId } },
      include: { user: { select: { email: true } }, task: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(logs);
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch logs' });
  }
});

// Stats for Analytics
router.get('/stats', authenticate, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId: req.user.organizationId }
    });

    const statusStats = [
      { name: 'Todo', value: tasks.filter(t => t.status === 'TODO').length },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
      { name: 'Done', value: tasks.filter(t => t.status === 'DONE').length },
    ];

    const priorityStats = [
      { name: 'High', value: tasks.filter(t => t.priority === 'HIGH').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'LOW').length },
    ];

    res.json({ statusStats, priorityStats, total: tasks.length });
  } catch (err) {
    res.status(400).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
