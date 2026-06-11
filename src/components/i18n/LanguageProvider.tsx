"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "es";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "app-language";
// Texto fuente (idioma base) por nodo. Se refresca cuando React reescribe el nodo
// con contenido nuevo (p.ej. un botón que pasa de "Create User" a "Save Changes").
const textNodeOriginalValues = new WeakMap<Text, string>();
// Última traducción que ESTE provider escribió en el nodo. Permite distinguir un
// cambio hecho por React (texto fuente nuevo) de uno hecho por nosotros (traducción).
const textNodeTranslatedValues = new WeakMap<Text, string>();
const attributeOriginalValues = new WeakMap<HTMLElement, Map<string, string>>();
const attributeTranslatedValues = new WeakMap<HTMLElement, Map<string, string>>();

const esToEnEntries: Array<[string, string]> = [
  ["Cargando sesión", "Loading session"],
  ["Verificando tus credenciales...", "Verifying your credentials..."],
  ["Conectando con el Servidor", "Connecting to the Server"],
  ["El servidor está en proceso de inicio, por favor espera...", "The server is starting up, please wait..."],
  ["Verificando conexión", "Checking connection"],
  ["Comprobando disponibilidad del servidor...", "Checking server availability..."],
  ["No hay sesión activa", "No active session"],
  ["Sesión expirada, vuelve a iniciar sesión", "Session expired, please sign in again"],
  ["Error desconocido", "Unknown error"],
  ["Completadas", "Completed"],
  ["completadas", "completed"],
  ["En progreso", "In progress"],
  ["Pendientes", "Pending"],
  ["Sin fecha", "No date"],
  ["No se pudieron cargar los proyectos", "Projects could not be loaded"],
  ["No se pudieron cargar los datos del proyecto", "Project data could not be loaded"],
  ["Registros de trabajo por proyecto", "Worklogs by project"],
  ["Revisa tareas completadas, flujo del proyecto y miembros activos.", "Review completed tasks, project flow, and active members."],
  ["Proyecto activo:", "Active project:"],
  ["Proyecto", "Project"],
  ["No hay proyectos disponibles", "No projects available"],
  ["Completadas esta semana", "Completed this week"],
  ["Según el rango semanal activo.", "Based on the active weekly range."],
  ["Tareas completadas", "Completed tasks"],
  ["Total de tareas cerradas en el proyecto.", "Total closed tasks in the project."],
  ["Miembros", "Members"],
  ["Personas asignadas al proyecto.", "People assigned to the project."],
  ["Completitud", "Completion"],
  ["Porcentaje de tareas finalizadas.", "Percentage of finished tasks."],
  ["Tareas completadas por día en el proyecto seleccionado", "Tasks completed per day in the selected project"],
  ["Tareas completadas por semana", "Tasks completed per week"],
  ["Distribución por estado del proyecto", "Project status distribution"],
  ["Miembros del proyecto", "Project members"],
  ["Equipo asociado al proyecto seleccionado.", "Team associated with the selected project."],
  ["Cargando miembros...", "Loading members..."],
  ["No hay miembros asociados al proyecto.", "There are no members associated with this project."],
  ["Tareas completadas", "Completed tasks"],
  ["Últimas tareas cerradas del proyecto.", "Latest closed tasks in the project."],
  ["Cargando tareas...", "Loading tasks..."],
  ["Asignada a:", "Assigned to:"],
  ["Sin asignar", "Unassigned"],
  ["Cerrada:", "Closed:"],
  ["Todavía no hay tareas completadas para este proyecto.", "There are no completed tasks for this project yet."],
  ["Vista global", "Global view"],
  ["Comparativa entre proyectos", "Project comparison"],
  ["Cargando datos globales...", "Loading global data..."],
  ["Compara la actividad de todos tus proyectos desde el mismo panel.", "Compare activity across all your projects from one panel."],
  ["Selecciona un proyecto para cambiar la vista superior, la progresión del sprint y la línea de tiempo sin salir de la página.", "Select a project to change the top view, sprint progression, and timeline without leaving the page."],
  ["Proyecto con más completadas", "Project with most completed tasks"],
  ["tareas completadas", "completed tasks"],
  ["Tareas completadas por proyecto en tu espacio de trabajo", "Tasks completed by project in your workspace"],
  ["No hay proyectos para comparar todavía.", "There are no projects to compare yet."],
  ["Usuario", "User"],
  ["Cargando perfil...", "Loading profile..."],
  ["Obteniendo datos del usuario", "Fetching user data"],
  ["Sin correo disponible", "No email available"],
  ["No definida", "Not defined"],
  ["Habilidad principal", "Main skill"],
  ["Área", "Area"],
  ["No se pudo cargar el perfil", "Could not load profile"],
  ["registradas", "registered"],
  ["No hay habilidades registradas todavía.", "No skills registered yet."],
  ["Cargando...", "Loading..."],
  ["Sin datos todavía", "No data yet"],
  ["seleccionado", "selected"],
  ["Tablero", "Dashboard"],
  ["Proyectos", "Projects"],
  ["Hitos", "Milestones"],
  ["Registros de trabajo", "Work Logs"],
  ["Perfil", "Profile"],
  ["Usuarios", "Users"],
  ["Buscar...", "Search..."],
  ["Cargando datos de hitos desde el backend...","Loading milestone data from backend..."],
  ["Activo", "Active"],
  ["Completado", "Complete"],
  ["completado", "complete"],
  ["Bajo", "Low"],
  ["Medio", "Medium"],
  ["Alto", "High"],
  ["En progreso", "In Progress"],
  ["Planificación", "Planning"],
  ["Crear sprint", "Create Sprint"],
  ["Gestiona los sprints y las tareas del proyecto", "Manage project sprints and tasks"],
  ["Tablero Scrum", "Scrum Board"],
  ["Reporte del proyecto", "Project Report"],
  ["Regenerando vista previa del reporte...", "Regenerating report preview..."],
  ["Nombre del sprint", "Sprint Name"],
  ["Fecha de inicio", "Start Date"],
  ["Fecha de fin", "End Date"],
  ["Cancelar", "Cancel"],
  ["Autenticación", "Authentication"],
  ["Agregar tarea", "Add Task"],
  ["Contraer", "Collapse"],
  ["Número de teléfono", "Phone number"],
  ["Ver tareas", "View Tasks"],
  ["Nuevo proyecto", "New project"],
  ["Registros de trabajo", "Work Logs"],
  ["Reporte del proyecto", "Project Report"],
  ["Tareas completadas", "Tasks Completed"],
  ["Crear usuario", "Create User"],
  ["Buscar proyectos, sprints, tareas, usuarios", "Search projects, sprints, tasks, users"],
  ["Buscar proyectos, sprints, tareas", "Search projects, sprints, tasks"],
  ["Registros", "Logs"],
  ["Rendimiento", "Performance"],
  ["Tiempo de carga de la página a lo largo del tiempo", "Page load time over time"],
  ["Ver tareas", "View tasks"],
  ["Progreso del sprint", "Sprint Progress"],
  ["Sin datos de sprint disponibles para este proyecto todavía.", "No sprint data available for this project yet."],
  ["Progreso del proyecto", "Project progress"],
  ["Tareas", "Tasks"],
  ["Propietario", "Owner"],
  ["Fecha límite", "Deadline"],
  ["Seleccionar sprint del proyecto", "Select Project Sprint"],
  ["Línea de tiempo de hitos", "Milestone Timeline"],
  ["Proyectos relacionados", "Related Projects"],
  ["proyectos cargados desde el backend", "projects loaded from backend"],
  ["Registros de trabajo", "Worklogs"],
  ["Tareas completadas", "Tasks Completed"],
  ["Velocidad del proyecto", "Project Velocity"],
  ["Flujo de tareas", "Task Flow"],
  ["Solicitar modificación", "Request Modification"],
  ["Clasificación", "Leaderboard"],
  ["Nombre", "First Name"],
  ["Apellido", "Last Name"],
  ["Subir CV (PDF)", "Upload CV (PDF)"],
  ["Subir imagen de perfil", "Upload Profile Image"],
  ["Correo electrónico", "Email"],
  ["Código", "Code"],
  ["Número de teléfono", "Phone Number"],
  ["Contraseña", "Password"],
  ["Áreas de designación", "Designation Areas"],
  ["Habilidades", "Skills"],
  ["Editar perfil", "Edit Profile"],
  ["Eliminar usuario", "Delete User"],
  ["Subir CV", "Upload CV"],
  ["Alfabético: A-Z", "Alphabetical: A-Z"],
  ["Alfabético: Z-A", "Alphabetical: Z-A"],
  ["Crear usuario", "Create User"],
  ["Agregar", "Add"],
  ["Solo PDF. Extraerá tu información y completará automáticamente el formulario.", "PDF only. It will extract your information and auto-fill the form."],
  ["JPG, PNG o WEBP. Tamaño cuadrado recomendado.", "JPG, PNG or WEBP. Recommended square image."],
  ["Eliminar imagen de perfil", "Remove Profile Image"],
  ["Creado:", "Created:"],
  ["Proyecto Actual", "Current Project"],
  ["Alerta", "Alert"],
  ["Eliminar", "Delete"],
  ["Editar proyecto", "Edit Project"],
  ["Crear proyecto", "Create Project"],
  ["Completa los datos esenciales primero y abre la configuración avanzada si necesitas presupuesto o facturación.", "Fill out the essentials first, then open advanced settings if you need budget or billing details."],
  ["Información esencial", "Project basics"],
  ["Qué define el proyecto y su cronograma.", "What defines the project and its timeline."],
  ["Requerido", "Required"],
  ["Nombre del proyecto", "Project Name"],
  ["Objetivo del proyecto", "Project Objective"],
  ["Cliente", "Client"],
  ["Tipo de proyecto", "Project Type"],
  ["Metodología", "Methodology"],
  ["Sugerencias inteligentes de miembros", "Smart member suggestions"],
  ["Ordenadas por ajuste de habilidades y tareas completadas", "Ranked by skill fit and completed tasks"],
  ["Analizando...", "Analyzing..."],
  ["Generando recomendaciones...", "Generating recommendations..."],
  ["Escribe un título o descripción más sólidos para obtener recomendaciones.", "Write a stronger title or description to get recommendations."],
  ["Usuarios del proyecto", "Project Users"],
  ["Buscar por nombre o correo", "Search by name or email"],
  ["Configuración avanzada", "Advanced settings"],
  ["Campos opcionales para planificación, finanzas y facturación.", "Optional fields for planning, finance, and billing."],
  ["Sprints estimados", "Estimated sprints"],
  ["Presupuesto", "Budget"],
  ["Costo mensual", "Monthly cost"],
  ["Modelo de facturación", "Billing model"],
  ["Precio fijo", "Fixed price"],
  ["Retención mensual", "Monthly retainer"],
  ["Tiempo y materiales", "Time and materials"],
  ["Guardar cambios", "Save Changes"],
  ["Guardando...", "Saving..."],
  ["Creando...", "Creating..."],
  ["Crear contraseña", "Create password"],
  ["Cambiar contraseña", "Change password"],
  ["Procesando CV...", "Processing CV..."],
  ["CV procesado", "CV processed"],
  ["El formulario se completó correctamente.", "Form has been populated successfully."],
  ["Imagen de perfil eliminada", "Profile image removed"],
  ["La imagen de perfil se eliminó correctamente.", "The profile image was removed successfully."],
  ["Usuario creado", "User created"],
  ["El usuario se creó correctamente.", "The user was created successfully."],
  ["Usuario actualizado", "User updated"],
  ["El usuario se actualizó correctamente.", "The user was updated successfully."],
  ["El usuario se creó localmente porque el servidor no estaba disponible.", "User created locally because the server was unavailable."],
  ["El usuario se actualizó localmente porque el servidor no estaba disponible.", "User updated locally because the server was unavailable."],
  ["Por favor sube un archivo PDF", "Please upload a PDF file"],
  ["Por favor sube una imagen JPG, PNG o WEBP", "Please upload a JPG, PNG, or WEBP image"],
  ["Mínimo una skill", "You must add at least one skill"],
  ["Mínimo un área de designación", "You must add at least one designation area"],
  ["Ver perfil", "View Profile"],
  ["Cerrar sesión", "Logout"],
  ["Buscar por nombre o correo", "Search by name or email"],
  ["Notificaciones", "Notifications"],
  ["Mostrar mas", "Show more"],
  ["Mostrar más", "Show more"],
  ["Historial completo con fecha y hora.", "Full history with date and time."],
  ["Este proyecto todavía no tiene sprints cargados.", "This project does not have any sprints loaded yet."],
  ["Milestones generados desde los sprints del proyecto seleccionado", "Milestones generated from the selected project's sprints"],
  ["Sin milestones para mostrar en este proyecto.", "No milestones to show for this project."],
  ["Los botones funcionan como tabs y actualizan toda la vista superior.", "The buttons work like tabs and update the entire top view."],
  ["4/5 completadas", "4/5 completed"],
  ["Nuevo", "New"],
  ["tareas", "tasks"],
  ["Primer ", "First"],
  ["nombre ", "name"],
  ["Apellido", "Last name"],
  ["Habilidad", "Skill"],
  ["Cargando proyectos...", "Loading projects..."],
  ["Tipo de proyecto", "Project Type"],
  ["Metodología", "Methodology"],
  ["Cliente", "Client"],
  ["Nombre del proyecto", "Project Name"],
  ["Lo que define el proyecto y su linea de tiempo", "What defines the project and its timeline."],
  ["Conceptos basicos del proyecto", "Project basics"],
  ["Rellena primero los datos básicos y, a continuación, abre la configuración avanzada si necesitas introducir datos sobre el presupuesto o la facturación.", "Fill out the essentials first, then open advanced settings if you need budget or billing details."],
  ["Crear Proyecto", "Create Project"],
  ["Requerido", "Required"],
  ["Descripción del proyecto", "Project Description"],
  ["Objetivo del proyecto", "Project Objective"],
  ["Prioridad", "Priority"],
  ["Estado", "Status"],
  ["Sugerencias inteligentes de miembros", "Smart member suggestions"],
  ["Clasificados por adecuación de habilidades y tareas completadas", "Ranked by skill fit and completed tasks"],
  ["Poner en marcha un portal central para la incorporación de clientes", "Launch a central portal for customer onboarding"],
  ["Escribe un título o una descripción más llamativos para recibir recomendaciones.", "Write a stronger title or description to get recommendations."],
  ["Configuraciones avanzadas", "Advanced settings"],
  ["Campos opcionales para planificación, finanzas y facturación.", "Optional fields for planning, finance, and billing."],
  ["Sprints estimados", "Estimated sprints"],
  ["Presupuesto", "Budget"],
  ["Costo mensual", "Monthly cost"],
  ["Modelo de facturación", "Billing model"],
  ["Precio fijo", "Fixed price"],
  ["Honorarios mensuales", "Monthly retainer"],
  ["Tiempo y materiales", "Time and materials"],
  ["Otros ", "Other"],
  ["Descripción del proyecto", "Project Description"],
  ["Objetivo", "Objective"],
  ["Poner en marcha un portal central para la incorporación de clientes", "Launch a central portal for customer onboarding"],
  ["Objetivo", "Objective"],

  // Módulo de Finanzas (PM-139)
  ["Finanzas", "Finance"],
  ["Resumen", "Summary"],
  ["Reporte", "Report"],
  ["KPIs financieros, EVM y reporte del proyecto.", "Financial KPIs, EVM and project report."],
  ["Burn acumulado", "Cumulative burn"],
  ["Costo estimado acumulado", "Cumulative estimated cost"],
  ["Presupuesto consumido", "Budget consumed"],
  ["Tiempo transcurrido", "Time elapsed"],
  ["El presupuesto alcanza la fecha fin", "Budget covers the planned end date"],
  ["El presupuesto no alcanza la fecha fin", "Budget does not cover the planned end date"],
  ["Sobrecosto proyectado:", "Projected overrun:"],
  ["Gasto estimado", "Estimated spend"],
  ["Proxy: costo mensual × meses", "Proxy: monthly cost × months"],
  ["Presupuesto restante", "Remaining budget"],
  ["Costo por story point", "Cost per story point"],
  ["Costo por sprint estimado", "Cost per estimated sprint"],
  ["Curva-S (PV / EV / AC)", "S-curve (PV / EV / AC)"],
  ["Costo de mano de obra", "Labor cost"],
  ["Gastos", "Expenses"],
  ["Horas registradas", "Logged hours"],
  ["Variación de costo (CV)", "Cost variance (CV)"],
  ["Descargar PDF", "Download PDF"],
  ["Actualizar", "Refresh"],
  ["No se encontró el proyecto solicitado.", "The requested project was not found."],
  ["No se pudo resolver el proyecto.", "The project could not be resolved."],
  ["Sin datos de burn todavía.", "No burn data yet."],
  ["Sin serie de EVM todavía.", "No EVM series yet."],

  // Finanzas Fase 2 — portafolio (PM-146)
  ["Portafolio financiero", "Financial portfolio"],
  ["Resumen financiero de todos tus proyectos.", "Financial overview of all your projects."],
  ["Con presupuesto", "With budget"],
  ["En riesgo", "At risk"],
  ["Presupuesto total", "Total budget"],
  ["Gasto estimado total", "Total estimated spend"],
  ["Restante total", "Total remaining"],
  ["Sobrecosto proyectado", "Projected overrun"],
  ["Gasto est.", "Est. spend"],
  ["Restante", "Remaining"],
  ["Consumido", "Consumed"],
  ["Estado", "Status"],
  ["Riesgo", "Risk"],
  ["En pausa", "On hold"],
  ["No hay proyectos en tu portafolio.", "There are no projects in your portfolio."],

  // Finanzas Fase 3 — equipo y horas (PM-142)
  ["Equipo", "Team"],
  ["Horas", "Hours"],
  ["Miembro", "Member"],
  ["Tarifa mensual", "Monthly rate"],
  ["Este proyecto no tiene miembros.", "This project has no members."],
  ["Editar miembro", "Edit member"],
  ["Guardar", "Save"],
  ["Guardando...", "Saving..."],
  ["Sin tarifa", "No rate"],
  ["No se pudieron cargar los miembros del proyecto.", "The project members could not be loaded."],
  ["Horas totales", "Total hours"],
  ["Horas por usuario", "Hours by user"],
  ["Horas por tarea", "Hours by task"],
  ["Sin horas registradas.", "No hours logged."],
  ["Registrar horas", "Log hours"],
  ["Registra tus horas trabajadas en una tarea del proyecto.", "Log your hours worked on a project task."],
  ["Selecciona una tarea.", "Select a task."],
  ["Selecciona una tarea", "Select a task"],
  ["Las horas deben estar entre 0 y 24.", "Hours must be between 0 and 24."],
  ["Selecciona la fecha.", "Select the date."],
  ["Descripción (opcional)", "Description (optional)"],
  ["Horas registradas correctamente.", "Hours logged successfully."],
  ["Registrar", "Log"],

  // Finanzas Fase 4 — gastos y facturas (PM-144)
  ["Facturas", "Invoices"],
  ["Facturación", "Billing"],
  ["Total de gastos", "Total expenses"],
  ["Por categoría", "By category"],
  ["Agregar gasto", "Add expense"],
  ["Nuevo gasto", "New expense"],
  ["Editar gasto", "Edit expense"],
  ["No hay gastos registrados.", "No expenses recorded."],
  ["Sin gastos registrados.", "No expenses recorded."],
  ["¿Eliminar este gasto?", "Delete this expense?"],
  ["Categoría", "Category"],
  ["Monto", "Amount"],
  ["Fecha", "Date"],
  ["Infraestructura", "Infrastructure"],
  ["Servicios", "Services"],
  ["Viajes", "Travel"],
  ["Otros", "Other"],
  ["Ingresa un monto válido.", "Enter a valid amount."],
  ["Facturado vs presupuesto", "Billed vs budget"],
  ["Pendiente de cobro", "Outstanding"],
  ["Facturado", "Billed"],
  ["Pagado", "Paid"],
  ["Borrador", "Draft"],
  ["Enviada", "Sent"],
  ["Pagada", "Paid"],
  ["Agregar factura", "Add invoice"],
  ["Nueva factura", "New invoice"],
  ["Editar factura", "Edit invoice"],
  ["No hay facturas registradas.", "No invoices recorded."],
  ["¿Eliminar esta factura?", "Delete this invoice?"],
  ["Concepto (opcional)", "Concept (optional)"],
  ["Concepto", "Concept"],
  ["Emisión", "Issued"],
  ["Fecha de emisión", "Issue date"],
  ["Selecciona la fecha de emisión.", "Select the issue date."],
  ["Vencimiento (opcional)", "Due date (optional)"],
  ["Inicio del período (opcional)", "Period start (optional)"],
  ["Fin del período (opcional)", "Period end (optional)"],

  // Finanzas — tarifa de venta y auto-cálculo de factura T&M (sale_rate)
  ["Tarifa de venta", "Sale rate"],
  ["Tarifa mensual (costo)", "Monthly rate (cost)"],
  ["Las tarifas solo son visibles para administradores o el PM del proyecto.", "Rates are only visible to administrators or the project PM."],
  ["Monto sugerido (horas × tarifa de venta)", "Suggested amount (hours × sale rate)"],
  ["Calcular", "Calculate"],
  ["Calculando...", "Calculating..."],
  ["Selecciona inicio y fin del período para calcular.", "Select the period start and end to calculate."],
  ["Total sugerido:", "Suggested total:"],
  ["Miembros con horas sin tarifa de venta:", "Members with hours but no sale rate:"],
  ["Usar este monto", "Use this amount"],
  ["Déjalo vacío para auto-calcular con las horas del período.", "Leave it empty to auto-calculate from the period hours."],
  ["Para auto-calcular el monto, selecciona inicio y fin del período.", "To auto-calculate the amount, select the period start and end."],
  ["No se pudo calcular el monto sugerido.", "The suggested amount could not be calculated."],
  // Mensajes de error del backend (BackPM CreateInvoice) alcanzables desde el modal de factura:
  ["No se pudo auto-calcular el monto: no hay horas facturables en el periodo (revisa que los miembros tengan tarifa de venta y horas registradas)", "The amount could not be auto-calculated: there are no billable hours in the period (check that members have a sale rate and logged hours)"],
  ["El monto es obligatorio (el auto-calculo solo aplica a proyectos por tiempo y materiales)", "The amount is required (auto-calculation only applies to time-and-materials projects)"],
  ["Para auto-calcular una factura T&M se requieren period_start y period_end", "To auto-calculate a T&M invoice, period_start and period_end are required"],
  ["Kanban", "Kanban"],
  ["Vista general por estado", "General view by status"],
  ["Cronología", "Timeline"],
  ["Gantt simplificado", "Simplified Gantt"],
  ["Tablero Scrum", "Scrum board"],
  ["Lista por sprint", "List by sprint"],
  ["Vista de tabla", "Table view"],
  ["Filtros y detalle", "Filters and details"],
  ["Vista de calendario", "Calendar"],
  ["Mes actual navegable", "Navigable current month"],
  ["Roadmap", "Roadmap"],
  ["Planificación y workload", "Planning and workload"],
  ["Vista tipo Gantt simplificada sin overflow horizontal.", "Simplified Gantt view without horizontal overflow."],
  ["Detalles de tarea", "Task Details"],
  ["Fecha de vencimiento", "Due Date"],
  ["Progreso", "Progress"],
  ["Asignar usuario", "Assign User"],
  ["Seleccionar usuario", "Select user"],
  ["Aceptar", "Confirm"],
  ["Descripción", "Description"],
  ["Usuario asignado correctamente.", "User assigned successfully."],
  ["Comentarios", "Comments"],
  ["Sin descripción disponible.", "No description available."],
  ["Anterior", "Previous"],
  ["Siguiente", "Next"],
  ["Hoy", "Today"],
  ["No hay tareas con esos filtros.", "No tasks match those filters."],
  ["Buscar tarea", "Search task"],
  ["Todos los estados", "All statuses"],
  ["Todas las prioridades", "All priorities"],
  ["Todos los responsables", "All assignees"],
  ["Tarea", "Task"],
  ["Sprint", "Sprint"],
  ["Responsable", "Assignee"],
  ["Estado", "Status"],
  ["Fecha", "Date"],
  ["Story points", "Story points"],
  ["Sin descripción", "No description"],
  ["No hay miembros para calcular workload.", "There are no members to calculate workload."],
  ["tareas asignadas", "assigned tasks"],
  ["Oscuro", "Dark"],
  ["Claro", "Light"],
  ["Pista de aterrizaje", "Runway"],
  ["Coste por punto de historia", "Cost per story point"],
  ["El proyecto no tiene story points estimados; no se puede calcular el costo por story point.", "The project does not have estimated story points; it is not possible to calculate the cost per story point."],
  ["El gasto es una estimacion: asume un costo mensual constante desde el inicio hasta hoy (no hay captura de costo real).", "The expense is an estimate: it assumes a constant monthly cost from the start until today (actual costs are not tracked)."],
  ["Costo", "Cost"],
  ["Presupuesto", "Budget"],


];

