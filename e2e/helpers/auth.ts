import { Page, expect } from "@playwright/test";

export const TEST_USERS = {
  direction: {
    email: "direction@batinova.fr",
    password: "demo123",
    defaultRoute: "/dashboard/direction",
  },
  conducteur: {
    email: "conducteur@batinova.fr",
    password: "demo123",
    defaultRoute: "/dashboard",
  },
  assistante: {
    email: "assistante@batinova.fr",
    password: "demo123",
    defaultRoute: "/chantiers",
  },
  chef: {
    email: "chef@batinova.fr",
    password: "demo123",
    defaultRoute: "/mobile",
  },
} as const;

export async function loginAs(
  page: Page,
  role: keyof typeof TEST_USERS,
): Promise<void> {
  const user = TEST_USERS[role];
  await page.goto("/login");
  await page.locator("#email").fill(user.email);
  await page.locator("#password").fill(user.password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(`**${user.defaultRoute}`);
}

export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Déconnexion" }).click();
  await page.waitForURL("**/login");
}
