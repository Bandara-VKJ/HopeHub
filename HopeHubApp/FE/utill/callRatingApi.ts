import { ngrokFetch } from "@/utill/ngrokFetch";

export async function callRatingApi<T>(path: string, body?: unknown): Promise<T> {
  const base = process.env.EXPO_PUBLIC_BASE_URL;
  if (!base) throw new Error("Backend URL is not configured.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await ngrokFetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || "Request failed.") as Error & { status: number; score?: number };
      error.status = response.status; error.score = data.score;
      throw error;
    }
    return data as T;
  } finally { clearTimeout(timeout); }
}
