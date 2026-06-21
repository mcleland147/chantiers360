import type { Page, Route } from "@playwright/test";

const CONDUCTOR_ID_BY_NAME: Record<string, string> = {
  "Marc Dupont": "u-conducteur",
  "Sophie Martin": "u-conducteur-2",
  "Luc Bernard": "u-conducteur-3",
};

/** Données alignées sur frontend/src/data/mockChantiers.ts pour les E2E sans backend. */
const MOCK_CHANTIER_DETAILS = [
  {
    id: "c-1",
    reference: "CHT-001",
    name: "Résidence Les Oliviers",
    client: "Mairie de Lyon",
    address: "12 rue des Oliviers, Lyon 69003",
    conductorName: "Marc Dupont",
    status: "Réalisation",
    startDate: "01/03/2024",
    expectedEndDate: "30/09/2025",
    openReservesCount: 3,
    progressPercent: 67,
    budget: 2_450_000,
    budgetSpent: 1_640_000,
    description:
      "Construction de 48 logements collectifs BBC avec parking souterrain et espaces verts.",
  },
  {
    id: "c-2",
    reference: "CHT-002",
    name: "Centre Commercial Nord",
    client: "SCI Galeries Partenaires",
    address: "45 avenue du Nord, Paris 75018",
    conductorName: "Sophie Martin",
    status: "Planification",
    startDate: "15/06/2024",
    expectedEndDate: "28/02/2026",
    openReservesCount: 1,
    progressPercent: 23,
    budget: 8_200_000,
    budgetSpent: 890_000,
    description: "Rénovation et extension d'un centre commercial de 12 000 m² sur 2 niveaux.",
  },
  {
    id: "c-3",
    reference: "CHT-003",
    name: "Immeuble Haussmann Rénov.",
    client: "Bouygues Immobilier",
    address: "8 boulevard Haussmann, Paris 75008",
    conductorName: "Marc Dupont",
    status: "Réalisation",
    startDate: "10/01/2024",
    expectedEndDate: "15/04/2025",
    openReservesCount: 7,
    progressPercent: 45,
    budget: 5_800_000,
    budgetSpent: 3_200_000,
    description:
      "Rénovation complète d'un immeuble haussmannien : ravalement, toiture, ascenseurs.",
  },
  {
    id: "c-4",
    reference: "CHT-004",
    name: "Parking Souterrain Opéra",
    client: "Ville de Marseille",
    address: "Place de l'Opéra, Marseille 13001",
    conductorName: "Luc Bernard",
    status: "Réception",
    startDate: "01/11/2023",
    expectedEndDate: "30/06/2025",
    openReservesCount: 2,
    progressPercent: 89,
    budget: 3_100_000,
    budgetSpent: 2_780_000,
    description:
      "Construction d'un parking souterrain de 280 places avec ventilation et sécurité incendie.",
  },
  {
    id: "c-5",
    reference: "CHT-005",
    name: "École Primaire Les Tilleuls",
    client: "Conseil Départemental 69",
    address: "Rue des Tilleuls, Villeurbanne 69100",
    conductorName: "Marc Dupont",
    status: "Démarrage",
    startDate: "01/09/2025",
    expectedEndDate: "31/08/2026",
    openReservesCount: 0,
    progressPercent: 12,
    budget: 1_850_000,
    budgetSpent: 220_000,
    description:
      "Extension et mise aux normes PMR d'une école primaire de 12 classes.",
  },
  {
    id: "c-6",
    reference: "CHT-006",
    name: "Pont Route Nationale 7",
    client: "DIR Centre-Est",
    address: "RN7, Valence 26000",
    conductorName: "Sophie Martin",
    status: "Réalisation",
    startDate: "15/04/2024",
    expectedEndDate: "01/03/2025",
    openReservesCount: 4,
    progressPercent: 78,
    budget: 12_500_000,
    budgetSpent: 9_800_000,
    description:
      "Réfection du tablier et renforcement structurel du pont sur la RN7.",
  },
  {
    id: "c-7",
    reference: "CHT-007",
    name: "Résidence Le Parc",
    client: "Nexity",
    address: "Avenue du Parc, Bordeaux 33000",
    conductorName: "Luc Bernard",
    status: "Préparation",
    startDate: "01/01/2026",
    expectedEndDate: "30/12/2027",
    openReservesCount: 0,
    progressPercent: 0,
    budget: 4_200_000,
    budgetSpent: 45_000,
    description:
      "Programme neuf de 32 logements intermédiaires avec commerces en RDC.",
  },
  {
    id: "c-8",
    reference: "CHT-008",
    name: "Hôpital Sud — Aile B",
    client: "CHU Toulouse",
    address: "Rue de l'Hôpital, Toulouse 31000",
    conductorName: "Marc Dupont",
    status: "Clôture",
    startDate: "01/06/2022",
    expectedEndDate: "31/12/2024",
    openReservesCount: 0,
    progressPercent: 100,
    budget: 6_700_000,
    budgetSpent: 6_550_000,
    description:
      "Réhabilitation de l'aile B : blocs opératoires, salles de soins et locaux techniques.",
  },
] as const;

