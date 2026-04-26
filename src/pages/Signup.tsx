import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import authSideImage from "@/assets/hero-highlands.jpg";
import { useAuth } from "@/context/AuthContext";
import { getStoredRef } from "@/lib/referral";
import { getFriendlyErrorMessage } from "@/lib/errors";

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordsMatch = password === confirm && confirm.length > 0;
  const passwordWeak = password.length > 0 && password.length < 8;

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordWeak || !passwordsMatch) return;
    setSubmitting(true);
    try {
      await signup(name, email, password, confirm, getStoredRef());
      setSubmitted(true);
      toast.success("Account created! Please check your email to verify.");
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-headline font-extrabold text-2xl text-primary mb-2">Check your email</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            We've sent a verification link to your email address. Click it to activate your account and start exploring.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">
            Back to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Side image (left on desktop) ── */}
      <div className="hidden lg:block relative min-h-0">
        <img
          src={authSideImage}
          alt="Ethiopian highlands landscape"
          className="h-full min-h-screen w-full object-cover"
          fetchPriority="high"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/50" />
        <div className="absolute bottom-12 left-10 right-10">
          <p className="font-headline font-bold text-xl text-white leading-snug">
            "Every journey begins with a single step into the unknown."
          </p>
        </div>
      </div>

      {/* ── Form (right on desktop) ── */}
      <div className="flex flex-col justify-center px-8 py-12 lg:px-16 bg-background">
        <Link to="/" className="font-headline text-xl font-black tracking-tighter text-primary">
          Endebeto
        </Link>

        <div className="mt-10 max-w-sm w-full">
          <h1 className="font-headline font-extrabold text-2xl text-primary mb-1">Create your account</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            Join Endebeto and start discovering unique Ethiopian experiences.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Abebe Kebede"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm border border-outline-variant/50 rounded-xl px-3 py-2.5 bg-white dark:bg-[#2d3133] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm border border-outline-variant/50 rounded-xl px-3 py-2.5 bg-white dark:bg-[#2d3133] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-sm border border-outline-variant/50 rounded-xl px-3 py-2.5 pr-10 bg-white dark:bg-[#2d3133] focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordWeak && (
                <p className="mt-1 text-[11px] text-red-500">Password must be at least 8 characters.</p>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full text-sm border rounded-xl px-3 py-2.5 pr-10 bg-white dark:bg-[#2d3133] focus:outline-none focus:ring-2 transition-all ${
                    confirm.length > 0
                      ? passwordsMatch
                        ? "border-green-400 focus:ring-green-300"
                        : "border-red-300 focus:ring-red-200"
                      : "border-outline-variant/50 focus:ring-primary/25"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirm.length > 0 && !passwordsMatch && (
                <p className="mt-1 text-[11px] text-red-500">Passwords do not match.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || passwordWeak || (confirm.length > 0 && !passwordsMatch)}
              className="w-full py-2.5 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-md shadow-primary/20 hover:scale-[0.99] active:opacity-90 transition-transform mt-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-outline-variant/40" />
            <span className="text-xs text-on-surface-variant">or continue with</span>
            <div className="h-px flex-1 bg-outline-variant/40" />
          </div>

          <div className="space-y-2.5">
            <a
              href={`${import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1"}/auth/google`}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 border border-outline-variant/50 rounded-xl text-sm font-headline font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
          </div>

          <p className="mt-7 text-center text-xs text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
