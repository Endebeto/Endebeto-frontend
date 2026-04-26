import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import heroCoffee from "@/assets/hero-coffee.jpg";
import { authService } from "@/services/auth.service";

export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch {
      // Still show success to prevent email enumeration
      setSent(true);
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

          {!sent ? (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400 mb-8 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </Link>

              <h1 className="font-headline font-extrabold text-2xl text-primary dark:text-green-400 mb-1">
                Forgot your password?
              </h1>
              <p className="text-on-surface-variant dark:text-zinc-400 text-sm mb-8 leading-relaxed">
                No worries — enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface dark:text-white mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant dark:text-zinc-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 dark:border-zinc-600 rounded-xl text-sm text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!email.trim() || submitting}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-on-surface-variant dark:text-zinc-500 mt-6">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-primary dark:text-green-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-secondary-container/50 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-8 w-8 text-primary dark:text-green-400" />
              </div>
              <h2 className="font-headline font-extrabold text-xl text-primary dark:text-green-400 mb-2">
                Check your inbox
              </h2>
              <p className="text-sm text-on-surface-variant dark:text-zinc-400 leading-relaxed mb-2">
                We sent a password reset link to
              </p>
              <p className="font-semibold text-on-surface dark:text-white text-sm mb-6 break-all">{email}</p>
              <p className="text-xs text-on-surface-variant dark:text-zinc-500 mb-8 leading-relaxed">
                Didn't receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => setSent(false)}
                  className="font-semibold text-primary dark:text-green-400 hover:underline"
                >
                  try a different email
                </button>
                .
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary dark:text-green-400 hover:underline underline-offset-4"
              >
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Image side ── */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src={heroCoffee}
          alt="Ethiopian landscape"
          className="absolute inset-0 w-full h-full object-cover"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
          <p className="font-headline font-extrabold text-4xl text-white leading-tight mb-4 drop-shadow">
            Regain Access.<br />Keep Exploring.
          </p>
          <p className="text-white/75 text-base max-w-xs leading-relaxed">
            Reset your password and get back to discovering Ethiopia's most authentic experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
