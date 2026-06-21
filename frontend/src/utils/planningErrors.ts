import type { ScheduleSlot } from "../types/domain";

export function extractPlanningApiError(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (
      err as {
        response?: {
          data?: {
            message?: string | { message?: string; conflict?: ScheduleSlot };
          };
        };
      }
    ).response?.data;
    if (typeof data?.message === "string") return data.message;
    if (data?.message && typeof data.message === "object" && "message" in data.message) {
      return String(data.message.message);
    }
  }
  return "Erreur lors de l'enregistrement du créneau.";
}
