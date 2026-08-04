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
    AXIOS.post("api/vendor/products", request),
  getProducts: () => AXIOS.get("api/vendor/products"),
  getOrders: () => AXIOS.get("api/vendor/orders"),
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

export const paymentService = {
  // Returns Paystack { data: { authorization_url, reference, access_code } }.
  initiate: (orderId: string) =>
    AXIOS.post("api/payment/initiate", { orderId }),
  verify: (transactionId: string) =>
    AXIOS.get(`api/payment/verify/${transactionId}`),
};
