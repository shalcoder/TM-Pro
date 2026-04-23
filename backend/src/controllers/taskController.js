const prisma = require('../../db');
const { logAction } = require('../services/auditService');

exports.getTasks = async (req, res) => {
  try {
    const { role, id, orgId } = req.user;

    const where = {
      organizationId: orgId,
    };

    if (role !== 'ADMIN') {
      where.createdById = id;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        createdById: req.user.id,
        organizationId: req.orgId
      }
    });

    await logAction({
      userId: req.user.id,
      action: 'TASK_CREATED',
      taskId: task.id,
      newValue: task
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: 'Task creation failed' });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;

  try {
    const existingTask = await prisma.task.findFirst({
      where: { id, organizationId: req.orgId }
    });

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && existingTask.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { 
        title, 
        description, 
        status,
        priority 
      }
    });

    await logAction({
      userId: req.user.id,
      action: 'TASK_UPDATED',
      taskId: id,
      oldValue: existingTask,
      newValue: updatedTask
    });

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: 'Update failed' });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const existingTask = await prisma.task.findFirst({
      where: { id, organizationId: req.orgId }
    });

    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'ADMIN' && existingTask.createdById !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.task.delete({ where: { id } });

    await logAction({
      userId: req.user.id,
      action: 'TASK_DELETED',
      taskId: null,
      oldValue: existingTask
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Deletion failed' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { organizationId: req.orgId }
    });

    const statusStats = [
      { name: 'Backlog', value: tasks.filter(t => t.status === 'BACKLOG').length },
      { name: 'Todo', value: tasks.filter(t => t.status === 'PENDING').length },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'IN_PROGRESS').length },
      { name: 'Review', value: tasks.filter(t => t.status === 'REVIEW').length },
      { name: 'Done', value: tasks.filter(t => t.status === 'COMPLETED').length },
    ];

    const priorityStats = [
      { name: 'High', value: tasks.filter(t => t.priority === 'HIGH').length },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'MEDIUM').length },
      { name: 'Low', value: tasks.filter(t => t.priority === 'LOW').length },
    ];

    res.json({ statusStats, priorityStats, total: tasks.length });
  } catch (err) {
    res.status(500).json({ error: 'Stats retrieval failed' });
  }
};
