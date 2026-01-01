import { processPendingReviews } from "./reviewService";

let reviewInterval: NodeJS.Timeout | null = null;

/**
 * AI 검토 스케줄러 시작
 * 30초마다 대기 중인 리버리를 확인하고 검토 처리
 */
export function startReviewScheduler() {
  if (reviewInterval) {
    console.log("[ReviewScheduler] Already running");
    return;
  }

  console.log("[ReviewScheduler] Starting review scheduler (30s interval)");

  reviewInterval = setInterval(async () => {
    try {
      await processPendingReviews();
    } catch (error) {
      console.error("[ReviewScheduler] Error processing reviews:", error);
    }
  }, 30 * 1000); // 30초마다 실행
}

/**
 * AI 검토 스케줄러 중지
 */
export function stopReviewScheduler() {
  if (reviewInterval) {
    clearInterval(reviewInterval);
    reviewInterval = null;
    console.log("[ReviewScheduler] Stopped");
  }
}
