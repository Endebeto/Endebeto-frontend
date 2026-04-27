import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, X, ShieldCheck, ChevronRight, ZoomIn, Loader2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { UserAvatar } from "@/components/UserAvatar";
import { adminService, type AdminHostApplication } from "@/services/admin.service";

/* ─── status styles ──────────────────────────────────────── */
type Status = "pending" | "approved" | "rejected";

const STATUS_STYLES: Record<Status, string> = {
  pending:  "text-amber-600 bg-amber-50",
  approved: "text-emerald-700 bg-emerald-50",
  rejected: "text-red-600 bg-red-50",
};
const DOT_STYLES: Record<Status, string> = {
  pending:  "bg-amber-500",
  approved: "bg-emerald-500",
  rejected: "bg-red-500",
};

/* ─── reject modal ───────────────────────────────────────── */
function RejectModal({ onClose, onConfirm, loading }: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}) {
  const [category, setCategory] = useState("Insufficient Experience");
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#2d3133] rounded-3xl w-full max-w-lg p-8 shadow-2xl">
        <h3 className="font-headline font-extrabold text-xl text-primary mb-1">Reject Application</h3>
        <p className="text-on-surface-variant text-sm mb-6">
          Provide a reason for rejection. This will be shared with the applicant.
        </p>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
              Reason Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option>Insufficient Experience</option>
              <option>Identification Issues</option>
              <option>Invalid Credentials</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
              Internal Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Detail the reasons here..."
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl font-headline font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(`${category}${note ? ": " + note : ""}`)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── photo viewer ───────────────────────────────────────── */
function PhotoViewer({ url, label }: { url?: string; label: string }) {
  const [big, setBig] = useState(false);
  if (!url) {
    return (
      <div className="aspect-video bg-surface-container-high rounded-xl flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-6 w-6 text-on-surface-variant mx-auto mb-1" />
          <p className="text-[10px] text-on-surface-variant font-medium">No file</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div
        className="group relative aspect-video bg-surface-container rounded-xl overflow-hidden cursor-pointer"
        onClick={() => setBig(true)}
      >
        <img src={url} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="h-5 w-5 text-white" />
        </div>
        <div className="absolute bottom-2 left-2 text-[9px] bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
          {label}
        </div>
      </div>
      {big && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setBig(false)}
        >
          <img src={url} alt={label} className="max-w-full max-h-full rounded-xl" />
        </div>
      )}
    </>
  );
}

/* ─── page ──────────────────────────────────────────────── */
type Tab = "pending" | "approved" | "rejected";

