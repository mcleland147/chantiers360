import {
  IssuePriority,
  IssueStatus,
  PhotoCategory,
  PrismaClient,
  ProjectStatus,
  UserRoleName,
} from '@prisma/client';

export interface RecetteUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoleName;
}

export const RECETTE_USERS: RecetteUser[] = [
  {
    id: 'u-direction',
    firstName: 'Claire',
    lastName: 'Bernard',
    email: 'direction@batinova.fr',
    role: 'DIRECTION',
  },
  {
    id: 'u-assistante',
    firstName: 'Julie',
    lastName: 'Petit',
    email: 'assistante@batinova.fr',
    role: 'ASSISTANTE_ADMINISTRATIVE',
  },
  {
    id: 'u-conducteur',
    firstName: 'Marc',
    lastName: 'Dupont',
    email: 'conducteur@batinova.fr',
    role: 'CONDUCTEUR_TRAVAUX',
  },
  {
    id: 'u-conducteur-2',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@batinova.fr',
    role: 'CONDUCTEUR_TRAVAUX',
  },
  {
    id: 'u-conducteur-3',
    firstName: 'Luc',
    lastName: 'Bernard',
    email: 'luc.bernard@batinova.fr',
    role: 'CONDUCTEUR_TRAVAUX',
  },
  {
    id: 'u-chef',
    firstName: 'Jean',
    lastName: 'Moreau',
    email: 'chef@batinova.fr',
    role: 'CHEF_CHANTIER',
  },
  {
    id: 'u-chef-2',
    firstName: 'Paul',
    lastName: 'Lefèvre',
    email: 'paul.lefevre@batinova.fr',
    role: 'CHEF_CHANTIER',
  },
];

interface RecetteProjectDef {
  reference: string;
  name: string;
  client: string;
  address: string;
  budget: number;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  conductorId: string;
  progressRatio?: number;
  late?: boolean;
  criticalIssues?: number;
  openIssues?: number;
}

