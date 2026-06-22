using Microsoft.AspNetCore.Authorization; // seguridad JWT
using Microsoft.AspNetCore.Mvc;
using TaskManager.Core.Entities;
using TaskManager.Core.Interfaces;

namespace TaskManager.Controllers
{
    [Authorize] 
    [ApiController]
    [Route("api/[controller]")] //URL será: api/tasks
    public class TasksController : ControllerBase
    {
        private readonly ITaskRepository _repository;

        // Inyeccion de la interfaz del repositorio (SOLID)
        public TasksController(ITaskRepository repository)
        {
            _repository = repository;
        }

        // 1. GET: api/tasks 
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserTask>>> GetTasks([FromQuery] string? status, [FromQuery] string? priority)
        {
            var tasks = await _repository.GetAllAsync(status, priority);
            return Ok(tasks);
        }

        // 2. GET: api/tasks/{id} (Tarea por ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<UserTask>> GetTask(int id)
        {
            var task = await _repository.GetByIdAsync(id);
            if (task == null)
            {
                return NotFound(new { mensaje = $"Tarea con ID {id} no encontrada." });
            }
            return Ok(task);
        }

        // 3. POST: api/tasks (Crear una nueva tarea)
        [HttpPost]
        public async Task<ActionResult<UserTask>> CreateTask([FromBody] UserTask task) 
        {
            task.CreatedAt = DateTime.UtcNow;
            await _repository.AddAsync(task);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        // 4. PUT: api/tasks/{id} (Actualizar una tarea existente)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, UserTask task)
        {
            if (id != task.Id)
            {
                return BadRequest(new { mensaje = "El ID de la URL no coincide con el ID de la tarea." });
            }

            var existingTask = await _repository.GetByIdAsync(id);
            if (existingTask == null)
            {
                return NotFound(new { mensaje = $"Tarea con ID {id} no encontrada para actualizar." });
            }

            // Actualizamos los campos permitidos
            existingTask.Title = task.Title;
            existingTask.Description = task.Description;
            existingTask.Status = task.Status;
            existingTask.Priority = task.Priority;
            existingTask.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existingTask);
            return NoContent(); // Estatus 204: Actualizado con éxito sin contenido que devolver
        }

        // 5. DELETE: api/tasks/{id} (Eliminar una tarea)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var existingTask = await _repository.GetByIdAsync(id);
            if (existingTask == null)
            {
                return NotFound(new { mensaje = $"Tarea con ID {id} no encontrada para eliminar." });
            }

            await _repository.DeleteAsync(id);
            return NoContent(); // Estatus 204
        }
    }
}