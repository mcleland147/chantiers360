import { AlertCircle, Eye, EyeOff, HardHat, Lock, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginBrandPanel } from "../components/brand/LoginBrandPanel";
import { getDefaultRouteForRole } from "../config/navigation";
import { AuthError, useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      const defaultRoute = getDefaultRouteForRole(user.role);
      navigate(from && from !== "/login" ? from : defaultRoute, {
        replace: true,
      });
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <LoginBrandPanel />
      </div>

      <div className="flex items-center justify-center bg-surface p-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
              <HardHat size={17} className="text-accent" />
            </div>
            <div className="text-sm font-semibold text-slate-900">
              Chantiers360
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Connexion</h2>
          <p className="mt-1.5 text-sm text-muted">
            Accédez à votre espace de gestion de chantiers.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-900"
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="conducteur@batinova.fr"
                  className="w-full rounded-lg border border-border bg-white py-2.5 pr-4 pl-9 text-sm transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-900"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-white py-2.5 pr-10 pl-9 text-sm transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted transition-colors hover:text-slate-900"
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  className="text-xs text-accent transition-colors hover:text-accent-hover hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-center text-[11px] text-muted">
            Comptes démo : conducteur@batinova.fr · demo123
          </p>
        </div>
      </div>
    </div>
  );
}
