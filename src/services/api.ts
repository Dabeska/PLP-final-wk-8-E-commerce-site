import axios from 'axios';
import type { Category, Order, OrderItem, Product, Status, User } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiResponse<T> = {
  data: T;
  error: string | null;
};

const unwrapResponse = <T>(response: ApiResponse<T>): T => {
  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

export interface AuthResponse {
  token: string;
  user: User;
}

type RawProduct = {
  id: string | number;
  name?: string | null;
  description?: string | null;
  price?: number | string | null;
  stock?: number | null;
  image_url?: string | null;
  category_id?: string | number | null;
};

type RawCategory = {
  id: string | number;
  name?: string | null;
  description?: string | null;
};

type RawStatusPayload = {
  id?: string | number | null;
  name?: string | null;
  status_name?: string | null;
};

type RawOrderItem = {
  id: string | number;
  order_id?: string | number | null;
  product_id?: string | number | null;
  quantity?: number | null;
  price?: number | string | null;
  product?: RawProduct | null;
  products?: RawProduct | null;
};

type RawOrder = {
  id: string | number;
  user_id?: string | number | null;
  status_id?: string | number | null;
  total_price?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  items?: RawOrderItem[] | null;
  order_items?: RawOrderItem[] | null;
  status?: RawStatusPayload | null;
  status_name?: string | null;
};

type CreateOrderItemPayload = {
  product_id: string | number;
  quantity: number;
  price: number;
};

export interface CreateOrderPayload {
  total_price: number;
  order_items: CreateOrderItemPayload[];
  status_id?: string | number | null;
  status_name?: string | null;
}

const toNumber = (value: string | number | null | undefined): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const ensureString = (value: string | number | null | undefined): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return value.toString();
};

const mapProduct = (product: RawProduct): Product => ({
  id: String(product.id),
  name: product.name ?? '',
  description: product.description ?? '',
  price: typeof product.price === 'number' ? product.price : Number(product.price ?? 0),
  stock: product.stock ?? undefined,
  imageUrl: product.image_url ?? undefined,
  categoryId: product.category_id != null ? String(product.category_id) : undefined
});

const mapCategory = (category: RawCategory): Category => ({
  id: String(category.id),
  name: category.name ?? '',
  description: category.description ?? undefined
});

const mapStatus = (status: RawStatusPayload | null | undefined): Status | undefined => {
  if (!status) {
    return undefined;
  }
  const name = status.status_name ?? status.name ?? undefined;
  if (!name) {
    return undefined;
  }
  return {
    id: String(status.id ?? ''),
    name
  };
};

const mapOrderItem = (item: RawOrderItem): OrderItem => {
  const productData = item.product ?? item.products ?? null;

  return {
    id: String(item.id),
    orderId: item.order_id != null ? String(item.order_id) : '',
    productId: item.product_id != null ? String(item.product_id) : '',
    quantity: item.quantity ?? 0,
    unitPrice: typeof item.price === 'number' ? item.price : Number(item.price ?? 0),
    product: productData ? mapProduct(productData) : undefined
  };
};

const mapOrder = (order: RawOrder): Order => {
  const total = typeof order.total_price === 'number' ? order.total_price : Number(order.total_price ?? 0);
  const createdAt = order.created_at ?? new Date().toISOString();
  const updatedAt = order.updated_at ?? createdAt;
  const itemsSource = order.items ?? order.order_items ?? [];

  return {
    id: String(order.id),
    userId: order.user_id != null ? String(order.user_id) : '',
    statusId: order.status_id != null ? String(order.status_id) : '',
    total,
    createdAt,
    updatedAt,
    items: itemsSource.map(mapOrderItem),
    status: mapStatus(order.status) ?? (order.status_name ? { id: String(order.status_id ?? ''), name: order.status_name } : undefined)
  };
};

export const AuthApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('api/auth/login', { email, password });
    return unwrapResponse(data);
  },
  register: async (fullName: string, email: string, password: string) => {
    const { data } = await api.post<ApiResponse<AuthResponse>>('api/auth/register', {
      fullName,
      email,
      password
    });
    return unwrapResponse(data);
  },
  me: async () => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('api/auth/me');
    const payload = unwrapResponse(data);
    return payload.user;
  }
};

type ProductCreatePayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string | null;
};

type ProductUpdatePayload = Partial<{
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string | null;
  imageUrl: string | null;
}>;

