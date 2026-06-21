import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { AuthError, loginWithCredentials } from "./authService";
import { apiClient } from "./apiClient";

vi.mock("./apiClient", () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe("authService — API login", () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it("connecte un compte valide et retourne un token JWT", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        user: {
          id: "u-conducteur",
          firstName: "Marc",
          lastName: "Dupont",
          email: "conducteur@batinova.fr",
          role: "CONDUCTEUR_TRAVAUX",
        },
        token: "header.payload.signature",
      },
    });

    const result = await loginWithCredentials(
      "conducteur@batinova.fr",
      "demo123",
    );

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "conducteur@batinova.fr",
      password: "demo123",
    });
    expect(result.user.role).toBe("CONDUCTEUR_TRAVAUX");
    expect(result.token.split(".")).toHaveLength(3);
  });

  it("rejette des identifiants invalides (401 API)", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new axios.AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        undefined,
        undefined,
        {
          status: 401,
          data: { message: "Adresse e-mail ou mot de passe incorrect." },
          statusText: "Unauthorized",
          headers: {},
          config: {} as never,
        },
      ),
    );

    await expect(
      loginWithCredentials("conducteur@batinova.fr", "wrong"),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("connecte chaque rôle MVP via l'API", async () => {
    const accounts = [
      { email: "direction@batinova.fr", role: "DIRECTION" },
      { email: "assistante@batinova.fr", role: "ASSISTANTE_ADMINISTRATIVE" },
      { email: "chef@batinova.fr", role: "CHEF_CHANTIER" },
    ] as const;

    for (const { email, role } of accounts) {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          user: {
            id: `u-${role.toLowerCase()}`,
            firstName: "Test",
            lastName: "User",
            email,
            role,
          },
          token: "a.b.c",
        },
      });

      const result = await loginWithCredentials(email, "demo123");
      expect(result.user.role).toBe(role);
    }
  });
});
