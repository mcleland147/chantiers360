import { describe, expect, it, beforeEach } from "vitest";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./authStorage";
import type { User } from "../types/domain";

const mockUser: User = {
  id: "u-1",
  firstName: "Marc",
  lastName: "Dupont",
  email: "conducteur@batinova.fr",
  role: "CONDUCTEUR_TRAVAUX",
};

describe("authStorage", () => {
  beforeEach(() => {
    clearAuthSession();
  });

  it("persiste et recharge une session", () => {
    saveAuthSession({ token: "jwt.mock", user: mockUser });
    const session = loadAuthSession();
    expect(session?.token).toBe("jwt.mock");
    expect(session?.user.email).toBe(mockUser.email);
  });

  it("retourne null si session invalide", () => {
    localStorage.setItem("chantiers360_auth", "not-json");
    expect(loadAuthSession()).toBeNull();
  });

  it("efface la session au logout", () => {
    saveAuthSession({ token: "jwt.mock", user: mockUser });
    clearAuthSession();
    expect(loadAuthSession()).toBeNull();
  });
});
