import { UserRoleName } from '@prisma/client';

export interface AuthUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoleName;
}

export interface LoginResponse {
  token: string;
  user: AuthUserResponse;
}
