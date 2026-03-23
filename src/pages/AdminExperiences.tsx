import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, MapPin, Users, Timer,
  Star, DollarSign, ImageIcon, Eye, X, ChevronRight,
  AlertTriangle, Calendar,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

/* ─── types ──────────────────────────────────────────── */
type ExpStatus = "pending" | "approved" | "rejected";
type TabKey = "pending" | "approved" | "rejected";

interface Experience {
  id: string;
  title: string;
  slug: string;
  hostName: string;
  hostInitials: string;
  hostEmail: string;
  location: string;
  price: number;
  duration: string;
  maxGuests: number;
  nextOccurrenceAt: string;
  submittedAt: string;
  status: ExpStatus;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  ratingsAverage: number;
  ratingsQuantity: number;
  rejectionReason?: string;
}

/* ─── mock data ──────────────────────────────────────── */
const MOCK_EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "Lalibela Rock-Hewn Church Walk",
    slug: "lalibela-rock-hewn-church-walk",
    hostName: "Abebe Bikila", hostInitials: "AB", hostEmail: "abebe@heritage.et",
    location: "Lalibela, Amhara",
    price: 850, duration: "4 hours", maxGuests: 8,
    nextOccurrenceAt: "Mar 15, 2026", submittedAt: "Feb 20, 2026",
    status: "pending",
    summary: "A guided walk through the ancient rock-hewn churches of Lalibela, a UNESCO World Heritage Site.",
    description: "Discover the remarkable rock-hewn churches carved directly into the volcanic rock of Lalibela. This guided walk covers all 11 churches across two groups, with stories about their history, architecture, and spiritual significance. Light breakfast included.",
    imageCover: "/imgs/hero-1.jpg",
    images: ["/imgs/hero-2.jpg", "/imgs/hero-3.jpg"],
    ratingsAverage: 0, ratingsQuantity: 0,
  },
  {
    id: "2",
    title: "Traditional Ethiopian Coffee Ceremony",
    slug: "traditional-coffee-ceremony",
    hostName: "Selamawit Tadesse", hostInitials: "ST", hostEmail: "selam@culture.et",
    location: "Gondar, Amhara",
    price: 350, duration: "2 hours", maxGuests: 6,
    nextOccurrenceAt: "Mar 10, 2026", submittedAt: "Feb 18, 2026",
    status: "pending",
    summary: "Experience the full Ethiopian coffee ceremony — from roasting green beans to sharing three rounds of coffee with locals.",
    description: "Join Selamawit in her family home for an authentic Ethiopian coffee ceremony. You'll roast raw green coffee beans over an open flame, grind them in a traditional mortar, brew three rounds of coffee, and learn about the cultural significance of each round. Snacks included.",
    imageCover: "/imgs/hero-2.jpg",
    images: ["/imgs/hero-1.jpg"],
    ratingsAverage: 0, ratingsQuantity: 0,
  },
  {
    id: "3",
    title: "Simien Mountains Sunrise Trek",
    slug: "simien-mountains-sunrise-trek",
    hostName: "Dawit Mengistu", hostInitials: "DM", hostEmail: "dawit@trek.et",
    location: "Simien Mountains, Amhara",
    price: 1200, duration: "6 hours", maxGuests: 10,
    nextOccurrenceAt: "Mar 22, 2026", submittedAt: "Feb 15, 2026",
    status: "pending",
    summary: "A breathtaking sunrise trek in the Simien Mountains with dramatic gorge views and Gelada baboon sightings.",
    description: "Start before dawn and hike to a dramatic escarpment viewpoint just as the sun rises over the Simien highlands. Your guide will share ecology and conservation insights. Spot Gelada baboons, Walia ibex, and Ethiopian wolves in their natural habitat. Packed lunch and hot tea included.",
    imageCover: "/imgs/hero-3.jpg",
    images: ["/imgs/hero-1.jpg", "/imgs/hero-2.jpg"],
    ratingsAverage: 0, ratingsQuantity: 0,
  },
  {
    id: "4",
    title: "Addis Ababa Street Food Safari",
    slug: "addis-ababa-street-food-safari",
    hostName: "Tigist Haile", hostInitials: "TH", hostEmail: "tigist@foodie.et",
    location: "Addis Ababa",
    price: 600, duration: "3 hours", maxGuests: 12,
    nextOccurrenceAt: "Mar 8, 2026", submittedAt: "Jan 30, 2026",
    status: "approved",
    summary: "A guided walk through Addis Ababa's most vibrant street food spots — injera, tibs, kitfo, and more.",
    description: "Explore the culinary soul of Addis Ababa on foot. Visit five street food stops, taste classic Ethiopian dishes, and learn about the ingredients and traditions behind each one. The route covers Merkato, Piazza, and the Churchill Avenue corridor.",
    imageCover: "/imgs/hero-1.jpg",
    images: [],
    ratingsAverage: 4.8, ratingsQuantity: 24,
  },
  {
    id: "5",
    title: "Omo Valley Cultural Immersion",
    slug: "omo-valley-cultural-immersion",
    hostName: "Yonas Assefa", hostInitials: "YA", hostEmail: "yonas@omo.et",
    location: "Omo Valley, SNNPR",
    price: 2500, duration: "Full day", maxGuests: 6,
    nextOccurrenceAt: "Apr 1, 2026", submittedAt: "Jan 20, 2026",
    status: "approved",
    summary: "A full-day immersion into the cultures of the Mursi, Karo, and Hamar tribes of the Omo Valley.",
    description: "Travel with Yonas deep into the Omo Valley to visit tribal villages, witness traditional ceremonies, and learn the histories and customs of some of Ethiopia's most distinctive ethnic groups. Responsible tourism guidelines strictly followed.",
    imageCover: "/imgs/hero-2.jpg",
    images: ["/imgs/hero-3.jpg"],
    ratingsAverage: 4.9, ratingsQuantity: 38,
  },
  {
    id: "6",
    title: "Danakil Depression Geology Walk",
    slug: "danakil-depression-geology",
    hostName: "Bereket Mesfin", hostInitials: "BM", hostEmail: "bereket@safari.et",
    location: "Danakil, Afar",
    price: 3200, duration: "Full day", maxGuests: 8,
    nextOccurrenceAt: "Apr 5, 2026", submittedAt: "Feb 5, 2026",
    status: "rejected",
    rejectionReason: "The listing lacks adequate safety protocols for an extreme-environment tour. Please provide a detailed safety plan, emergency contacts, and proof of liability insurance before resubmitting.",
    summary: "A guided walk across the Danakil Depression — one of Earth's hottest and most otherworldly landscapes.",
    description: "Explore sulphur springs, salt flats, lava lakes, and mineral-coloured hydrothermal fields in the Danakil Depression. Bereket will explain the geology, ecology, and local Afar culture of this alien landscape.",
    imageCover: "/imgs/hero-3.jpg",
    images: [],
    ratingsAverage: 0, ratingsQuantity: 0,
  },
];

