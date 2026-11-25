import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/modules/accounts/model/errors";

const FALLBACK = "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";

describe("authErrorMessage", () => {
  it("shows the backend's message for domain errors", () => {
    expect(authErrorMessage(401, { detail: "Невірний email або пароль." })).toBe(
      "Невірний email або пароль.",
    );
  });

  it("shows the email problem before the password one", () => {
    const body = { password: ["Пароль надто короткий."], email: ["Введіть правильний email."] };

    expect(authErrorMessage(400, body)).toBe("Введіть правильний email.");
  });

  it("hides technical failures behind a plain message", () => {
    expect(authErrorMessage(403, { detail: "CSRF Failed: CSRF token missing." })).toBe(FALLBACK);
    expect(authErrorMessage(500, null)).toBe(FALLBACK);
    expect(authErrorMessage(0, null)).toBe(FALLBACK);
    expect(authErrorMessage(400, { unexpected: true })).toBe(FALLBACK);
  });
});
