import React from "react";
import { X } from "lucide-react";

export interface AdminBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: React.ReactNode;
}

export function AdminBulkActionBar({
  selectedCount,
  onClearSelection,
  children,
}: AdminBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-primary text-white dark:bg-[#1f2325] dark:text-on-surface rounded-2xl px-5 py-3 shadow-2xl border border-primary/20 dark:border-white/10 flex items-center gap-4">
        {/* Count badge */}
        <div className="flex items-center gap-2 pr-3 border-r border-white/20 dark:border-white/10">
          <span className="w-6 h-6 rounded-full bg-white/20 dark:bg-primary/30 text-white dark:text-primary-200 text-xs font-bold flex items-center justify-center">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold whitespace-nowrap">
            {selectedCount === 1 ? "item selected" : "items selected"}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">{children}</div>

        {/* Clear selection */}
        <div className="pl-2 border-l border-white/20 dark:border-white/10">
          <button
            type="button"
            onClick={onClearSelection}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center gap-1 text-xs"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deselect</span>
          </button>
        </div>
      </div>
    </div>
  );
}
