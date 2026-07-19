// services/api.js
// All API calls live here, per team convention — nowhere else.
// Set VITE_USE_MOCK_API=false in .env once the real backend is live.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== "false"

// ---------------------------------------------------------------------------
// Mock data + helpers (used until the real backend is ready)
// ---------------------------------------------------------------------------

const MOCK_LATENCY_MS = 350

/** @type {import("../types").Task[]} */
let mockTasks = [
  {
    id: "t1",
    title: "Wire up Auth context",
    description: "Connect login/register forms to AuthContext and persist the JWT.",
    status: "done",
    priority: "high",
    dueDate: "2026-07-15",
    userId: "u1",
  },
  {
    id: "t2",
    title: "Build task board UI",
    description: "Kanban-style columns for todo / in-progress / done with drag reordering.",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-07-20",
    userId: "u1",
  },
  {
    id: "t3",
    title: "Hook up GSAP ScrollTrigger reveals",
    description: "Stagger the task cards in on scroll, respecting reduced-motion.",
    status: "in-progress",
    priority: "medium",
    dueDate: "2026-07-19",
    userId: "u1",
  },
  {
    id: "t4",
    title: "Write API contract doc",
    description: "Document every endpoint Sumit's backend needs to expose.",
    status: "done",
    priority: "medium",
    dueDate: "2026-07-10",
    userId: "u1",
  },
  {
    id: "t5",
    title: "Design empty + error states",
    status: "todo",
    priority: "low",
    dueDate: "2026-07-25",
    userId: "u1",
  },
  {
    id: "t6",
    title: "Add due-date + priority filters",
    status: "todo",
    priority: "medium",
    dueDate: "2026-07-22",
    userId: "u1",
  },
]

const mockUser = { id: "u1", name: "Gaurav Kumar", email: "gaurav@taskflow.dev" }

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockToken() {
  return "mock.jwt.token"
}

// ---------------------------------------------------------------------------
// Low-level request helper (real API path)
// ---------------------------------------------------------------------------

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}))
    throw new Error(errBody.message || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return null
  const json = await res.json()
  return json.data !== undefined ? json.data : json
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export async function registerUser({ name, email, password }) {
  if (USE_MOCK) {
    await delay()
    return { token: mockToken(), user: { ...mockUser, name, email } }
  }
  return request("/auth/register", { method: "POST", body: { name, email, password } })
}

export async function loginUser({ email, password }) {
  if (USE_MOCK) {
    await delay()
    if (!email || !password) throw new Error("Email and password are required.")
    return { token: mockToken(), user: mockUser }
  }
  return request("/auth/login", { method: "POST", body: { email, password } })
}

export async function getCurrentUser(token) {
  if (USE_MOCK) {
    await delay(150)
    return mockUser
  }
  return request("/auth/me", { token })
}

// ---------------------------------------------------------------------------
// Task endpoints
// ---------------------------------------------------------------------------

export async function getTasks(token) {
  if (USE_MOCK) {
    await delay()
    return [...mockTasks]
  }
  return request("/tasks", { token })
}

export async function createTask(token, task) {
  if (USE_MOCK) {
    await delay()
    const newTask = { ...task, id: `t${Date.now()}`, userId: mockUser.id }
    mockTasks = [newTask, ...mockTasks]
    return newTask
  }
  return request("/tasks", { method: "POST", body: task, token })
}

export async function getTask(token, id) {
  if (USE_MOCK) {
    await delay(150)
    const task = mockTasks.find((t) => t.id === id)
    if (!task) throw new Error("Task not found.")
    return task
  }
  return request(`/tasks/${id}`, { token })
}

export async function updateTask(token, id, updates) {
  if (USE_MOCK) {
    await delay()
    mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    return mockTasks.find((t) => t.id === id)
  }
  return request(`/tasks/${id}`, { method: "PUT", body: updates, token })
}

export async function deleteTask(token, id) {
  if (USE_MOCK) {
    await delay()
    mockTasks = mockTasks.filter((t) => t.id !== id)
    return null
  }
  return request(`/tasks/${id}`, { method: "DELETE", token })
}

export async function updateTaskStatus(token, id, status) {
  if (USE_MOCK) {
    await delay(200)
    mockTasks = mockTasks.map((t) => (t.id === id ? { ...t, status } : t))
    return mockTasks.find((t) => t.id === id)
  }
  return request(`/tasks/${id}/status`, { method: "PATCH", body: { status }, token })
}