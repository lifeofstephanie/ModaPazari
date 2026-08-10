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

export interface UserAddress {
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "buyer" | "vendor" | "admin";
  avatar?: string;
  address?: UserAddress;
  vendorStatus?: "pending" | "approved" | "rejected";
  emailVerified?: boolean;
}

export const authService = {
  signUp: (request: SignupRequest) => AXIOS.post("api/auth/register", request),
  sigIn: (request: SigninRequest) => AXIOS.post("api/auth/login", request),
  forgotPassword: (email: string) =>
    AXIOS.post("api/auth/forgot-password", { email }),
  resetPassword: (payload: { email: string; token: string; password: string }) =>
    AXIOS.post("api/auth/reset-password", payload),
  verifyEmail: (payload: { email: string; token: string }) =>
    AXIOS.post("api/auth/verify-email", payload),
  getMe: () => AXIOS.get<UserProfile>("api/auth/me"),
  updateMe: (body: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    address?: UserAddress;
  }) => AXIOS.put<UserProfile>("api/auth/me", body),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    AXIOS.put("api/auth/password", body),
};

export type ProductVariant = { size: string; stock: number };

export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
  images?: string[];
  colors?: string[];
  variants?: ProductVariant[];
  department?: Department;
  season?: Season;
};

export const vendorService = {
  createProduct: (request: CreateProductRequest) =>
    AXIOS.post<ApiProduct>("api/vendor/products", request),
  updateProduct: (id: string, request: CreateProductRequest) =>
    AXIOS.put<ApiProduct>(`api/vendor/products/${id}`, request),
  deleteProduct: (id: string) => AXIOS.delete(`api/vendor/products/${id}`),
  getProducts: () => AXIOS.get<ApiProduct[]>("api/vendor/products"),
  getOrders: () => AXIOS.get<ApiOrder[]>("api/vendor/orders"),
  updateOrderStatus: (id: string, status: "shipped" | "delivered") =>
    AXIOS.patch<ApiOrder>(`api/vendor/orders/${id}/status`, { status }),
  getStats: () => AXIOS.get<VendorStats>("api/vendor/stats"),
  getBanks: () => AXIOS.get<{ name: string; code: string }[]>("api/vendor/banks"),
  getPayoutAccount: () =>
    AXIOS.get<{ connected: boolean; bankName?: string; accountNumber?: string }>(
      "api/vendor/payout-account"
    ),
  setupPayoutAccount: (body: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
  }) => AXIOS.post("api/vendor/payout-account", body),
};

export interface VendorStats {
  revenue: number;
  orders: number;
  productsLive: number;
  productsPending: number;
  monthly: { label: string; earnings: number }[];
  bestSellers: {
    id: string;
    name: string;
    price: number;
    stock: number;
    orders: number;
    sales: number;
  }[];
  recent: {
    id: string;
    customer: string;
    status: ApiOrderStatus;
    total: number;
    date: string;
  }[];
}

