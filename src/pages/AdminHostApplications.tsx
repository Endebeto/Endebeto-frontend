import { useState } from "react";
import { FileText, X, ShieldCheck, ChevronRight, ZoomIn } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/* ─── mock data ──────────────────────────────────────────── */
type Status = "pending" | "approved" | "rejected";

interface Application {
  id: string;
  name: string;
  email: string;
  initials: string;
  types: string[];
  date: string;
  status: Status;
  region: string;
  experience: string;
  bio: string;
  languages: string[];
  specialties: string[];
  rejectionReason?: string;
}

const applications: Application[] = [
  {
    id: "1", name: "Abebe Bikila",     email: "abebe.b@heritage.et",    initials: "AB",
    types: ["Coffee Ceremony", "Hiking"],     date: "Oct 24, 2023", status: "pending",
    region: "Lalibela Region", experience: "5 Years Exp",
    bio: "Passionate guide with deep roots in the Lalibela highlands. Specializing in traditional coffee ceremonies and high-altitude hiking paths.",
    languages: ["Amharic", "English"], specialties: ["Coffee", "Trekking"],
  },
  {
    id: "2", name: "Selamawit Tadesse", email: "selam.t@culture.et",   initials: "ST",
    types: ["Loom Weaving"],                  date: "Oct 22, 2023", status: "pending",
    region: "Gonder Region", experience: "3 Years Exp",
    bio: "Traditional artisan specializing in handloom weaving techniques passed down for generations in the Gonder region.",
    languages: ["Amharic", "French"], specialties: ["Weaving", "Crafts"],
  },
  {
    id: "3", name: "Yonas Assefa",     email: "y.assefa@guide.com",    initials: "YA",
    types: ["Historical Tours", "Coffee"],    date: "Oct 21, 2023", status: "pending",
    region: "Axum Region", experience: "8 Years Exp",
    bio: "Archaeologist turned guide with extensive knowledge of Axumite civilization and ancient obelisks.",
    languages: ["Amharic", "English", "Italian"], specialties: ["History", "Coffee"],
  },
  {
    id: "4", name: "Tigist Haile",     email: "tigist.h@ethost.et",    initials: "TH",
    types: ["Culinary", "Market Tours"],      date: "Oct 18, 2023", status: "approved",
    region: "Addis Ababa", experience: "4 Years Exp",
    bio: "Professional chef sharing the secrets of Ethiopian injera and spice blends.",
    languages: ["Amharic", "English"], specialties: ["Culinary", "Culture"],
  },
  {
    id: "5", name: "Bereket Mesfin",   email: "bereket.m@safari.et",   initials: "BM",
    types: ["Wildlife", "Photography"],       date: "Oct 15, 2023", status: "rejected",
    region: "Omo Valley", experience: "2 Years Exp",
    bio: "Nature photographer who guides wildlife watching trips in the Omo Valley.",
    languages: ["Amharic"], specialties: ["Wildlife", "Photography"],
    rejectionReason: "Insufficient documentation for wildlife guide permit.",
  },
];

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
function RejectModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (reason: string) => void }) {
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
            className="px-5 py-2.5 rounded-xl font-headline font-semibold text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(`${category}${note ? ": " + note : ""}`)}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-headline font-bold text-sm shadow-md hover:opacity-90 transition-opacity"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────── */
type Tab = "pending" | "approved" | "rejected";

export default function AdminHostApplications() {
  const [activeTab, setActiveTab]     = useState<Tab>("pending");
  const [selected, setSelected]       = useState<Application | null>(applications[0]);
  const [showReject, setShowReject]   = useState(false);
  const [search, setSearch]           = useState("");
  const [statuses, setStatuses]       = useState<Record<string, Status>>(
    Object.fromEntries(applications.map((a) => [a.id, a.status]))
  );

  const counts = {
    pending:  applications.filter((a) => statuses[a.id] === "pending").length,
    approved: applications.filter((a) => statuses[a.id] === "approved").length,
    rejected: applications.filter((a) => statuses[a.id] === "rejected").length,
  };

  const filtered = applications.filter(
    (a) =>
      statuses[a.id] === activeTab &&
      (a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()))
  );

  function handleApprove() {
    if (!selected) return;
    setStatuses((s) => ({ ...s, [selected.id]: "approved" }));
    setSelected(null);
  }

  function handleReject(reason: string) {
    if (!selected) return;
    setStatuses((s) => ({ ...s, [selected.id]: "rejected" }));
    setSelected((prev) => prev ? { ...prev, rejectionReason: reason } : null);
    setShowReject(false);
    setSelected(null);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "pending",  label: `Pending (${counts.pending})`  },
    { id: "approved", label: `Approved (${counts.approved})` },
    { id: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <AdminLayout
      searchPlaceholder="Search applications..."
      searchValue={search}
      onSearch={setSearch}
    >
      {/* Canvas: table + detail panel side-by-side */}
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
              <div className="scrollbar-hide bg-white dark:bg-[#2d3133] rounded-2xl shadow-sm border border-outline-variant/10"
                   style={{ overflowX: "auto", scrollbarWidth: "none" }}>
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
                    ) : filtered.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => setSelected(app)}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === app.id
                            ? "bg-primary/5"
                            : "hover:bg-primary/3 dark:hover:bg-primary/5"
                        }`}
                      >
                        {/* Applicant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container shrink-0">
                              {app.initials}
                            </div>
                            <div>
                              <p className="font-headline font-semibold text-sm text-on-surface">{app.name}</p>
                              <p className="text-[10px] text-on-surface-variant">{app.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Types */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {app.types.map((t) => (
                              <span key={t} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold whitespace-nowrap">
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>
                        {/* Date */}
                        <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                          {app.date}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[statuses[app.id]]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[statuses[app.id]]}`} />
                            {statuses[app.id]}
                          </span>
                        </td>
                        {/* Arrow */}
                        <td className="px-5 py-4 text-right">
                          <ChevronRight className="h-4 w-4 text-on-surface-variant inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Detail panel ── */}
          {selected ? (
            <aside className="w-[420px] shrink-0 border-l border-outline-variant/15 bg-white dark:bg-[#2d3133] flex flex-col overflow-y-auto shadow-2xl">
              {/* Header row */}
              <div className="flex items-center justify-between p-5 pb-0">
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                {statuses[selected.id] === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowReject(true)}
                      className="px-4 py-2 rounded-xl bg-surface text-red-600 font-headline font-bold text-xs hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 rounded-xl bg-primary text-white font-headline font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                    >
                      Approve
                    </button>
                  </div>
                )}
                {statuses[selected.id] === "approved" && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">✓ Approved</span>
                )}
                {statuses[selected.id] === "rejected" && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full">✕ Rejected</span>
                )}
              </div>

              {/* Profile hero */}
              <div className="flex flex-col items-center pt-6 pb-6 px-6">
                <div className="w-24 h-24 rounded-2xl bg-secondary-container flex items-center justify-center font-headline font-black text-4xl text-on-secondary-container shadow-lg mb-4">
                  {selected.initials}
                </div>
                <h3 className="font-headline font-extrabold text-xl text-primary">{selected.name}</h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  <span className="text-on-tertiary-fixed-variant bg-tertiary-fixed px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    {selected.region}
                  </span>
                  <span className="text-on-secondary-container bg-secondary-container px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide">
                    {selected.experience}
                  </span>
                </div>
              </div>

              {/* Detail body */}
              <div className="px-6 pb-8 space-y-6">

                {/* Background */}
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-3">Background</p>
                  <div className="bg-surface-container-low rounded-xl p-4 space-y-4">
                    <div>
                      <p className="text-[10px] text-on-surface-variant font-medium mb-1">Bio</p>
                      <p className="text-sm leading-relaxed text-on-surface">{selected.bio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-1">Languages</p>
                        <p className="text-sm font-bold text-primary">{selected.languages.join(" · ")}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-on-surface-variant font-medium mb-1">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                          {selected.specialties.map((s) => (
                            <span key={s} className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ID verification */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest text-on-surface-variant">Identification</p>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Front Side", "Back Side"].map((label) => (
                      <div key={label} className="group relative aspect-video bg-surface-container rounded-xl overflow-hidden cursor-pointer">
                        <div className="absolute inset-0 bg-surface-container-high flex items-center justify-center">
                          <div className="text-center">
                            <FileText className="h-6 w-6 text-on-surface-variant mx-auto mb-1" />
                            <p className="text-[10px] text-on-surface-variant font-medium">ID Document</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute bottom-2 left-2 text-[9px] bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background check */}
                <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="text-sm font-headline font-bold text-primary mb-0.5">Background Check Complete</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      No red flags found in local municipal databases. References checked and validated.
                    </p>
                  </div>
                </div>

                {/* Rejection reason (if rejected) */}
                {statuses[selected.id] === "rejected" && selected.rejectionReason && (
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

      {/* ── Reject modal ── */}
      {showReject && (
        <RejectModal
          onClose={() => setShowReject(false)}
          onConfirm={handleReject}
        />
      )}
    </AdminLayout>
  );
}
