import { ChevronRight, ShieldOff } from "lucide-react";
import {
  STATUS_TABS,
  type StatusFilter,
} from "@/components/admin-users/adminUsersUtils";

export function AdminUsersPageHeader({
  statusFilter,
  onStatusChange,
}: {
  statusFilter: StatusFilter;
  onStatusChange: (k: StatusFilter) => void;
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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
