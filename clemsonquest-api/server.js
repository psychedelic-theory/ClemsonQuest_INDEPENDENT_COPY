process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // DEV ONLY: allow self-signed TLS

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();

// Set up Postgres pool + Prisma adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // allow Railway's self-signed cert in dev
  },
});
const adapter = new PrismaPg(pool);

// Prisma 7 requires an adapter *or* accelerateUrl
const prisma = new PrismaClient({
  adapter,
});

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Quick debug to confirm DB works
app.get('/debug/organizations', async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany();
    res.json(orgs);
  } catch (err) {
    console.error('Error fetching organizations', err);
    res.status(500).json({ error: 'Database error' });
  }
});

function requireAdmin(req, res, next) {
  const role = req.header('x-role');
  if (role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}


// DEV-ONLY: Seed one org + 4 teams
app.post('/dev/seed-basic', async (req, res) => {
  try {
    // If there's already at least one org, don't reseed
    const existingOrg = await prisma.organization.findFirst();
    if (existingOrg) {
      return res.status(200).json({ message: 'Org already exists', organizationId: existingOrg.id });
    }

    const org = await prisma.organization.create({
      data: {
        name: 'ClemsonQuest Org',
        teams: {
          create: [
            { name: 'Team 1', color: '#F66733' }, // Clemson orange
            { name: 'Team 2', color: '#522D80' }, // Clemson purple
            { name: 'Team 3', color: '#FFB347' },
            { name: 'Team 4', color: '#7FB3D5' },
          ],
        },
      },
      include: {
        teams: true,
      },
    });

    return res.status(201).json({
      message: 'Seeded org and teams',
      organizationId: org.id,
      teams: org.teams,
    });
  } catch (err) {
    console.error('Error in /dev/seed-basic:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ClemsonQuest API listening on port ${PORT}`);
});

// --- AUTH ROUTES ---
// Create a new organization (admin only)
app.post('/admin/organizations', requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const org = await prisma.organization.create({
      data: {
        name,
        // optionally auto-create 4 teams for each new org:
        teams: {
          create: [
            { name: 'Team 1', color: '#F66733' },
            { name: 'Team 2', color: '#522D80' },
            { name: 'Team 3', color: '#FFB347' },
            { name: 'Team 4', color: '#7FB3D5' },
          ],
        },
      },
      include: { teams: true },
    });

    return res.status(201).json(org);
  } catch (err) {
    console.error('Error in POST /admin/organizations:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// List organizations (admin only)
app.get('/admin/organizations', requireAdmin, async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      include: { teams: true },
    });
    return res.json(orgs);
  } catch (err) {
    console.error('Error in GET /admin/organizations:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// Register a new user with CUID + .edu validation + random team assignment
app.post('/auth/register', async (req, res) => {
  try {
    const { cuid, firstName, lastName, email } = req.body;

    console.log('Incoming /auth/register body:', req.body);

    if (!cuid || !firstName || !lastName || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const cuidRegex = /^C\d{8}$/;
    if (!cuidRegex.test(cuid)) {
      return res.status(400).json({ error: 'CUID must be in format C12345678' });
    }

    const eduRegex = /\.edu$/i;
    if (!eduRegex.test(email)) {
      return res.status(400).json({ error: 'Email must be a .edu address' });
    }

    // Check for duplicates
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ cuid }, { email }],
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'User with this CUID or email already exists' });
    }

    // Get the first organization (for now we only have one) + team sizes
    // Randomness only when multiple teams are tied for smallest
    const org = await prisma.organization.findFirst({
    include: {
        teams: {
        include: {
            _count: {
            select: { users: true },
            },
        },
        },
    },
    });

    if (!org || org.teams.length === 0) {
    return res.status(500).json({ error: 'No organization/teams configured. Run /dev/seed-basic first.' });
    }

    // Find the minimum team size
    const minSize = Math.min(...org.teams.map(t => t._count.users));

    // Filter to teams that have that minimum size
    const smallestTeams = org.teams.filter(t => t._count.users === minSize);

    // Pick randomly among the smallest teams
    const chosenTeam = smallestTeams[Math.floor(Math.random() * smallestTeams.length)];


    const user = await prisma.user.create({
      data: {
        cuid,
        firstName,
        lastName,
        email,
        role: 'USER',
        organizationId: org.id,
        teamId: chosenTeam.id,
      },
      include: {
        organization: true,
        team: true,
      },
    });

    return res.status(201).json({
      id: user.id,
      cuid: user.cuid,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      teamId: user.teamId,
      team: user.team ? { id: user.team.id, name: user.team.name, color: user.team.color } : null,
      organization: user.organization ? { id: user.organization.id, name: user.organization.name } : null,
    });
  } catch (err) {
    console.error('Error in /auth/register:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message,
      code: err.code,
      meta: err.meta,
    });
  }
});
