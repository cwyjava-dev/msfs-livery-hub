import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { liveries } from "../drizzle/schema";
import { eq } from "drizzle-orm";

interface ReviewResult {
  approved: boolean;
  notes: string;
}

/**
 * AI 리버리 검토 로직
 * 파일명, 설명, 스크린샷 등을 검증하고 승인/거절 결정
 */
export async function reviewLiveryWithAI(liveryId: number): Promise<ReviewResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 리버리 정보 조회
  const liveryResult = await db
    .select()
    .from(liveries)
    .where(eq(liveries.id, liveryId))
    .limit(1);

  if (!liveryResult.length) {
    throw new Error("Livery not found");
  }

  const livery = liveryResult[0];

  // AI에 검토 요청
  const prompt = `
당신은 Microsoft Flight Simulator 리버리 품질 검증 전문가입니다.
다음 리버리 정보를 검토하고 승인 가능 여부를 판단해주세요.

리버리 정보:
- 이름: ${livery.liveryName}
- 제조사: ${livery.manufacturer}
- 기종: ${livery.aircraft}
- 브랜드/애드온: ${livery.brand}
- 설명: ${livery.description || "없음"}
- MSFS 버전: ${livery.msfsVersion || "미지정"}
- 파일명: ${livery.fileName || "없음"}
- 파일 크기: ${livery.fileSize ? (livery.fileSize / 1024 / 1024).toFixed(2) + " MB" : "미지정"}
- 스크린샷 개수: ${livery.screenshots ? JSON.parse(livery.screenshots).length : 0}개

검토 기준:
1. 리버리 이름이 명확하고 설명적인가?
2. 제조사와 기종이 올바르게 입력되었는가?
3. 브랜드/애드온이 해당 기종과 호환되는가?
4. 파일명이 적절한가? (예: .zip, .7z 등)
5. 파일 크기가 합리적인가? (일반적으로 50MB 이상 500MB 이하)
6. 스크린샷이 충분한가? (최소 1개 이상)
7. 설명이 충분한가?

JSON 형식으로 다음과 같이 응답해주세요:
{
  "approved": true 또는 false,
  "notes": "승인 또는 거절 사유 (한국어)"
}
`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a MSFS livery quality validator. Respond only with valid JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "livery_review",
        strict: true,
        schema: {
          type: "object",
          properties: {
            approved: { type: "boolean" },
            notes: { type: "string" },
          },
          required: ["approved", "notes"],
          additionalProperties: false,
        },
      },
    },
  });

  // 응답 파싱
  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  let reviewResult: ReviewResult;
  try {
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    reviewResult = JSON.parse(contentStr);
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    reviewResult = {
      approved: false,
      notes: "AI 검토 중 오류가 발생했습니다.",
    };
  }

  // 데이터베이스에 검토 결과 저장
  await db
    .update(liveries)
    .set({
      status: reviewResult.approved ? "approved" : "rejected",
      reviewedAt: new Date(),
      reviewNotes: reviewResult.notes,
    })
    .where(eq(liveries.id, liveryId));

  return reviewResult;
}

/**
 * 검토 대기 중인 리버리를 처리하는 배치 작업
 */
export async function processPendingReviews() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 5분 이상 대기 중인 리버리 조회
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const pendingLiveries = await db
    .select()
    .from(liveries)
    .where(eq(liveries.status, "pending"));

  for (const livery of pendingLiveries) {
    // 생성 후 5분 이상 경과했는지 확인
    const createdTime = new Date(livery.createdAt).getTime();
    const now = Date.now();
    const elapsedMinutes = (now - createdTime) / (1000 * 60);

    if (elapsedMinutes >= 5) {
      try {
        await reviewLiveryWithAI(livery.id);
      } catch (error) {
        console.error(`Failed to review livery ${livery.id}:`, error);
        // 오류 발생 시 거절 처리
        await db
          .update(liveries)
          .set({
            status: "rejected",
            reviewedAt: new Date(),
            reviewNotes: "AI 검토 중 오류가 발생했습니다.",
          })
          .where(eq(liveries.id, livery.id));
      }
    }
  }
}
