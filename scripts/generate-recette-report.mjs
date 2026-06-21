#!/usr/bin/env node
/**
 * Génère docs/rapports/recette-auto/recette-auto-YYYY-MM-DD.md
 * à partir de e2e/recette-results.json (Playwright JSON reporter).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const resultsPath = path.join(root, "e2e", "recette-results.json");
const outDir = path.join(root, "docs", "rapports", "recette-auto");
const date = new Date().toISOString().slice(0, 10);
const outFile = path.join(outDir, `recette-auto-${date}.md`);

if (!fs.existsSync(resultsPath)) {
  console.warn("[recette-report] Fichier absent :", resultsPath);
  process.exit(0);
}

const raw = JSON.parse(fs.readFileSync(resultsPath, "utf8"));
const suites = raw.suites ?? [];
const rows = [];

function walkSuites(suite, filePrefix = "") {
  const file = suite.file ?? filePrefix;
  for (const spec of suite.specs ?? []) {
    const recMatch = spec.title.match(/@(REC[-\w]+)/);
    const recId = recMatch ? recMatch[1] : "—";
    const testResults = spec.tests?.[0]?.results ?? [];
    const last = testResults[testResults.length - 1];
    const status = last?.status ?? "unknown";
    const passed = status === "passed";
    rows.push({
      recId,
      title: spec.title,
      file: file.replace(/^.*\/e2e\//, "e2e/"),
      status,
      passed,
      durationMs: last?.duration ?? 0,
    });
  }
  for (const child of suite.suites ?? []) {
    walkSuites(child, file || filePrefix);
  }
}

for (const suite of suites) {
  walkSuites(suite);
}

const passed = rows.filter((r) => r.passed).length;
const failed = rows.filter((r) => !r.passed && r.status !== "skipped").length;
const skipped = rows.filter((r) => r.status === "skipped").length;
const total = rows.length;

const traceDir = path.join(root, "e2e", "playwright-report-recette");
const hasHtmlReport = fs.existsSync(traceDir);

let md = `# Rapport recette automatisée — ${date}

**Généré par :** \`scripts/generate-recette-report.mjs\`  
**Source :** \`e2e/recette-results.json\`  
**Stack :** API réelle + PostgreSQL seedé + JWT (aucun mock)

---

## Synthèse

| Indicateur | Valeur |
|------------|--------|
| Scénarios exécutés | ${total} |
| Passés | ${passed} |
| Échoués | ${failed} |
| Ignorés | ${skipped} |
| Taux de succès | ${total ? Math.round((passed / total) * 100) : 0} % |

---

## Détail par scénario

| ID REC | Statut | Durée (ms) | Fichier test | Titre |
|--------|--------|------------|--------------|-------|
`;

for (const row of rows) {
  const icon = row.passed ? "✅" : row.status === "skipped" ? "⏭" : "❌";
  md += `| ${row.recId} | ${icon} ${row.status} | ${Math.round(row.durationMs)} | \`${row.file}\` | ${row.title.replace(/\|/g, "\\|")} |\n`;
}

md += `
---

## Artefacts

`;

if (hasHtmlReport) {
  md += `- Rapport HTML Playwright : \`e2e/playwright-report-recette/index.html\`\n`;
}
md += `- Traces / captures : générées en cas d'échec (\`e2e/test-results/\`)\n`;

md += `
---

## Limites (validation MOA manuelle requise)

Les scénarios ci-dessus couvrent les **contrôles factuels** uniquement.  
La signature MOA reste obligatoire pour : libellés métier, confort UX, acceptation breaking change budget, décision GO/NO GO.

Voir : \`docs/33-Cahier-Recette-MOA-Manuelle.md\` · matrice : \`docs/31-Matrice-Automatisation-Recette.md\`

---

*Rapport recette automatisée — Chantiers360*
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, md, "utf8");
console.log("[recette-report] Écrit :", outFile);
