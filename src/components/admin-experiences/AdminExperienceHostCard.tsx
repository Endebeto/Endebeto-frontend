import { Copy, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { hostInitials } from "@/components/admin-experiences/experienceAdminUtils";
import type { AdminExperience } from "@/services/admin.service";

export function AdminExperienceHostCard({ exp }: { exp: AdminExperience }) {
  const host = exp.host;
  if (!host) return null;
  const memberSince = host.createdAt
    ? new Date(host.createdAt).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : null;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied.`);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-outline-variant/20 dark:border-zinc-700 p-4 space-y-3">
      <div className="flex items-center gap-3">
        {host.photo ? (
          <img
            src={host.photo}
            alt={host.name}
            className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 dark:border-zinc-700"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/15 dark:bg-primary/30 text-primary dark:text-green-400 text-sm font-bold flex items-center justify-center">
            {hostInitials(host.name ?? "")}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-headline font-bold text-on-surface dark:text-white truncate">
            {host.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {host.hostStatus && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  host.hostStatus === "approved"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-green-400 dark:border-emerald-800"
                    : host.hostStatus === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"
                }`}
              >
                {String(host.hostStatus).charAt(0).toUpperCase() +
                  String(host.hostStatus).slice(1)}
              </span>
            )}
            {memberSince && (
              <span className="text-[11px] text-on-surface-variant dark:text-zinc-400">
                Host since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <button
          type="button"
          onClick={() => copyToClipboard(host.email, "Email")}
          className="w-full flex items-center gap-2 text-left text-xs text-on-surface-variant dark:text-zinc-300 hover:text-primary dark:hover:text-green-400 transition-colors"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{host.email}</span>
          <Copy className="h-3 w-3 opacity-50 ml-auto shrink-0" />
        </button>
        {host.phone && (
          <button
            type="button"
            onClick={() => copyToClipboard(host.phone!, "Phone")}
            className="w-full flex items-center gap-2 text-left text-xs text-on-surface-variant dark:text-zinc-300 hover:text-primary dark:hover:text-green-400 transition-colors"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{host.phone}</span>
            <Copy className="h-3 w-3 opacity-50 ml-auto shrink-0" />
          </button>
        )}
      </div>

      {host.hostStory && (
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed line-clamp-3 border-t border-outline-variant/10 dark:border-zinc-700 pt-3">
          {host.hostStory}
        </p>
      )}
    </div>
  );
}
