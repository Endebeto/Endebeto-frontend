import api from "@/lib/api";
import type { User } from "./auth.service";

export interface UserListResponse {
  status: string;
  results: number;
  data: { users: User[] };
}

export const usersService = {
  getAll: (params?: { page?: number; limit?: number; role?: string }) =>
    api.get<UserListResponse>("/users", { params }),

  getOne: (id: string) =>
    api.get<{ status: string; data: { user: User } }>(`/users/${id}`),

  update: (id: string, data: Partial<User>) =>
    api.patch<{ status: string; data: { user: User } }>(`/users/${id}`, data),

  delete: (id: string) =>
    api.delete(`/users/${id}`),
};
