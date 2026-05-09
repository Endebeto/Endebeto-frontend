import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import { apiErrMessage, extractInactiveAccountForbiddenMessage, getFriendlyErrorMessage } from "./errors";

function axErr(
  status: number | undefined,
  data?: { message?: string },
  code?: string,
): AxiosError {
  const err = new AxiosError("request failed", code, undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: {} as AxiosError["config"],
    data,
  } as AxiosError["response"]);
  return err;
}

describe("getFriendlyErrorMessage", () => {
  it("uses friendlyMessage when present on error object", () => {
    const err = { friendlyMessage: "Safe msg" };
    expect(getFriendlyErrorMessage(err)).toBe("Safe msg");
  });

  it("uses backend 4xx message when present", () => {
    const err = axErr(400, { message: "Invalid input." });
    expect(getFriendlyErrorMessage(err, "fallback")).toBe("Invalid input.");
  });

  it("uses fallback for 4xx when body has no message", () => {
    const err = axErr(404, {});
    expect(getFriendlyErrorMessage(err, "Nothing here.")).toBe("Nothing here.");
  });

  it("uses fallback for 5xx", () => {
    const err = axErr(500, { message: "DB down" });
    expect(getFriendlyErrorMessage(err, "Try later.")).toBe("Try later.");
  });

  it("uses fallback for network / no response", () => {
    const err = new AxiosError("Network Error", "ERR_NETWORK");
    expect(getFriendlyErrorMessage(err, "Offline.")).toBe("Offline.");
  });

  it("extracts message from non-axios object with response.data.message", () => {
    const err = { response: { data: { message: "Not found" } } };
    expect(getFriendlyErrorMessage(err, "fallback")).toBe("Not found");
  });

  it("truncates overly long backend messages", () => {
    const long = "x".repeat(300);
    const err = axErr(400, { message: long });
    const out = getFriendlyErrorMessage(err, "f");
    expect(out.length).toBeLessThanOrEqual(240);
    expect(out.endsWith("…")).toBe(true);
  });

  it("apiErrMessage delegates to getFriendlyErrorMessage", () => {
    expect(apiErrMessage(axErr(422, { message: "Nope" }), "X")).toBe("Nope");
  });
});

describe("extractInactiveAccountForbiddenMessage", () => {
  it("returns message for admin suspension copy", () => {
    const msg = "Your account has been suspended by an administrator.";
    const e = axErr(403, { message: msg });
    expect(extractInactiveAccountForbiddenMessage(e)).toBe(msg);
  });

  it("returns message for self-deactivation copy", () => {
    const msg =
      "This account has been deactivated. If you need access again, please contact support.";
    const e = axErr(403, { message: msg });
    expect(extractInactiveAccountForbiddenMessage(e)).toBe(msg);
  });

  it("returns null for unrelated 403", () => {
    const e = axErr(403, { message: "You do not have permission to perform this action" });
    expect(extractInactiveAccountForbiddenMessage(e)).toBeNull();
  });

  it("returns null for 403 without body message", () => {
    expect(extractInactiveAccountForbiddenMessage(axErr(403, {}))).toBeNull();
  });
});
