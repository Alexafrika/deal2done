/**
 * Configured axios instance.
 * Automatically injects Authorization header and handles 401 refresh.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: refresh on 401 ─────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
  failedQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        api.defaults.headers.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Typed API helpers ─────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterPayload) => api.post("/auth/register", data),
  login: (data: LoginPayload) => api.post("/auth/login", data),
  refresh: (refreshToken: string) => api.post("/auth/refresh", { refresh_token: refreshToken }),
  me: () => api.get("/auth/me"),
  logout: (refreshToken: string) => api.post("/auth/logout", { refresh_token: refreshToken }),
};

export const productsApi = {
  list: (params?: Record<string, unknown>) => api.get("/products", { params }),
  get: (id: string) => api.get(`/products/${id}`),
  create: (data: unknown) => api.post("/products", data),
  update: (id: string, data: unknown) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  myProducts: (params?: Record<string, unknown>) => api.get("/products/my", { params }),
  uploadImage: (id: string, file: File, isPrimary = false) => {
    const form = new FormData();
    form.append("file", file);
    form.append("is_primary", String(isPrimary));
    return api.post(`/products/${id}/images`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const ordersApi = {
  // Cart
  getCarts: () => api.get("/cart"),
  addToCart: (data: { product_id: string; quantity: number }) => api.post("/cart/items", data),
  removeCartItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: (cartId: string) => api.delete(`/cart/${cartId}`),
  // Orders
  checkout: (data: CheckoutPayload) => api.post("/orders/checkout", data),
  myOrders: (params?: Record<string, unknown>) => api.get("/orders", { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  reorder: (orderId: string) => api.post(`/orders/${orderId}/reorder`),
  // Supplier
  supplierOrders: (params?: Record<string, unknown>) => api.get("/supplier/orders", { params }),
  updateOrderStatus: (id: string, data: { status: string; comment?: string }) =>
    api.patch(`/supplier/orders/${id}/status`, data),
};

export const adminApi = {
  users: (params?: Record<string, unknown>) => api.get("/admin/users", { params }),
  activateUser: (id: string) => api.patch(`/admin/users/${id}/activate`),
  deactivateUser: (id: string) => api.patch(`/admin/users/${id}/deactivate`),
  pendingSuppliers: () => api.get("/admin/suppliers/pending"),
  verifySupplier: (id: string) => api.patch(`/admin/suppliers/${id}/verify`),
  rejectSupplier: (id: string) => api.patch(`/admin/suppliers/${id}/reject`),
  pendingProducts: () => api.get("/admin/products/pending"),
  approveProduct: (id: string) => api.patch(`/admin/products/${id}/approve`),
  analytics: () => api.get("/admin/analytics/summary"),
};

// ── Type stubs ────────────────────────────────────────────────────────────

interface RegisterPayload {
  email: string;
  phone?: string;
  password: string;
  full_name: string;
  role: "buyer" | "supplier";
}

interface LoginPayload {
  email: string;
  password: string;
}

interface CheckoutPayload {
  cart_id: string;
  delivery_address_id?: string;
  delivery_method?: string;
  payment_method?: string;
  notes?: string;
}
