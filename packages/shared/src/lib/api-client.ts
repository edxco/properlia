// Base API client configuration
console.log('API Client initialized', process.env.NEXT_PUBLIC_API_URL);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/v1$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Auth endpoints (login, logout, current user) use root URL, all others use /api/v1
    const isAuthEndpoint = endpoint.startsWith('/users/sign_in') ||
                          endpoint.startsWith('/users/sign_out') ||
                          endpoint.startsWith('/users/current');
    const baseUrl = isAuthEndpoint ? API_ROOT_URL : API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData.errors
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  },

  async requestWithToken<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T; token?: string }> {
    const { requiresAuth = false, ...fetchOptions } = options;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (requiresAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Auth endpoints (login, logout, current user) use root URL, all others use /api/v1
    const isAuthEndpoint = endpoint.startsWith('/users/sign_in') ||
                          endpoint.startsWith('/users/sign_out') ||
                          endpoint.startsWith('/users/current');
    const baseUrl = isAuthEndpoint ? API_ROOT_URL : API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData.errors
      );
    }

    const authHeader = response.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const contentType = response.headers.get('content-type');
    let data: T;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = {} as T;
    }

    return { data, token };
  },

  get<T>(endpoint: string, requiresAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  },

  post<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
    });
  },

  put<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth,
    });
  },

  patch<T>(endpoint: string, data?: unknown, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      requiresAuth,
    });
  },

  delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      requiresAuth,
    });
  },

  async uploadFormData<T>(endpoint: string, formData: FormData, requiresAuth = true): Promise<T> {
    const headers: Record<string, string> = {};

    if (requiresAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData.errors
      );
    }

    return response.json();
  },
};
