import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import heroCoffee from "@/assets/hero-coffee.jpg";

/* ── password strength ──────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "",        color: "bg-outline-variant/30" },
    { label: "Weak",    color: "bg-red-500" },
    { label: "Fair",    color: "bg-amber-500" },
    { label: "Good",    color: "bg-sky-500" },
    { label: "Strong",  color: "bg-emerald-500" },
  ];
  return { score, ...map[score] };
}

export default function ResetPassword() {
  const { token }   = useParams<{ token: string }>();
  const navigate    = useNavigate();

  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [showCfm,    setShowCfm]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [error,      setError]      = useState("");

  const strength  = getStrength(password);
  const mismatch  = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && password === confirm && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;
    setError("");
    setSubmitting(true);
    try {
      const { authService } = await import("@/services/auth.service");
      await authService.resetPassword(token, { password, passwordConfirm: confirm });
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Reset link is invalid or has expired.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* ── Form side ── */}
      <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-background dark:bg-zinc-950">
        <Link to="/" className="font-headline text-xl font-black tracking-tighter text-primary dark:text-green-400">
          Endebeto
        </Link>

        <div className="mt-10 max-w-sm w-full">

          {!done ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400 mb-8 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>

              <h1 className="font-headline font-extrabold text-2xl text-primary dark:text-green-400 mb-1">
                Set a new password
              </h1>
              <p className="text-on-surface-variant dark:text-zinc-400 text-sm mb-8 leading-relaxed">
                Your new password must be at least 8 characters and different from your old one.
              </p>

              {error && (
                <div className="flex items-start gap-2.5 p-3 mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* new password */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-11 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 dark:border-zinc-600 rounded-xl text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary dark:hover:text-green-400 transition-colors"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* strength bar */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength.score ? strength.color : "bg-outline-variant/20 dark:bg-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className={`text-[11px] font-semibold ${
                          strength.score <= 1 ? "text-red-500" :
                          strength.score === 2 ? "text-amber-500" :
                          strength.score === 3 ? "text-sky-500" : "text-emerald-500"
                        }`}>
                          {strength.label} password
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* confirm password */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCfm ? "text" : "password"}
                      required
                      placeholder="Re-enter your new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={`w-full px-4 py-3 pr-11 bg-surface-container-low dark:bg-zinc-800 border rounded-xl text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 outline-none focus:ring-2 transition-all ${
                        mismatch
                          ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                          : "border-outline-variant/30 dark:border-zinc-600 focus:border-primary focus:ring-primary/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCfm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary dark:hover:text-green-400 transition-colors"
                    >
                      {showCfm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mismatch && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Passwords don't match
                    </p>
                  )}
                  {!mismatch && confirm.length > 0 && confirm === password && (
                    <p className="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Passwords match
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting…</>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              {/* token debug hint */}
              {token && (
                <p className="text-[10px] text-on-surface-variant/40 dark:text-zinc-600 mt-6 text-center break-all">
                  Token: {token.slice(0, 12)}…
                </p>
              )}
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container/50 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-8 w-8 text-primary dark:text-green-400" />
              </div>
              <h2 className="font-headline font-extrabold text-xl text-primary dark:text-green-400 mb-2">
                Password updated!
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed mb-8">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Image side ── */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src={heroCoffee}
          alt="Ethiopian highlands"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <p className="font-headline font-extrabold text-4xl text-white leading-tight mb-4 drop-shadow">
            A fresh start<br />awaits you.
          </p>
          <p className="text-white/75 text-base max-w-xs leading-relaxed">
            Choose a strong, memorable password and get back to exploring Ethiopia's hidden gems.
          </p>
        </div>
      </div>
    </div>
  );
}