/* ─── reject modal ────────────────────────────────────── */
function RejectModal({
  exp,
  onConfirm,
  onClose,
}: {
  exp: Experience;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-outline-variant/20 dark:border-zinc-700 w-full max-w-md">
        <div className="flex items-start gap-3 p-6 border-b border-outline-variant/10 dark:border-zinc-700">
          <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-base text-on-surface dark:text-white">Reject Experience</h3>
            <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 leading-relaxed">
              You are rejecting <strong className="text-on-surface dark:text-white">"{exp.title}"</strong>. The host will be notified with your reason.
            </p>
          </div>
        </div>
        <div className="p-6">
          <label className="block text-xs font-semibold text-on-surface dark:text-white mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain clearly what needs to be improved or why this experience cannot be approved…"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 bg-surface dark:bg-zinc-800 text-on-surface dark:text-white text-sm resize-none outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all"
          />
          <p className="text-[11px] text-on-surface-variant dark:text-zinc-500 mt-1">{reason.length} characters</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white text-sm font-medium hover:bg-surface dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!reason.trim()}
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Reject Experience
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── detail panel ────────────────────────────────────── */
function DetailPanel({
  exp,
  onApprove,
  onReject,
  onClose,
}: {
  exp: Experience;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  const statusBadge: Record<ExpStatus, string> = {
    pending:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-headline font-bold text-sm text-on-surface dark:text-white">Experience Detail</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-surface dark:hover:bg-zinc-800 text-on-surface-variant transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* scrollable body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* cover image */}
        <div className="relative rounded-xl overflow-hidden aspect-video bg-surface-container dark:bg-zinc-800">
          <img
            src={exp.imageCover}
            alt={exp.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <span className={`absolute top-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadge[exp.status]}`}>
            {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
          </span>
        </div>

        {/* gallery strip */}
        {exp.images.length > 0 && (
          <div className="flex gap-2">
            {exp.images.map((img, i) => (
              <div key={i} className="w-16 h-12 rounded-lg overflow-hidden border border-outline-variant/20 dark:border-zinc-700 shrink-0">
                <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            ))}
            {exp.images.length === 0 && (
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant dark:text-zinc-500">
                <ImageIcon className="h-3.5 w-3.5" /> No additional images
              </div>
            )}
          </div>
        )}

        {/* title + host */}
        <div>
          <h2 className="font-headline font-extrabold text-lg text-on-surface dark:text-white leading-tight mb-1">
            {exp.title}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 dark:bg-primary/30 text-primary dark:text-green-300 text-[10px] font-bold flex items-center justify-center">
              {exp.hostInitials}
            </div>
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">
              by <strong className="text-on-surface dark:text-white">{exp.hostName}</strong>
              <span className="mx-1">·</span>
              {exp.hostEmail}
            </span>
          </div>
        </div>

        {/* specs bento */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { icon: MapPin,       label: "Location",   value: exp.location },
            { icon: DollarSign,   label: "Price",      value: `ETB ${exp.price.toLocaleString()}` },
            { icon: Timer,        label: "Duration",   value: exp.duration },
            { icon: Users,        label: "Max Guests", value: `${exp.maxGuests} people` },
            { icon: Calendar,     label: "Next Date",  value: exp.nextOccurrenceAt },
            { icon: Clock,        label: "Submitted",  value: exp.submittedAt },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface dark:bg-zinc-800 rounded-xl p-3 border border-outline-variant/20 dark:border-zinc-700 flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                <s.icon className="h-3.5 w-3.5 text-primary dark:text-green-400" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-xs font-semibold text-on-surface dark:text-white mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ratings (if any) */}
        {exp.ratingsQuantity > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(exp.ratingsAverage) ? "fill-amber-400 text-amber-400" : "text-outline-variant dark:text-zinc-600"}`} />
              ))}
            </div>
            <span className="text-xs font-semibold text-on-surface dark:text-white">{exp.ratingsAverage.toFixed(1)}</span>
            <span className="text-xs text-on-surface-variant dark:text-zinc-400">({exp.ratingsQuantity} reviews)</span>
          </div>
        )}

        {/* summary */}
        <div>
          <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">Summary</p>
          <p className="text-sm text-on-surface dark:text-zinc-200 leading-relaxed">{exp.summary}</p>
        </div>

        {/* description */}
        <div>
          <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide mb-1.5">Full Description</p>
          <p className="text-sm text-on-surface-variant dark:text-zinc-300 leading-relaxed">{exp.description}</p>
        </div>

        {/* rejection reason (if rejected) */}
        {exp.status === "rejected" && exp.rejectionReason && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-xl p-4">
            <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{exp.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* action footer (only for pending) */}
      {exp.status === "pending" && (
        <div className="shrink-0 p-5 border-t border-outline-variant/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── main component ──────────────────────────────────── */
export default function AdminExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>(MOCK_EXPERIENCES);
  const [tab, setTab] = useState<TabKey>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Experience | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Experience | null>(null);

  const tabCounts = {
    pending:  experiences.filter((e) => e.status === "pending").length,
    approved: experiences.filter((e) => e.status === "approved").length,
    rejected: experiences.filter((e) => e.status === "rejected").length,
  };

  const filtered = experiences.filter((e) => {
    const matchTab = e.status === tab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.hostName.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleApprove = (id: string) => {
    setExperiences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "approved" } : e))
    );
    setSelected((prev) => (prev?.id === id ? { ...prev, status: "approved" } : prev));
  };

  const handleReject = (id: string, reason: string) => {
    setExperiences((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: "rejected", rejectionReason: reason } : e
      )
    );
    setSelected((prev) =>
      prev?.id === id ? { ...prev, status: "rejected", rejectionReason: reason } : prev
    );
    setRejectTarget(null);
  };

  const statusBadge: Record<ExpStatus, string> = {
    pending:  "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending",  label: "Pending Approval" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <AdminLayout
      searchPlaceholder="Search experiences, hosts, locations…"
      searchValue={search}
      onSearch={(v) => { setSearch(v); setSelected(null); }}
    >
      {/* reject modal */}
      {rejectTarget && (
        <RejectModal
          exp={rejectTarget}
          onConfirm={(reason) => handleReject(rejectTarget.id, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: list panel ── */}
        <div className={`flex flex-col border-r border-outline-variant/10 dark:border-zinc-700 bg-white dark:bg-zinc-900 transition-all duration-200 ${selected ? "w-[400px] shrink-0" : "flex-1"}`}>

          {/* panel header */}
          <div className="shrink-0 px-5 pt-5 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-headline font-extrabold text-lg text-on-surface dark:text-white">Experience Management</h1>
                <p className="text-xs text-on-surface-variant dark:text-zinc-400">Review, approve and manage listed experiences</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-headline font-black text-primary dark:text-green-400">{tabCounts.pending}</p>
                <p className="text-[10px] text-on-surface-variant dark:text-zinc-400 uppercase tracking-wide">Pending</p>
              </div>
            </div>

            {/* tabs */}
            <div className="flex gap-1 border-b border-outline-variant/10 dark:border-zinc-700">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setSelected(null); }}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors ${
                    tab === t.key
                      ? "text-primary dark:text-green-400"
                      : "text-on-surface-variant dark:text-zinc-400 hover:text-on-surface dark:hover:text-white"
                  }`}
                >
                  {t.label}
                  {tabCounts[t.key] > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab === t.key
                        ? "bg-primary/15 text-primary dark:bg-green-400/15 dark:text-green-400"
                        : "bg-outline-variant/20 text-on-surface-variant dark:bg-zinc-700 dark:text-zinc-400"
                    }`}>
                      {tabCounts[t.key]}
                    </span>
                  )}
                  {tab === t.key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-green-400 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-surface dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-on-surface-variant dark:text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-on-surface dark:text-white mb-1">No {tab} experiences</p>
                <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                  {search ? "Try a different search query" : `No experiences with "${tab}" status`}
                </p>
              </div>
            ) : (
              filtered.map((exp) => {
                const isSelected = selected?.id === exp.id;
                return (
                  <button
                    key={exp.id}
                    onClick={() => setSelected(isSelected ? null : exp)}
                    className={`w-full text-left rounded-xl border transition-all duration-150 overflow-hidden group ${
                      isSelected
                        ? "border-primary/30 dark:border-green-400/30 bg-primary/5 dark:bg-primary/10 shadow-sm"
                        : "border-outline-variant/20 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-primary/20 dark:hover:border-zinc-500 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex gap-0">
                      {/* cover strip */}
                      <div className="w-24 shrink-0 relative bg-surface-container dark:bg-zinc-800">
                        <img
                          src={exp.imageCover}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>

                      {/* content */}
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-headline font-semibold text-on-surface dark:text-white leading-tight line-clamp-2 flex-1">
                            {exp.title}
                          </p>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge[exp.status]}`}>
                            {exp.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="w-4 h-4 rounded-full bg-primary/15 text-primary text-[8px] font-bold flex items-center justify-center shrink-0">
                            {exp.hostInitials}
                          </div>
                          <span className="text-[11px] text-on-surface-variant dark:text-zinc-400 truncate">{exp.hostName}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
                            <MapPin className="h-3 w-3" />{exp.location}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
                            <DollarSign className="h-3 w-3" />ETB {exp.price.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-on-surface-variant dark:text-zinc-400">
                            <Timer className="h-3 w-3" />{exp.duration}
                          </span>
                        </div>
                      </div>

                      {/* chevron */}
                      <div className="flex items-center pr-3">
                        <ChevronRight className={`h-4 w-4 transition-all ${isSelected ? "text-primary dark:text-green-400 translate-x-0.5" : "text-outline-variant dark:text-zinc-600"}`} />
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: detail panel ── */}
        {selected && (
          <div className="flex-1 bg-surface dark:bg-zinc-950 overflow-hidden flex flex-col">
            <DetailPanel
              exp={selected}
              onApprove={() => handleApprove(selected.id)}
              onReject={() => setRejectTarget(selected)}
              onClose={() => setSelected(null)}
            />
          </div>
        )}

        {/* empty state when no selection */}
        {!selected && (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-surface dark:bg-zinc-950">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-800 border border-outline-variant/20 dark:border-zinc-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Eye className="h-6 w-6 text-on-surface-variant dark:text-zinc-500" />
              </div>
              <p className="font-headline font-bold text-sm text-on-surface dark:text-white mb-1">Select an experience</p>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400">Click any row to view its full details and take action</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
