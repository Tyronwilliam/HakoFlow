import { describe, expect, it } from "vitest";
import { signInSchema } from "../validators";

describe("signInSchema", () => {
  it("accepte des identifiants valides", () => {
    expect(signInSchema.safeParse({ email: "a@b.co", password: "x" }).success).toBe(true);
  });

  it("rejette un email invalide avec le message attendu", () => {
    const result = signInSchema.safeParse({ email: "nope", password: "x" });
    expect(result.error?.issues[0].message).toBe("Adresse email invalide");
  });

  it("rejette un mot de passe vide", () => {
    const result = signInSchema.safeParse({ email: "a@b.co", password: "" });
    expect(result.error?.issues[0].message).toBe("Mot de passe requis");
  });
});
