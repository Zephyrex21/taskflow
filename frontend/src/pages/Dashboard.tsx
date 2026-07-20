import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence } from "motion/react"
import gsap from "gsap"
import { Plus, Search, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import * as api from "@/services/api"
import type { Task, TaskPriority, TaskStatus } from "@/types"
import { Navbar } from "@/components/Navbar"
import { TaskCard } from "@/components/TaskCard"
import { TaskForm, type TaskFormValues } from "@/components/TaskForm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const COLUMNS: { status: TaskStatus; label: string; accent: string }[] = [
  { status: "todo", label: "To do", accent: "bg-paper-dim" },
  { status: "in-progress", label: "In progress", accent: "bg-progress" },
  { status: "done", label: "Done", accent: "bg-done" },
]

function sortByDueDate(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
}

export default function Dashboard() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [query, setQuery] = useState("")
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    api
      .getTasks(token)
      .then((data) => {
        if (active) setTasks(data)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [token])

  // Scroll-reveal the columns once tasks have loaded.
  useEffect(() => {
    if (isLoading || !boardRef.current) return
    const columns = boardRef.current.querySelectorAll("[data-column]")
    const tween = gsap.from(columns, {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out",
    })
    return () => {
      tween.kill()
    }
  }, [isLoading])

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter
      const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase())
      return matchesPriority && matchesQuery
    })
  }, [tasks, priorityFilter, query])

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], "in-progress": [], done: [] }
    for (const task of filteredTasks) grouped[task.status].push(task)
    return {
      todo: sortByDueDate(grouped.todo),
      "in-progress": sortByDueDate(grouped["in-progress"]),
      done: sortByDueDate(grouped.done),
    }
  }, [filteredTasks])

  const stats = useMemo(() => {
    const overdue = tasks.filter(
      (t) => t.dueDate && t.status !== "done" && new Date(t.dueDate) < new Date()
    ).length
    const done = tasks.filter((t) => t.status === "done").length
    return {
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done,
      overdue,
    }
  }, [tasks])

  const hasFilters = priorityFilter !== "all" || query.trim().length > 0

  async function handleCreate(values: TaskFormValues) {
    const created = await api.createTask(token, { ...values, status: "todo" })
    setTasks((prev) => [created, ...prev])
    setIsDialogOpen(false)
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
    try {
      await api.updateTaskStatus(token, id, status)
    } catch {
      // revert on failure
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: t.status } : t)))
    }
  }

  async function handleDelete(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await api.deleteTask(token, id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't delete task.")
    }
  }

  return (
    <div className="min-h-screen bg-ink pb-16">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-medium">Your board</h1>
            <p className="mt-1 text-sm text-paper-dim">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} across your workspace
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        </div>

        {!isLoading && stats.total > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: stats.total, dot: "bg-flow" },
              { label: "In progress", value: stats.inProgress, dot: "bg-progress" },
              { label: "Done", value: stats.done, dot: "bg-done" },
              { label: "Overdue", value: stats.overdue, dot: "bg-danger" },
            ].map((s) => (
              <div key={s.label} className="clay-sm bg-ink-raised px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className="text-xs text-paper-dim">{s.label}</span>
                </div>
                <p className="mt-1 font-display text-xl font-medium">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks…"
              className="pl-10"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | "all")}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("")
                setPriorityFilter("all")
              }}
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {error && (
          <p role="alert" className="clay-sm mb-6 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="clay h-64 animate-pulse bg-ink-raised/60" />
            ))}
          </div>
        ) : stats.total === 0 ? (
          <div className="clay flex flex-col items-center gap-2 bg-ink-raised px-6 py-16 text-center">
            <p className="font-display text-lg font-medium">Your board is empty</p>
            <p className="max-w-sm text-sm text-paper-dim">
              Create your first task to start tracking work — it'll land in To do.
            </p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              New task
            </Button>
          </div>
        ) : (
          <div ref={boardRef} className="grid gap-4 sm:grid-cols-3">
            {COLUMNS.map(({ status, label, accent }) => (
              <div key={status} data-column className="clay-inset flex flex-col gap-3 bg-ink-raised/40 p-3">
                <div className="flex items-center gap-2 px-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
                  <h2 className="text-xs font-medium uppercase tracking-wide text-paper-dim">
                    {label}
                  </h2>
                  <span className="text-xs text-paper-dim/60">{tasksByStatus[status].length}</span>
                </div>

                <div className="flex flex-col gap-2 min-h-[4rem]">
                  <AnimatePresence mode="popLayout">
                    {tasksByStatus[status].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))}
                  </AnimatePresence>
                  {tasksByStatus[status].length === 0 && (
                    <div className="rounded-2xl border border-dashed border-ink-line px-4 py-6 text-center text-xs text-paper-dim/60">
                      Nothing here yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
            <DialogDescription>Add it to your board — it'll start in To do.</DialogDescription>
          </DialogHeader>
          <TaskForm onSubmit={handleCreate} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
