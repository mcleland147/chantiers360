import {
  formatDateFr,
  issuePriorityToFrench,
  issueStatusToFrench,
  statusToFrench,
} from '../mappers/chantier.mapper';
import { ProjectWithRelations } from '../../projects/repositories/projects.repository';
import { Issue, IssuePriority, IssueStatus, Project, User } from '@prisma/client';

export interface ChantierResponse {
  id: string;
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorId: string;
  conductorName: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
  receptionDate?: string;
  budget?: number;
  budgetSpent: number;
  openReservesCount: number;
  progressPercent?: number;
  description: string;
}

export interface ReserveResponse {
  id: string;
  reference: string;
  title: string;
  chantierReference: string;
  chantierName: string;
  priority: string;
  status: string;
  assigneeName: string;
  createdAt: string;
}

export interface AlertResponse {
  id: string;
  type: 'RETARD_CHANTIER' | 'RESERVE_CRITIQUE';
  message: string;
  chantierReference: string;
  chantierName: string;
  createdAt: string;
}

export function computeBudgetSpent(validatedExpenseTotal: number): number {
  return Math.round(validatedExpenseTotal * 100) / 100;
}

export function buildChantierResponse(
  project: ProjectWithRelations,
  validatedExpenseTotal = 0,
): ChantierResponse {
  const budget = project.budget ? Number(project.budget) : undefined;
  const progressPercent = project.progress[0]?.progressRatio ?? undefined;

  return {
    id: project.id,
    reference: project.reference,
    name: project.name,
    client: project.client,
    address: project.address,
    conductorId: project.conductorId,
    conductorName: `${project.conductor.firstName} ${project.conductor.lastName}`,
    status: statusToFrench(project.status),
    startDate: formatDateFr(project.startDate),
    expectedEndDate: formatDateFr(project.expectedEndDate),
    receptionDate: project.receptionDate
      ? formatDateFr(project.receptionDate)
      : undefined,
    budget,
    budgetSpent: computeBudgetSpent(validatedExpenseTotal),
    openReservesCount: project._count.issues,
    progressPercent,
    description: '',
  };
}

export function buildReserveResponse(
  issue: Issue & { project: Project },
  assigneeName: string,
): ReserveResponse {
  return {
    id: issue.id,
    reference: formatIssueReference(issue.id),
    title: issue.title,
    chantierReference: issue.project.reference,
    chantierName: issue.project.name,
    priority: issuePriorityToFrench(issue.priority),
    status: issueStatusToFrench(issue.status),
    assigneeName,
    createdAt: formatDateFr(issue.createdAt),
  };
}

export function formatIssueReference(issueId: string): string {
  const suffix = issueId.replace(/\D/g, '').slice(-3).padStart(3, '0');
  return `RSV-${suffix}`;
}

export function userDisplayName(user: Pick<User, 'firstName' | 'lastName'>): string {
  return `${user.firstName} ${user.lastName}`;
}

export function isOpenIssueStatus(status: IssueStatus): boolean {
  return status === 'OUVERTE' || status === 'EN_COURS';
}

export function isCriticalPriority(priority: IssuePriority): boolean {
  return priority === 'CRITIQUE';
}
