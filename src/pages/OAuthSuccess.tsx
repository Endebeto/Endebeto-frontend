import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

/**
 * Landing page for OAuth redirects.
 * Backend sets the httpOnly cookie and redirects here; we refresh /me and route home.
 */
const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    refreshUser()
      .then(() => {
        toast.success("Signed in with Google!");
        navigate("/", { replace: true });
      })
      .catch(() => {
        toast.error("Could not load your account. Please try again.");
        navigate("/login", { replace: true });
      });
  }, [navigate, refreshUser]);

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
