import { useId, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Lock, Mail, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { experiencesService } from "@/services/experiences.service";
import { useAuth } from "@/context/AuthContext";
import { useModalA11y } from "@/hooks/useModalA11y";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── helpers ─────────────────────────────────────────────── */

export function buildWaLink(phone: string | null | undefined, experienceTitle: string) {
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

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

/* ─── ContactHostButton ───────────────────────────────────── */

export interface ContactHostButtonProps {
  experienceId: string;
  /** Public host fields only — email/phone are fetched for booked guests (P1-6). */
  host: { name?: string; hostStory?: string } | undefined;
  experienceTitle: string;
  booked: boolean;
  compact?: boolean;
}

const pill = (compact: boolean) =>
  compact ? "text-xs px-4 py-1.5 rounded-full" : "text-xs px-3 py-1.5 rounded-lg";

export function ContactHostButton({
  experienceId,
  host,
  experienceTitle,
  booked,
  compact = false,
}: ContactHostButtonProps) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const firstName = host?.name?.split(" ")[0] ?? "the host";

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname }}
        className={`flex items-center gap-1.5 font-bold text-primary dark:text-green-400 border border-primary/40 dark:border-green-400/40 hover:bg-primary/5 transition-colors ${pill(compact)}`}
      >
        <Lock className="h-3.5 w-3.5" />
        Log in to contact
      </Link>
    );
  }

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={`flex items-center gap-1.5 font-bold text-primary dark:text-green-400 border border-primary/40 dark:border-green-400/40 hover:bg-primary/5 transition-colors ${pill(compact)}`}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      {booked ? "Contact Host" : "Message Host"}
    </button>
  );

  return (
    <div className="relative">
      {trigger}
      {open &&
        (booked ? (
          <BookedContactPanel
            experienceId={experienceId}
            experienceTitle={experienceTitle}
            firstName={firstName}
            compact={compact}
            onClose={() => setOpen(false)}
          />
        ) : (
          <MessageHostDialog
            experienceId={experienceId}
            experienceTitle={experienceTitle}
            firstName={firstName}
            onClose={() => setOpen(false)}
          />
        ))}
    </div>
  );
}

/* ─── booked guests: real contact details ─────────────────── */

function BookedContactPanel({
  experienceId,
  experienceTitle,
  firstName,
  compact,
  onClose,
}: {
  experienceId: string;
  experienceTitle: string;
  firstName: string;
  compact: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useModalA11y<HTMLDivElement>({ onClose });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["host-contact", experienceId],
    queryFn: async () => (await experiencesService.getHostContact(experienceId)).data.data.host,
    staleTime: 5 * 60_000,
  });

  const waLink = buildWaLink(data?.phone, experienceTitle);
  const mailtoLink = buildMailtoLink(data?.email, experienceTitle);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 p-4 min-w-0 outline-none
          max-sm:fixed max-sm:left-4 max-sm:right-4 max-sm:top-[42%] max-sm:-translate-y-1/2 max-sm:w-auto max-sm:max-h-[min(28rem,calc(100vh-5rem))] max-sm:overflow-y-auto
          sm:w-64 sm:absolute sm:max-w-[min(16rem,calc(100vw-1.5rem))]
          ${compact ? "sm:left-0 sm:top-full sm:mt-2" : "sm:right-0 sm:top-full sm:mt-2"}`}
      >
        <p id={titleId} className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 mb-3 break-words">
          Contact {firstName} via
        </p>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-on-surface-variant py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading contact details…
          </div>
        )}
        {isError && (
          <p className="text-xs text-error py-2">Couldn&apos;t load contact details. Try again later.</p>
        )}
        {data && !waLink && !mailtoLink && (
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 italic py-2">
            The host hasn&apos;t added contact details yet.
          </p>
        )}

        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
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
            onClick={onClose}
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
  );
}

/* ─── everyone else: message through Endebeto ────────────── */

function MessageHostDialog({
  experienceId,
  experienceTitle,
  firstName,
  onClose,
}: {
  experienceId: string;
  experienceTitle: string;
  firstName: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const titleId = useId();
  const mutation = useMutation({
    mutationFn: () => experiencesService.contactHost(experienceId, message.trim()),
    onSuccess: () => {
      toast.success(`Message sent. ${firstName} will reply to your email.`);
      onClose();
    },
    onError: (err: unknown) =>
      toast.error(getFriendlyErrorMessage(err, "Couldn't send your message. Please try again.")),
  });
  const dialogRef = useModalA11y<HTMLDivElement>({ onClose, closeDisabled: mutation.isPending });
  const length = message.trim().length;
  const valid = length >= MESSAGE_MIN && length <= MESSAGE_MAX;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 p-6 outline-none"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 id={titleId} className="font-headline font-extrabold text-lg text-primary dark:text-emerald-400">
            Message {firstName}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-surface-container-low dark:hover:bg-zinc-800 text-on-surface-variant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">
          Ask about <strong>{experienceTitle}</strong>. Endebeto forwards your message, and the host
          replies to your email address.
        </p>
        <label htmlFor={`${titleId}-msg`} className="sr-only">
          Your message
        </label>
        <textarea
          id={`${titleId}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={MESSAGE_MAX}
          placeholder="e.g. Is this suitable for children? What should I bring?"
          className="w-full bg-surface-container-low dark:bg-zinc-800 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/25 resize-none"
        />
        <div className="flex items-center justify-between mt-1 mb-4 text-[11px] text-on-surface-variant">
          <span>{length < MESSAGE_MIN ? `At least ${MESSAGE_MIN} characters` : " "}</span>
          <span>
            {length}/{MESSAGE_MAX}
          </span>
        </div>
        <button
          type="button"
          disabled={!valid || mutation.isPending}
          onClick={() => mutation.mutate()}
          className="w-full py-3 rounded-xl bg-primary text-white font-headline font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send message
        </button>
      </div>
    </div>
  );
}
