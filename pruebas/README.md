# Pruebas Playwright

Carpeta con pruebas automatizadas usando Playwright Test.

Requisitos:
- Node.js y npm instalados.
- Ejecutar la aplicación Next.js localmente (por defecto en `http://localhost:3000`).

Instalación y ejecución:

1. Abrir terminal en la carpeta `pruebas`:

```bash
cd pruebas
npm install
npm run install:playwright # instala navegadores necesarios
```

2. Ejecutar pruebas (asume la app corriendo en `http://localhost:3000`):

```bash
npm test
```

Variables de entorno útiles:
- `BASE_URL` para cambiar la URL base (por ejemplo `http://localhost:3000`).
- `TEST_USER_EMAIL` y `TEST_USER_PASSWORD` para credenciales de usuario de prueba.
- `LEAD_EMAIL`/`LEAD_PASSWORD`, `EXEC_EMAIL`/`EXEC_PASSWORD` para roles específicos.

Notas:
- Las pruebas TC-011, TC-012 y TC-015 están marcadas como omitidas (`skip`) porque requieren funcionalidades o infraestructura no disponibles en el entorno de pruebas (cambio de roles, envío de correo, historial de cambios).
- Los selectores usados son genéricos y pueden necesitar ajustes según la implementación real (nombres de inputs, textos de botones, rutas). Ajusta los `locator` en los archivos bajo `pruebas/tests` si es necesario.
