"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "es";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "app-language";

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
  ["En progreso", "In progress"],
  ["Pendientes", "Pending"],
  ["Sin fecha", "No date"],
  ["No se pudieron cargar los proyectos", "Projects could not be loaded"],
  ["No se pudieron cargar los datos del proyecto", "Project data could not be loaded"],
  ["Worklogs por proyecto", "Worklogs by project"],
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
  ["Skill principal", "Main skill"],
  ["Area", "Area"],
  ["No se pudo cargar el perfil", "Could not load profile"],
  ["registradas", "registered"],
  ["No hay skills registradas todavía.", "No skills registered yet."],
  ["Cargando...", "Loading..."],
  ["Sin datos todavía", "No data yet"],
  ["seleccionado", "selected"],
  ["Dashboard", "Dashboard"],
  ["Projects", "Projects"],
  ["Milestones", "Milestones"],
  ["Work Logs", "Work Logs"],
  ["Profile", "Profile"],
  ["Users", "Users"],
  ["Search...", "Search..."],
  ["View Profile", "View Profile"],
  ["Logout", "Logout"],
  ["Request Modification", "Request Modification"],
  ["Tasks", "Tasks"],
  ["Leaderboard", "Leaderboard"],
  ["Inicia Sesión", "Sign In"],
  ["Por favor, ingresa email y contraseña", "Please enter email and password"],
  ["Ingresa un email válido", "Enter a valid email"],
  ["Email", "Email"],
  ["Password", "Password"],
  ["Logs", "Registros"],
  ["User updated project settings", "El usuario actualizó la configuración del proyecto"],
  ["Logs · 2 mins ago", "Registros · hace 2 minutos"],
  ["No description available.", "No hay descripción disponible."],
  ["Progress", "Progreso"],
  ["Owner: ", "Responsable: "],
  [" tasks", " tareas"],
  ["% complete", "% completado"],
  ["Deadline: ", "Fecha límite: "],
  ["Active", "Activo"],
  ["Selecciona un proyecto para cambiar la vista superior, la progresión del sprint y la línea de tiempo sin salir de la página.", "Select a project to change the top view, sprint progression, and timeline without leaving the page."],
  ["Loading milestone data from backend...", "Loading milestone data from backend..."],
  ["Sprint Progress", "Progreso del sprint"],
  ["Complete", "Completo"],
  ["Remaining", "Restante"],
  ["kickoff", "inicio"],
  ["closure", "cierre"],
  ["Sprint window opened and execution started", "Se abrió la ventana del sprint y comenzó la ejecución"],
  ["Sprint delivered and closed", "Sprint entregado y cerrado"],
  ["Target closing date for this sprint", "Fecha objetivo de cierre de este sprint"],
  ["Worklogs", "Bitácora de trabajo"],
  ["Revisa tareas completadas, flujo del proyecto y miembros activos.", "Review completed tasks, project flow, and active members."],
  ["Proyecto activo:", "Active project:"],
  ["Según el rango semanal activo.", "Based on the active weekly range."],
  ["Total de tareas cerradas en el proyecto.", "Total closed tasks in the project."],
  ["Personas asignadas al proyecto.", "People assigned to the project."],
  ["Porcentaje de tareas finalizadas.", "Percentage of finished tasks."],
  ["Tareas completadas por día en el proyecto seleccionado", "Tasks completed per day in the selected project"],
  ["Tareas completadas por semana", "Tasks completed per week"],
  ["Distribución por estado del proyecto", "Project status distribution"],
  ["Miembros del proyecto", "Project members"],
  ["Equipo asociado al proyecto seleccionado.", "Team associated with the selected project."],
  ["Cargando miembros...", "Loading members..."],
  ["No hay miembros asociados al proyecto.", "There are no members associated with this project."],
  ["Últimas tareas cerradas del proyecto.", "Latest closed tasks in the project."],
  ["Cargando tareas...", "Loading tasks..."],
  ["Asignada a:", "Assigned to:"],
  ["Cerrada:", "Closed:"],
  ["Todavía no hay tareas completadas para este proyecto.", "There are no completed tasks for this project yet."],
  ["Vista global", "Global view"],
  ["Comparativa entre proyectos", "Project comparison"],
  ["Cargando datos globales...", "Loading global data..."],
  ["Compara la actividad de todos tus proyectos desde el mismo panel.", "Compare activity across all your projects from one panel."],
  ["Proyecto con más completadas", "Project with most completed tasks"],
  ["Tareas completadas por proyecto en tu espacio de trabajo", "Tasks completed by project in your workspace"],
  ["No hay proyectos para comparar todavía.", "There are no projects to compare yet."],
  ["Skill principal", "Habilidad principal"],
  ["Area", "Area"],
  ["No definida", "Not defined"],
  ["Skills", "Skills"],
  ["registradas", "registered"],
  ["No hay skills registradas todavía.", "No skills registered yet."],
  ["No tienes tareas asignadas todavía.", "You do not have any assigned tasks yet."],
  ["Sin descripción", "No description"],
  ["Prioridad:", "Priority:"],
  ["Vence:", "Due:"],
  ["Sin datos todavía", "No data yet"],
  ["Completadas:", "Completed:"],
  ["En progreso:", "In progress:"],
  ["Pendientes:", "Pending:"],
  ["Cargando proyectos...", "Loading projects..."],
  ["Error al cargar proyectos", "Error loading projects"],
  ["View Tasks", "View Tasks"],
  ["issues", "issues"],
  ["Project Name", "Nombre del proyecto"],
  ["Project Description", "Descripción del proyecto"],
  ["Smart member suggestions", "Sugerencias inteligentes de miembros"],
  ["Ranked by skill fit and completed tasks", "Ordenado por ajuste de habilidades y tareas completadas"],
  ["Analyzing...", "Analizando..."],
  ["No skill", "Sin habilidad"],
  ["done", "completadas"],
  ["Generating recommendations...", "Generando recomendaciones..."],
  ["Write a stronger title or description to get recommendations.", "Escribe un título o descripción más sólida para obtener recomendaciones."],
  ["Start Date", "Fecha de inicio"],
  ["End Date", "Fecha de fin"],
  ["Project Users", "Usuarios del proyecto"],
  ["Buscar por nombre o correo", "Search by name or email"],
  ["No se encontraron usuarios.", "No users were found."],
  ["High Priority", "Prioridad alta"],
  ["Medium Priority", "Prioridad media"],
  ["Low Priority", "Prioridad baja"],
  ["Cancel", "Cancelar"],
  ["Save Changes", "Guardar cambios"],
  ["Create Project", "Crear proyecto"],
  ["Creating...", "Creando..."],
  ["Edit Project", "Editar proyecto"],
  ["+ New Project", "+ Nuevo proyecto"],
  ["Error al crear el proyecto", "Error al crear el proyecto"],
  ["La fecha de inicio debe ser anterior a la fecha de fin", "La fecha de inicio debe ser anterior a la fecha de fin"],
  ["El proyecto se actualizo, pero algunos miembros no pudieron sincronizarse.", "El proyecto se actualizó, pero algunos miembros no pudieron sincronizarse."],
  ["El proyecto se creo, pero algunos miembros no pudieron agregarse.", "El proyecto se creó, pero algunos miembros no pudieron agregarse."],
  ["Scrum Board", "Tablero Scrum"],
  ["Manage project sprints and tasks", "Gestiona los sprints y tareas del proyecto"],
  ["Generate Report", "Generar reporte"],
  ["+ Create Sprint", "+ Crear sprint"],
  ["Data could not be loaded", "No se pudieron cargar los datos"],
  ["Cannot move task", "No se puede mover la tarea"],
  ["Tasks cannot be moved into a completed sprint.", "Las tareas no se pueden mover a un sprint completado."],
  ["Task could not be moved", "No se pudo mover la tarea"],
  ["Task not created", "La tarea no se creó"],
  ["Task title is required.", "El título de la tarea es obligatorio."],
  ["Created in backlog because it is missing assignment or due date.", "Se creó en backlog porque falta asignación o fecha de vencimiento."],
  ["Task was created successfully.", "La tarea se creó correctamente."],
  ["Sprint created", "Sprint creado"],
  ["The sprint was created successfully.", "El sprint se creó correctamente."],
  ["Sprint could not be created", "No se pudo crear el sprint"],
  ["Are you sure you want to delete this task? This action cannot be undone.", "¿Seguro que quieres eliminar esta tarea? Esta acción no se puede deshacer."],
  ["Task deleted", "Tarea eliminada"],
  ["The task was removed successfully.", "La tarea se eliminó correctamente."],
  ["Task could not be deleted", "No se pudo eliminar la tarea"],
  ["An unexpected error occurred.", "Ocurrió un error inesperado."],
  ["Task updated", "Tarea actualizada"],
  ["The assignee was updated successfully.", "El asignado se actualizó correctamente."],
  ["Task could not be updated", "No se pudo actualizar la tarea"],
  ["Sprint updated", "Sprint actualizado"],
  ["The sprint was updated successfully.", "El sprint se actualizó correctamente."],
  ["Sprint could not be updated", "No se pudo actualizar el sprint"],
  ["Are you sure you want to complete this sprint?", "¿Seguro que quieres completar este sprint?"],
  ["Sprint completed", "Sprint completado"],
  ["The sprint was completed successfully.", "El sprint se completó correctamente."],
  ["Sprint could not be completed", "No se pudo completar el sprint"],
  ["New Task", "Nueva tarea"],
  ["Task title", "Título de la tarea"],
  ["Description", "Descripción"],
  ["Smart suggestions", "Sugerencias inteligentes"],
  ["Based on skills, area and completed tasks", "Basado en habilidades, área y tareas completadas"],
  ["Assign To", "Asignar a"],
  ["Unassigned", "Sin asignar"],
  ["Priority", "Prioridad"],
  ["Due Date", "Fecha de vencimiento"],
  ["Create Task", "Crear tarea"],
  ["Task Details", "Detalles de la tarea"],
  ["Status", "Estado"],
  ["Select user", "Selecciona un usuario"],
  ["Confirm", "Confirmar"],
  ["User assigned successfully.", "Usuario asignado correctamente."],
  ["Close", "Cerrar"],
  ["Delete", "Eliminar"],
  ["Project Report", "Reporte del proyecto"],
  ["Regenerate PDF", "Regenerar PDF"],
  ["Download PDF", "Descargar PDF"],
  ["Close report modal", "Cerrar modal de reporte"],
  ["Regenerating report preview...", "Regenerando vista previa del reporte..."],
  ["No report available yet.", "Aún no hay reporte disponible."],
  ["Project report preview", "Vista previa del reporte del proyecto"],
  ["Backlog", "Backlog"],
  ["Completed Sprints", "Sprints completados"],
  ["Sprint not created", "Sprint no creado"],
  ["Please complete all fields.", "Completa todos los campos."],
  ["Invalid sprint dates", "Fechas del sprint no válidas"],
  ["Sprint start date cannot be in the past.", "La fecha de inicio del sprint no puede estar en el pasado."],
  ["Sprint end date must be after the start date.", "La fecha de fin del sprint debe ser posterior a la fecha de inicio."],
  ["Sprint Name", "Nombre del sprint"],
  ["Sprint 1 - Authentication", "Sprint 1 - Autenticación"],
  ["Create Sprint", "Crear sprint"],
  ["Creating...", "Creando..."],
  ["No se pudo cargar el reporte", "No se pudo cargar el reporte"],
  ["Assign User", "Asignar usuario"],
  ["No recommendations available yet.", "Aún no hay recomendaciones disponibles."],
  ["Create User", "Crear usuario"],
  ["Edit Profile", "Editar perfil"],
  ["User", "Usuario"],
  ["Admin", "Administrador"],
  ["First Name", "Nombre"],
  ["First name", "nombre"],
  ["Last Name", "Apellido"],
  ["Last name", "apellido"],
  ["Code", "Código"],
  ["Phone Number", "Número de teléfono"],
  ["Phone number", "número de teléfono"],
  ["Create password", "Crear contraseña"],
  ["Change password", "Cambiar contraseña"],
  ["Designation Areas", "Áreas de especialización"],
  ["Backend Developer, Frontend Developer...", "Desarrollador Backend, Desarrollador Frontend..."],
  ["Add", "Agregar"],
  ["React, SQL, TypeScript...", "React, SQL, TypeScript..."],
  ["Saving...", "Guardando..."],
  ["Edit user", "Editar usuario"],
  ["Processing CV...", "Procesando CV..."],
  ["Profile Preview", "Vista previa del perfil"],
  ["Please upload a PDF file", "Sube un archivo PDF"],
  ["Failed to process CV", "No se pudo procesar el CV"],
  ["Invalid response from server", "Respuesta inválida del servidor"],
  ["CV processed", "CV procesado"],
  ["Form has been populated successfully.", "El formulario se completó correctamente."],
  ["Please upload a JPG, PNG, or WEBP image", "Sube una imagen JPG, PNG o WEBP"],
  ["Profile image removed", "Imagen de perfil eliminada"],
  ["The profile image was removed successfully.", "La imagen de perfil se eliminó correctamente."],
  ["Profile image could not be removed", "No se pudo eliminar la imagen de perfil"],
  ["Profile image could not be uploaded", "No se pudo subir la imagen de perfil"],
  ["User created", "Usuario creado"],
  ["The user was created successfully.", "El usuario se creó correctamente."],
  ["User updated", "Usuario actualizado"],
  ["The user was updated successfully.", "El usuario se actualizó correctamente."],
  ["User created locally because the server was unavailable.", "Usuario creado localmente porque el servidor no estaba disponible."],
  ["User updated locally because the server was unavailable.", "Usuario actualizado localmente porque el servidor no estaba disponible."],
  ["Email must be valid and include .com", "El correo debe ser válido e incluir .com"],
  ["Phone number must have at least 10 digits", "El número de teléfono debe tener al menos 10 dígitos"],
  ["You must add at least one skill", "Debes agregar al menos una habilidad"],
  ["You must add at least one designation area", "Debes agregar al menos un área de especialización"],
  ["No Role Assigned", "Sin rol asignado"],
  ["Alphabetical: A-Z", "Alfabético: A-Z"],
  ["Alphabetical: Z-A", "Alfabético: Z-A"],
  ["No report available yet.", "No report available yet."],
  ["Regenerating report preview...", "Regenerating report preview..."],
  ["No notifications new.", "No notifications new."],
  ["Notificaciones", "Notifications"],
  ["Notificaciones extendidas", "Extended notifications"],
  ["Nueva", "New"],
  ["Actualizando...", "Updating..."],
  ["sin leer", "unread"],
  ["Mostrar más", "Show more"],
  ["No tienes notificaciones nuevas.", "You have no new notifications."],
  ["Abrir notificaciones", "Open notifications"],
  ["Cerrar notificaciones", "Close notifications"],
  ["Notificación", "Notification"],
];

