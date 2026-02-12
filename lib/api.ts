import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Standardized API Response Interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
  };
}

// Handle responses and 401 errors
api.interceptors.response.use(
  (response) => {
    // Auto-extract data from standardized response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const apiResponse = response.data as ApiResponse;

      // For paginated responses, preserve meta
      if (apiResponse.meta) {
        return {
          ...response,
          data: {
            data: apiResponse.data,
            ...apiResponse.meta,
          },
        };
      }

      // For single item responses with data field, extract it
      if (apiResponse.data !== undefined) {
        return { ...response, data: apiResponse.data };
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Config {
  id: number;
  group_code: string; // 'Location' or 'Floor'
  parent_id?: number; // Parent location ID for floors
  value: string;
  descr?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
  parent?: Config; // Parent config relationship
  children?: Config[]; // Child configs relationship
}

export interface Event {
  id: number;
  title: string;
  location_id: number;
  floor_id?: number;
  location: Config;
  floor?: Config;
  // Legacy fields (for backward compatibility)
  event_date: string;
  event_time: string;
  end_time?: string;
  // New datetime fields
  event_start_datetime?: string;
  event_end_datetime?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

export interface TodayEventsResponse {
  date: string;
  timezone: string;
  events: Event[];
}

export interface Promo {
  image_url: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

const apiService = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const response = await api.post('/api/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/logout');
  },

  async getUser(): Promise<User> {
    const response = await api.get('/api/user');
    return response.data;
  },

  // Events
  async getTodayEvents(date?: string): Promise<TodayEventsResponse> {
    const response = await api.get('/api/events/today', {
      params: date ? { date } : {},
    });
    return response.data; // Interceptor extracts data from standardized response
  },

  async getEvents(page = 1, perPage = 15, search = '', locationId?: number, floorId?: number, dateFrom?: string, dateTo?: string, sortBy?: string, sortDir?: string): Promise<PaginatedResponse<Event>> {
    const response = await api.get('/api/events', {
      params: {
        page,
        per_page: perPage,
        search,
        location_id: locationId,
        floor_id: floorId,
        date_from: dateFrom,
        date_to: dateTo,
        sort_by: sortBy,
        sort_dir: sortDir
      },
    });
    return response.data;
  },

  async getEvent(id: number): Promise<Event> {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  },

  async createEvent(data: Partial<Event>): Promise<Event> {
    const response = await api.post('/api/events', data);
    return response.data; // Interceptor extracts data automatically
  },

  async updateEvent(id: number, data: Partial<Event>): Promise<Event> {
    const response = await api.put(`/api/events/${id}`, data);
    return response.data; // Interceptor extracts data automatically
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(`/api/events/${id}`);
    // No data to return for delete
  },

  async getFloorAvailability(floorId: number, date: string): Promise<any> {
    const response = await api.get('/api/events/floor-availability', {
      params: { floor_id: floorId, date },
    });
    return response.data;
  },

  // Configs
  async getConfigs(page = 1, perPage = 15, search = '', groupCode?: string, isActive?: boolean, sortBy?: string, sortDir?: string): Promise<PaginatedResponse<Config>> {
    const response = await api.get('/api/configs', {
      params: { page, per_page: perPage, search, group_code: groupCode, is_active: isActive, sort_by: sortBy, sort_dir: sortDir },
    });
    return response.data;
  },

  async getActiveConfigs(groupCode?: string): Promise<Config[]> {
    const response = await api.get('/api/configs/active', {
      params: groupCode ? { group_code: groupCode } : {},
    });
    return response.data; // Interceptor extracts data array
  },

  async createConfig(data: Partial<Config>): Promise<Config> {
    const response = await api.post('/api/configs', data);
    return response.data; // Interceptor extracts data
  },

  async updateConfig(id: number, data: Partial<Config>): Promise<Config> {
    const response = await api.put(`/api/configs/${id}`, data);
    return response.data; // Interceptor extracts data
  },

  async deleteConfig(id: number): Promise<void> {
    await api.delete(`/api/configs/${id}`);
    // No data to return for delete
  },

  // Promos
  async getPromos(): Promise<{ promos: Promo[] }> {
    const response = await api.get('/api/promos');
    return response.data;
  },
};

export default apiService;
