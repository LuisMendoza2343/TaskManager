import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserTask, TaskStatus, TaskPriority } from '../types/task';

const API_URL = 'https://localhost:7123/api/tasks';

export function TaskList() {
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');

  // Filtros requeridos
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');

  // Estados de carga y validaciones
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modo edición
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = API_URL;
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);
      if (filterPriority !== 'All') params.append('priority', filterPriority);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await axios.get<UserTask[]>(url, getAuthHeader());
      setTasks(res.data);
    } catch (err) {
      setError('No se pudieron cargar las tareas desde el servidor.');
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!title.trim()) {
      setValidationError('El título es obligatorio.');
      return;
    }

    try {
      const newTask = {
        title: title.trim(),
        description: description.trim(), 
        status: 'Pending' as TaskStatus,
        priority: priority
      };

      await axios.post(API_URL, newTask, getAuthHeader());
      setTitle('');
      setDescription('');
      setPriority('Medium');
      fetchTasks();
    } catch (err) {
      setError('Error al crear la tarea.');
      console.error(err);
    }
  };

  const handleStartEdit = (task: UserTask) => {
    setEditingTaskId(task.id || null);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const handleSaveEdit = async (task: UserTask) => {
    if (!editTitle.trim()) {
      alert('El título no puede quedar vacío.');
      return;
    }
    try {
      const updatedTask = {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim()
      };
      await axios.put(`${API_URL}/${task.id}`, updatedTask, getAuthHeader());
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      setError('No se pudieron guardar los cambios.');
      console.error(err);
    }
  };

  const handleUpdateStatus = async (task: UserTask, newStatus: TaskStatus) => {
    try {
      const updatedTask = {
        ...task,
        status: newStatus
      };
      await axios.put(`${API_URL}/${task.id}`, updatedTask, getAuthHeader());
      fetchTasks();
    } catch (err) {
      setError('Error al actualizar el estado.');
      console.error(err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      fetchTasks();
    } catch (err) {
      setError('Error al eliminar la tarea.');
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ width: '95%', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#f3f4f6' }}>
      
      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#7f1d1d', color: '#fca5a5', borderRadius: '6px', marginBottom: '1.5rem', border: '1px solid #f87171' }}>
          ⚠️ {error}
        </div>
      )}

      {/* CONTENEDOR EN DOS COLUMNAS */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', alignItems: 'flex-start', marginTop: '2rem' }}>
        
        {/* COLUMNA IZQUIERDA: FORMULARIO (CONGELADO AL HACER SCROLL) */}
        <div style={{ 
          flex: '1', 
          minWidth: '320px', 
          backgroundColor: '#1f2937', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          border: '1px solid #374151',
          position: 'sticky',
          top: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#ffffff', fontSize: '1.3rem' }}>Panel de Gestión de Tareas</h3>
          
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {validationError && (
              <span style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: '600' }}>{validationError}</span>
            )}
            
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Título de la tarea (Obligatorio)" 
              style={{ padding: '0.75rem', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#ffffff', borderRadius: '6px', fontSize: '0.95rem' }}
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Descripción corta de la tarea" 
              rows={3}
              style={{ padding: '0.75rem', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#ffffff', borderRadius: '6px', fontSize: '0.95rem', fontFamily: 'sans-serif', resize: 'vertical' }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontWeight: '600', color: '#9ca3af', fontSize: '0.9rem' }}>Prioridad:</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} style={{ width: '100%', padding: '0.75rem', backgroundColor: '#374151', color: '#ffffff', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '0.95rem' }}>
                <option value="Low">Baja</option>
                <option value="Medium">Media</option>
                <option value="High">Alta</option>
              </select>
            </div>

            <button type="submit" style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
              Guardar Tarea
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ flex: '1.5', minWidth: '450px' }}>
          
          {/* BARRA DE FILTROS */}
          <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#1f2937', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', alignItems: 'center', border: '1px solid #374151' }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#9ca3af' }}>Filtrar por:</span>
            
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', fontSize: '0.85rem' }}>
              <option value="All">Todos los Estados</option>
              <option value="Pending">Pendiente</option>
              <option value="InProgress">En progreso</option>
              <option value="Completed">Completada</option>
            </select>

            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #4b5563', backgroundColor: '#374151', color: '#fff', fontSize: '0.85rem' }}>
              <option value="All">Todas las Prioridades</option>
              <option value="Low">Baja</option>
              <option value="Medium">Media</option>
              <option value="High">Alta</option>
            </select>
          </div>

          <h3 style={{ margin: '0 0 1.5rem 0', color: '#ffffff', fontSize: '1.3rem', borderBottom: '2px solid #374151', paddingBottom: '0.5rem' }}>Listado de Tareas Activas</h3>
          
          {loading ? (
            <p style={{ color: '#60a5fa', fontStyle: 'italic', padding: '2rem', textAlign: 'center', fontWeight: '600' }}>
              Cargando tareas desde el servidor...
            </p>
          ) : tasks.length === 0 ? (
            <p style={{ color: '#9ca3af', fontStyle: 'italic', backgroundColor: '#1f2937', padding: '2rem', borderRadius: '8px', textAlign: 'center', border: '1px dashed #4b5563' }}>
              No se encontraron tareas con los filtros seleccionados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937', padding: '1.2rem', borderRadius: '8px', border: '1px solid #374151', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', borderLeft: task.status === 'Completed' ? '6px solid #10b981' : task.status === 'InProgress' ? '6px solid #f59e0b' : '6px solid #3b82f6' }}>
                  
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    {editingTaskId === task.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <input 
                          type="text" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)}
                          style={{ padding: '0.4rem', backgroundColor: '#374151', border: '1px solid #3b82f6', color: '#fff', borderRadius: '4px', fontSize: '1rem', width: '100%' }}
                        />
                        <input 
                          type="text" 
                          value={editDescription} 
                          onChange={(e) => setEditDescription(e.target.value)}
                          style={{ padding: '0.4rem', backgroundColor: '#374151', border: '1px solid #4b5563', color: '#fff', borderRadius: '4px', fontSize: '0.85rem', width: '100%' }}
                        />
                      </div>
                    ) : (
                      <>
                        <h4 style={{ margin: '0 0 0.4rem 0', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? '#9ca3af' : '#ffffff', fontSize: '1.1rem' }}>
                          {task.title}
                        </h4>
                        <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: task.status === 'Completed' ? '#6b7280' : '#d1d5db' }}>
                          {task.description || 'Sin descripción'}
                        </p>
                      </>
                    )}
                    
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span>📅 <strong>Creada:</strong> {formatDate(task.createdAt) || 'N/A'}</span>
                      {task.updatedAt && task.updatedAt !== task.createdAt && (
                        <span>🔄 <strong>Actualizada:</strong> {formatDate(task.updatedAt)}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.6rem', backgroundColor: '#374151', color: '#e5e7eb', borderRadius: '4px' }}>
                        P: {task.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.6rem', backgroundColor: task.status === 'Completed' ? '#065f46' : task.status === 'InProgress' ? '#78350f' : '#1e3a8a', color: '#ffffff', borderRadius: '4px' }}>
                        {task.status === 'Pending' ? 'Pendiente' : task.status === 'InProgress' ? 'En Progreso' : 'Completada'}
                      </span>
                    </div>
                  </div>
                  
                  {/* BOTONES */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0, alignItems: 'flex-end' }}>
                    <select 
                      value={task.status} 
                      onChange={(e) => handleUpdateStatus(task, e.target.value as TaskStatus)}
                      style={{ padding: '0.4rem', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '0.85rem', backgroundColor: '#374151', color: '#fff', cursor: 'pointer', width: '110px' }}
                    >
                      <option value="Pending">Pendiente</option>
                      <option value="InProgress">En progreso</option>
                      <option value="Completed">Completada</option>
                    </select>

                    <div style={{ display: 'flex', gap: '0.4rem', width: '110px' }}>
                      {editingTaskId === task.id ? (
                        <>
                          <button onClick={() => handleSaveEdit(task)} style={{ flex: 1, padding: '0.4rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                            ✓
                          </button>
                          <button onClick={() => setEditingTaskId(null)} style={{ flex: 1, padding: '0.4rem', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' }}>
                            ✕
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleStartEdit(task)} style={{ width: '100%', padding: '0.4rem', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                          Editar
                        </button>
                      )}
                    </div>

                    <button onClick={() => handleDeleteTask(task.id!)} style={{ width: '110px', padding: '0.4rem 0.8rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
                      Eliminar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}