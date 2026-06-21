import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateWorkerDto, UpdateWorkerDto } from './dto/worker.dto';

export interface WorkerResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  trade?: string;
  isActive: boolean;
}

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = true): Promise<WorkerResponse[]> {
    const rows = await this.prisma.worker.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return rows.map((row) => this.mapRow(row));
  }

  async create(dto: CreateWorkerDto): Promise<WorkerResponse> {
    const row = await this.prisma.worker.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        trade: dto.trade?.trim() || null,
      },
    });
    return this.mapRow(row);
  }

  async update(id: string, dto: UpdateWorkerDto): Promise<WorkerResponse> {
    await this.ensureExists(id);
    const row = await this.prisma.worker.update({
      where: { id },
      data: {
        firstName: dto.firstName?.trim(),
        lastName: dto.lastName?.trim(),
        trade: dto.trade === undefined ? undefined : dto.trade?.trim() || null,
        isActive: dto.isActive,
      },
    });
    return this.mapRow(row);
  }

  async ensureExists(id: string) {
    const row = await this.prisma.worker.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Ouvrier introuvable.');
    }
    return row;
  }

  async ensureActiveForScheduling(id: string) {
    const row = await this.ensureExists(id);
    if (!row.isActive) {
      throw new BadRequestException(
        'Cet ouvrier est inactif et ne peut pas être affecté à un créneau.',
      );
    }
    return row;
  }

  private mapRow(row: {
    id: string;
    firstName: string;
    lastName: string;
    trade: string | null;
    isActive: boolean;
  }): WorkerResponse {
    return {
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      fullName: `${row.firstName} ${row.lastName}`,
      trade: row.trade ?? undefined,
      isActive: row.isActive,
    };
  }
}
