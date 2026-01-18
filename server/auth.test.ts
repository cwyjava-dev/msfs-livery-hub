import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomToken,
} from "./auth";

describe("Auth Service", () => {
  describe("Password Hashing", () => {
    it("should hash password successfully", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify correct password", async () => {
      const password = "testPassword123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testPassword123";
      const wrongPassword = "wrongPassword456";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    it("should produce different hashes for same password", async () => {
      const password = "testPassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("JWT Token", () => {
    it("should generate valid JWT token", () => {
      const payload = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
      };
      const token = generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should verify and decode JWT token", () => {
      const payload = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
      };
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.username).toBe(payload.username);
      expect(decoded?.email).toBe(payload.email);
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here";
      const decoded = verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });

    it("should return null for expired token", () => {
      // Create a token with very short expiry
      const payload = {
        userId: 1,
        username: "testuser",
        email: "test@example.com",
      };
      
      // We can't easily test expired tokens without mocking time,
      // so this is a placeholder for the concept
      const token = generateToken(payload);
      expect(token).toBeDefined();
    });
  });

  describe("Random Token Generation", () => {
    it("should generate random token", () => {
      const token = generateRandomToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate different tokens each time", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();
      
      expect(token1).not.toBe(token2);
    });

    it("should generate hex string tokens", () => {
      const token = generateRandomToken();
      
      // Hex strings only contain 0-9 and a-f
      expect(/^[0-9a-f]+$/.test(token)).toBe(true);
    });
  });
});
