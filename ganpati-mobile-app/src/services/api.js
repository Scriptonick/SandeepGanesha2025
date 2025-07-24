const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('ganpati_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('ganpati_token', token);
    } else {
      localStorage.removeItem('ganpati_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(name, email, password) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (response.success) {
      this.setToken(response.token);
    }
    
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Avatar methods
  async getAvatars() {
    return await this.request('/avatars');
  }

  // Collection methods
  async getUserCollections(userId) {
    return await this.request(`/collections/${userId}`);
  }

  // Scratch methods
  async canScratchToday(userId) {
    return await this.request(`/scratch/can-scratch/${userId}`);
  }

  async scratchCard(userId) {
    return await this.request(`/scratch/${userId}`, {
      method: 'POST',
    });
  }

  // Leaderboard methods
  async getLeaderboard() {
    return await this.request('/leaderboard');
  }

  // Admin methods
  async getAdminUsers() {
    return await this.request('/admin/users');
  }

  async addUser(userData) {
    return await this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId, userData) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId) {
    return await this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async blockUser(userId, blocked) {
    return await this.request(`/admin/users/${userId}/block`, {
      method: 'PUT',
      body: JSON.stringify({ blocked }),
    });
  }

  async assignScratchCard(userId) {
    return await this.request(`/admin/users/${userId}/assign-scratch`, {
      method: 'POST',
    });
  }

  async getInventory() {
    return await this.request('/admin/inventory');
  }

  async updateInventory(avatarId, quantity) {
    return await this.request(`/admin/inventory/${avatarId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async getAdminStats() {
    return await this.request('/admin/stats');
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

export default new ApiService();