import axios, { AxiosError } from 'axios';

const API_URL = 'https://localhost:7123/api/auth';

// Configuración global de Axios para enviar el token automáticamente en peticiones a la API
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  // 1. Iniciar Sesión
  async login(username: string, password: string) {
    try {
      // Forzamos el envío limpio del JSON
      const response = await axios.post(`${API_URL}/login`, { 
        username: username.trim(), 
        password: password 
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ mensaje?: string }>;
      const mensaje = err.response?.data?.mensaje || 'Usuario o contraseña incorrectos / Error de servidor';
      throw new Error(mensaje);
    }
  },

  // 2. Registrar Usuario (¡Faltaba este método para desbloquear la vista de Registro!)
  async register(username: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/register`, { 
        username: username.trim(), 
        password: password 
      });
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ mensaje?: string }>;
      const mensaje = err.response?.data?.mensaje || 'Error al registrar el usuario';
      throw new Error(mensaje);
    }
  },

  // 3. Cerrar Sesión
  logout() {
    localStorage.removeItem('token');
  },

  // 4. Validar Estado de Autenticación
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // 5. Obtener Token Guardado
  getToken() {
    return localStorage.getItem('token');
  }
};