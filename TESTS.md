# Pruebas Playwright

Carpeta con pruebas automatizadas usando Playwright Test.

## Requisitos

- Node.js y npm instalados
- Ejecutar la aplicación Next.js localmente (por defecto en `http://localhost:3000`)
- Backend disponible (por defecto en `https://backpm.onrender.com`)

## Instalación

1. Abrir terminal en la carpeta `pruebas`:

```bash
cd pruebas
npm install
npm run install:playwright # instala navegadores necesarios
```

## Ejecución de pruebas

Ejecutar todas las pruebas:

```bash
npm test
```

Ejecutar con interfaz gráfica (ver navegador):

```bash
npm run test:headed
```

## Credenciales de prueba

Las siguientes credenciales están configuradas para las pruebas:

- **Admin**: `admin@test.com` / `TestAdmin123`
- **Usuario**: `ejemplo2@gmail.com` / `prueba123`

## Variables de entorno

Puedes personalizar el comportamiento de las pruebas con variables de entorno:

```bash
# URL base de la aplicación
BASE_URL=http://localhost:3000

# Credenciales de admin
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=Admin123

# Credenciales de usuario
USER_EMAIL=user@test.com
USER_PASSWORD=User123
```

Ejemplo de ejecución con variables:

```bash
BASE_URL=http://localhost:3000 USER_EMAIL=ejemplo2@gmail.com USER_PASSWORD=prueba123 npm test
```

## Pruebas disponibles

### Autenticación (auth.spec.ts)
- **TC-001**: Login con credenciales correctas
- **TC-002**: Rechazo de credenciales incorrectas

### Sesión (session.spec.ts)
- **TC-004**: Bloqueo de vistas protegidas con sesión expirada

### Dashboard (dashboard.spec.ts)
- **TC-006**: Acceso a dashboard
- **TC-009**: Visualización de métricas

### Proyectos (project.spec.ts)
- **TC-003**: Crear nuevo proyecto
- **TC-007**: Visualización de proyecto
- **TC-013**: Visualización y selección de sprint en Milestones

### Sprints (sprint.spec.ts)
- **TC-005**: Visualización de sprints en Milestones

### Tareas (task.spec.ts)
- **TC-008**: Cambio de estado de tarea
- **TC-010**: Comentario en tarea
- **TC-014**: Asignar tarea a miembro

### Pruebas omitidas (others.spec.ts)
- **TC-011**: Cambio de rol - No implementada
- **TC-012**: Notificación por correo - No disponible en entorno de pruebas
- **TC-015**: Historial de cambios - No implementado

## Estructura de archivos

```
pruebas/
├── tests/
│   ├── auth.spec.ts          # Tests de autenticación (TC-001, TC-002)
│   ├── session.spec.ts       # Tests de sesión (TC-004)
│   ├── dashboard.spec.ts     # Tests de dashboard (TC-006, TC-009)
│   ├── project.spec.ts       # Tests de proyectos (TC-003, TC-007, TC-013)
│   ├── sprint.spec.ts        # Tests de sprints (TC-005)
│   ├── task.spec.ts          # Tests de tareas (TC-008, TC-010, TC-014)
│   └── others.spec.ts        # Tests omitidos (TC-011, TC-012, TC-015)
├── playwright.config.ts      # Configuración de Playwright
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

## Notas

- Los tests asumen que la aplicación está corriendo en `http://localhost:3000`
- Los selectores se basan en la estructura actual de la UI
- Algunas pruebas validan solo la navegación y presencia de elementos (UI mockada)
- Ajusta los selectores en los archivos `.spec.ts` si la UI cambia
- Los tests con datos mockados en el frontend pueden no reflejar cambios persistentes

## Troubleshooting

Si los tests fallan:

1. Verifica que la aplicación esté ejecutándose en `http://localhost:3000`
2. Verifica que las credenciales sean correctas
3. Revisa los logs de Playwright en `playwright-report/`
4. Asegúrate de que el backend esté disponible
5. Verifica que el navegador Chromium esté instalado: `npm run install:playwright`
