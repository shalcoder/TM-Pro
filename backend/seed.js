const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Data Seeding...');

  // 1. Find the first organization
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('❌ No organization found. Please log in first to create one!');
    return;
  }

  // 2. Find the first user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ No user found. Please log in first!');
    return;
  }

  const tasks = [
    {
      title: 'Initialize Core Infrastructure',
      description: 'Set up the multi-tenant architecture and PostgreSQL connection pooling.',
      status: 'COMPLETED',
      priority: 'HIGH',
      organizationId: org.id,
      createdById: user.id
    },
    {
      title: 'Google OAuth2 Integration',
      description: 'Implement dual-token JWT strategy for secure organization access.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      organizationId: org.id,
      createdById: user.id
    },
    {
      title: 'Analytics Dashboard Revamp',
      description: 'Design the real-time velocity tracking and activity stream modules.',
      status: 'PENDING',
      priority: 'MEDIUM',
      organizationId: org.id,
      createdById: user.id
    },
    {
      title: 'Security Audit Logs',
      description: 'Implement persistent JSON snapshots for every administrative action.',
      status: 'BACKLOG',
      priority: 'LOW',
      organizationId: org.id,
      createdById: user.id
    },
    {
      title: 'Frontend Performance Tuning',
      description: 'Optimize Recharts rendering and pre-bundle dependencies for faster load.',
      status: 'REVIEW',
      priority: 'MEDIUM',
      organizationId: org.id,
      createdById: user.id
    }
  ];

  console.log(`📦 Seeding ${tasks.length} operations...`);

  for (const task of tasks) {
    await prisma.task.create({ data: task });
  }

  console.log('✅ Seeding Complete! Your dashboard is now pre-populated.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
