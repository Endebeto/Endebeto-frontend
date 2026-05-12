import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import { ExperienceCatalogRow } from "@/components/admin-experiences/ExperienceCatalogRow";
import {
  CATALOG_TAB_ITEMS,
  TAB_LABEL,
  type TabKey,
} from "@/components/admin-experiences/experienceAdminUtils";
import type { AdminExperience } from "@/services/admin.service";

export function ExperienceCatalogSidebar({
  tab,
  onTabChange,
  experiences,
  isLoading,
  isError,
  search,
  selected,
  onSelectToggle,
  catalogTotal,
  catalogPages,
  catalogPage,
  onPageChange,
}: {
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  experiences: AdminExperience[];
  isLoading: boolean;
  isError: boolean;
  search: string;
  selected: AdminExperience | null;
  onSelectToggle: (exp: AdminExperience) => void;
  catalogTotal: number;
  catalogPages: number;
  catalogPage: number;
  onPageChange: (p: number | ((prev: number) => number)) => void;
}) {
  const emptyLabel = TAB_LABEL[tab].toLowerCase();

  return (
    <div
      className={`flex flex-col border-r border-outline-variant/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all duration-200 ${
        selected ? "w-[400px] shrink-0" : "flex-1"
      }`}
    >
      <div className="shrink-0 px-5 pt-5 pb-0">
        <div className="mb-4">
          <h1 className="font-headline font-extrabold text-lg text-on-surface dark:text-white">
            Experience Management
          </h1>
          <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5">
            Live and suspended listings are approved experiences. Suspend to hide
            a listing from guests until issues are resolved.
          </p>
        </div>

        <div className="flex gap-1 border-b border-outline-variant/10 dark:border-zinc-700 overflow-x-auto">
          {CATALOG_TAB_ITEMS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors shrink-0 ${
                tab === t.key
                  ? "text-primary dark:text-green-400"
                  : "text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
              }`}
            >
              {t.label}
              {tab === t.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-green-400 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 py-16 text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Failed to load experiences.</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-surface dark:bg-zinc-800 flex items-center justify-center mb-3">
              <Eye className="h-5 w-5 text-on-surface-variant dark:text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-on-surface dark:text-white mb-1">
              No {emptyLabel} listings
            </p>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400">
              {search.trim()
                ? "Try a different search."
                : "Nothing in this tab yet."}
            </p>
          </div>
        ) : (
          experiences.map((exp) => {
            const isSelected = selected?._id === exp._id;
            return (
              <ExperienceCatalogRow
                key={exp._id}
                exp={exp}
                tab={tab}
                isSelected={isSelected}
                onToggle={() => onSelectToggle(exp)}
              />
            );
          })
        )}
      </div>

      {catalogTotal > 0 && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-t border-outline-variant/10 dark:border-zinc-700 text-xs text-on-surface-variant dark:text-zinc-400">
          <span>
            {catalogTotal} listing{catalogTotal === 1 ? "" : "s"}
            {catalogPages > 1 && ` · Page ${catalogPage} of ${catalogPages}`}
          </span>
          {catalogPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={catalogPage <= 1 || isLoading}
                onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-outline-variant/20 disabled:opacity-40 hover:bg-surface dark:hover:bg-zinc-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={catalogPage >= catalogPages || isLoading}
                onClick={() =>
                  onPageChange((p) => Math.min(catalogPages, p + 1))
                }
                className="p-1.5 rounded-lg border border-outline-variant/20 disabled:opacity-40 hover:bg-surface dark:hover:bg-zinc-800"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
