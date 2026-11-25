const FALLBACK = "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";

// Field order for the form: the email problem is the one to fix first.
const FIELDS = ["email", "password"] as const;

// Turns a backend error body into one line for the form. Domain errors come as
// {"detail": "..."}, field checks as {"email": ["..."]}; anything else gets a fallback,
// so the user never sees a raw technical message.
export function authErrorMessage(status: number, body: unknown): string {
  // 403 here is a CSRF failure, whose detail is a technical English text.
  if (status === 403 || status >= 500 || typeof body !== "object" || body === null) {
    return FALLBACK;
  }
  const record = body as Record<string, unknown>;
  if (typeof record.detail === "string") {
    return record.detail;
  }
  for (const field of FIELDS) {
    const messages = record[field];
    if (Array.isArray(messages) && typeof messages[0] === "string") {
      return messages[0];
    }
  }
  return FALLBACK;
}
