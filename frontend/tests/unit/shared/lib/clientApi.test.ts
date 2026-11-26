import { describe, expect, it } from "vitest";
import { errorMessage } from "@/shared/lib/clientApi";

const FALLBACK = "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";

describe("errorMessage", () => {
  it("shows the backend's message for domain errors", () => {
    expect(errorMessage(401, { detail: "Невірний email або пароль." })).toBe(
      "Невірний email або пароль.",
    );
  });

  it("shows field errors in the form's order, then any other field", () => {
    const body = { password: ["Пароль надто короткий."], email: ["Введіть правильний email."] };

    expect(errorMessage(400, body, ["email", "password"])).toBe("Введіть правильний email.");
    expect(errorMessage(400, { starts_on: ["Невірна дата."] }, ["name"])).toBe("Невірна дата.");
  });

  it("hides technical failures behind a plain message", () => {
    expect(errorMessage(403, { detail: "CSRF Failed: CSRF token missing." })).toBe(FALLBACK);
    expect(errorMessage(500, null)).toBe(FALLBACK);
    expect(errorMessage(0, null)).toBe(FALLBACK);
    expect(errorMessage(400, { unexpected: true })).toBe(FALLBACK);
  });
});
