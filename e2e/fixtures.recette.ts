/**
 * Fixture recette MOA — stack réelle (API + JWT + PostgreSQL seedé).
 * Aucun mock API : les tests dans e2e/tests/recette/ doivent importer ce fichier.
 */
import { test as base, expect } from "@playwright/test";

export const test = base;
export { expect };
