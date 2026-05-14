import { describe, expect, it } from "vitest";
import {
  extractExperienceMongoIdFromPath,
  resolveExperienceMetaFetchUrl,
} from "./experienceLinkPreview";

describe("experienceLinkPreview", () => {
  it("extracts mongo id only for /experiences/:24hex", () => {
    expect(extractExperienceMongoIdFromPath("/experiences/507f1f77bcf86cd799439011")).toBe(
      "507f1f77bcf86cd799439011",
    );
    expect(extractExperienceMongoIdFromPath("/experiences/foo")).toBe(null);
    expect(extractExperienceMongoIdFromPath("/experiences/mine")).toBe(null);
  });

  it("resolveExperienceMetaFetchUrl accepts absolute EXPERIENCE_META_API_URL base", () => {
    expect(
      resolveExperienceMetaFetchUrl(
        "507f191e810c19729de860ea",
        "https://app.example.com/experiences/507f191e810c19729de860ea",
        { experienceMetaApiUrl: "https://api.example.com/api/v1/" },
      ),
    ).toBe("https://api.example.com/api/v1/experiences/507f191e810c19729de860ea");
  });

  it("resolveExperienceMetaFetchUrl resolves relative /api/v1 against page origin", () => {
    expect(
      resolveExperienceMetaFetchUrl(
        "507f191e810c19729de860ea",
        "https://mysite.netlify.app/experiences/507f191e810c19729de860ea",
        { viteApiUrl: "/api/v1" },
      ),
    ).toBe("https://mysite.netlify.app/api/v1/experiences/507f191e810c19729de860ea");
  });

  it("resolveExperienceMetaFetchUrl accepts absolute VITE-style API base", () => {
    expect(
      resolveExperienceMetaFetchUrl(
        "507f191e810c19729de860ea",
        "https://app.example.com/experiences/507f191e810c19729de860ea",
        { viteApiUrl: "https://api.example.com/api/v1" },
      ),
    ).toBe("https://api.example.com/api/v1/experiences/507f191e810c19729de860ea");
  });

  it("resolveExperienceMetaFetchUrl returns null when no env bases", () => {
    expect(
      resolveExperienceMetaFetchUrl("507f191e810c19729de860ea", "https://a.example.com/b", {}),
    ).toBe(null);
  });
});
