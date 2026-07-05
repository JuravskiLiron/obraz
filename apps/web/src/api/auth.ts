import { api } from "@/lib/api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/api";

export const register = (body: RegisterRequest) =>
  api.post<AuthResponse>(`/api/auth/register`, body);

export const login = (body: LoginRequest) =>
  api.post<AuthResponse>(`/api/auth/login`, body);

export const me = () => api.get<User>(`/api/auth/me`, { auth: true });
