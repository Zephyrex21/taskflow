import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Task, TaskPriority } from "@/types"

export interface TaskFormValues {
  title: string
  description?: string
  priority: TaskPriority
  dueDate?: string
}

interface TaskFormProps {
  initialValues?: Partial<Task>
  onSubmit: (values: TaskFormValues) => Promise<void> | void
  onCancel: () => void
  submitLabel?: string
}

export function TaskForm({ initialValues, onSubmit, onCancel, submitLabel = "Add task" }: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [description, setDescription] = useState(initialValues?.description ?? "")
  const [priority, setPriority] = useState<TaskPriority>(initialValues?.priority ?? "medium")
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({ title, description: description || undefined, priority, dueDate: dueDate || undefined })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ship the onboarding flow"
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-description">Description</Label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail (optional)"
          rows={3}
          className="flex w-full rounded-xl clay-inset bg-ink-raised px-4 py-2 text-sm text-paper placeholder:text-paper-dim/60 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flow resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-priority">Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
            <SelectTrigger id="task-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="task-due">Due date</Label>
          <Input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  )
}
