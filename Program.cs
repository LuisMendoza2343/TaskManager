using Microsoft.EntityFrameworkCore;
using TaskManager.Infrastructure.Data;
using TaskManager.Core.Interfaces;
using TaskManager.Infrastructure.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. REGISTRO DE SERVICIOS
builder.Services.AddRazorPages();

// Conexión a la Base de Datos
builder.Services.AddDbContext<TaskDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Soporte para Controladores API
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Inyección de Dependencias del Repositorio
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();

//  CONFIGURACIÓN DEL MOTOR DE AUTENTICACIÓN JWT 
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

//  CONFIGURACIÓN DE CORS  
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Puerto por defecto Vite/React
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// -------------------------------------------------------------

var app = builder.Build();

// 2. CONFIGURACIÓN DEL PIPELINE (Middlewares)
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

// EL ORDEN AQUÍ ES CRÍTICO 
app.UseCors("AllowReactApp"); // 1. Entra React
app.UseAuthentication();     // 2. ¿Quién eres? (Verifica Token JWT)
app.UseAuthorization();      // 3. ¿A qué tienes permiso?

app.MapControllers();
app.MapRazorPages();

//DATA SEEDER AUTOMÁTICO 
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TaskManager.Infrastructure.Data.TaskDbContext>();

        // 1. Asegurar que la base de datos esté creada
        context.Database.EnsureCreated();

        // 2. Insertar usuario admin por defecto si la tabla está vacía
        if (!context.Usuarios.Any())
        {
            context.Usuarios.Add(new TaskManager.Core.Entities.Usuario
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("password123"),
                Role = "Admin"
            });
            context.SaveChanges();
        }

        // 3. Insertar tareas de prueba de ejemplo
        if (!context.Tasks.Any())
        {
            context.Tasks.AddRange(
                new TaskManager.Core.Entities.UserTask
                {
                    Title = "Revisión de Arquitectura",
                    Description = "Validar el cumplimiento de Clean Architecture y SOLID",
                    Status = TaskManager.Core.Entities.TaskStatus.Pending,
                    Priority = TaskManager.Core.Entities.TaskPriority.High,
                    CreatedAt = DateTime.UtcNow
                },
                new TaskManager.Core.Entities.UserTask
                {
                    Title = "Pruebas de Integración",
                    Description = "Verificar la correcta comunicación del CRUD con React",
                    Status = TaskManager.Core.Entities.TaskStatus.Completed,
                    Priority = TaskManager.Core.Entities.TaskPriority.Medium,
                    CreatedAt = DateTime.UtcNow
                }
            );
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurrió un error al sembrar los datos de prueba.");
    }
}



app.Run();