/** 20 chantiers couvrant tous les statuts et scénarios recette */
export const RECETTE_PROJECTS: RecetteProjectDef[] = [
  {
    reference: 'CHT-001',
    name: 'Résidence Les Oliviers',
    client: 'Mairie de Lyon',
    address: '12 rue des Oliviers, Lyon 69003',
    budget: 2_450_000,
    startDate: '2024-03-01',
    expectedEndDate: '2025-09-30',
    status: 'REALISATION',
    conductorId: 'u-conducteur',
    progressRatio: 67,
    openIssues: 1,
  },
  {
    reference: 'CHT-002',
    name: 'Centre Commercial Nord',
    client: 'SCI Galeries Partenaires',
    address: '45 avenue du Nord, Paris 75018',
    budget: 8_200_000,
    startDate: '2024-06-15',
    expectedEndDate: '2026-02-28',
    status: 'PLANIFICATION',
    conductorId: 'u-conducteur-2',
    progressRatio: 23,
    openIssues: 1,
  },
  {
    reference: 'CHT-003',
    name: 'Immeuble Haussmann Rénov.',
    client: 'Bouygues Immobilier',
    address: '8 boulevard Haussmann, Paris 75008',
    budget: 5_800_000,
    startDate: '2024-01-10',
    expectedEndDate: '2025-04-15',
    status: 'REALISATION',
    conductorId: 'u-conducteur',
    progressRatio: 45,
    late: true,
    criticalIssues: 2,
    openIssues: 2,
  },
  {
    reference: 'CHT-004',
    name: 'Parking Souterrain Opéra',
    client: 'Ville de Marseille',
    address: 'Place de l\'Opéra, Marseille 13001',
    budget: 3_100_000,
    startDate: '2023-11-01',
    expectedEndDate: '2025-06-30',
    status: 'RECEPTION',
    conductorId: 'u-conducteur-3',
    progressRatio: 89,
    openIssues: 2,
  },
  {
    reference: 'CHT-005',
    name: 'École Primaire Les Tilleuls',
    client: 'Conseil Départemental 69',
    address: 'Rue des Tilleuls, Villeurbanne 69100',
    budget: 1_850_000,
    startDate: '2025-09-01',
    expectedEndDate: '2026-08-31',
    status: 'DEMARRAGE',
    conductorId: 'u-conducteur',
    progressRatio: 12,
  },
  {
    reference: 'CHT-006',
    name: 'Pont Route Nationale 7',
    client: 'DIR Sud',
    address: 'RN7, Avignon 84000',
    budget: 12_500_000,
    startDate: '2024-02-01',
    expectedEndDate: '2025-05-01',
    status: 'REALISATION',
    conductorId: 'u-conducteur',
    progressRatio: 72,
    late: true,
  },
  {
    reference: 'CHT-007',
    name: 'Maison de Santé Pluridisciplinaire',
    client: 'ARS Auvergne-Rhône-Alpes',
    address: '15 avenue Pasteur, Grenoble 38000',
    budget: 4_200_000,
    startDate: '2025-01-15',
    expectedEndDate: '2026-03-31',
    status: 'PLANIFICATION',
    conductorId: 'u-conducteur-2',
    progressRatio: 18,
  },
  {
    reference: 'CHT-008',
    name: 'Rénovation Hôtel de Ville',
    client: 'Mairie de Bordeaux',
    address: 'Place Pey-Berland, Bordeaux 33000',
    budget: 6_700_000,
    startDate: '2023-06-01',
    expectedEndDate: '2024-12-15',
    status: 'CLOTURE',
    conductorId: 'u-conducteur-3',
    progressRatio: 100,
  },
  {
    reference: 'CHT-009',
    name: 'Entrepôt Logistique Est',
    client: 'FM Logistic',
    address: 'ZAC des Portes de France, Metz 57070',
    budget: 9_800_000,
    startDate: '2025-02-01',
    expectedEndDate: '2026-01-31',
    status: 'PREPARATION',
    conductorId: 'u-conducteur-2',
    progressRatio: 5,
  },
  {
    reference: 'CHT-010',
    name: 'Résidence Étudiants Campus',
    client: 'CROUS Lyon',
    address: 'Campus La Doua, Villeurbanne 69100',
    budget: 3_600_000,
    startDate: '2024-09-01',
    expectedEndDate: '2025-12-31',
    status: 'REALISATION',
    conductorId: 'u-conducteur-3',
    progressRatio: 55,
    openIssues: 1,
  },
  {
    reference: 'CHT-011',
    name: 'Extension Usine Agroalimentaire',
    client: 'Lactalis',
    address: 'Zone industrielle, Laval 53000',
    budget: 7_300_000,
    startDate: '2024-04-01',
    expectedEndDate: '2025-10-31',
    status: 'REALISATION',
    conductorId: 'u-conducteur',
    progressRatio: 58,
    criticalIssues: 1,
    openIssues: 1,
  },
  {
    reference: 'CHT-012',
    name: 'Centre Aquatique Municipal',
    client: 'Métropole de Lyon',
    address: 'Quai Rambaud, Lyon 69002',
    budget: 11_200_000,
    startDate: '2023-03-01',
    expectedEndDate: '2025-08-31',
    status: 'RECEPTION',
    conductorId: 'u-conducteur-2',
    progressRatio: 95,
    openIssues: 3,
  },
  {
    reference: 'CHT-013',
    name: 'Réhabilitation Friche Industrielle',
    client: 'SPL Lyon Confluence',
    address: 'Quai Perrache, Lyon 69002',
    budget: 15_000_000,
    startDate: '2025-01-01',
    expectedEndDate: '2027-06-30',
    status: 'PREPARATION',
    conductorId: 'u-conducteur',
    progressRatio: 8,
  },
  {
    reference: 'CHT-014',
    name: 'Galerie Commerciale Rénovation',
    client: 'Unibail-Rodamco',
    address: 'Centre Part-Dieu, Lyon 69003',
    budget: 4_900_000,
    startDate: '2024-07-01',
    expectedEndDate: '2025-11-30',
    status: 'DEMARRAGE',
    conductorId: 'u-conducteur-3',
    progressRatio: 22,
  },
  {
    reference: 'CHT-015',
    name: 'Lotissement Les Vignes',
    client: 'Promoteur Habitat Plus',
    address: 'Chemin des Vignes, Dijon 21000',
    budget: 2_100_000,
    startDate: '2024-11-01',
    expectedEndDate: '2025-09-30',
    status: 'REALISATION',
    conductorId: 'u-conducteur-2',
    progressRatio: 40,
  },
  {
    reference: 'CHT-016',
    name: 'Data Center Extension',
    client: 'Orange Business',
    address: 'Parc technologique, Valbonne 06560',
    budget: 18_500_000,
    startDate: '2024-05-01',
    expectedEndDate: '2026-04-30',
    status: 'PLANIFICATION',
    conductorId: 'u-conducteur',
    progressRatio: 15,
  },
  {
    reference: 'CHT-017',
    name: 'Maison de Retraite Les Acacias',
    client: 'EHPAD Méditerranée',
    address: 'Avenue des Acacias, Nice 06000',
    budget: 3_400_000,
    startDate: '2023-08-01',
    expectedEndDate: '2025-03-31',
    status: 'CLOTURE',
    conductorId: 'u-conducteur-3',
    progressRatio: 100,
  },
  {
    reference: 'CHT-018',
    name: 'Stade Municipal Rénovation',
    client: 'Ville de Saint-Étienne',
    address: 'Avenue Auguste Durafour, Saint-Étienne 42000',
    budget: 8_900_000,
    startDate: '2024-01-01',
    expectedEndDate: '2025-07-31',
    status: 'REALISATION',
    conductorId: 'u-conducteur-2',
    progressRatio: 62,
    late: true,
    criticalIssues: 1,
    openIssues: 1,
  },
  {
    reference: 'CHT-019',
    name: 'Immeuble Bureaux Green Tower',
    client: 'BNP Paribas REPM',
    address: 'La Défense, Puteaux 92800',
    budget: 22_000_000,
    startDate: '2025-03-01',
    expectedEndDate: '2027-12-31',
    status: 'PREPARATION',
    conductorId: 'u-conducteur',
    progressRatio: 3,
  },
  {
    reference: 'CHT-020',
    name: 'Hôpital de Jour Psychiatrique',
    client: 'CHU de Nantes',
    address: 'Boulevard Jean Monnet, Nantes 44000',
    budget: 5_500_000,
    startDate: '2024-10-01',
    expectedEndDate: '2026-06-30',
    status: 'DEMARRAGE',
    conductorId: 'u-conducteur-3',
    progressRatio: 28,
    openIssues: 1,
  },
];