export default function AdminHostApplications() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab]   = useState<Tab>("pending");
  const [selected, setSelected]     = useState<AdminHostApplication | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [search, setSearch]         = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-host-applications", activeTab],
    queryFn: () => adminService.getHostApplications({ status: activeTab }).then(r => r.data.data.applications),
    staleTime: 30_000,
  });

  const { data: counts } = useQuery({
    queryKey: ["admin-host-applications-counts"],
    queryFn: async () => {
      const [p, a, r] = await Promise.all([
        adminService.getHostApplications({ status: "pending"  }).then(r => r.data.results),
        adminService.getHostApplications({ status: "approved" }).then(r => r.data.results),
        adminService.getHostApplications({ status: "rejected" }).then(r => r.data.results),
      ]);
      return { pending: p, approved: a, rejected: r };
    },
    staleTime: 30_000,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveHostApplication(id),
    onSuccess: () => {
      toast.success("Application approved");
      qc.invalidateQueries({ queryKey: ["admin-host-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-host-applications-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setSelected(null);
    },
    onError: () => toast.error("Failed to approve application"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminService.rejectHostApplication(id, reason),
    onSuccess: () => {
      toast.success("Application rejected");
      qc.invalidateQueries({ queryKey: ["admin-host-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-host-applications-counts"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
      setShowReject(false);
      setSelected(null);
    },
    onError: () => toast.error("Failed to reject application"),
  });

  const applications = data ?? [];
  const filtered = applications.filter(a =>
    a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending",  label: `Pending (${counts?.pending  ?? "…"})` },
    { id: "approved", label: `Approved (${counts?.approved ?? "…"})` },
    { id: "rejected", label: `Rejected (${counts?.rejected ?? "…"})` },
  ];

  return (
    <AdminLayout
      searchPlaceholder="Search applications..."
      searchValue={search}
      onSearch={setSearch}
    >
      <div className="flex flex-1 overflow-hidden">

        {/* ── Table panel ── */}
        <div className="flex-1 overflow-y-auto p-6 min-w-0">
          <div className="w-full">
            <div className="mb-6">
              <h2 className="font-headline font-extrabold text-2xl text-primary tracking-tight">Host Applications</h2>
              <p className="text-on-surface-variant text-sm mt-0.5">Review and manage host applicants</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mb-5 border-b border-outline-variant/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelected(null); }}
                  className={`pb-3.5 text-sm font-headline font-semibold transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 border-primary text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-16 text-red-500">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">Failed to load applications.</p>
              </div>
            ) : (
              <div
                className="scrollbar-hide bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm border border-outline-variant/10"
                style={{ overflowX: "auto", scrollbarWidth: "none" }}
              >
                <table className="w-full min-w-[560px] text-left">
                  <thead className="bg-surface-container-low/60">
                    <tr>
                      {["Applicant", "Experience Types", "Submitted", "Status", ""].map((h, i) => (
                        <th
                          key={i}
                          className={`px-5 py-3 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 4 ? "text-right" : ""}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/8">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-on-surface-variant">
                          No {activeTab} applications found.
                        </td>
                      </tr>
                    ) : filtered.map((app) => {
                      const st = app.status as Status;
                      return (
                        <tr
                          key={app._id}
                          onClick={() => setSelected(app)}
                          className={`cursor-pointer transition-colors ${
                            selected?._id === app._id
                              ? "bg-primary/5"
                              : "hover:bg-primary/3 dark:hover:bg-primary/5"
                          }`}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar
                                name={app.user?.name ?? "User"}
                                photo={app.user?.photo}
                                className="w-9 h-9 rounded-full bg-secondary-container"
                                initialsClassName="text-xs text-on-secondary-container"
                              />
                              <div>
                                <p className="font-headline font-semibold text-sm text-on-surface">{app.user?.name}</p>
                                <p className="text-[10px] text-on-surface-variant">{app.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 flex-wrap">
                              {(app.experienceDetails?.experienceTypes ?? []).slice(0, 3).map((t) => (
                                <span key={t} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold whitespace-nowrap">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[st]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[st]}`} />
                              {st}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <ChevronRight className="h-4 w-4 text-on-surface-variant inline" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selected ? (
          <aside className="w-[420px] shrink-0 border-l border-outline-variant/15 bg-white dark:bg-[#2d3133] flex flex-col overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 pb-0">
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {selected.status === "pending" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowReject(true)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-surface text-red-600 font-headline font-bold text-xs hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => approveMutation.mutate(selected._id)}
                    disabled={approveMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-primary text-white font-headline font-bold text-xs shadow-md hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {approveMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Approve
                  </button>
                </div>
              )}
              {selected.status === "approved" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  Approved
                </span>
              )}
              {selected.status === "rejected" && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                  <X className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                  Rejected
                </span>
              )}
            </div>

            {/* Profile hero */}
            <div className="flex flex-col items-center pt-6 pb-6 px-6">
              <UserAvatar
                name={selected.user?.name ?? "User"}
                photo={selected.media?.personalPhoto}
                className="w-24 h-24 rounded-2xl bg-secondary-container shadow-lg mb-4"
                initialsClassName="text-4xl text-on-secondary-container font-black"
                imgClassName="w-full h-full object-cover"
              />
              <h3 className="font-headline font-extrabold text-xl text-primary text-center">
                {selected.personalInfo?.fullName?.trim() || selected.user?.name}
              </h3>
              {selected.personalInfo?.fullName?.trim() &&
                selected.user?.name &&
                selected.personalInfo.fullName.trim() !== selected.user.name && (
                <p className="text-[10px] text-on-surface-variant mt-0.5 text-center">
                  Account name: {selected.user.name}
                </p>
              )}
              <p className="text-xs text-on-surface-variant mt-1">{selected.user?.email}</p>
              {selected.personalInfo?.email &&
                selected.user?.email &&
                selected.personalInfo.email.toLowerCase() !== selected.user.email.toLowerCase() && (
                <p className="text-[10px] text-on-surface-variant">Form email: {selected.personalInfo.email}</p>
              )}
              {selected.submittedAt && (
                <p className="text-[10px] text-on-surface-variant mt-1">
                  Submitted {new Date(selected.submittedAt).toLocaleString()}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                {selected.personalInfo?.cityRegion && (
                  <span className="text-on-tertiary-fixed-variant bg-tertiary-fixed px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    {selected.personalInfo.cityRegion}
                  </span>
                )}
              </div>
            </div>

            {/* Detail body */}
            <div className="px-6 pb-8 space-y-6">
              {/* Contact & address (full parity with host apply form step 1) */}
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-3">Contact & location</p>
                <div className="bg-surface-container-low dark:bg-zinc-800/40 rounded-xl p-4 space-y-3 text-sm text-on-surface">
                  {selected.personalInfo?.phoneNumber ? (
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-0.5">Phone</p>
                      <p className="font-semibold tabular-nums">{selected.personalInfo.phoneNumber}</p>
                    </div>
                  ) : null}
                  {selected.personalInfo?.fullAddress?.trim() ? (
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-0.5">Full address</p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.personalInfo.fullAddress.trim()}</p>
                    </div>
                  ) : null}
                  {!selected.personalInfo?.phoneNumber && !selected.personalInfo?.fullAddress?.trim() && (
                    <p className="text-xs text-on-surface-variant">No phone or address on file.</p>
                  )}
                </div>
              </div>

              {/* Background */}
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-3">Background</p>
                <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
                  {selected.personalInfo?.aboutYou && (
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-1">About you</p>
                      <p className="text-sm leading-relaxed text-on-surface">{selected.personalInfo.aboutYou}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selected.personalInfo?.languagesSpoken?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-1">Languages</p>
                        <p className="text-sm font-bold text-primary">{selected.personalInfo!.languagesSpoken!.join(" · ")}</p>
                      </div>
                    )}
                    {(selected.experienceDetails?.specialties?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-1">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.experienceDetails!.specialties!.map((s) => (
                            <span key={s} className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {selected.experienceDetails?.experienceTypes && selected.experienceDetails.experienceTypes.length > 0 && (
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-1">Experience types</p>
                      <div className="flex flex-wrap gap-1">
                        {selected.experienceDetails.experienceTypes.map((t) => (
                          <span key={t} className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.experienceDetails?.previousExperience?.trim() ? (
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-1">Previous experience</p>
                      <p className="text-sm text-on-surface whitespace-pre-wrap">{selected.experienceDetails.previousExperience}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ID verification + portrait (matches form step 3) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant">Identification & portrait</p>
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <PhotoViewer url={selected.media?.personalPhoto} label="Profile portrait" />
                  <PhotoViewer url={selected.media?.nationalIdFront} label="ID — front" />
                  <PhotoViewer url={selected.media?.nationalIdBack} label="ID — back" />
                </div>
              </div>

              {/* Rejection reason */}
              {selected.status === "rejected" && selected.rejectionReason && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/20">
                  <p className="text-xs font-bold text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm text-on-surface-variant">{selected.rejectionReason}</p>
                </div>
              )}
            </div>
          </aside>
        ) : (
          <div className="w-[420px] shrink-0 border-l border-outline-variant/15 hidden lg:flex flex-col items-center justify-center text-center p-10 bg-surface-container-low/30">
            <FileText className="h-10 w-10 text-outline mb-4" />
            <p className="font-headline font-bold text-primary mb-1">No application selected</p>
            <p className="text-xs text-on-surface-variant">Click a row to review the applicant's details.</p>
          </div>
        )}
      </div>

      {showReject && selected && (
        <RejectModal
          onClose={() => setShowReject(false)}
          loading={rejectMutation.isPending}
          onConfirm={(reason) => rejectMutation.mutate({ id: selected._id, reason })}
        />
      )}
    </AdminLayout>
  );
}
