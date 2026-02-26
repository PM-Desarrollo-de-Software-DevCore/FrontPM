.

🛠️ Infraestructura y CI/CD
El proyecto utiliza un flujo de Integración y Despliegue Continuo (CI/CD) automatizado para garantizar la estabilidad del código:

Frontend (Vercel): Configurado con un pipeline nativo que ejecuta el build y despliega automáticamente cada cambio en la rama principal.

Backend (Render): Integrado con despliegue automático que reinicia el servicio y aplica los cambios tras pasar las validaciones de entorno.

Pipeline de Calidad: Ambos servicios están vinculados al repositorio, asegurando que solo el código que compila correctamente llegue a producción.
<img width="1311" height="493" alt="image" src="https://github.com/user-attachments/assets/4c87f9d0-5bef-4da0-8070-92cc5a14b49d" />
<img width="1421" height="950" alt="image" src="https://github.com/user-attachments/assets/0d5950ad-6164-4e03-ad3c-c259cdc19441" />

🌿 Flujo de Trabajo (Git Flow)
Para mantener la integridad de la rama principal (main), el repositorio tiene reglas de protección:

Prohibido el Push Directo: No se permiten cambios directos en main.

Pull Requests (PR): Todo cambio debe proponerse mediante una Pull Request. Esto permite la revisión de código y asegura que los tests de métricas y lógica de riesgo se ejecuten antes de la fusión.

<img width="870" height="208" alt="image" src="https://github.com/user-attachments/assets/67b06114-3442-4b93-880e-c7ef7287fe04" />

📖 Documentación de la API
La API cuenta con documentación interactiva para facilitar las pruebas de los endpoints (Auth, Proyectos, Métricas).

Swagger UI: Disponible en la ruta /api-docs (o la ruta que hayas configurado).

Aquí puedes probar los cálculos de XP, Score de Riesgo y Workload en tiempo real.

<img width="1710" height="1032" alt="image" src="https://github.com/user-attachments/assets/de8b8bf9-6ae5-4018-9ffa-3fa9ed494d12" />
