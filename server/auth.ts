import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { getDb } from "./db";
import { users, sessions, emailVerificationTokens, passwordResetTokens } from "../drizzle/schema";
import { eq, and, gt, sql } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = "7d";
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  emailVerified: boolean;
}

export interface JWTPayload {
  userId: number;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate a random token for email verification or password reset
 */
export function generateRandomToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Register a new user
 */
export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; userId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스를 사용할 수 없습니다." };

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${username} OR ${users.email} = ${email}`);

    if (existingUser.length > 0) {
      return { success: false, error: "사용자명 또는 이메일이 이미 존재합니다." };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await db.insert(users).values({
      username,
      email,
      passwordHash,
      emailVerified: false,
      role: "user",
    });

    const userId = Number(result[0]?.insertId) || 0;

    return { success: true, userId };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "사용자 등록 중 오류가 발생했습니다." };
  }
}

/**
 * Login user with username/email and password
 */
export async function loginUser(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스를 사용할 수 없습니다." };

    // Find user by username or email
    const userList = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${usernameOrEmail} OR ${users.email} = ${usernameOrEmail}`);

    if (userList.length === 0) {
      return { success: false, error: "사용자명 또는 비밀번호가 잘못되었습니다." };
    }

    const user = userList[0];

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash || "");
    if (!isPasswordValid) {
      return { success: false, error: "사용자명 또는 비밀번호가 잘못되었습니다." };
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username || "",
      email: user.email || "",
    });

    // Create session
    const sessionToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

    await db.insert(sessions).values({
      userId: user.id,
      token: sessionToken,
      expiresAt,
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username || "",
        email: user.email || "",
        role: user.role,
        emailVerified: user.emailVerified,
      },
      token,
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "로그인 중 오류가 발생했습니다." };
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number): Promise<AuthUser | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    
    const userList = await db.select().from(users).where(eq(users.id, userId));
    if (userList.length === 0) return null;

    const user = userList[0];
    return {
      id: user.id,
      username: user.username || "",
      email: user.email || "",
      role: user.role,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

/**
 * Create email verification token
 */
export async function createEmailVerificationToken(userId: number): Promise<string> {
  try {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스를 사용할 수 없습니다.");
    
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    });

    return token;
  } catch (error) {
    console.error("Create email verification token error:", error);
    throw error;
  }
}

/**
 * Verify email with token
 */
export async function verifyEmailWithToken(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스를 사용할 수 없습니다." };

    // Find token
    const tokenList = await db
      .select()
      .from(emailVerificationTokens)
      .where(sql`${emailVerificationTokens.token} = ${token} AND ${emailVerificationTokens.expiresAt} > NOW()`);

    if (tokenList.length === 0) {
      return { success: false, error: "유효하지 않거나 만료된 토큰입니다." };
    }

    const verificationToken = tokenList[0];

    // Update user email verified status
    await db
      .update(users)
      .set({ emailVerified: true, emailVerifiedAt: new Date() })
      .where(eq(users.id, verificationToken.userId));

    // Delete used token
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    return { success: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { success: false, error: "이메일 인증 중 오류가 발생했습니다." };
  }
}

/**
 * Create password reset token
 */
export async function createPasswordResetToken(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스를 사용할 수 없습니다." };

    // Find user by email
    const userList = await db.select().from(users).where(eq(users.email, email));

    if (userList.length === 0) {
      return { success: false, error: "해당 이메일로 등록된 사용자가 없습니다." };
    }

    const user = userList[0];
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    return { success: true, token };
  } catch (error) {
    console.error("Create password reset token error:", error);
    return { success: false, error: "비밀번호 재설정 토큰 생성 중 오류가 발생했습니다." };
  }
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스를 사용할 수 없습니다." };

    // Find token
    const tokenList = await db
      .select()
      .from(passwordResetTokens)
      .where(sql`${passwordResetTokens.token} = ${token} AND ${passwordResetTokens.expiresAt} > NOW()`);

    if (tokenList.length === 0) {
      return { success: false, error: "유효하지 않거나 만료된 토큰입니다." };
    }

    const resetToken = tokenList[0];

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));

    // Delete used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, resetToken.id));

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { success: false, error: "비밀번호 재설정 중 오류가 발생했습니다." };
  }
}

/**
 * Logout user (delete session)
 */
export async function logoutUser(userId: number): Promise<{ success: boolean }> {
  try {
    const db = await getDb();
    if (!db) return { success: false };

    // Delete all sessions for user
    await db.delete(sessions).where(eq(sessions.userId, userId));

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}
