// apps/api/prisma/seed.ts
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Wipe old demo data first, children before parents, so re-running
  // this script never trips a unique-constraint error on a second pass.
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.workspace.deleteMany();

  const workspace = await prisma.workspace.create({
    data: { name: 'Demo Workspace' },
  });

  const alex = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      email: 'alex@example.com',
      fullName: 'Alex Rivera',
      username: 'alexrivera',
      title: 'Product Lead',
      isGuest: false,
      googleId: 'google-demo-alex',
      themeMode: 'dark',
      accentColor: 'blue',
    },
  });

  const jordan = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      email: 'jordan@example.com',
      fullName: 'Jordan Lee',
      username: 'jordanlee',
      title: 'Engineer',
      isGuest: false,
      googleId: 'google-demo-jordan',
    },
  });

  const guest = await prisma.user.create({
    data: {
      workspaceId: workspace.id,
      fullName: 'Guest User',
      username: `guest-${Date.now()}`,
      isGuest: true,
    },
  });

  const [bugLabel, featureLabel, designLabel] = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#ef4444' } }),
    prisma.label.create({ data: { name: 'Feature', color: '#3b82f6' } }),
    prisma.label.create({ data: { name: 'Design', color: '#a855f7' } }),
  ]);

  const website = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      leadId: alex.id,
      name: 'Website Redesign',
      priority: 'HIGH',
      dueDate: new Date('2026-09-30'),
    },
  });

  const mobile = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      leadId: jordan.id,
      name: 'Mobile App',
      priority: 'MEDIUM',
    },
  });

  // Nested `create` inside a task write, in one round trip, instead of
  // creating the Task first and then separately creating join rows.
  const parentTask = await prisma.task.create({
    data: {
      projectId: website.id,
      reporterId: alex.id,
      title: 'Launch new homepage',
      status: 'IN_PROGRESS',
      priority: 'URGENT',
      dueDate: new Date('2026-09-15'),
      assignees: { create: [{ userId: jordan.id }] },
      labels: { create: [{ labelId: featureLabel.id }] },
    },
  });

  await prisma.task.create({
    data: {
      projectId: website.id,
      reporterId: jordan.id,
      parentTaskId: parentTask.id, // demonstrates the subtask relation
      title: 'Fix hero image on mobile breakpoint',
      status: 'TODO',
      priority: 'HIGH',
      assignees: { create: [{ userId: jordan.id }] },
      labels: {
        create: [{ labelId: bugLabel.id }, { labelId: designLabel.id }],
      },
    },
  });

  const backlogTask = await prisma.task.create({
    data: {
      projectId: mobile.id,
      reporterId: jordan.id,
      title: 'Explore offline mode',
      status: 'BACKLOG', // exercises the status you specifically decided to include
      priority: 'LOW',
      assignees: { create: [{ userId: guest.id }] },
    },
  });

  await prisma.comment.create({
    data: {
      taskId: parentTask.id,
      authorId: jordan.id,
      body: 'Staging link is up, ready for review.',
    },
  });

  await prisma.comment.create({
    data: {
      taskId: backlogTask.id,
      authorId: alex.id,
      body: "Let's scope this after the redesign ships.",
    },
  });

  console.log('✅ Seed complete:', {
    workspace: workspace.name,
    users: 3,
    projects: 2,
    tasks: 3,
    comments: 2,
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
    // Non-zero exit codes are how CI tools and scripts detect failure —
    // a seed script that silently swallows an error and exits 0 would
    // look successful to automation even though nothing actually got written.
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
