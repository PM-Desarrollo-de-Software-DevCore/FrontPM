"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TaskStatus = "backlog" | "inProgress" | "completed";
type TaskPriority = "High" | "Medium" | "Low";

type Task = {
  id: number;
  title: string;
  description: string;
  assignee: string;
  owner: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  comments: number;
  attachments: number;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Food Research",
    description:
      "Food design is required for our new project. Let's research the best practices.",
    assignee: "Samira",
    owner: "UI Sharks",
    dueDate: "2026-04-20",
    priority: "High",
    status: "backlog",
    comments: 8,
    attachments: 5,
  },
  {
    id: 2,
    title: "Mockups",
    description: "Create the first mobile mockups for the interface.",
    assignee: "Andrea",
    owner: "UI Sharks",
    dueDate: "2026-04-24",
    priority: "Medium",
    status: "backlog",
    comments: 6,
    attachments: 3,
  },
  {
    id: 3,
    title: "UI Animation",
    description: "Micro interactions and loading progress animations.",
    assignee: "Luis",
    owner: "Frontend Team",
    dueDate: "2026-04-25",
    priority: "Low",
    status: "backlog",
    comments: 4,
    attachments: 2,
  },
  {
    id: 4,
    title: "User Interface",
    description: "Design new user interface for the delivery app.",
    assignee: "Carlos",
    owner: "UI Sharks",
    dueDate: "2026-04-18",
    priority: "High",
    status: "inProgress",
    comments: 4,
    attachments: 2,
  },
  {
    id: 5,
    title: "Usability Testing",
    description: "Perform the usability testing for the newly developed app.",
    assignee: "Elena",
    owner: "QA Team",
    dueDate: "2026-04-22",
    priority: "Medium",
    status: "inProgress",
    comments: 5,
    attachments: 3,
  },
  {
    id: 6,
    title: "Food Research",
    description:
      "Food design is required for our new project. Let's research the best practices.",
    assignee: "Bruno",
    owner: "Product Team",
    dueDate: "2026-04-21",
    priority: "Low",
    status: "inProgress",
    comments: 9,
    attachments: 5,
  },
  {
    id: 7,
    title: "Mind Mapping",
    description:
      "Mind mapping for the food delivery app by targeting young users.",
    assignee: "Mia",
    owner: "Product Team",
    dueDate: "2026-04-15",
    priority: "Low",
    status: "completed",
    comments: 2,
    attachments: 7,
  },
  {
    id: 8,
    title: "Food Research",
    description:
      "Food design is required for our new project. Let's research the best practices.",
    assignee: "Leo",
    owner: "Research Team",
    dueDate: "2026-04-12",
    priority: "Medium",
    status: "completed",
    comments: 5,
    attachments: 5,
  },
  {
    id: 9,
    title: "User Feedback",
    description:
      "Perform the user survey and take necessary steps to solve the problem.",
    assignee: "Nora",
    owner: "UX Team",
    dueDate: "2026-04-10",
    priority: "High",
    status: "completed",
    comments: 8,
    attachments: 5,
  },
];

const columns: { key: TaskStatus; title: string }[] = [
  { key: "backlog", title: "Backlog" },
  { key: "inProgress", title: "In Progress" },
  { key: "completed", title: "Completed" },
];

function formatDate(date: string) {
  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysLabel(date: string) {
  const today = new Date();
  const due = new Date(date);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diff = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff <= 0) return "Due today";
  if (diff === 1) return "1 day";
  return `${diff} days`;
}

function getPriorityClasses(priority: TaskPriority) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-500";
    case "Medium":
      return "bg-amber-100 text-amber-600";
    case "Low":
      return "bg-zinc-200 text-zinc-700";
    default:
      return "bg-zinc-200 text-zinc-700";
  }
}

function getStatusClasses(status: TaskStatus) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-600";
    case "inProgress":
      return "bg-amber-100 text-amber-600";
    case "backlog":
      return "bg-zinc-200 text-zinc-700";
    default:
      return "bg-zinc-200 text-zinc-700";
  }
}