export async function seedRecetteData(
  prisma: PrismaClient,
  passwordHash: string,
  roleByName: Map<UserRoleName, string>,
): Promise<void> {
  for (const user of RECETTE_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash,
        roleId: roleByName.get(user.role)!,
      },
      create: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        passwordHash,
        roleId: roleByName.get(user.role)!,
      },
    });
  }

  await prisma.historyEvent.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.projectExpense.deleteMany();
  await prisma.projectResource.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.workerSchedule.deleteMany();
  await prisma.worker.deleteMany();

  const projectIds = new Map<string, string>();

  for (const def of RECETTE_PROJECTS) {
    const project = await prisma.project.upsert({
      where: { reference: def.reference },
      update: {
        name: def.name,
        client: def.client,
        address: def.address,
        budget: def.budget,
        startDate: new Date(def.startDate),
        expectedEndDate: new Date(def.expectedEndDate),
        status: def.status,
        conductorId: def.conductorId,
        receptionDate:
          def.status === 'CLOTURE' ? new Date('2024-12-01') : undefined,
      },
      create: {
        reference: def.reference,
        name: def.name,
        client: def.client,
        address: def.address,
        budget: def.budget,
        startDate: new Date(def.startDate),
        expectedEndDate: new Date(def.expectedEndDate),
        status: def.status,
        conductorId: def.conductorId,
        receptionDate:
          def.status === 'CLOTURE' ? new Date('2024-12-01') : undefined,
      },
    });
    projectIds.set(def.reference, project.id);

    if (def.progressRatio !== undefined) {
      await prisma.progressUpdate.create({
        data: {
          projectId: project.id,
          authorId: 'u-chef',
          comment: `Avancement recette — ${def.progressRatio}%`,
          progressRatio: def.progressRatio,
          createdAt: new Date('2025-05-14'),
        },
      });
    }

    await prisma.assignment.create({
      data: {
        projectId: project.id,
        userId: 'u-chef',
        functionLabel: 'Chef de chantier',
        assignmentDate: new Date(def.startDate),
      },
    });

    await prisma.historyEvent.create({
      data: {
        projectId: project.id,
        userId: def.conductorId,
        action: 'Création chantier',
        newValue: `${def.reference} — ${def.name}`,
        createdAt: new Date(def.startDate),
      },
    });

    if (def.late) {
      await prisma.alert.create({
        data: {
          projectId: project.id,
          type: 'RETARD_CHANTIER',
          message: 'Date de fin prévue dépassée',
          status: 'ACTIVE',
          createdAt: new Date('2025-05-15'),
        },
      });
    }

    const criticalCount = def.criticalIssues ?? 0;
    for (let i = 0; i < criticalCount; i += 1) {
      await prisma.issue.create({
        data: {
          projectId: project.id,
          title: `Réserve critique ${i + 1} — ${def.reference}`,
          description: 'Réserve critique seed recette',
          priority: 'CRITIQUE',
          status: 'EN_COURS',
          createdById: 'u-chef',
          createdAt: new Date('2025-05-12'),
        },
      });
      if (i === 0) {
        await prisma.alert.create({
          data: {
            projectId: project.id,
            type: 'RESERVE_CRITIQUE',
            message: 'Réserve critique non levée',
            status: 'ACTIVE',
            createdAt: new Date('2025-05-12'),
          },
        });
      }
    }

    const openCount = def.openIssues ?? 0;
    for (let i = 0; i < openCount; i += 1) {
      await prisma.issue.create({
        data: {
          projectId: project.id,
          title: `Réserve ouverte ${i + 1} — ${def.reference}`,
          description: 'Réserve seed recette',
          priority: i === 0 ? 'HAUTE' : 'MOYENNE',
          status: i % 2 === 0 ? 'OUVERTE' : 'EN_COURS',
          createdById: def.conductorId,
          createdAt: new Date('2025-05-02'),
        },
      });
    }

    await prisma.photo.create({
      data: {
        projectId: project.id,
        fileName: `${def.reference.toLowerCase()}-photo.jpg`,
        originalFileName: `${def.reference.toLowerCase()}-photo.jpg`,
        storageKey: `legacy/seed-${project.id}`,
        mimeType: 'image/jpeg',
        fileSizeBytes: 0,
        fileUrl: `/uploads/${def.reference.toLowerCase()}.jpg`,
        category: 'PENDANT_TRAVAUX',
        addedById: 'u-chef',
        createdAt: new Date('2025-05-14'),
      },
    });
  }

  const workers = [
    { id: 'w-1', firstName: 'Ahmed', lastName: 'Benali', trade: 'Maçon' },
    { id: 'w-2', firstName: 'Lucas', lastName: 'Girard', trade: 'Électricien' },
    { id: 'w-3', firstName: 'Karim', lastName: 'Diallo', trade: 'Plombier' },
    { id: 'w-4', firstName: 'Thomas', lastName: 'Roux', trade: 'Manœuvre' },
    {
      id: 'w-5',
      firstName: 'Pierre',
      lastName: 'Morel',
      trade: 'Coffreur',
      isActive: false,
    },
  ];

  for (const worker of workers) {
    await prisma.worker.upsert({
      where: { id: worker.id },
      update: worker,
      create: worker,
    });
  }

  const cht001Id = projectIds.get('CHT-001');
  const cht003Id = projectIds.get('CHT-003');
  const cht005Id = projectIds.get('CHT-005');

  const scheduleSeeds: Array<{
    workerId: string;
    reference: string;
    startAt: string;
    endAt: string;
    status: 'PLANNED' | 'CONFIRMED' | 'CANCELLED';
  }> = [
    { workerId: 'w-1', reference: 'CHT-001', startAt: '2025-06-16T06:00:00.000Z', endAt: '2025-06-16T14:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-1', reference: 'CHT-003', startAt: '2025-06-17T08:00:00.000Z', endAt: '2025-06-17T12:00:00.000Z', status: 'CANCELLED' },
    { workerId: 'w-2', reference: 'CHT-001', startAt: '2025-06-18T07:00:00.000Z', endAt: '2025-06-18T15:00:00.000Z', status: 'CONFIRMED' },
    { workerId: 'w-3', reference: 'CHT-005', startAt: '2025-06-19T06:00:00.000Z', endAt: '2025-06-19T14:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-4', reference: 'CHT-003', startAt: '2025-06-20T08:00:00.000Z', endAt: '2025-06-20T12:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-5', reference: 'CHT-001', startAt: '2025-06-21T08:00:00.000Z', endAt: '2025-06-21T12:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-1', reference: 'CHT-001', startAt: '2025-06-23T06:00:00.000Z', endAt: '2025-06-23T14:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-2', reference: 'CHT-003', startAt: '2025-06-24T07:00:00.000Z', endAt: '2025-06-24T15:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-3', reference: 'CHT-005', startAt: '2025-06-25T06:00:00.000Z', endAt: '2025-06-25T14:00:00.000Z', status: 'PLANNED' },
    { workerId: 'w-4', reference: 'CHT-001', startAt: '2025-06-26T08:00:00.000Z', endAt: '2025-06-26T12:00:00.000Z', status: 'CONFIRMED' },
  ];

  for (const seed of scheduleSeeds) {
    const projectId = projectIds.get(seed.reference);
    if (!projectId) continue;
    await prisma.workerSchedule.create({
      data: {
        workerId: seed.workerId,
        projectId,
        startAt: new Date(seed.startAt),
        endAt: new Date(seed.endAt),
        status: seed.status,
        createdById: 'u-conducteur',
      },
    });
  }

  if (cht001Id) {
    const resources = [
      {
        type: 'MAIN_OEUVRE' as const,
        label: 'Équipe maçonnerie',
        unitCost: 45_000,
        quantity: 12,
      },
      {
        type: 'MATERIEL' as const,
        label: 'Grue mobile',
        unitCost: 8_500,
        quantity: 4,
      },
      {
        type: 'SOUS_TRAITANT' as const,
        label: 'Lot électricité',
        unitCost: 120_000,
        quantity: 1,
      },
    ];

    for (const res of resources) {
      await prisma.projectResource.create({
        data: {
          projectId: cht001Id,
          type: res.type,
          label: res.label,
          unitCost: res.unitCost,
          quantity: res.quantity,
          totalPlanned: res.unitCost * res.quantity,
          createdById: 'u-conducteur',
        },
      });
    }

    const expenseSeeds: Array<{
      category: 'ACHAT_MATERIAUX' | 'SOUS_TRAITANCE' | 'LOCATION' | 'FRAIS_GENERAUX';
      label: string;
      amount: number;
      status: 'VALIDATED' | 'DRAFT' | 'CANCELLED';
      date: string;
    }> = [
      { category: 'ACHAT_MATERIAUX', label: 'Béton C25/30', amount: 800_000, status: 'VALIDATED', date: '2025-01-15' },
      { category: 'SOUS_TRAITANCE', label: 'Lot électricité phase 1', amount: 600_000, status: 'VALIDATED', date: '2025-02-20' },
      { category: 'ACHAT_MATERIAUX', label: 'Acier HA', amount: 400_000, status: 'VALIDATED', date: '2025-03-10' },
      { category: 'FRAIS_GENERAUX', label: 'Assurances chantier', amount: 200_000, status: 'VALIDATED', date: '2025-04-01' },
      { category: 'LOCATION', label: 'Grue — brouillon', amount: 500_000, status: 'DRAFT', date: '2025-05-01' },
      { category: 'ACHAT_MATERIAUX', label: 'Commande annulée', amount: 300_000, status: 'CANCELLED', date: '2025-05-05' },
      { category: 'SOUS_TRAITANCE', label: 'Plomberie', amount: 75_000, status: 'VALIDATED', date: '2025-05-20' },
      { category: 'ACHAT_MATERIAUX', label: 'Isolants', amount: 25_000, status: 'VALIDATED', date: '2025-06-01' },
    ];

    for (const exp of expenseSeeds) {
      await prisma.projectExpense.create({
        data: {
          projectId: cht001Id,
          category: exp.category,
          label: exp.label,
          amount: exp.amount,
          expenseDate: new Date(exp.date),
          status: exp.status,
          createdById: 'u-conducteur',
        },
      });
    }

    await prisma.alert.create({
      data: {
        projectId: cht001Id,
        type: 'BUDGET_80',
        message: 'Budget consommé à 85.7 % (seuil 80 %)',
        status: 'ACTIVE',
        createdAt: new Date('2025-06-01'),
      },
    });
  }

  console.log(`Recette : ${RECETTE_PROJECTS.length} chantiers seedés.`);
}
