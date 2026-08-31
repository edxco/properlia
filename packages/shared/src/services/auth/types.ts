export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  message: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