const enToEsEntries: Array<[string, string]> = esToEnEntries.map(([es, en]) => [en, es]);

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

function translateDom(language: Language) {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parentTag = node.parentElement?.tagName;

    if (!node.nodeValue) continue;
    if (!node.nodeValue.trim()) continue;
    if (node.parentElement?.closest("[data-no-i18n='true']")) continue;
    if (parentTag && ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA"].includes(parentTag)) continue;

    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const translated = translateText(node.nodeValue || "", language);
    if (translated !== node.nodeValue) {
      node.nodeValue = translated;
    }
  });

  const attributesToTranslate: Array<"placeholder" | "title" | "aria-label"> = [
    "placeholder",
    "title",
    "aria-label",
  ];

  const elements = document.querySelectorAll<HTMLElement>("input, textarea, button, [title], [aria-label]");

  elements.forEach((element) => {
    if (element.closest("[data-no-i18n='true']")) return;

    attributesToTranslate.forEach((attribute) => {
      const current = element.getAttribute(attribute);
      if (!current) return;

      const translated = translateText(current, language);
      if (translated !== current) {
        element.setAttribute(attribute, translated);
      }
    });
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored === "en" || stored === "es") {
      setLanguageState(stored);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, "en");
    setLanguageState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);

    const apply = () => translateDom(language);
    apply();

    const observer = new MutationObserver(() => {
      apply();
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
