type Task = {
  id: number;
  title: string;
  assignee: string;
  priority: "Alta" | "Media" | "Baja";
  dueDate: string;
};

const tasksByProject: Record<
  string,
  {
    projectName: string;
    columns: {
      todo: Task[];
      inProgress: Task[];
      done: Task[];
    };
  }
> = {
  "apollo-control": {
    projectName: "Apollo Control",
    columns: {
      todo: [
        {
          id: 1,
          title: "Diseñar vista de dashboard ejecutivo",
          assignee: "Samira",
          priority: "Alta",
          dueDate: "2026-04-12",
        },
        {
          id: 2,
          title: "Definir tarjetas de métricas",
          assignee: "Bruno",
          priority: "Media",
          dueDate: "2026-04-14",
        },
      ],
      inProgress: [
        {
          id: 3,
          title: "Conectar endpoint de proyectos",
          assignee: "Israel",
          priority: "Alta",
          dueDate: "2026-04-10",
        },
      ],
      done: [
        {
          id: 4,
          title: "Inicializar estructura del frontend",
          assignee: "Equipo Front",
          priority: "Baja",
          dueDate: "2026-04-05",
        },
      ],
    },
  },
  "mobile-app": {
    projectName: "Mobile App",
    columns: {
      todo: [
        {
          id: 5,
          title: "Crear flujo de login",
          assignee: "Andrea",
          priority: "Alta",
          dueDate: "2026-04-18",
        },
      ],
      inProgress: [
        {
          id: 6,
          title: "Diseño del tablero mobile",
          assignee: "Luis",
          priority: "Media",
          dueDate: "2026-04-16",
        },
      ],
      done: [],
    },
  },
  "risk-engine": {
    projectName: "Risk Engine",
    columns: {
      todo: [],
      inProgress: [],
      done: [
        {
          id: 7,
          title: "Cálculo de score de riesgo",
          assignee: "Backend Team",
          priority: "Alta",
          dueDate: "2026-04-01",
        },
        {
          id: 8,
          title: "Pruebas de workload",
          assignee: "QA Team",
          priority: "Media",
          dueDate: "2026-04-03",
        },
      ],
    },
  },
};

function getPriorityClasses(priority: Task["priority"]) {
  switch (priority) {
    case "Alta":
      return "bg-red-100 text-red-700";
    case "Media":
      return "bg-yellow-100 text-yellow-700";
    case "Baja":
      return "bg-green-100 text-green-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = tasksByProject[projectId];

  if (!project) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-zinc-900">Proyecto no encontrado</h1>
          <p className="mt-2 text-zinc-600">
            No existe un tablero de tareas para este proyecto.
          </p>
        </div>
      </main>
    );
  }

  const columns = [
    { key: "todo", title: "Por hacer", tasks: project.columns.todo },
    { key: "inProgress", title: "En progreso", tasks: project.columns.inProgress },
    { key: "done", title: "Completadas", tasks: project.columns.done },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">Tablero de tareas</p>
          <h1 className="text-3xl font-bold text-zinc-900">{project.projectName}</h1>
          <p className="mt-2 text-zinc-600">
            Visualiza el avance de las tareas por columna.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-3">
          {columns.map((column) => (
            <div
              key={column.key}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">{column.title}</h2>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {column.tasks.length}
                </span>
              </div>

              <div className="space-y-4">
                {column.tasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
                    No hay tareas en esta columna.
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-zinc-900">{task.title}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(task.priority)}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-zinc-600">
                        <p>
                          <span className="font-medium text-zinc-800">Asignado a:</span>{" "}
                          {task.assignee}
                        </p>
                        <p>
                          <span className="font-medium text-zinc-800">Fecha límite:</span>{" "}
                          {task.dueDate}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}