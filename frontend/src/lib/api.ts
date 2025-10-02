// Versão simplificada sem process.env
const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Clients
  async getClients(params?: { page?: number; limit?: number; search?: string; is_active?: boolean }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    
    return this.request(`/api/clients?${queryParams}`);
  }

  async createClient(clientData: { name: string; email: string; is_active?: boolean }) {
    return this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(clientId: number, clientData: { name: string; email: string; is_active?: boolean }) {
    return this.request(`/api/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(clientId: number) {
    return this.request(`/api/clients/${clientId}`, {
      method: 'DELETE',
    });
  }

  // Assets
  async getAssets() {
    return this.request('/api/assets');
  }

  async searchAsset(ticker: string) {
    return this.request(`/api/assets/search/${ticker}`, {
      method: 'POST',
    });
  }

  async createAllocation(allocationData: {
    client_id: number;
    asset_id: number;
    quantity: number;
    buy_price: number;
    buy_date: string;
  }) {
    return this.request('/api/assets/allocations', {
      method: 'POST',
      body: JSON.stringify(allocationData),
    });
  }

  async getClientAllocations(clientId: number) {
    return this.request(`/api/assets/clients/${clientId}/allocations`);
  }

  // Movements
  async getMovements(params?: { client_id?: number; start_date?: string; end_date?: string; type?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.type) queryParams.append('type', params.type);
    
    return this.request(`/api/movements?${queryParams}`);
  }

  async createMovement(movementData: {
    client_id: number;
    type: 'deposit' | 'withdrawal';
    amount: number;
    date: string;
    note?: string;
  }) {
    return this.request('/api/movements', {
      method: 'POST',
      body: JSON.stringify(movementData),
    });
  }

  async getMovementsSummary(params?: { client_id?: number; start_date?: string; end_date?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.client_id) queryParams.append('client_id', params.client_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    return this.request(`/api/movements/summary?${queryParams}`);
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
}

export const apiService = new ApiService();