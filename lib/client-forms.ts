"use client";

/**
 * POST JSON to a same-origin API route, returning { ok, data } or throwing.
 * Lightweight shared helper for the contact + subscribe forms.
 */
export async function postJson<T>(url: string, payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      json && typeof json === "object" && "error" in json && typeof (json as { error?: unknown }).error === "string"
        ? (json as { error: string }).error
        : "Something went wrong. Please try again.";
    return { ok: false, error: message } as T;
  }
  return { ok: true, data: json } as T;
}