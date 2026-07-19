import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://fake-for-ci-test-only';

let app;

function installFakes() {
  const User = require('../models/User');
  const Task = require('../models/Task');

  let idCounter = 0;
  const nextId = (prefix) => `${prefix}_${++idCounter}`;
  const users = [];
  const tasks = [];

  function matchesFilter(doc, filter) {
    return Object.keys(filter).every((key) => String(doc[key]) === String(filter[key]));
  }

  User.findOne = async (filter) => {
    const found = users.find((u) => matchesFilter(u, filter));
    return found ? { ...found } : null;
  };
  User.create = async (data) => {
    const user = { _id: nextId('user'), ...data };
    users.push(user);
    return user;
  };
  User.findById = (id) => ({
    select: async () => {
      const user = users.find((u) => u._id === id);
      if (!user) return null;
      const clone = { ...user };
      delete clone.passwordHash;
      return clone;
    },
  });

  Task.create = async (data) => {
    const task = { _id: nextId('task'), ...data, createdAt: new Date(), updatedAt: new Date() };
    tasks.push(task);
    return task;
  };
  Task.find = (filter) => ({
    sort: async () => tasks.filter((t) => matchesFilter(t, filter)),
  });
  Task.findOne = async (filter) => {
    const found = tasks.find((t) => matchesFilter(t, filter));
    return found ? { ...found } : null;
  };
  Task.findOneAndUpdate = async (filter, updates) => {
    const idx = tasks.findIndex((t) => matchesFilter(t, filter));
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date() };
    return { ...tasks[idx] };
  };
  Task.findOneAndDelete = async (filter) => {
    const idx = tasks.findIndex((t) => matchesFilter(t, filter));
    if (idx === -1) return null;
    const [removed] = tasks.splice(idx, 1);
    return removed;
  };
}

beforeAll(() => {
  installFakes();
  app = require('../app');
});

describe('Health check', () => {
  it('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth flow', () => {
  let token;

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.token).toBeDefined();
    token = res.body.data.token;
  });

  it('rejects duplicate email registration', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });

  it('blocks /api/tasks without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(401);
  });

  it('creates and fetches a task with a valid token', async () => {
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'CI test task', priority: 'high' });
    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
  });
});