const E2E_CREATED_CHANTIER = {
  id: "c-new",
  reference: "CHT-099",
  name: "Chantier E2E",
  client: "Client E2E",
  address: "Adresse E2E",
  conductorName: "Marc Dupont",
  status: "Préparation",
  startDate: "01/01/2025",
  expectedEndDate: "31/12/2025",
  budget: 500_000,
  budgetSpent: 0,
  openReservesCount: 0,
  description: "",
};

const detailsById = new Map(
  MOCK_CHANTIER_DETAILS.map((c) => [c.id, { ...c }]),
);

function toListItem(
  c: (typeof MOCK_CHANTIER_DETAILS)[number] | typeof E2E_CREATED_CHANTIER,
) {
  return {
    id: c.id,
    reference: c.reference,
    name: c.name,
    client: c.client,
    address: c.address,
    conductorName: c.conductorName,
    conductorId: CONDUCTOR_ID_BY_NAME[c.conductorName] ?? "u-conducteur",
    status: c.status,
    startDate: c.startDate,
    expectedEndDate: c.expectedEndDate,
    openReservesCount: c.openReservesCount,
    progressPercent: c.progressPercent,
  };
}

const MOCK_RESERVES_C3 = [
  {
    id: "r-4",
    chantierId: "c-3",
    reference: "RSV-042",
    title: "Fissure mur porteur nord",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Critique",
    status: "En cours",
    assigneeName: "Jean Moreau",
    createdAt: "12/05/2025",
  },
  {
    id: "r-5",
    chantierId: "c-3",
    reference: "RSV-044",
    title: "Non-conformité électrique NF C15-100",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Critique",
    status: "En cours",
    assigneeName: "Paul Lefèvre",
    createdAt: "10/05/2025",
  },
];

const reservesByChantier = new Map<string, typeof MOCK_RESERVES_C3>([
  ["c-3", MOCK_RESERVES_C3.map((r) => ({ ...r }))],
  ["c-1", []],
]);

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