function getColumnHeaderClasses(status: TaskStatus) {
  switch (status) {
    case "backlog":
      return "border-l-4 border-l-zinc-400";
    case "inProgress":
      return "border-l-4 border-l-amber-400";
    case "completed":
      return "border-l-4 border-l-green-400";
    default:
      return "border-l-4 border-l-zinc-400";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (task: Task) => void;
}

function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignee: "",
    owner: "",
    dueDate: "",
    priority: "Medium" as TaskPriority,
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newTask: Task = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      assignee: form.assignee,
      owner: form.owner,
      dueDate: form.dueDate,
      priority: form.priority,
      status: "backlog",
      comments: 0,
      attachments: 0,
    };

    onCreate(newTask);

    setForm({
      title: "",
      description: "",
      assignee: "",
      owner: "",
      dueDate: "",
      priority: "Medium",
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl space-y-5 rounded-2xl border bg-white p-8 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-zinc-900">Create Task</h2>

        <input
          value={form.title}
          placeholder="Task Title"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <input
          value={form.assignee}
          placeholder="Assignee"
          onChange={(e) => setForm({ ...form, assignee: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <input
          value={form.owner}
          placeholder="Manager"
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <textarea
          value={form.description}
          placeholder="Task Description"
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border p-3"
          required
        />

        <div>
          <label className="mb-1 block text-sm text-zinc-600">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full rounded border p-3"
            required
          />
        </div>

        <select
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value as TaskPriority })
          }
          className="w-full rounded border p-3"
        >
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded border px-4 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-full rounded bg-black px-4 py-3 text-white"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProjectTasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const groupedTasks = useMemo<Record<TaskStatus, Task[]>>(() => {
    return {
      backlog: tasks.filter((task) => task.status === "backlog"),
      inProgress: tasks.filter((task) => task.status === "inProgress"),
      completed: tasks.filter((task) => task.status === "completed"),
    };
  }, [tasks]);

  const handleDropTask = (newStatus: TaskStatus) => {
    if (!draggedTaskId) return;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === draggedTaskId ? { ...task, status: newStatus } : task
      )
    );

    if (selectedTask?.id === draggedTaskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : prev));
    }

    setDraggedTaskId(null);
  };

  const handleCreateTask = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/projects"
              className="mb-2 inline-flex text-sm text-zinc-500 hover:text-zinc-700"
            >
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-semibold text-zinc-700">Tasks</h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            + New Task
          </button>
        </div>

        <section className="grid grid-cols-1 gap-10 xl:grid-cols-3">
          {columns.map((column) => (
            <div
              key={column.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropTask(column.key)}
              className="min-h-[650px] rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-5 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 ${getColumnHeaderClasses(
                  column.key
                )}`}
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-zinc-800">
                    {column.title}
                  </h2>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-semibold text-zinc-500">
                    {groupedTasks[column.key].length}
                  </span>
                </div>

                <button className="text-lg text-zinc-400">•••</button>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="mb-4 flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-red-300 bg-red-50 py-3 text-xl font-semibold text-red-400 transition hover:bg-red-100 active:scale-95"
              >
                +
              </button>

              <div className="space-y-5">
                {groupedTasks[column.key].map((task) => (
                  <article
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onClick={() => setSelectedTask(task)}
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-zinc-800">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <span>🕒</span>
                        <span>{daysLabel(task.dueDate)}</span>
                      </div>
                    </div>

                    <p className="mb-4 text-sm leading-6 text-zinc-500">
                      {task.description}
                    </p>

                    <div className="mb-4 flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <span>📎</span>
                        <span>{task.attachments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{task.comments}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        className="rounded-full bg-cyan-50 px-2 py-1 text-[10px] font-medium text-cyan-500"
                      >
                        +
                      </button>

                      <div className="flex -space-x-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-200 text-[10px] font-semibold text-zinc-700">
                          {initials(task.owner)}
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-200 text-[10px] font-semibold text-zinc-700">
                          {initials(task.assignee)}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
      />

      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-400">
                  Project / Task ID - {selectedTask.id}
                </p>
                <h2 className="text-3xl font-semibold text-zinc-800">
                  {selectedTask.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="cursor-pointer text-2xl text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            </div>

            <div className="mb-6 grid grid-cols-[120px_1fr] gap-y-4 text-sm">
              <p className="text-zinc-500">Priority</p>
              <div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${getPriorityClasses(
                    selectedTask.priority
                  )}`}
                >
                  {selectedTask.priority}
                </span>
              </div>

              <p className="text-zinc-500">Status</p>
              <div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold ${getStatusClasses(
                    selectedTask.status
                  )}`}
                >
                  {selectedTask.status === "inProgress"
                    ? "In Progress"
                    : selectedTask.status === "completed"
                    ? "Completed"
                    : "Backlog"}
                </span>
              </div>

              <p className="text-zinc-500">Manager</p>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[10px] font-semibold text-zinc-700">
                  {initials(selectedTask.owner)}
                </div>
                <span className="text-zinc-700">{selectedTask.owner}</span>
              </div>

              <p className="text-zinc-500">Assignee</p>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-200 text-[10px] font-semibold text-zinc-700">
                  {initials(selectedTask.assignee)}
                </div>
                <span className="text-zinc-700">{selectedTask.assignee}</span>
              </div>

              <p className="text-zinc-500">Due Date</p>
              <div className="text-zinc-700">{formatDate(selectedTask.dueDate)}</div>
            </div>

            <div className="mb-6 border-t border-zinc-200 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                Attachments
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-sky-500">📎 Document Links</p>
                <button className="cursor-pointer text-zinc-600">
                  + Add Attachment
                </button>
              </div>
            </div>

            <div className="mb-6 border-t border-zinc-200 pt-5">
              <h3 className="mb-3 text-sm font-semibold text-zinc-700">
                Description
              </h3>
              <p className="text-sm leading-7 text-zinc-500">
                {selectedTask.description}
              </p>
            </div>

            <div className="border-t border-zinc-200 pt-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-xs font-semibold text-zinc-700">
                  {initials(selectedTask.assignee)}
                </div>
                <div className="flex gap-4 text-sm text-zinc-500">
                  <button className="cursor-pointer font-medium">Normal Text</button>
                  <button className="cursor-pointer">B</button>
                  <button className="cursor-pointer italic">I</button>
                  <button className="cursor-pointer">•</button>
                  <button className="cursor-pointer">🔗</button>
                </div>
              </div>

              <textarea
                placeholder="Add attachment or add comment to describe the issue..."
                className="mb-4 min-h-[90px] w-full rounded-lg bg-zinc-50 p-3 text-sm outline-none"
              />

              <div className="flex items-center gap-3">
                <button className="cursor-pointer rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white">
                  Save
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="cursor-pointer text-sm text-zinc-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}