export type ApiOrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface ApiOrder {
  _id: string;
  buyer?: { firstName?: string; lastName?: string; email?: string } | string | null;
  orderItems: {
    product: ApiRef;
    name?: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }[];
  subtotal?: number;
  tax?: number;
  shippingFee?: number;
  totalPrice: number;
  status: ApiOrderStatus;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  paymentReference?: string;
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
  colors?: string[];
  variants?: ProductVariant[];
  department?: Department;
  season?: Season;
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

export type Department =
  | "clothes"
  | "accessories"
  | "footwear"
  | "bags"
  | "jewelry"
  | "beauty"
  | "other";
export type Season = "winter" | "summer" | "autumn" | "spring" | "none";

export const DEPARTMENTS: Department[] = [
  "clothes",
  "accessories",
  "footwear",
  "bags",
  "jewelry",
  "beauty",
  "other",
];
export const SEASONS: Season[] = ["winter", "summer", "autumn", "spring", "none"];

export type FeedParams = {
  cursor?: string;
  limit?: number;
  category?: string;
  department?: Department;
  season?: Season;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
};

export const productService = {
  getFeed: (params?: FeedParams) =>
    AXIOS.get<FeedResponse>("api/products/feed", { params }),
  getById: (id: string) => AXIOS.get<ApiProduct>(`api/products/${id}`),
};

export interface ApiReview {
  _id: string;
  rating: number;
  comment?: string;
  user?: { firstName?: string; lastName?: string } | string | null;
  createdAt?: string;
}

export const reviewService = {
  getForProduct: (productId: string) =>
    AXIOS.get<ApiReview[]>(`api/review/${productId}`),
  create: (productId: string, body: { rating: number; comment?: string }) =>
    AXIOS.post<ApiReview>(`api/review/${productId}`, body),
};

export interface ApiWishlist {
  _id?: string;
  products: ApiProduct[];
}

export const wishlistService = {
  get: () => AXIOS.get<ApiWishlist | null>("api/wishlist"),
  add: (productId: string) => AXIOS.post("api/wishlist", { productId }),
  remove: (productId: string) => AXIOS.delete(`api/wishlist/${productId}`),
};

export type CartLine = {
  product: string;
  quantity: number;
  color?: string;
  size?: string;
};
export type GuestCartItem = {
  product: string;
  quantity: number;
  price?: number;
  color?: string;
  size?: string;
};

export interface ServerCartItem {
  _id: string;
  product:
    | { _id: string; name: string; price: number; images?: string[]; stock?: number }
    | string;
  quantity: number;
  color?: string;
  size?: string;
}

export interface ServerCart {
  user: string;
  items: ServerCartItem[];
}

export const cartService = {
  get: () => AXIOS.get<ServerCart>("api/cart"),
  add: (body: {
    productId: string;
    quantity: number;
    color?: string;
    size?: string;
  }) => AXIOS.post<ServerCart>("api/cart", body),
  updateQty: (itemId: string, quantity: number) =>
    AXIOS.put<ServerCart>(`api/cart/item/${itemId}`, { quantity }),
  remove: (itemId: string) => AXIOS.delete<ServerCart>(`api/cart/item/${itemId}`),
  clear: () => AXIOS.delete("api/cart"),
  // Merge a guest cart into the DB cart on login; returns the populated cart.
  merge: (items: GuestCartItem[]) =>
    AXIOS.post<ServerCart>("api/cart/merge", { items }),
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
  // The signed-in buyer's own orders.
  getMine: () => AXIOS.get<ApiOrder[]>("api/orders/mine"),
  getById: (id: string) => AXIOS.get<ApiOrder>(`api/orders/${id}`),
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
  vendorStatus?: "pending" | "approved" | "rejected";
  createdAt?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export const adminService = {
  getStats: () => AXIOS.get<AdminStats>("api/admin/stats"),
  getUsers: (page = 1) =>
    AXIOS.get<Paginated<AdminUser>>("api/admin/users", { params: { page } }),
  deleteUser: (id: string) => AXIOS.delete(`api/admin/users/${id}`),
  getOrders: (page = 1) =>
    AXIOS.get<Paginated<ApiOrder>>("api/admin/orders", { params: { page } }),
  getProducts: (status?: "pending" | "approved" | "rejected", page = 1) =>
    AXIOS.get<Paginated<ApiProduct>>("api/admin/products", {
      params: { status, page },
    }),
  setProductStatus: (id: string, status: "approved" | "rejected" | "pending") =>
    AXIOS.patch<ApiProduct>(`api/admin/products/${id}/status`, { status }),
  getVendors: (status?: "pending" | "approved" | "rejected", page = 1) =>
    AXIOS.get<Paginated<AdminUser>>("api/admin/vendors", {
      params: { status, page },
    }),
  setVendorStatus: (id: string, status: "approved" | "rejected") =>
    AXIOS.patch<AdminUser>(`api/admin/vendors/${id}/status`, { status }),
  refundOrder: (id: string) =>
    AXIOS.post<ApiOrder>(`api/admin/orders/${id}/refund`),
  getPromos: () => AXIOS.get<ApiPromo[]>("api/admin/promos"),
  createPromo: (body: PromoInput) => AXIOS.post<ApiPromo>("api/admin/promos", body),
  updatePromo: (id: string, body: Partial<ApiPromo>) =>
    AXIOS.put<ApiPromo>(`api/admin/promos/${id}`, body),
  deletePromo: (id: string) => AXIOS.delete(`api/admin/promos/${id}`),
};

export interface ApiPromo {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export type PromoInput = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxUses: number;
  expiresAt?: string;
};

export interface ApiNotification {
  _id: string;
  message: string;
  type: "order" | "promo" | "system";
  read: boolean;
  createdAt?: string;
}

export const notificationService = {
  list: () => AXIOS.get<ApiNotification[]>("api/notification"),
  unreadCount: () =>
    AXIOS.get<{ count: number }>("api/notification/unread-count"),
  markRead: (id: string) => AXIOS.put(`api/notification/${id}/read`),
  markAllRead: () => AXIOS.put("api/notification/read-all"),
};

export interface PricingConfig {
  vatPercent: number;
  shippingFee: number;
  freeShippingThreshold: number;
}

export const pricingService = {
  get: () => AXIOS.get<PricingConfig>("api/pricing"),
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
