const API_BASE = process.env.RECETTE_API_URL ?? "http://localhost:3000/api";

export interface AuthSession {
  token: string;
  user: { id: string; email: string; role: string };
}

export interface ChantierSummary {
  id: string;
  reference: string;
  name: string;
  budget?: number;
  budgetSpent?: number;
}

export interface BudgetSummaryApi {
  budgetConsumed: number;
  consumptionPercent: number | null;
  alert80Active: boolean;
  alert100Active: boolean;
  expenseCount: number;
}

export async function apiLogin(
  email: string,
  password = "demo123",
): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login API échoué (${res.status}) pour ${email}`);
  }
  return res.json() as Promise<AuthSession>;
}

export async function apiGetMe(token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /auth/me échoué (${res.status})`);
  return res.json();
}

export async function apiListChantiers(token: string): Promise<ChantierSummary[]> {
  const res = await fetch(`${API_BASE}/chantiers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /chantiers échoué (${res.status})`);
  return res.json() as Promise<ChantierSummary[]>;
}

export async function getChantierIdByReference(
  token: string,
  reference: string,
): Promise<string> {
  const chantiers = await apiListChantiers(token);
  const found = chantiers.find((c) => c.reference === reference);
  if (!found) {
    throw new Error(`Chantier ${reference} introuvable dans la seed recette`);
  }
  return found.id;
}

export async function apiGetBudgetSummary(
  token: string,
  chantierId: string,
): Promise<BudgetSummaryApi> {
  const result = await apiGetBudgetSummaryRaw(token, chantierId);
  if (!result.ok) {
    throw new Error(
      `GET budget/summary échoué (${result.status}) : ${String(result.body).slice(0, 200)}`,
    );
  }
  return result.body as BudgetSummaryApi;
}

export async function apiGetBudgetSummaryRaw(
  token: string,
  chantierId: string,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${API_BASE}/chantiers/${chantierId}/budget/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json().catch(() => res.text());
  return { ok: res.ok, status: res.status, body };
}

export async function apiGetExpenses(token: string, chantierId: string) {
  const res = await fetch(`${API_BASE}/chantiers/${chantierId}/expenses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET expenses échoué (${res.status})`);
  return res.json() as Promise<
    Array<{ amount: number; status: string; label: string }>
  >;
}

export async function apiPatchChantier(
  token: string,
  chantierId: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`${API_BASE}/chantiers/${chantierId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function apiChangeChantierStatus(
  token: string,
  chantierId: string,
  status: string,
  reason?: string,
) {
  const res = await fetch(`${API_BASE}/chantiers/${chantierId}/status`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, reason }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function apiCreatePlanningSlot(
  token: string,
  payload: {
    workerId: string;
    projectId: string;
    startAt: string;
    endAt: string;
    notes?: string;
  },
) {
  const res = await fetch(`${API_BASE}/planning/slots`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function apiUploadPhoto(
  token: string,
  chantierId: string,
  file: Buffer,
  filename: string,
  category = "Pendant travaux",
): Promise<{ status: number; body: unknown }> {
  const form = new FormData();
  const blob = new Blob([file], { type: "image/jpeg" });
  form.append("files", blob, filename);
  form.append("category", category);

  const res = await fetch(`${API_BASE}/chantiers/${chantierId}/photos/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // keep text
  }
  return { status: res.status, body };
}

export async function apiDeletePhoto(token: string, photoId: string) {
  const res = await fetch(`${API_BASE}/photos/${photoId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status };
}

export async function apiGetChantierHistory(token: string, chantierId: string) {
  const res = await fetch(`${API_BASE}/chantiers/${chantierId}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET history échoué (${res.status})`);
  return res.json() as Promise<
    Array<{ action: string; oldValue?: string; authorName: string }>
  >;
}

export async function apiListWorkers(token: string, includeInactive = false) {
  const query = includeInactive ? "?includeInactive=true" : "";
  const res = await fetch(`${API_BASE}/workers${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET /workers échoué (${res.status})`);
  return res.json() as Promise<
    Array<{ id: string; fullName: string; isActive: boolean }>
  >;
}

export async function apiUpdateWorker(
  token: string,
  workerId: string,
  body: Record<string, unknown>,
) {
  const res = await fetch(`${API_BASE}/workers/${workerId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

export async function waitForApiReady(
  maxAttempts = 30,
  delayMs = 1000,
): Promise<void> {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error(
    `API recette indisponible sur ${API_BASE}/health après ${maxAttempts}s`,
  );
}
