const API_BASE_URL = 'http://localhost:3000';

// FUNÇÃO BASE PARA REQUISIÇÕES 
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };


  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
}

// SERVIÇOS DE AUTENTICAÇÃO 
export const authService = {
  // Registra um novo usuário 
 async register(username, profissao, email, password) {
  console.log("Enviando registro para backend...");
  
  const response = await apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({
      username: username,
      profissao: profissao || "Usuário",
      email: email,
      password: password
    }),
  });

  console.log("Resposta do backend:", response);
  
  if (response.token) {
    console.log("Salvando token no localStorage:", response.token.substring(0, 20) + "...");
    localStorage.setItem('token', response.token);
    
    if (response.user) {
      console.log("Salvando usuário no localStorage:", response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    console.log("Token e usuário salvos com sucesso!");
  } else {
    console.warn("ATENÇÃO: Nenhum token recebido na resposta do registro!");
    console.warn("Resposta completa:", response);
  }

  return response;
},
  // Faz login do usuário
  async login(email, password) {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email: email, 
        password: password  
      }),
    });

    // Salvar token e usuário no localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  // Faz logout (remove o token)
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verifica se o usuário está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obtém o token armazenado
  getToken() {
    return localStorage.getItem('token');
  },

  // Obtém os dados do usuário
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// SERVIÇOS DE USUÁRIO 
export const userService = {
  // Verifica se email já existe (simulação)
  async checkEmailExists(email) {
    try {
      const response = await apiRequest(`/check-email?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });
      return response.exists || false;
    } catch (error) {
      console.log("Não foi possível verificar email, assumindo que não existe");
      return false; 
    }
  },

  // Registra um novo usuário 
 async addUser(userData) {
  try {
    console.log("Registrando usuário:", userData);

    const response = await authService.register(
      userData.username,
      userData.profissao,
      userData.email,
      userData.password
    );

    console.log("Registro bem-sucedido:", response);
    console.log("Token recebido:", !!response.token);
    console.log("Usuário recebido:", !!response.user);
    
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    console.log("Token salvo no localStorage:", !!savedToken);
    console.log("Usuário salvo no localStorage:", !!savedUser);
    
    return {
      id: response.userId,
      username: userData.username,
      email: userData.email,
      profissao: userData.profissao,
      token: response.token, 
      user: response.user,   
      ...response,
    };
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
},

  async validateLogin(email, password) {
    try {
      console.log("Validando login para:", email);

      // Chama o authService.login
      const response = await authService.login(email, password);
      
      console.log("Resposta do login:", response);

      if (response.token && response.user) {
        // Retorna dados formatados para o frontend
        return {
          id: response.user.id,
          username: response.user.username,  
          email: response.user.email,
          token: response.token,
        };
      } else {
        throw new Error(response.message || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error("Erro no login:", error);
      
      // Limpa localStorage em caso de erro
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      throw error;
    }
  },

  // Envia link de recuperação de senha
  async sendPasswordResetLink(email) {
    try {
      const response = await apiRequest('/api/send-reset-link', { 
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Obtém usuário por email (simulação)
  async getUserByEmail(email) {
    return null; 
  },

  // Atualiza dados do usuário
  async updateUser(userId, userData) {
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Deleta usuário
  async deleteUser(userId) {
    try {
      const response = await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Verifica se está logado
export const isAuthenticated = () => authService.isAuthenticated();

// Faz logout
export const logout = () => authService.logout();

// Obtém dados do usuário atual
export const getCurrentUser = () => authService.getUser();

// Obtém token
export const getToken = () => authService.getToken();

// Exporta a função base também se precisar
export default apiRequest;