import { Eye } from "lucide-react";

export function ExperienceSelectPlaceholder() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-center bg-surface dark:bg-zinc-950">
      <div className="text-center max-w-sm px-6">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-outline-variant/20 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Eye className="h-6 w-6 text-on-surface-variant dark:text-zinc-500" />
        </div>
        <p className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">
          Select a listing
        </p>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400">
          Click a row for details. Use Live / Expired / Suspended / Drafts tabs.
          Suspend or reinstate from the detail panel.
        </p>
      </div>
    </div>
  );
}
