const API_URL = 'http://localhost:5000'; 

export const userService = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /register
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  addUser: async (userData) => {
    console.log('📡 Chamando POST /register com:', userData);

    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('📡 Resposta do /register:', response.status, data);

    if (!response.ok) {
      // Lança erro com a mensagem que veio do backend
      throw new Error(data.error || 'Erro ao cadastrar usuário');
    }

    // Salva token automaticamente se vier na resposta
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  login: async (credentials) => {
    console.log('📡 Chamando POST /login com:', credentials);

    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log('📡 Resposta do /login:', response.status, data);

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao fazer login');
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /me
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  getMe: async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // POST /comparisons
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  saveComparison: async (taxData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/comparisons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ taxData }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GET /comparisons
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  getComparisons: async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/comparisons`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DELETE /comparisons/:id
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  deleteComparison: async (id) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/comparisons/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Logout
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};