async function handleChantiersRoute(route: Route): Promise<void> {
  const requestUrl = new URL(route.request().url());
  const pathname = requestUrl.pathname.replace(/\/$/, "");
  const method = route.request().method();

  if (method === "GET" && pathname === "/api/chantiers") {
    await route.fulfill({
      json: MOCK_CHANTIER_DETAILS.map(toListItem),
    });
    return;
  }

  if (method === "GET" && pathname === "/api/chantiers/mine") {
    const mine = MOCK_CHANTIER_DETAILS.filter((c) => c.id === "c-3").map(toListItem);
    await route.fulfill({ json: mine });
    return;
  }

  if (method === "GET" && pathname === "/api/reserves") {
    const all = [...reservesByChantier.values()].flat();
    await route.fulfill({ json: all });
    return;
  }

  if (method === "GET" && pathname === "/api/photos") {
    const all = [...photosByChantier.entries()].flatMap(([chantierId, list]) => {
      const detail = detailsById.get(chantierId);
      return list.map((p) => ({
        ...p,
        chantierReference: detail?.reference ?? "CHT-003",
        chantierName: detail?.name ?? "Chantier",
        fileUrl: "/uploads/mock.jpg",
      }));
    });
    await route.fulfill({ json: all });
    return;
  }

  if (method === "GET" && pathname.endsWith("/history")) {
    await route.fulfill({ json: [] });
    return;
  }

  const assignmentsMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/assignments$/);
  if (assignmentsMatch) {
    const id = assignmentsMatch[1];
    if (method === "GET") {
      await route.fulfill({ json: assignmentsByChantier.get(id) ?? [] });
      return;
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() as {
        userId?: string;
        functionLabel?: string;
      };
      const userName =
        body.userId === "u-chef-2" ? "Paul Lefèvre" : "Jean Moreau";
      const row = {
        id: `a-new-${Date.now()}`,
        chantierId: id,
        collaboratorName: userName,
        jobTitle: body.functionLabel ?? "Membre",
        assignedAt: "20/06/2026",
        isActive: true,
      };
      const list = [...(assignmentsByChantier.get(id) ?? []), row];
      assignmentsByChantier.set(id, list);
      await route.fulfill({ status: 201, json: row });
      return;
    }
  }

  const progressMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/progress$/);
  if (progressMatch) {
    const id = progressMatch[1];
    if (method === "GET") {
      await route.fulfill({ json: progressByChantier.get(id) ?? [] });
      return;
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() as {
        comment?: string;
        percent?: number;
      };
      const row = {
        id: `p-new-${Date.now()}`,
        chantierId: id,
        date: "20/06/2026",
        authorName: "Marc Dupont",
        comment: body.comment ?? "",
        percent: body.percent,
      };
      const list = [row, ...(progressByChantier.get(id) ?? [])];
      progressByChantier.set(id, list);
      await route.fulfill({ status: 201, json: row });
      return;
    }
  }

  const reservesMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/reserves$/);
  if (reservesMatch) {
    const id = reservesMatch[1];
    if (method === "GET") {
      await route.fulfill({ json: reservesByChantier.get(id) ?? [] });
      return;
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() as {
        title?: string;
        priority?: string;
      };
      const row = {
        id: `r-new-${Date.now()}`,
        chantierId: id,
        reference: "RSV-E2E",
        title: body.title ?? "Nouvelle réserve",
        chantierReference: "CHT-003",
        chantierName: "Immeuble Haussmann Rénov.",
        priority: body.priority ?? "Moyenne",
        status: "Ouverte",
        assigneeName: "Marc Dupont",
        createdAt: "20/06/2026",
      };
      const list = [row, ...(reservesByChantier.get(id) ?? [])];
      reservesByChantier.set(id, list);
      await route.fulfill({ status: 201, json: row });
      return;
    }
  }

  const priseEnChargeMatch = pathname.match(
    /^\/api\/chantiers\/([^/]+)\/reserves\/([^/]+)\/prise-en-charge$/,
  );
  if (method === "PATCH" && priseEnChargeMatch) {
    const chantierId = priseEnChargeMatch[1];
    const reserveId = priseEnChargeMatch[2];
    const list = reservesByChantier.get(chantierId) ?? [];
    const idx = list.findIndex((r) => r.id === reserveId);
    if (idx >= 0) {
      list[idx] = {
        ...list[idx],
        status: "En cours",
        assigneeName: "Jean Moreau",
        takenAt: "20/06/2026",
      };
      reservesByChantier.set(chantierId, list);
      await route.fulfill({ json: list[idx] });
      return;
    }
  }

  const leveeMatch = pathname.match(
    /^\/api\/chantiers\/([^/]+)\/reserves\/([^/]+)\/levee$/,
  );
  if (method === "PATCH" && leveeMatch) {
    const chantierId = leveeMatch[1];
    const reserveId = leveeMatch[2];
    const list = reservesByChantier.get(chantierId) ?? [];
    const idx = list.findIndex((r) => r.id === reserveId);
    if (idx >= 0) {
      list[idx] = { ...list[idx], status: "Levée" };
      reservesByChantier.set(chantierId, list);
      await route.fulfill({ json: list[idx] });
      return;
    }
  }

  const uploadMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/photos\/upload$/);
  if (method === "POST" && uploadMatch) {
    const id = uploadMatch[1];
    const row = {
      id: `ph-upload-${Date.now()}`,
      chantierId: id,
      category: "Pendant travaux",
      fileName: "facade-e2e.jpg",
      fileUrl: `/api/photos/ph-upload-${Date.now()}/file`,
      authorName: "Marc Dupont",
      date: "20/06/2026",
    };
    const list = [row, ...(photosByChantier.get(id) ?? [])];
    photosByChantier.set(id, list);
    await route.fulfill({ status: 201, json: [row] });
    return;
  }

  const photosMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/photos$/);
  if (photosMatch) {
    const id = photosMatch[1];
    if (method === "GET") {
      await route.fulfill({ json: photosByChantier.get(id) ?? [] });
      return;
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() as {
        fileName?: string;
        category?: string;
      };
      const row = {
        id: `ph-new-${Date.now()}`,
        chantierId: id,
        category: body.category ?? "Pendant travaux",
        fileName: body.fileName ?? "photo.jpg",
        authorName: "Marc Dupont",
        date: "20/06/2026",
      };
      const list = [row, ...(photosByChantier.get(id) ?? [])];
      photosByChantier.set(id, list);
      await route.fulfill({ status: 201, json: row });
      return;
    }
  }

  const detailMatch = pathname.match(/^\/api\/chantiers\/([^/]+)$/);
  if (method === "GET" && detailMatch) {
    const id = detailMatch[1];
    if (id === "c-new") {
      await route.fulfill({ json: E2E_CREATED_CHANTIER });
      return;
    }
    const detail = detailsById.get(id);
    if (detail) {
      await route.fulfill({ json: detail });
      return;
    }
    await route.fulfill({ status: 404, json: { message: "Chantier introuvable" } });
    return;
  }

  if (method === "POST" && pathname === "/api/chantiers") {
    await route.fulfill({ status: 201, json: E2E_CREATED_CHANTIER });
    return;
  }

  const statusMatch = pathname.match(/^\/api\/chantiers\/([^/]+)\/status$/);
  if (method === "PATCH" && statusMatch) {
    const id = statusMatch[1];
    const body = route.request().postDataJSON() as { status?: string };
    const base = detailsById.get(id) ?? E2E_CREATED_CHANTIER;
    await route.fulfill({
      json: { ...base, status: body.status ?? base.status },
    });
    return;
  }

  if (method === "PATCH" && detailMatch) {
    const id = detailMatch[1];
    const detail = detailsById.get(id);
    if (detail) {
      await route.fulfill({ json: detail });
      return;
    }
  }

  await route.fulfill({ status: 404, json: { message: "Not mocked" } });
}

/** Intercepte les routes chantiers et vues globales pour E2E sans PostgreSQL. */
export async function installChantiersApiMock(page: Page): Promise<void> {
  await page.route("**/api/chantiers**", handleChantiersRoute);
  await page.route("**/api/reserves**", handleChantiersRoute);
  await page.route("**/api/photos**", handleChantiersRoute);
}
