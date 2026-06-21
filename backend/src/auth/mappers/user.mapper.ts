import { Role, User } from '@prisma/client';
import { AuthUserResponse } from '../types/auth-user.response';

type UserWithRole = User & { role: Role };

export function toAuthUserResponse(user: UserWithRole): AuthUserResponse {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
  };
}
