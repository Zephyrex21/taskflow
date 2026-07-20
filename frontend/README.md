# TaskFlow

A task manager UI — register/login, personal to-do board with drag-free
status columns, priority and due-date filtering, and a claymorphism design
system with animated landing page. Fully frontend-only: all data lives in
mock storage in the browser, no backend or database required.

## Stack

- React 19 + Vite + TypeScript
- React Router v7
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- GSAP + ScrollTrigger, Motion (formerly Framer Motion), Lenis smooth scroll

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL Vite prints. Register an account (stored in mock data
for the session) and start creating tasks.

## Structure

```
src/
├── pages/        Landing, Login, Register, Dashboard
├── components/   Navbar, TaskCard, TaskForm, ui/ (shadcn components)
├── services/     api.js — mock data layer
├── context/      AuthContext.js — auth state
└── hooks/        useLenis.ts — smooth scroll setup
```

## Build

```bash
npm run build
```
