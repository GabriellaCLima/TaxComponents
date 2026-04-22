import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Redireciona para login se não estiver autenticado
    return <Navigate to="/" />;
  }
  
  return children;
}