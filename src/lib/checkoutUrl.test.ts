import { describe, it, expect } from "vitest";
import { isValidChapaCheckoutUrl } from "./checkoutUrl";

describe("isValidChapaCheckoutUrl", () => {
  it("accepts chapa https hosts", () => {
    expect(isValidChapaCheckoutUrl("https://checkout.chapa.co/checkout/payment/abc")).toBe(true);
    expect(isValidChapaCheckoutUrl("https://x.chapa.co/p")).toBe(true);
  });
  it("rejects other schemes and hosts", () => {
    expect(isValidChapaCheckoutUrl("http://checkout.chapa.co/x")).toBe(false);
    expect(isValidChapaCheckoutUrl("https://chapa.co.evil.com/x")).toBe(false);
    expect(isValidChapaCheckoutUrl("https://evilchapa.co/x")).toBe(false);
    expect(isValidChapaCheckoutUrl("https://checkout.chapa.co@evil.com/x")).toBe(false);
    expect(isValidChapaCheckoutUrl("javascript:alert(1)")).toBe(false);
    expect(isValidChapaCheckoutUrl("")).toBe(false);
    expect(isValidChapaCheckoutUrl(undefined)).toBe(false);
  });
});
