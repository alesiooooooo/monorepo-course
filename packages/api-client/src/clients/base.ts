import { ApiError } from "../contracts/errors";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
}

export async function request<T>(
  baseUrl: string,
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, timeoutMs = 5000 } = opts;

  // Таймаут — иначе fetch ждёт вечность
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new ApiError(res.status, path, `Request failed: ${res.status}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
