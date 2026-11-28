import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

const { getMeMock, logoutMock } = vi.hoisted(() => ({
  getMeMock: vi.fn(),
  logoutMock: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/services/auth.service", () => ({
  authService: {
    getMe: getMeMock,
    login: vi.fn(),
    signup: vi.fn(),
    logout: logoutMock,
  },
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("without stored user: skips getMe and is not authenticated", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getMeMock).not.toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("with stored user: getMe success sets authenticated user", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test Pat",
      email: "pat@test.local",
      role: "user" as const,
      hostStatus: "none" as const,
    };
    localStorage.setItem("user", JSON.stringify(user));

    const serverUser = { ...user, name: "Test Pat (server)" };
    getMeMock.mockResolvedValue({
      data: { status: "success", data: { data: serverUser } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getMeMock).toHaveBeenCalledTimes(1);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(serverUser);
  });

  it("with stored user: getMe failure clears storage and session", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439012",
      name: "Gone",
      email: "gone@test.local",
      role: "user" as const,
      hostStatus: "none" as const,
    };
    localStorage.setItem("user", JSON.stringify(user));

    getMeMock.mockRejectedValue(new Error("unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
  });
  it("logs out when another tab removes the stored user (P2-20)", async () => {
    const user = {
      _id: "507f1f77bcf86cd799439011",
      name: "Tab Pat",
      email: "tab@test.local",
      role: "user" as const,
      hostStatus: "none" as const,
    };
    localStorage.setItem("user", JSON.stringify(user));
    getMeMock.mockResolvedValue({
      data: { status: "success", data: { data: user } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => {
      localStorage.removeItem("user");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "user", newValue: null }),
      );
    });

    await waitFor(() => expect(result.current.user).toBeNull());
    expect(result.current.isAuthenticated).toBe(false);
  });
});
