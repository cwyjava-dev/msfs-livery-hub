import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createLivery,
  getLiveries,
  getLiveryById,
  incrementDownloadCount,
  getUserLiveries,
  createContact,
} from "./db";
import { isBrandAllowed } from "../shared/aircraft";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  livery: router({
    // Create a new livery (protected)
    create: protectedProcedure
      .input(
        z.object({
          manufacturer: z.enum(["Airbus", "Boeing"]),
          aircraft: z.string().min(1),
          brand: z.string().min(1),
          liveryName: z.string().min(1).max(256),
          description: z.string().optional(),
          msfsVersion: z.enum(["2020", "2024", "Both"]).optional(),
          installMethod: z.string().optional(),
          screenshots: z.array(z.string()).max(4).optional(),
          fileUrl: z.string().min(1),
          fileKey: z.string().min(1),
          fileName: z.string().optional(),
          fileSize: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Validate brand restrictions for A340/A350
        if (!isBrandAllowed(input.aircraft, input.brand)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${input.aircraft} 기종은 iniBuilds 브랜드만 허용됩니다.`,
          });
        }

        const livery = await createLivery({
          userId: ctx.user.id,
          manufacturer: input.manufacturer,
          aircraft: input.aircraft,
          brand: input.brand,
          liveryName: input.liveryName,
          description: input.description,
          msfsVersion: input.msfsVersion,
          installMethod: input.installMethod,
          screenshots: input.screenshots ? JSON.stringify(input.screenshots) : null,
          fileUrl: input.fileUrl,
          fileKey: input.fileKey,
          fileName: input.fileName,
          fileSize: input.fileSize,
        });

        return { success: true, id: Number(livery[0]?.insertId) || 0 };
      }),

    // Get liveries with filters (public)
    list: publicProcedure
      .input(
        z.object({
          manufacturer: z.string().optional(),
          aircraft: z.string().optional(),
          brand: z.string().optional(),
          search: z.string().optional(),
          limit: z.number().min(1).max(100).default(20),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        const results = await getLiveries({
          manufacturer: input.manufacturer,
          aircraft: input.aircraft,
          brand: input.brand,
          search: input.search,
          limit: input.limit,
          offset: input.offset,
        });

        return results.map((r) => ({
          ...r.livery,
          screenshots: r.livery.screenshots ? JSON.parse(r.livery.screenshots) : [],
          uploader: r.user,
        }));
      }),

    // Get single livery by ID (public)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const result = await getLiveryById(input.id);
        if (!result) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "리버리를 찾을 수 없습니다.",
          });
        }

        return {
          ...result.livery,
          screenshots: result.livery.screenshots ? JSON.parse(result.livery.screenshots) : [],
          uploader: result.user,
        };
      }),

    // Increment download count
    download: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await incrementDownloadCount(input.id);
        return { success: true };
      }),

    // Get user's own liveries (protected)
    myLiveries: protectedProcedure.query(async ({ ctx }) => {
      const results = await getUserLiveries(ctx.user.id);
      return results.map((livery) => ({
        ...livery,
        screenshots: livery.screenshots ? JSON.parse(livery.screenshots) : [],
      }));
    }),
  }),

  contact: router({
    // Submit contact/report form (public)
    submit: publicProcedure
      .input(
        z.object({
          type: z.enum(["general", "upload_error", "copyright", "feature_request"]),
          title: z.string().min(1).max(256),
          content: z.string().min(1),
          email: z.string().email(),
          relatedLiveryId: z.number().optional(),
          relatedLiveryInfo: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await createContact({
          type: input.type,
          title: input.title,
          content: input.content,
          email: input.email,
          relatedLiveryId: input.relatedLiveryId,
          relatedLiveryInfo: input.relatedLiveryInfo,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
