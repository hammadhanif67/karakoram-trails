// Small response helpers shared by the booking API.

/** Headers for anything that carries booking data: never cached, never leaked via Referer. */
export const PRIVATE_HEADERS = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
} as const;

export function json(body: unknown, status = 200, headers: HeadersInit = PRIVATE_HEADERS) {
  return Response.json(body, { status, headers });
}

/** Error body shape the frontend understands: { error: code, message, ...details }. */
export function fail(status: number, error: string, message: string, details?: Record<string, unknown>) {
  return json({ ...details, error, message }, status);
}

export async function readJson(request: Request, maxBytes = 16 * 1024): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) throw new HttpError(415, "unsupported_type", "Send JSON.");
  const len = Number(request.headers.get("content-length") ?? "0");
  if (len > maxBytes) throw new HttpError(413, "too_large", "Request is too large.");
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "too_large", "Request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "bad_json", "Request body is not valid JSON.");
  }
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    /** Extra fields for the response body (e.g. the list a confirmation dialog shows). */
    public details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

/** Runs a handler and turns HttpError / unexpected errors into JSON responses. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) return fail(err.status, err.code, err.message, err.details);
    console.error(err);
    return fail(500, "server_error", "Something went wrong. Please try again or contact us on WhatsApp.");
  }
}
