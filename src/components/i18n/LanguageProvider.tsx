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
