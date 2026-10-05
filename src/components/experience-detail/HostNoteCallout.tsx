import { useState, useMemo } from "react";
import { Megaphone, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  sanitizeAnnouncementMessage,
  normalizeAnnouncementSubject,
} from "@/components/experience-detail/experienceDetailUtils";

interface HostNoteCalloutProps {
  experienceId: string;
  announcement?: {
    subject?: string;
    message?: string;
    sentAt?: string;
  };
  className?: string;
}

export function HostNoteCallout({
  experienceId,
  announcement,
  className = "",
}: HostNoteCalloutProps) {
  const version = announcement?.sentAt || announcement?.subject || "latest";
  const storageKey = useMemo(() => {
    return `endebeto_dismissed_host_note_${experienceId}_${version}`;
  }, [experienceId, version]);

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  const [isExpanded, setIsExpanded] = useState(false);

  if (!announcement?.subject && !announcement?.message) return null;
  if (isDismissed) return null;

  const subject = normalizeAnnouncementSubject(announcement.subject);
  const message = sanitizeAnnouncementMessage(announcement.message);
  const formattedDate = announcement.sentAt
    ? new Date(announcement.sentAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(storageKey, "true");
    } catch {
      // Ignore localStorage write failure in private browsing mode
    }
  };

  const isLongMessage = message.length > 160 || message.includes("\n");

  return (
    <div
      role="region"
      aria-label="Host announcement"
      className={`relative rounded-2xl border border-amber-500/25 bg-amber-500/10 dark:bg-amber-950/25 p-4 sm:p-5 shadow-sm text-left backdrop-blur-sm transition-all duration-300 animate-in fade-in-50 ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Megaphone icon pill */}
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Megaphone className="h-4 w-4" aria-hidden="true" />
        </div>

        {/* Content area */}
        <div className="min-w-0 flex-1 pr-6">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">
              Host Note
            </span>
            {formattedDate && (
              <span className="text-[11px] text-amber-800/70 dark:text-amber-300/60 font-medium">
                {formattedDate}
              </span>
            )}
          </div>

          <h3 className="font-headline font-bold text-sm text-amber-950 dark:text-amber-100 mb-1 leading-snug">
            {subject}
          </h3>

          <p
            className={`text-xs text-amber-900/90 dark:text-amber-200/90 whitespace-pre-wrap leading-relaxed ${
              !isExpanded && isLongMessage ? "line-clamp-2" : ""
            }`}
          >
            {message}
          </p>

          {isLongMessage && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Read full note <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Dismiss (X) button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss host note (won't show again)"
          title="Dismiss host note"
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-amber-800/60 hover:text-amber-900 dark:text-amber-300/60 dark:hover:text-amber-100 hover:bg-amber-500/20 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
