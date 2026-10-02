import { ChevronRight, Download, ShieldOff } from "lucide-react";
import {
  STATUS_TABS,
  type StatusFilter,
} from "@/components/admin-users/adminUsersUtils";
import type { AdminUser } from "@/services/admin.service";
import { exportUsersCsv } from "@/lib/csvExport";
import { toast } from "sonner";

export function AdminUsersPageHeader({
  statusFilter,
  onStatusChange,
  users,
}: {
  statusFilter: StatusFilter;
  onStatusChange: (k: StatusFilter) => void;
  users?: AdminUser[];
}) {
  const handleExport = () => {
    if (!users || users.length === 0) {
      toast.error("No users available to export");
      return;
    }
    exportUsersCsv(users, `users-${statusFilter}`);
    toast.success(`Exported ${users.length} users to CSV`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-1.5">
            <span>Admin</span>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-primary">Users Management</span>
          </nav>
          <h2 className="font-headline font-extrabold text-3xl text-primary tracking-tight">
            User Directory
          </h2>
          <p className="text-on-surface-variant text-sm mt-0.5">
            Manage platform users, roles, and host approval status.
          </p>
        </div>

        <button
          type="button"
          disabled={!users || users.length === 0}
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#2d3133] border border-outline-variant/20 hover:border-primary/40 text-xs font-semibold text-primary shadow-sm hover:shadow transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
          title="Export current users list to CSV"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onStatusChange(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === key
                ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {key === "suspended" && <ShieldOff className="h-3.5 w-3.5" />}
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
