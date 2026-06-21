import type { Page } from "@playwright/test";

const DEMO_PASSWORD = "demo123";

const AUTH_ACCOUNTS: Record<
  string,
  {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }
> = {
  "direction@batinova.fr": {
    id: "u-direction",
    firstName: "Claire",
    lastName: "Bernard",
    email: "direction@batinova.fr",
    role: "DIRECTION",
  },
  "assistante@batinova.fr": {
    id: "u-assistante",
    firstName: "Julie",
    lastName: "Petit",
    email: "assistante@batinova.fr",
    role: "ASSISTANTE_ADMINISTRATIVE",
  },
  "conducteur@batinova.fr": {
    id: "u-conducteur",
    firstName: "Marc",
    lastName: "Dupont",
    email: "conducteur@batinova.fr",
    role: "CONDUCTEUR_TRAVAUX",
  },
  "chef@batinova.fr": {
    id: "u-chef",
    firstName: "Jean",
    lastName: "Moreau",
    email: "chef@batinova.fr",
    role: "CHEF_CHANTIER",
  },
};

function createMockJwt(userId: string, email: string, role: string): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString("base64url");
  const signature = Buffer.from(`mock-signature-${userId}`).toString("base64url");
  return `${header}.${payload}.${signature}`;
}

export async function installAuthApiMock(page: Page): Promise<void> {
  await page.route("**/api/auth/login", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    const body = route.request().postDataJSON() as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase() ?? "";
    const account = AUTH_ACCOUNTS[email];

    if (!account || body.password !== DEMO_PASSWORD) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Adresse e-mail ou mot de passe incorrect.",
        }),
      });
      return;
    }

    const user = { ...account };
    await route.fulfill({
      json: {
        token: createMockJwt(user.id, user.email, user.role),
        user,
      },
    });
  });

  await page.route("**/api/auth/me", async (route) => {
    const authHeader = route.request().headers()["authorization"] ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Token JWT requis." }),
      });
      return;
    }

    const token = authHeader.slice(7);
    const payloadPart = token.split(".")[1];
    if (!payloadPart) {
      await route.fulfill({ status: 401, json: { message: "Token invalide." } });
      return;
    }

    try {
      const payload = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8"),
      ) as { sub?: string; email?: string };
      const account = Object.values(AUTH_ACCOUNTS).find((a) => a.id === payload.sub);
      if (!account) {
        await route.fulfill({ status: 401, json: { message: "Token invalide." } });
        return;
      }
      await route.fulfill({ json: account });
    } catch {
      await route.fulfill({ status: 401, json: { message: "Token invalide." } });
    }
  });
}

export { AUTH_ACCOUNTS, DEMO_PASSWORD };
