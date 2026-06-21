import { test as base, expect } from "@playwright/test";
import { installAuthApiMock } from "./helpers/mockAuthApi";
import { installChantiersApiMock } from "./helpers/mockChantiersApi";
import { installDashboardApiMock } from "./helpers/mockDashboardApi";
import { installPlanningApiMock } from "./helpers/mockPlanningApi";
import { installBudgetApiMock } from "./helpers/mockBudgetApi";
import { installUsersApiMock } from "./helpers/mockUsersApi";

export const test = base.extend({
  page: async ({ page }, use) => {
    await installAuthApiMock(page);
    await installDashboardApiMock(page);
    await installChantiersApiMock(page);
    await installPlanningApiMock(page);
    await installBudgetApiMock(page);
    await installUsersApiMock(page);
    await use(page);
  },
});

export { expect };
