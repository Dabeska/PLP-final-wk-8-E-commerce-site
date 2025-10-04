import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

export const AuthApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },
  register: async (fullName: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { fullName, email, password });
    return data;
  },
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  }
};

export const ProductsApi = {
  list: async () => {
    const { data } = await api.get('/products');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },
  create: async (payload: unknown) => {
    const { data } = await api.post('/products', payload);
    return data;
  },
  update: async (id: string, payload: unknown) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  }
};

export const CategoriesApi = {
  list: async () => {
    const { data } = await api.get('/categories');
    return data;
  }
};

export const OrdersApi = {
  list: async () => {
    const { data } = await api.get('/orders');
    return data;
  },
  get: async (id: string) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },
  create: async (payload: unknown) => {
    const { data } = await api.post('/orders', payload);
    return data;
  },
  update: async (id: string, payload: unknown) => {
    const { data } = await api.put(`/orders/${id}`, payload);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/orders/${id}`);
    return data;
  }
};

export const OrderItemsApi = {
  create: async (payload: unknown) => {
    const { data } = await api.post('/order-items', payload);
    return data;
  }
};

export const StatusApi = {
  list: async () => {
    const { data } = await api.get('/statuses');
    return data;
  }
};

export default api;
