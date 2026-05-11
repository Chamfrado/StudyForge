import { clearAuth, getToken, saveAuth } from "@/lib/auth";
import type {
  ApiErrorResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (response.status === 401) {
    clearAuth();

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    let errorMessage = "Something went wrong.";

    try {
      const errorData = (await response.json()) as ApiErrorResponse;

      errorMessage =
        errorData.detail ||
        errorData.message ||
        `Request failed with status ${response.status}`;
    } catch {
      errorMessage = `Request failed with status ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  register: async (data: RegisterRequest) => {
    return http<RegisterResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest) => {
    const response = await http<LoginResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(data),
    });

    saveAuth(response.access_token, response.user);

    return response;
  },

  me: async () => {
    return http("/auth/me", {
      method: "GET",
      auth: true,
    });
  },
};
