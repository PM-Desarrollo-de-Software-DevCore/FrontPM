import { API_BASE_URL } from "@/lib/auth";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiRequestOptions = RequestInit & {
  requireAuth?: boolean;
};

function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("authToken");
}

function withBaseUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}

export async function apiFetch(path: string, options: ApiRequestOptions = {}): Promise<Response> {
  const { requireAuth = false, headers, body, ...rest } = options;
  const finalHeaders = new Headers(headers ?? {});

  const hasFormDataBody = typeof FormData !== "undefined" && body instanceof FormData;
  if (!hasFormDataBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (requireAuth) {
    const token = getStoredToken();

    if (!token) {
      throw new ApiError("No hay sesion activa", 401);
    }

    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(withBaseUrl(path), {
    ...rest,
    headers: finalHeaders,
    body,
  });
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}
