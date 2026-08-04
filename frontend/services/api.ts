import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://modapazari.onrender.com";
const AXIOS = axios.create({
  baseURL: BASE_URL,
});

// Attach the auth token if present. Never log request headers/bodies here —
// that would leak JWTs and passwords into the browser console.
AXIOS.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AXIOS.interceptors.response.use(
  (response) => response,
  (e) => {
    const error = e as AxiosError;
    const errorResponse = error?.response?.data as any;

    // Prefer detailed errors if available
    const message =
      errorResponse?.errors?.[0]?.msg ||
      errorResponse?.message ||
      "An error occurred";

    toast.error(message);

    return Promise.reject(error);
  },
);

export type SignupRequest = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
};
export type SigninRequest = {
  email: string;
  password: string;
};

export const authService = {
  signUp: (request: SignupRequest) => AXIOS.post("api/auth/register", request),
  sigIn: (request: SigninRequest) => AXIOS.post("api/auth/login", request),
};

export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
};

export const vendorService = {
  createProduct: (request: CreateProductRequest) =>
    AXIOS.post<ApiProduct>("api/vendor/products", request),
  updateProduct: (id: string, request: CreateProductRequest) =>
    AXIOS.put<ApiProduct>(`api/vendor/products/${id}`, request),
  deleteProduct: (id: string) => AXIOS.delete(`api/vendor/products/${id}`),
  getProducts: () => AXIOS.get<ApiProduct[]>("api/vendor/products"),
  getOrders: () => AXIOS.get<ApiOrder[]>("api/vendor/orders"),
};

export type ApiOrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface ApiOrder {
  _id: string;
  buyer?: { firstName?: string; lastName?: string; email?: string } | string | null;
  orderItems: {
    product: ApiRef;
    name?: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: ApiOrderStatus;
  shippingAddress?: { fullName?: string };
  createdAt?: string;
}

export type ApiRef = { _id: string; name?: string } | string | null;

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  stock: number;
  category?: ApiRef;
  brand?: ApiRef;
  vendor?: ApiRef;
  status?: string;
  createdAt?: string;
}

export interface FeedResponse {
  items: ApiProduct[];
  nextCursor: string | null;
  hasMore: boolean;
}

export type FeedParams = {
  cursor?: string;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
};

export const productService = {
  getFeed: (params?: FeedParams) =>
    AXIOS.get<FeedResponse>("api/products/feed", { params }),
  getById: (id: string) => AXIOS.get<ApiProduct>(`api/products/${id}`),
};

export type CartLine = { product: string; quantity: number };
export type GuestCartItem = { product: string; quantity: number; price: number };

export const cartService = {
  get: () => AXIOS.get("api/cart"),
  add: (item: CartLine) => AXIOS.post("api/cart", item),
  remove: (productId: string) => AXIOS.delete(`api/cart/${productId}`),
  // Merge a guest cart into the DB cart on login; returns { items, warnings }.
  merge: (items: GuestCartItem[]) => AXIOS.post("api/cart/merge", { items }),
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country?: string;
  postalCode?: string;
};

export const orderService = {
  // Create a pending order for pay-now checkout, then call paymentService.initiate.
  // Pass an idempotencyKey (e.g. crypto.randomUUID()) to make double-clicks safe.
  checkout: (
    items: CartLine[],
    shippingAddress: ShippingAddress,
    idempotencyKey?: string
  ) =>
    AXIOS.post(
      "api/orders/checkout",
      { items, shippingAddress },
      idempotencyKey
        ? { headers: { "Idempotency-Key": idempotencyKey } }
        : undefined
    ),
  getById: (id: string) => AXIOS.get(`api/orders/${id}`),
};

export interface AdminStats {
  users: number;
  vendors: number;
  orders: number;
  pendingProducts: number;
  approvedProducts: number;
  revenue: number;
}

export interface AdminUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: "buyer" | "vendor" | "admin";
  storeName?: string;
  createdAt?: string;
}

export const adminService = {
  getStats: () => AXIOS.get<AdminStats>("api/admin/stats"),
  getUsers: () => AXIOS.get<AdminUser[]>("api/admin/users"),
  deleteUser: (id: string) => AXIOS.delete(`api/admin/users/${id}`),
  getOrders: () => AXIOS.get<ApiOrder[]>("api/admin/orders"),
  getProducts: (status?: "pending" | "approved" | "rejected") =>
    AXIOS.get<ApiProduct[]>("api/admin/products", { params: { status } }),
  setProductStatus: (id: string, status: "approved" | "rejected" | "pending") =>
    AXIOS.patch<ApiProduct>(`api/admin/products/${id}/status`, { status }),
};

export const paymentService = {
  // Returns Paystack { data: { authorization_url, reference, access_code } }.
  // callbackUrl is where Paystack redirects the buyer after payment.
  initiate: (orderId: string, callbackUrl?: string) =>
    AXIOS.post("api/payment/initiate", { orderId, callbackUrl }),
  // Verify by Paystack reference; returns { data: { status, ... } }.
  verify: (reference: string) =>
    AXIOS.get(`api/payment/verify/${reference}`),
};
