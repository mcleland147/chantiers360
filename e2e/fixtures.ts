import { test as base, expect } from "@playwright/test";
import { installAuthApiMock } from "./helpers/mockAuthApi";
import { installChantiersApiMock } from "./helpers/mockChantiersApi";
import { installDashboardApiMock } from "./helpers/mockDashboardApi";
import { installUsersApiMock } from "./helpers/mockUsersApi";

export const test = base.extend({
  page: async ({ page }, use) => {
    await installAuthApiMock(page);
    await installDashboardApiMock(page);
    await installChantiersApiMock(page);
    await installUsersApiMock(page);
    await use(page);
  },
});

export { expect };
