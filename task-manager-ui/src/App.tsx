import { useState } from 'react';
import { Login } from './components/Login';
import { TaskList } from './components/TaskList';
import { authService } from './services/authService';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    authService.isAuthenticated()
  );

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  // Flujo correcto: Solo muestra Login si no está autenticado
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Muestra el tablero de tareas cuando SÍ está autenticado
  return (
    <div>
      <div style={{ textAlign: 'right', padding: '1rem', background: '#1e1e1e' }}>
        <button 
          onClick={handleLogout}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Cerrar Sesión
        </button>
      </div>
      <TaskList />
    </div>
  );
}

export default App;