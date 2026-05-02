import { describe, expect, it } from "vitest";
import { encryptSecret, decryptSecret } from "../apps/api/src/utils/crypto.js";
import { extractSkills } from "../apps/api/src/utils/skill-normalizer.js";
import {
  signAccessToken,
  verifyAccessToken,
} from "../apps/api/src/utils/jwt.js";
import { AppError } from "../apps/api/src/utils/app-error.js";
import {
  isEarlyApplicantJob,
  sortJobsByPriority,
} from "../apps/api/src/services/job-ranking.service.js";

describe("Crypto - AES-256-GCM", () => {
  it("encrypts and decrypts a secret correctly", () => {
    const original = "my-secret-portal-password";
    const encrypted = encryptSecret(original);

    expect(encrypted.encryptedValue).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.tag).toBeDefined();
    expect(encrypted.encryptedValue).not.toBe(original);

    const decrypted = decryptSecret(encrypted);
    expect(decrypted).toBe(original);
  });

  it("produces different ciphertext on each call (random IV)", () => {
    const original = "same-password";
    const enc1 = encryptSecret(original);
    const enc2 = encryptSecret(original);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.encryptedValue).not.toBe(enc2.encryptedValue);
  });

  it("fails to decrypt with tampered tag", () => {
    const encrypted = encryptSecret("test");
    encrypted.tag = Buffer.from("tampered").toString("base64");

    expect(() => decryptSecret(encrypted)).toThrow();
  });
});

describe("JWT Utilities", () => {
  it("signs and verifies token", () => {
    const payload = { sub: "user123", email: "test@test.com" };
    const token = signAccessToken(payload);

    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const verified = verifyAccessToken(token);
    expect(verified.sub).toBe("user123");
    expect(verified.email).toBe("test@test.com");
  });

  it("rejects tampered token", () => {
    const token = signAccessToken({ sub: "user1", email: "a@b.com" });
    const tampered = token.slice(0, -5) + "XXXXX";

    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});

describe("Skill Normalizer", () => {
  it("extracts known skills from text", () => {
    const text = "I know JavaScript, TypeScript, and React with Node.js";
    const skills = extractSkills(text);

    expect(skills).toContain("javascript");
    expect(skills).toContain("typescript");
    expect(skills).toContain("react");
    expect(skills).toContain("node.js");
  });

  it("normalizes aliases (node -> node.js)", () => {
    const skills = extractSkills("Built with Node and Express");
    expect(skills).toContain("node.js");
    expect(skills).toContain("express");
  });

  it("deduplicates skills", () => {
    const skills = extractSkills("python Python PYTHON");
    expect(skills.filter((s) => s === "python")).toHaveLength(1);
  });

  it("returns empty array for unknown text", () => {
    const skills = extractSkills("random unrelated words xyz");
    expect(skills).toEqual([]);
  });
});

describe("AppError", () => {
  it("creates not-found error with 404 status", () => {
    const err = AppError.notFound("User not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("User not found");
    expect(err).toBeInstanceOf(Error);
  });

  it("creates bad-request error with 400 status", () => {
    const err = AppError.badRequest("Invalid input");
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Invalid input");
  });

  it("creates conflict error with 409 status", () => {
    const err = AppError.conflict("Already exists");
    expect(err.statusCode).toBe(409);
  });
});

describe("Job Ranking", () => {
  it("flags early applicant jobs based on recency and low applicant count", () => {
    expect(
      isEarlyApplicantJob({
        postedDate: new Date().toISOString(),
        applicantCount: 12,
      }),
    ).toBe(true);

    expect(
      isEarlyApplicantJob({
        postedDate: new Date(Date.now() - 5 * 86_400_000).toISOString(),
        applicantCount: 12,
      }),
    ).toBe(false);
  });

  it("sorts 90%+ matches ahead of lower-score jobs even when older", () => {
    const jobs = sortJobsByPriority([
      {
        title: "Recent lower match",
        relevanceScore: 82,
        postedDate: new Date().toISOString(),
        applicantCount: 5,
      },
      {
        title: "Older strong match",
        relevanceScore: 94,
        postedDate: new Date(Date.now() - 4 * 86_400_000).toISOString(),
        applicantCount: 80,
      },
    ]);

    expect(jobs[0].title).toBe("Older strong match");
  });

  it("sorts early applicant jobs ahead of similar-score older jobs", () => {
    const jobs = sortJobsByPriority([
      {
        title: "Older role",
        relevanceScore: 88,
        postedDate: new Date(Date.now() - 6 * 86_400_000).toISOString(),
        applicantCount: 10,
      },
      {
        title: "Fresh early role",
        relevanceScore: 88,
        postedDate: new Date(Date.now() - 86_400_000).toISOString(),
        applicantCount: 8,
      },
    ]);

    expect(jobs[0].title).toBe("Fresh early role");
  });
});
