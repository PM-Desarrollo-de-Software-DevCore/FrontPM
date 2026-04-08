import Link from "next/link";

const projects = [
  {
    id: "apollo-control",
    name: "Apollo Control",
    description: "Plataforma de gestión de proyectos en tiempo real.",
    status: "En progreso",
    progress: 72,
    tasks: 18,
    owner: "Equipo DevCore",
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    description: "Aplicación móvil para seguimiento de tareas.",
    status: "Planeación",
    progress: 28,
    tasks: 10,
    owner: "UX + Frontend",
  },
  {
    id: "risk-engine",
    name: "Risk Engine",
    description: "Módulo de cálculo de riesgo y carga de trabajo.",
    status: "Completado",
    progress: 100,
    tasks: 24,
    owner: "Backend Team",
  },
];

function getStatusClasses(status: string) {
  switch (status) {
    case "Completado":
      return "bg-green-100 text-green-700 border-green-200";
    case "En progreso":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Planeación":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Project Management</p>
            <h1 className="text-3xl font-bold text-zinc-900">Tablero de proyectos</h1>
            <p className="mt-2 text-zinc-600">
              Aquí puedes visualizar todos los proyectos creados y entrar al tablero
              de tareas de cada uno.
            </p>
          </div>

          <button className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90">
            + Nuevo proyecto
          </button>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Total de proyectos</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">{projects.length}</h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Proyectos activos</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">
              {projects.filter((project) => project.status === "En progreso").length}
            </h2>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Tareas totales</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-900">
              {projects.reduce((acc, project) => acc + project.tasks, 0)}
            </h2>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-900">{project.name}</h2>
                  <p className="mt-2 text-sm text-zinc-600">{project.description}</p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(project.status)}`}
                >
                  {project.status}
                </span>
              </div>

              <div className="space-y-3 text-sm text-zinc-600">
                <p>
                  <span className="font-semibold text-zinc-800">Responsable:</span>{" "}
                  {project.owner}
                </p>
                <p>
                  <span className="font-semibold text-zinc-800">Tareas:</span>{" "}
                  {project.tasks}
                </p>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold text-zinc-800">Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-200">
                    <div
                      className="h-2 rounded-full bg-zinc-900"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <Link
                href={`/projects/${project.id}/tasks`}
                className="mt-6 inline-block rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Ver tablero de tareas
              </Link>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}