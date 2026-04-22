import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { getFriendlyErrorMessage } from "@/lib/errors";

type Status = "loading" | "success" | "error";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          getFriendlyErrorMessage(err, "The verification link is invalid or has expired."),
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h1 className="font-headline font-extrabold text-2xl text-primary mb-2">
              Verifying your email…
            </h1>
            <p className="text-on-surface-variant text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1 className="font-headline font-extrabold text-2xl text-primary mb-2">
              Email verified!
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              Your account is now active. Sign in to start exploring Ethiopian
              experiences.
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary text-white text-sm font-headline font-bold px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="font-headline font-extrabold text-2xl text-primary mb-2">
              Verification failed
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
              {message}
            </p>
            <Link
              to="/signup"
              className="inline-block bg-primary text-white text-sm font-headline font-bold px-6 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
            >
              Back to Sign Up
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