// No revertir pares donde el inglés es substring del español (Report⊂Reporte, Concept⊂Concepto):
// al aplicar en->es sobre el texto fuente en español, el reemplazo por substring duplicaría la
// cola ("Reportee"/"Conceptoo"). El sentido es->en (inglés es el default) sí los traduce.
const enToEsEntries: Array<[string, string]> = esToEnEntries
  .filter(([es, en]) => !es.includes(en))
  // Tampoco revertir si el inglés aparece dentro del español FUENTE de OTRA entrada
  // (p.ej. "Milestones" vive literalmente en "Milestones generados desde los sprints..."):
  // revertir en->es sobre ese source en español lo corrompería ("Hitos generados...").
  // El revert del texto ya mostrado se recalcula desde el source cacheado, no desde aquí.
  .filter(([es, en]) => !esToEnEntries.some(([otherEs]) => otherEs !== es && otherEs.includes(en)))
  .map(([es, en]) => [en, es]);

const LanguageContext = createContext<LanguageContextValue | null>(null);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyDictionary(value: string, dictionary: Array<[string, string]>): string {
  let translated = value;

  const sorted = [...dictionary].sort((a, b) => b[0].length - a[0].length);

  for (const [from, to] of sorted) {
    const pattern = new RegExp(escapeRegExp(from), "g");
    translated = translated.replace(pattern, to);
  }

  return translated;
}

