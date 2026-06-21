import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AssignableUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAssignable(): Promise<AssignableUserResponse[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { name: { not: 'DIRECTION' } },
      },
      include: { role: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`,
      role: user.role.name,
    }));
  }
}
