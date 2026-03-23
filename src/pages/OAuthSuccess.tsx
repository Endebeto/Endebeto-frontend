import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

/**
 * Landing page for OAuth redirects.
 * The backend redirects here as:  /oauth-success?token=<jwt>
 * We store the token, refresh the user from /me, then redirect home.
 */
const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      toast.error("Google sign-in failed. Please try again.");
      navigate("/login", { replace: true });
      return;
    }

    localStorage.setItem("token", token);

    refreshUser()
      .then(() => {
        toast.success("Signed in with Google!");
        navigate("/", { replace: true });
      })
      .catch(() => {
        localStorage.removeItem("token");
        toast.error("Could not load your account. Please try again.");
        navigate("/login", { replace: true });
      });
  }, [params, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-on-surface-variant">Signing you in…</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