function translateText(value: string, language: Language): string {
  if (!value.trim()) {
    return value;
  }

  const dictionary = language === "en" ? esToEnEntries : enToEsEntries;
  return applyDictionary(value, dictionary);
}

const TRANSLATABLE_ATTRIBUTES: Array<"placeholder" | "title" | "aria-label"> = [
  "placeholder",
  "title",
  "aria-label",
];
const SKIP_TAGS = ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"];
const ATTRIBUTE_SELECTOR = "input, textarea, button, [title], [aria-label]";

function shouldSkipTextNode(node: Text): boolean {
  if (!node.nodeValue || !node.nodeValue.trim()) return true;
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.includes(parent.tagName)) return true;
  if (parent.closest("[data-no-i18n='true']")) return true;
  return false;
}

function translateTextNode(node: Text, language: Language) {
  if (shouldSkipTextNode(node)) return;

  const current = node.nodeValue || "";

  // Si el valor actual no es la última traducción que escribimos, el texto fuente
  // cambió (React re-renderizó el nodo) → re-cachear el original. Sin esto, un nodo
  // reutilizado por React queda congelado en la traducción de su primer valor.
  if (current !== textNodeTranslatedValues.get(node)) {
    textNodeOriginalValues.set(node, current);
  }

  const source = textNodeOriginalValues.get(node) ?? current;
  const translated = translateText(source, language);
  if (translated !== node.nodeValue) {
    node.nodeValue = translated;
  }
  textNodeTranslatedValues.set(node, translated);
}