export const ProductsApi = {
  list: async (): Promise<Product[]> => {
    const { data } = await api.get<ApiResponse<RawProduct[]>>('api/products');
    const products = unwrapResponse(data);
    return (products ?? []).map(mapProduct);
  },
  get: async (id: string | number): Promise<Product> => {
    const { data } = await api.get<ApiResponse<RawProduct>>(`api/products/${id}`);
    const product = unwrapResponse(data);
    return mapProduct(product);
  },
  create: async (payload: ProductCreatePayload): Promise<Product> => {
    const requestPayload = {name: payload.name,description: payload.description,price: payload.price,stock: payload.stock,image_url: payload.imageUrl ?? null,category_id: toNumber(payload.categoryId) ?? payload.categoryId};

    const { data } = await api.post<ApiResponse<RawProduct>>('api/products', requestPayload);
    return mapProduct(unwrapResponse(data));
  },
  update: async (id: string | number, payload: ProductUpdatePayload): Promise<Product> => {
    const requestPayload: Record<string, unknown> = {};

    if (payload.name !== undefined) requestPayload.name = payload.name;
    if (payload.description !== undefined) requestPayload.description = payload.description;
    if (payload.price !== undefined) requestPayload.price = payload.price;
    if (payload.stock !== undefined) requestPayload.stock = payload.stock;
    if (payload.imageUrl !== undefined) requestPayload.image_url = payload.imageUrl;
    if (payload.categoryId !== undefined) {requestPayload.category_id = toNumber(payload.categoryId) ?? payload.categoryId;}

    const { data } = await api.put<ApiResponse<RawProduct>>(`api/products/${id}`, requestPayload);
    return mapProduct(unwrapResponse(data));
  },
  remove: async (id: string | number) => {
    const { data } = await api.delete<ApiResponse<{ id: string | number }>>(`api/products/${id}`);
    return unwrapResponse(data);
  },
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const { data } = await api.post<ApiResponse<{ url: string }>>('api/products/upload', formData);

    return unwrapResponse(data);
  }
};

export const CategoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await api.get<ApiResponse<RawCategory[]>>('api/categories');
    const categories = unwrapResponse(data);
    return (categories ?? []).map(mapCategory);
  },
  create: async (payload: { name: string; description?: string }): Promise<Category> => {
    const { data } = await api.post<ApiResponse<RawCategory>>('api/categories', payload);
    return mapCategory(unwrapResponse(data));
  },
  update: async (id: string | number, payload: { name?: string; description?: string }): Promise<Category> => {
    const { data } = await api.put<ApiResponse<RawCategory>>(`api/categories/${id}`, payload);
    return mapCategory(unwrapResponse(data));
  },
  remove: async (id: string | number) => {
    const { data } = await api.delete<ApiResponse<{ id: string | number }>>(`api/categories/${id}`);
    return unwrapResponse(data);
  }
};

export const OrdersApi = {
  list: async (): Promise<Order[]> => {
    const { data } = await api.get<ApiResponse<RawOrder[]>>('api/orders');
    const payload = unwrapResponse(data);
    return (payload ?? []).map(mapOrder);
  },
  get: async (id: string | number): Promise<Order> => {
    const { data } = await api.get<ApiResponse<RawOrder>>(`api/orders/${id}`);
    const payload = unwrapResponse(data);
    if (!payload) {
      throw new Error('Order not found');
    }
    return mapOrder(payload);
  },
  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post<ApiResponse<RawOrder>>('api/orders', payload);
    return mapOrder(unwrapResponse(data));
  },
  update: async (
    id: string | number,
    payload: {
      status_id?: string | number | null;
      status_name?: string | null;
      total_price?: number;
      user_id?: string | number;
    }
  ): Promise<Order> => {
    const { data } = await api.put<ApiResponse<RawOrder>>(`api/orders/${id}`, payload);
    return mapOrder(unwrapResponse(data));
  },
  cancel: async (id: string | number): Promise<Order> => {
    const { data } = await api.patch<ApiResponse<RawOrder>>(`api/orders/${id}/cancel`, {});
    return mapOrder(unwrapResponse(data));
  },
  remove: async (id: string | number) => {
    const { data } = await api.delete<ApiResponse<{ id: string | number }>>(`api/orders/${id}`);
    return unwrapResponse(data);
  }
};

export const OrderItemsApi = {
  create: async (payload: unknown) => {
    const { data } = await api.post('api/order-items', payload);
    return data;
  }
};

export const StatusApi = {
  list: async (): Promise<Status[]> => {
    const { data } = await api.get<ApiResponse<RawStatusPayload[]>>('api/statuses');
    const payload = unwrapResponse(data) ?? [];
    return payload
      .map((status) => mapStatus(status))
      .filter((status): status is Status => Boolean(status));
  }
};

export default api;

