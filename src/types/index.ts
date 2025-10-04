export type Role = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  status?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  statusId: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  status?: Status;
}

export interface Status {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