function translateElementAttributes(element: HTMLElement, language: Language) {
  if (element.closest("[data-no-i18n='true']")) return;

  if (!attributeOriginalValues.has(element)) {
    attributeOriginalValues.set(element, new Map());
  }
  if (!attributeTranslatedValues.has(element)) {
    attributeTranslatedValues.set(element, new Map());
  }

  const elementOriginals = attributeOriginalValues.get(element)!;
  const elementTranslated = attributeTranslatedValues.get(element)!;

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    const current = element.getAttribute(attribute);
    if (!current) return;

    // Mismo criterio que los nodos de texto: si el atributo no es lo que
    // tradujimos por última vez, React lo cambió → re-cachear el original.
    if (current !== elementTranslated.get(attribute)) {
      elementOriginals.set(attribute, current);
    }

    const translated = translateText(elementOriginals.get(attribute) ?? current, language);
    if (translated !== current) {
      element.setAttribute(attribute, translated);
    }
    elementTranslated.set(attribute, translated);
  });
}

// Traduce un subárbol: text nodes (vía TreeWalker) + atributos traducibles.
// Se usa para el pase inicial (root = document.body) y, de forma incremental, para
// cada nodo agregado que reporta el MutationObserver — así el costo por mutación es
// O(nodos agregados) en vez de O(todo el DOM × diccionario).
function translateSubtree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root as Text, language);
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE) return;

  const element = root as HTMLElement;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    translateTextNode(walker.currentNode as Text, language);
  }

  if (element.matches(ATTRIBUTE_SELECTOR)) {
    translateElementAttributes(element, language);
  }
  element
    .querySelectorAll<HTMLElement>(ATTRIBUTE_SELECTOR)
    .forEach((el) => translateElementAttributes(el, language));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "es" ? "es" : "en";
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);

    // Pase completo una sola vez (al montar / al cambiar de idioma).
    translateSubtree(document.body, language);

    // En cada mutación traducimos SOLO lo que cambió (no se re-escanea todo el DOM).
    // El callback del observer corre como microtask antes del paint → sin flash de
    // texto fuente en contenido dinámico.
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          if (mutation.target.nodeType === Node.TEXT_NODE) {
            translateTextNode(mutation.target as Text, language);
          }
        } else if (mutation.type === "attributes") {
          if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            translateElementAttributes(mutation.target as HTMLElement, language);
          }
        } else {
          mutation.addedNodes.forEach((node) => translateSubtree(node, language));
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage: (newLanguage) => setLanguageState(newLanguage),
      toggleLanguage: () => setLanguageState((current) => (current === "en" ? "es" : "en")),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
