import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import {
  registerUser,
  loginUser,
  verifyEmailWithToken,
  createPasswordResetToken,
  resetPasswordWithToken,
  logoutUser,
} from "./auth";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  
  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(128),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const result = await registerUser(input.username, input.email, input.password);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "등록 실패",
        });
      }
      return { success: true, userId: result.userId };
    }),
  
  login: publicProcedure
    .input(
      z.object({
        usernameOrEmail: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await loginUser(input.usernameOrEmail, input.password);
      if (!result.success) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: result.error || "로그인 실패",
        });
      }
      
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, result.token, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      
      return {
        success: true,
        user: result.user,
      };
    }),
  
  logout: publicProcedure.mutation(async ({ ctx }) => {
    if (ctx.user?.id) {
      await logoutUser(ctx.user.id);
    }
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
  
  verifyEmail: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      const result = await verifyEmailWithToken(input.token);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "이메일 인증 실패",
        });
      }
      return { success: true };
    }),
  
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const result = await createPasswordResetToken(input.email);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "비밀번호 재설정 요청 실패",
        });
      }
      return { success: true };
    }),
  
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {
      const result = await resetPasswordWithToken(input.token, input.newPassword);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error || "비밀번호 재설정 실패",
        });
      }
      return { success: true };
    }),
});
