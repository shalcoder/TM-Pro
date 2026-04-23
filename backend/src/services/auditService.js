const prisma = require('../../db');

const logAction = async ({ userId, action, taskId, oldValue, newValue }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        taskId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
      }
    });
  } catch (err) {
    console.error('Audit Logging Failed:', err);
    // In production, you might want to send this to a dedicated logging service (Sentry, ELK)
  }
};

module.exports = { logAction };
