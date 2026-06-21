import type { Page } from "@playwright/test";

const ASSIGNABLE_USERS = [
  {
    id: "u-chef",
    firstName: "Jean",
    lastName: "Moreau",
    fullName: "Jean Moreau",
    role: "CHEF_CHANTIER",
  },
  {
    id: "u-chef-2",
    firstName: "Paul",
    lastName: "Lefèvre",
    fullName: "Paul Lefèvre",
    role: "CHEF_CHANTIER",
  },
];

const assignmentsByChantier = new Map<string, Array<Record<string, unknown>>>([
  [
    "c-3",
    [
      {
        id: "a-5",
        chantierId: "c-3",
        collaboratorName: "Jean Moreau",
        jobTitle: "Chef de chantier",
        assignedAt: "10/01/2024",
        isActive: true,
      },
    ],
  ],
]);

const progressByChantier = new Map<string, Array<Record<string, unknown>>>([
  [
    "c-3",
    [
      {
        id: "p-4",
        chantierId: "c-3",
        date: "13/05/2025",
        authorName: "Jean Moreau",
        comment:
          "Ravalement façade nord en pause — attente validation architecte sur teinte.",
        percent: 45,
      },
    ],
  ],
]);

const photosByChantier = new Map<string, Array<Record<string, unknown>>>([
  [
    "c-3",
    [
      {
        id: "ph-3",
        chantierId: "c-3",
        category: "Pendant travaux",
        fileName: "ravalement-nord.jpg",
        authorName: "Jean Moreau",
        date: "13/05/2025",
      },
    ],
  ],
]);

export async function installUsersApiMock(page: Page): Promise<void> {
  await page.route("**/api/users/assignable", async (route) => {
    await route.fulfill({ json: ASSIGNABLE_USERS });
  });
}

export function getTabMockStores() {
  return { assignmentsByChantier, progressByChantier, photosByChantier };
}

export { ASSIGNABLE_USERS };
