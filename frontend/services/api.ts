import axios, { type AxiosError } from "axios";
import toast from "react-hot-toast";

const BASE_URL = "https://e-commerce-api-fauv.onrender.com/";
const AXIOS = axios.create({
  baseURL: BASE_URL,
});

AXIOS.interceptors.request.use((config) => {
  console.log("Axios Request:", {
    url: `${config.baseURL}${config.url}`,
    method: config.method,
    headers: config.headers,
    data: config.data,
  });
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

    console.log("Axios Error Response:", errorResponse);

    toast.error(message);

    return Promise.reject(error);
  }
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
