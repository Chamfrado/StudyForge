import { clearAuth, getToken, saveAuth } from "@/lib/auth";
import type {
  AnalyticsOverview,
  ApiErrorResponse,
  CreateSubjectRequest,
  Flashcard,
  FlashcardsResponse,
  GenerateFlashcardsResponse,
  LoginRequest,
  LoginResponse,
  Material,
  MaterialsResponse,
  Quiz,
  RegisterRequest,
  RegisterResponse,
  Subject,
  SubjectsResponse,
  Summary,
  UpdateSubjectRequest,
  UploadMaterialRequest,
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

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function httpFormData<T>(
  path: string,
  formData: FormData,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    method: options.method || "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: formData,
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

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
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

  getAnalyticsOverview: async () => {
    return http<AnalyticsOverview>("/analytics/overview", {
      method: "GET",
      auth: true,
    });
  },

  getSubjects: async () => {
    return http<SubjectsResponse>("/subjects", {
      method: "GET",
      auth: true,
    });
  },

  getSubject: async (subjectId: string) => {
    return http<Subject>(`/subjects/${subjectId}`, {
      method: "GET",
      auth: true,
    });
  },

  createSubject: async (data: CreateSubjectRequest) => {
    return http<Subject>("/subjects", {
      method: "POST",
      auth: true,
      body: JSON.stringify(data),
    });
  },

  updateSubject: async (subjectId: string, data: UpdateSubjectRequest) => {
    return http<Subject>(`/subjects/${subjectId}`, {
      method: "PUT",
      auth: true,
      body: JSON.stringify(data),
    });
  },

  deleteSubject: async (subjectId: string) => {
    return http<void>(`/subjects/${subjectId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  getMaterials: async () => {
    return http<MaterialsResponse>("/materials", {
      method: "GET",
      auth: true,
    });
  },

  getMaterial: async (materialId: string) => {
    return http<Material>(`/materials/${materialId}`, {
      method: "GET",
      auth: true,
    });
  },

  uploadMaterial: async (data: UploadMaterialRequest) => {
    const formData = new FormData();

    formData.append("subject_id", data.subject_id);
    formData.append("title", data.title);
    formData.append("file", data.file);

    return httpFormData<Material>("/materials/upload", formData);
  },

  deleteMaterial: async (materialId: string) => {
    return http<void>(`/materials/${materialId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  generateSummary: async (materialId: string) => {
    return http<Summary>(`/ai/materials/${materialId}/summary`, {
      method: "POST",
      auth: true,
    });
  },

  generateFlashcards: async (materialId: string) => {
    return http<GenerateFlashcardsResponse>(
      `/ai/materials/${materialId}/flashcards`,
      {
        method: "POST",
        auth: true,
      },
    );
  },

  generateQuiz: async (materialId: string) => {
    return http<Quiz>(`/ai/materials/${materialId}/quiz`, {
      method: "POST",
      auth: true,
    });
  },

  getFlashcards: async () => {
    return http<FlashcardsResponse>("/flashcards", {
      method: "GET",
      auth: true,
    });
  },

  getFlashcard: async (flashcardId: string) => {
    return http<Flashcard>(`/flashcards/${flashcardId}`, {
      method: "GET",
      auth: true,
    });
  },

  deleteFlashcard: async (flashcardId: string) => {
    return http<void>(`/flashcards/${flashcardId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  exportFlashcardsCsv: async () => {
    const token = getToken();

    const response = await fetch(`${API_URL}/flashcards/export/csv`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      throw new Error(`Could not export CSV. Status ${response.status}`);
    }

    return response.blob();
  },
};
