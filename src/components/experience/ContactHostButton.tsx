import { useState } from "react";
import { Lock, MessageCircle, Mail } from "lucide-react";

/* ─── helpers ─────────────────────────────────────────────── */

export function buildWaLink(phone: string | undefined, experienceTitle: string) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (digits.length < 7) return null;
  const msg = encodeURIComponent(
    `Hi! I booked your experience "${experienceTitle}" on Endebeto — I have a question.`,
  );
  return `https://wa.me/${digits}?text=${msg}`;
}

export function buildMailtoLink(email: string | undefined, experienceTitle: string) {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(`Question about: ${experienceTitle}`)}`;
}

/* ─── ContactHostButton ───────────────────────────────────── */

export interface ContactHostButtonProps {
  host: { name?: string; email?: string; phone?: string; hostStory?: string } | undefined;
  experienceTitle: string;
  booked: boolean;
  compact?: boolean;
}

export function ContactHostButton({ host, experienceTitle, booked, compact = false }: ContactHostButtonProps) {
  const [open, setOpen] = useState(false);

  const waLink     = buildWaLink(host?.phone, experienceTitle);
  const mailtoLink = buildMailtoLink(host?.email, experienceTitle);
  const hasAny     = !!(waLink || mailtoLink);

  if (!booked) {
    return (
      <button
        disabled
        title="Book this experience to contact the host"
        className={`flex items-center gap-1.5 font-bold text-on-surface-variant/50 dark:text-zinc-500 border border-outline-variant/20 dark:border-zinc-700 cursor-not-allowed ${
          compact
            ? "text-xs px-4 py-1.5 rounded-full"
            : "text-xs px-3 py-1.5 rounded-lg"
        }`}
      >
        <Lock className="h-3.5 w-3.5" />
        Book to Contact
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 font-bold text-primary dark:text-green-400 border border-primary/40 dark:border-green-400/40 hover:bg-primary/5 transition-colors ${
          compact
            ? "text-xs px-4 py-1.5 rounded-full"
            : "text-xs px-3 py-1.5 rounded-lg"
        }`}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Contact Host
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Contact host"
            className={`z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 p-4 min-w-0
              max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-[42%] max-sm:-translate-y-1/2 max-sm:w-auto max-sm:max-h-[min(28rem,calc(100vh-5rem))] max-sm:overflow-y-auto
              sm:w-64 sm:absolute sm:max-w-[min(16rem,calc(100vw-1.5rem))]
              ${compact ? "sm:left-0 sm:top-full sm:mt-2" : "sm:right-0 sm:top-full sm:mt-2"}`}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 mb-3 break-words">
              Contact {host?.name?.split(" ")[0] ?? "Host"} via
            </p>

            {!hasAny && (
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 italic py-2">
                The host hasn't added contact details yet.
              </p>
            )}

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 w-full min-w-0 p-3 rounded-xl hover:bg-[#25D366]/10 transition-colors mb-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface dark:text-white group-hover:text-[#128C7E]">WhatsApp</p>
                  <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 break-words">Opens WhatsApp with pre-filled message</p>
                </div>
              </a>
            )}

            {mailtoLink && (
              <a
                href={mailtoLink}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 w-full min-w-0 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface dark:text-white group-hover:text-primary dark:group-hover:text-green-400">Email</p>
                  <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 break-words">Opens your email client</p>
                </div>
              </a>
            )}

            <p className="text-[10px] text-on-surface-variant/60 dark:text-zinc-500 mt-3 leading-relaxed break-words">
              Contact info is only visible because you have a booking for this experience.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
