import { isAxiosError } from "axios";

export function extractApiErrorMessage(
  error: unknown,
  fallback = "Une erreur est survenue.",
): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as {
      message?: string | { message?: string; ruleCode?: string };
    };
    if (typeof body?.message === "string") return body.message;
    if (body?.message && typeof body.message === "object" && body.message.message) {
      return body.message.message;
    }
  }
  return fallback;
}
