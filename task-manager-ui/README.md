# Task Manager Application - Full-Stack Solution

Solución completa para la gestión de tareas, diseñada bajo principios SOLID y arquitectura desacoplada.

---

## 📐 Arquitectura del Sistema

* Backend (.NET): Diseñado con Clean Architecture separando el Dominio, la Aplicación, la Infraestructura y la API en capas independientes.
* Frontend (React): Componentes modulares basados en TypeScript y servicios de comunicación asíncrona mediante Axios.

---

## 🛠️ Tecnologías Utilizadas

* Backend: C# en .NET, ASP.NET Core Web API, Entity Framework Core, SQL Server, JWT y BCrypt.Net.
* Frontend: React, Vite, TypeScript y Axios.

---

## 🧠 Decisiones Técnicas Destacadas

1. Autenticación JWT: Implementación de tokens firmados inyectados dinámicamente en las cabeceras Authorization: Bearer.
2. Validación en Dos Capas: Validación preventiva inmediata en el cliente y validación estricta de integridad en el servidor.
3. Manejo de Estado Asíncrono: Control de flujos de carga (loading) en React para mitigar problemas de desincronización visual al aplicar filtros de prioridad y estado.

---

## 🚀 Pasos para Ejecutar el Proyecto

### Requisitos Previos:
* .NET SDK (Versión 8.0 o superior)
* SQL Server Express / LocalDB
* Node.js (Versión 18 o superior)

### 1. Inicialización del Backend

1. Dirígete a la carpeta raíz del proyecto del servidor:
cd Backend

2. Abre el archivo appsettings.json y ajusta la cadena de conexión según tus credenciales locales de SQL Server:
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=TaskManagerDb;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}

3. Ejecuta las migraciones pendientes para construir automáticamente la base de datos y sus tablas:
dotnet ef database update

*(Nota: Alternativamente, puedes ejecutar el archivo script.sql adjunto en la raíz de la entrega directamente en tu gestor de base de datos).*

4. Lanza el servidor de desarrollo:
dotnet run

*La API web se expondrá de manera local en https://localhost:7123.*

### 2. Inicialización del Frontend

1. Dirígete a la carpeta raíz del cliente:
cd TASK-MANAGER-UI

2. Instala los módulos y dependencias de Node estructurados en el package.json:
npm install

3. Levanta el entorno local con Vite:
npm run dev

*El Frontend estará accesible inmediatamente en el puerto local especificado en la consola (por lo general, http://localhost:5173). El usuario administrador por defecto para pruebas es admin con la contraseña password123.*