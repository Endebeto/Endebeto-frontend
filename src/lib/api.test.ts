import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import api from "./api";

type Handler = (config: InternalAxiosRequestConfig) => number | Promise<number>;

const original = api.defaults.adapter;
let calls: string[] = [];

function install(handler: Handler) {
  api.defaults.adapter = async (config) => {
    const url = config.url ?? "";
    calls.push(`${(config.method ?? "get").toUpperCase()} ${url}`);
    const status = await handler(config);
    const response = {
      data: {},
      status,
      statusText: String(status),
      headers: {},
      config,
    };
    if (status >= 400) {
      throw new AxiosError(
        `HTTP ${status}`,
        "ERR_BAD_REQUEST",
        config,
        null,
        response,
      );
    }
    return response;
  };
}

describe("api interceptors", () => {
  let expired: ReturnType<typeof vi.fn>;
  const onExpired = () => expired();

  beforeEach(() => {
    calls = [];
    expired = vi.fn();
    localStorage.setItem("user", JSON.stringify({ _id: "u1" }));
    window.addEventListener("auth:expired", onExpired);
  });

  afterEach(() => {
    window.removeEventListener("auth:expired", onExpired);
    api.defaults.adapter = original;
    localStorage.clear();
  });

  it("sends X-Requested-With on every request", async () => {
    let header: unknown;
    install((config) => {
      header = config.headers.get("X-Requested-With");
      return 200;
    });
    await api.get("/ping");
    expect(header).toBe("XMLHttpRequest");
  });

  it("refreshes once and retries /users/me after a 401", async () => {
    let meCalls = 0;
    install((config) => {
      if (config.url === "/users/me") return ++meCalls === 1 ? 401 : 200;
      return 200;
    });
    const res = await api.get("/users/me");
    expect(res.status).toBe(200);
    expect(calls).toEqual([
      "GET /users/me",
      "POST /users/refresh",
      "GET /users/me",
    ]);
    expect(expired).not.toHaveBeenCalled();
    expect(localStorage.getItem("user")).not.toBeNull();
  });

  it("does not poison later 401s after a successful retry", async () => {
    let n = 0;
    install((config) => {
      if (config.url !== "/bookings/me") return 200;
      n++;
      return n === 1 || n === 3 ? 401 : 200;
    });
    await api.get("/bookings/me");
    await api.get("/bookings/me");
    // second call 401s again -> must refresh again (no stale "already retried")
    expect(calls.filter((c) => c === "POST /users/refresh")).toHaveLength(2);
    expect(expired).not.toHaveBeenCalled();
  });

  it("stops after one retry when the retried request 401s again", async () => {
    install((config) => (config.url === "/wallet" ? 401 : 200));
    await expect(api.get("/wallet")).rejects.toBeTruthy();
    expect(calls).toEqual(["GET /wallet", "POST /users/refresh", "GET /wallet"]);
    expect(expired).toHaveBeenCalledTimes(1);
  });

  it("ends logged out cleanly when refresh fails", async () => {
    install((config) => (config.url === "/wallet" ? 401 : config.url === "/users/refresh" ? 401 : 200));
    await expect(api.get("/wallet")).rejects.toBeTruthy();
    expect(calls.filter((c) => c === "POST /users/refresh")).toHaveLength(1);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("user")).toBeNull();
  });

  it("failed refresh for the /users/me probe does not fire auth:expired", async () => {
    install((config) => (config.url === "/users/me" || config.url === "/users/refresh" ? 401 : 200));
    await expect(api.get("/users/me")).rejects.toBeTruthy();
    expect(expired).not.toHaveBeenCalled();
  });

  it("shares a single refresh between concurrent 401s", async () => {
    const seen = new Set<string>();
    install(async (config) => {
      if (config.url === "/users/refresh") {
        await new Promise((r) => setTimeout(r, 10));
        return 200;
      }
      if (!seen.has(config.url ?? "")) {
        seen.add(config.url ?? "");
        return 401;
      }
      return 200;
    });
    await Promise.all([api.get("/a"), api.get("/b"), api.get("/c")]);
    expect(calls.filter((c) => c === "POST /users/refresh")).toHaveLength(1);
  });

  it("401 on /users/login does not expire the session or wipe storage", async () => {
    install(() => 401);
    await expect(api.post("/users/login", {})).rejects.toBeTruthy();
    expect(calls).toEqual(["POST /users/login"]);
    expect(expired).not.toHaveBeenCalled();
    expect(localStorage.getItem("user")).not.toBeNull();
  });
});
