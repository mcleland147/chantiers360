import type { Page, Route } from "@playwright/test";

interface MockSlot {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  projectReference: string;
  projectName: string;
  startAt: string;
  endAt: string;
  status: string;
  createdByName: string;
}

const WORKERS = [
  {
    id: "w-1",
    firstName: "Ahmed",
    lastName: "Benali",
    fullName: "Ahmed Benali",
    trade: "Maçon",
    isActive: true,
  },
  {
    id: "w-2",
    firstName: "Lucas",
    lastName: "Girard",
    fullName: "Lucas Girard",
    trade: "Électricien",
    isActive: true,
  },
];

const CHANTIER_BY_ID: Record<string, { reference: string; name: string }> = {
  "c-1": { reference: "CHT-001", name: "Résidence Les Oliviers" },
  "c-3": { reference: "CHT-003", name: "Immeuble Haussmann Rénov." },
};

let slots: MockSlot[] = [
  {
    id: "slot-seed-1",
    workerId: "w-1",
    workerName: "Ahmed Benali",
    projectId: "c-1",
    projectReference: "CHT-001",
    projectName: "Résidence Les Oliviers",
    startAt: "2025-06-16T08:00:00.000Z",
    endAt: "2025-06-16T12:00:00.000Z",
    status: "Planifié",
    createdByName: "Marc Dupont",
  },
];

function overlaps(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

function inRange(slot: MockSlot, from: string, to: string): boolean {
  return slot.startAt < to && slot.endAt > from;
}

async function handlePlanningRoute(route: Route): Promise<void> {
  const request = route.request();
  const url = new URL(request.url());
  const pathname = url.pathname.replace(/\/api/, "/api");
  const method = request.method();

  if (pathname === "/api/workers" && method === "GET") {
    await route.fulfill({ json: WORKERS });
    return;
  }

  if (pathname === "/api/planning/kpi/occupation" && method === "GET") {
    await route.fulfill({
      json: {
        from: url.searchParams.get("from"),
        to: url.searchParams.get("to"),
        plannedHours: 4,
        referenceHoursPerWeek: 35,
        occupationPercent: 11.4,
        workers: [
          {
            workerId: "w-1",
            workerName: "Ahmed Benali",
            plannedHours: 4,
            occupationPercent: 11.4,
          },
        ],
      },
    });
    return;
  }

  if (pathname === "/api/planning" && method === "GET") {
    const from = url.searchParams.get("from") ?? "";
    const to = url.searchParams.get("to") ?? "";
    const projectId = url.searchParams.get("projectId");
    const workerId = url.searchParams.get("workerId");

    let result = slots.filter((slot) => inRange(slot, from, to));
    if (projectId) result = result.filter((slot) => slot.projectId === projectId);
    if (workerId) result = result.filter((slot) => slot.workerId === workerId);

    await route.fulfill({ json: result });
    return;
  }

  if (pathname === "/api/planning/slots" && method === "POST") {
    const body = request.postDataJSON() as {
      workerId: string;
      projectId: string;
      startAt: string;
      endAt: string;
      notes?: string;
    };

    const conflict = slots.find(
      (slot) =>
        slot.workerId === body.workerId &&
        slot.status !== "Annulé" &&
        overlaps(body.startAt, body.endAt, slot.startAt, slot.endAt),
    );

    if (conflict) {
      await route.fulfill({
        status: 409,
        json: {
          statusCode: 409,
          message: {
            message: `Conflit de planning — Ahmed Benali est déjà affecté sur ${conflict.projectReference} le 16/06/2025 de 08:00 à 12:00.`,
            conflict,
          },
        },
      });
      return;
    }

    const chantier = CHANTIER_BY_ID[body.projectId] ?? {
      reference: "CHT-001",
      name: "Chantier",
    };
    const worker = WORKERS.find((w) => w.id === body.workerId) ?? WORKERS[0];
    const created: MockSlot = {
      id: `slot-${Date.now()}`,
      workerId: body.workerId,
      workerName: worker.fullName,
      projectId: body.projectId,
      projectReference: chantier.reference,
      projectName: chantier.name,
      startAt: body.startAt,
      endAt: body.endAt,
      status: "Planifié",
      createdByName: "Marc Dupont",
    };
    slots = [...slots, created];
    await route.fulfill({ status: 201, json: created });
    return;
  }

  await route.fulfill({ status: 404, json: { message: "Not mocked" } });
}

export async function installPlanningApiMock(page: Page): Promise<void> {
  await page.route("**/api/workers**", handlePlanningRoute);
  await page.route("**/api/planning**", handlePlanningRoute);
}

export function resetPlanningMockState(): void {
  slots = [
    {
      id: "slot-seed-1",
      workerId: "w-1",
      workerName: "Ahmed Benali",
      projectId: "c-1",
      projectReference: "CHT-001",
      projectName: "Résidence Les Oliviers",
      startAt: "2025-06-16T08:00:00.000Z",
      endAt: "2025-06-16T12:00:00.000Z",
      status: "Planifié",
      createdByName: "Marc Dupont",
    },
  ];
}
