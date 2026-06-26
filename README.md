# TaskManager

Aplicación web full-stack para la gestión de tareas, desarrollada con arquitectura limpia y principios SOLID.

## Tecnologías
* **Backend:** ASP.NET Core (C#)
* **Frontend:** React con TypeScript
* **Base de Datos:** SQL Server (EF Core)

##  Características
* Gestión completa de tareas (CRUD).
* Autenticación basada en JWT.
* Arquitectura escalable y desacoplada.

##  Instalación

### Requisitos previos
* .NET 8.0 SDK
* Node.js (LTS)
* SQL Server

### Backend
1. Navega a la raíz del proyecto.
2. Ejecuta `dotnet restore` y `dotnet run` para levantar la API.
3. Configura tu cadena de conexión en `appsettings.json`.

### Frontend
1. Entra a la carpeta `task-manager-ui`.
2. Ejecuta `npm install`.
3. Ejecuta `npm run dev` para iniciar el cliente.

### Base de Datos
Ejecuta el archivo `script.sql` en tu instancia de SQL Server para inicializar el esquema necesario.

### IMPORTANTE PARA ACCESO A LA PP:

Usuario: admin
Password: password123
