import axios from "axios";
import type { User } from "../types/domain";
import { apiClient } from "./apiClient";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export interface LoginResult {
  user: User;
  token: string;
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const { data } = await apiClient.post<LoginResult>("/auth/login", {
      email,
      password,
    });
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new AuthError("Adresse e-mail ou mot de passe incorrect.");
    }
    throw new AuthError("Impossible de se connecter. Réessayez plus tard.");
  }
}

/** Déconnexion locale — pas d'invalidation serveur en MVP */
export async function logoutFromApi(_token: string): Promise<void> {
  return;
}

/** Profil courant via GET /auth/me */
export async function fetchCurrentUser(_token: string): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}
