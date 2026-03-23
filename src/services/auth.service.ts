import api from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: { user: User };
}

export interface User {
  _id: string;
  name: string;
  email: string;
  photo?: string;
  role: "user" | "admin";
  hostStatus: "none" | "pending" | "approved" | "rejected";
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>("/users/login", payload),

  signup: (payload: SignupPayload) =>
    api.post<AuthResponse>("/users/signup", payload),

  getMe: () =>
    api.get<{ status: string; data: { data: User } }>("/users/me"),

  updateMe: (data: FormData | Partial<Pick<User, "name" | "email" | "photo">>) =>
    api.patch<{ status: string; data: { user: User } }>("/users/updateMe", data, {
      headers: data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {},
    }),

  /** Multipart field name must be `photo` (single image, max 5MB). */
  uploadProfilePhoto: (file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api.patch<{ status: string; data: { user: User } }>("/users/me/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updatePassword: (payload: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }) =>
    api.patch<AuthResponse>("/users/updateMyPassword", payload),

  forgotPassword: (email: string) =>
    api.post<{ status: string; message: string }>("/users/forgotPassword", { email }),

  resetPassword: (token: string, payload: { password: string; passwordConfirm: string }) =>
    api.patch<AuthResponse>(`/users/resetPassword/${token}`, payload),

  verifyEmail: (token: string) =>
    api.get(`/users/verifyEmail/${token}`),
};
