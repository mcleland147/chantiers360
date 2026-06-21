import { BrandHeader } from "./BrandHeader";

const workflowSteps = [
  {
    step: "01",
    label: "Préparation & Planification",
    desc: "Initialisation du chantier, définition des équipes et du budget",
  },
  {
    step: "02",
    label: "Réalisation & Suivi",
    desc: "Mises à jour d'avancement, photos de chantier et réserves",
  },
  {
    step: "03",
    label: "Réception & Clôture",
    desc: "Levée des réserves, rapport final et archivage",
  },
];

const stats = [
  { v: "12", l: "Chantiers actifs" },
  { v: "3", l: "En retard" },
  { v: "134", l: "Photos ce mois" },
];

/** Panneau gauche connexion — prototype Figma */
export function LoginBrandPanel() {
  return (
    <div className="flex h-full flex-col justify-between bg-brand p-12 text-white">
      <div>
        <BrandHeader />

        <div className="mt-16">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Pilotez vos chantiers
            <br />
            en toute clarté.
          </h1>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-white/55">
            Gestion de chantiers BTP, suivi d&apos;avancement, réserves et
            équipes — centralisés en un seul endroit.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-3">
          {workflowSteps.map((s) => (
            <div
              key={s.step}
              className="flex items-start gap-4 rounded-xl bg-white/5 p-4"
            >
              <span className="mt-0.5 font-mono text-xs font-semibold text-accent">
                {s.step}
              </span>
              <div>
                <div className="text-sm font-medium text-white">{s.label}</div>
                <div className="mt-0.5 text-xs text-white/45">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
        {stats.map((s) => (
          <div key={s.l}>
            <div className="text-3xl font-semibold text-accent">{s.v}</div>
            <div className="mt-1 text-xs text-white/45">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
