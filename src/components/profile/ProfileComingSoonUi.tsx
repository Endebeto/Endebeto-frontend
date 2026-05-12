/** Non-interactive toggle preview for “coming soon” sections */
export function ProfileToggleDisabled({ checked = false }: { checked?: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full pointer-events-none opacity-45 ${
        checked ? "bg-primary/60" : "bg-surface-container"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white/90 shadow mt-0.5 transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}

import { Sparkles } from "lucide-react";

export function ProfileComingSoonBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border border-amber-200/90 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/35 px-3.5 py-2.5 ${className}`}
    >
      <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs font-headline font-bold text-amber-950 dark:text-amber-100">
          Coming soon
        </p>
        <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-snug mt-0.5">
          This feature isn&apos;t wired up yet. Settings here are disabled until we
          ship it.
        </p>
      </div>
    </div>
  );
}
