import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileEdit, Banknote, ImageIcon, MapPin, Upload, X,
  CheckCircle2, Circle, Star, MessageCircle, ArrowLeft,
  ShieldCheck, Plus, Lock, AlertCircle, Save,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";
import LocationPicker, { type PinLocation } from "@/components/LocationPicker";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { experiencesService } from "@/services/experiences.service";

/* ─── types ──────────────────────────────────────────── */
interface FormData {
  title: string;
  summary: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  maxGuests: string;
  nextOccurrenceAt: string;
  location: string;
  address: string;
}

const STEPS = ["Info", "Schedule", "Media", "Location"];

/* ─── success modal ──────────────────────────────────── */
function SuccessModal({ onDashboard, onPreview }: { onDashboard: () => void; onPreview: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-2xl p-8 text-center shadow-2xl border border-outline-variant/10 dark:border-zinc-700">
        <div className="w-20 h-20 bg-secondary-container/50 dark:bg-emerald-900/40 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 mb-3">Pending Approval</h2>
        <p className="text-on-surface-variant dark:text-zinc-400 mb-8 leading-relaxed">
          Your experience has been submitted! Our editorial team will review the details and notify you within 48 hours.
        </p>
        <div className="space-y-3">
          <button
            onClick={onDashboard}
            className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={onPreview}
            className="w-full py-4 text-primary dark:text-green-400 font-bold hover:bg-surface dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            View My Experiences
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostCreateExperience() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use only the categories the host was approved to offer
  const approvedCategories = user?.approvedCategories ?? [];
  const defaultCategory = approvedCategories[0] ?? "";

  const [form, setForm] = useState<FormData>({
    title: "", summary: "", description: "", category: defaultCategory,
    price: "", duration: "", maxGuests: "", nextOccurrenceAt: "",
    location: "", address: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [pin, setPin] = useState<PinLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch existing experiences to enforce one-per-category limit.
  // Uses the same queryKey + raw queryFn as HostExperiences so the cache is shared correctly.
  const { data: myExpData } = useQuery({
    queryKey: ["my-experiences"],
    queryFn: () => experiencesService.getMyExperiences(),
    staleTime: 30_000,
  });
  const myExperiences = myExpData?.data.data.data ?? [];

  // Check if the currently selected category already has an active experience
  const categoryTaken = myExperiences.some(
    (e) => e.category === form.category && e.status !== "rejected"
  );

  const coverRef   = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const coverPreview   = coverFile   ? URL.createObjectURL(coverFile)   : null;
  const galleryPreview = galleryFiles.map((f) => URL.createObjectURL(f));

  const removeGallery = (i: number) =>
    setGalleryFiles((p) => p.filter((_, idx) => idx !== i));

  /* determine which sections have content (for step indicator) */
  const infoFilled     = !!form.title && !!form.description;
  const scheduleFilled = !!form.price && !!form.duration && !!form.nextOccurrenceAt;
  const mediaFilled    = !!coverFile;
  const locationFilled = !!form.location;
  const stepStatus     = [infoFilled, scheduleFilled, mediaFilled, locationFilled];

  const canSubmit = infoFilled && scheduleFilled && mediaFilled && locationFilled;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || categoryTaken) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("summary", form.summary);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("maxGuests", form.maxGuests);
      fd.append("nextOccurrenceAt", form.nextOccurrenceAt);
      fd.append("location", form.location);
      if (form.address) fd.append("address", form.address);
      if (pin?.lat) fd.append("latitude", String(pin.lat));
      if (pin?.lng) fd.append("longitude", String(pin.lng));
      if (coverFile) fd.append("imageCover", coverFile);
      galleryFiles.forEach((f) => fd.append("images", f));

      await experiencesService.create(fd);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit experience. Please try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /** Save the current form as a draft — only title + category required. */
  const handleSaveDraft = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter at least a title before saving a draft.");
      return;
    }
    setSavingDraft(true);
    try {
      const fd = new FormData();
      fd.append("status", "draft");
      fd.append("title", form.title);
      fd.append("category", form.category);
      if (form.summary.trim())       fd.append("summary", form.summary);
      if (form.description.trim())   fd.append("description", form.description);
      if (form.price)                fd.append("price", form.price);
      if (form.duration.trim())      fd.append("duration", form.duration);
      if (form.maxGuests)            fd.append("maxGuests", form.maxGuests);
      if (form.nextOccurrenceAt)     fd.append("nextOccurrenceAt", form.nextOccurrenceAt);
      if (form.location.trim())      fd.append("location", form.location);
      if (form.address.trim())       fd.append("address", form.address);
      if (pin?.lat)                  fd.append("latitude", String(pin.lat));
      if (pin?.lng)                  fd.append("longitude", String(pin.lng));
      if (coverFile)                 fd.append("imageCover", coverFile);
      galleryFiles.forEach((f) =>    fd.append("images", f));

      await experiencesService.create(fd);
      await queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      toast.success("Draft saved! You can continue editing it from My Experiences.");
      navigate("/host/experiences");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to save draft.";
      toast.error(msg);
    } finally {
      setSavingDraft(false);
    }
  };

  /* shared input class */
  const inputCls = "w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-on-surface dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-green-400/50 transition-all placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500";

  return (
    <HostLayout hostName={user?.name ?? "Host"} hostInitials={(user?.name ?? "H").slice(0, 2).toUpperCase()} hostTitle="Host">
      {success && (
        <SuccessModal
          onDashboard={() => navigate("/host-dashboard")}
          onPreview={() => navigate("/host/experiences")}
        />
      )}

      <main className="px-6 md:px-10 lg:px-12 py-10 max-w-7xl mx-auto">

        {/* ── Page Header + Progress ─────────────────────── */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight mb-8">
            Host a New Journey
          </h1>

          {/* step indicator */}
          <div className="relative flex items-center justify-between w-full">
            {/* connector line behind */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-container-high dark:bg-zinc-700" />

            {STEPS.map((label, i) => {
              const done   = stepStatus[i];
              const active = !done && stepStatus.slice(0, i).every(Boolean);
              return (
                <div key={label} className="flex flex-col items-center gap-2 bg-surface dark:bg-zinc-950 px-2 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm shadow-sm transition-all ${
                      done
                        ? "bg-primary text-white shadow-primary/30"
                        : active
                        ? "bg-primary text-white shadow-primary/20"
                        : "bg-surface-container-highest dark:bg-zinc-700 text-on-surface-variant dark:text-zinc-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    done || active ? "text-primary dark:text-green-400" : "text-on-surface-variant dark:text-zinc-500"
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* ── Form + Sidebar ────────────────────────────── */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── LEFT: form sections ── */}
          <div className="lg:col-span-8 space-y-8">

            {/* ─ Basic Information ─ */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 text-primary dark:text-green-400">
                  <FileEdit className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">Basic Information</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Experience Title <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Coffee Ceremony in the Simien Foothills"
                    value={form.title}
                    onChange={set("title")}
                    className={inputCls}
                  />
                  <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">Keep it catchy and descriptive of the unique value.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                      Category
                      <Lock className="h-3 w-3 text-on-surface-variant dark:text-zinc-500" />
                    </label>
                    {approvedCategories.length > 0 ? (
                      <select value={form.category} onChange={set("category")} className={inputCls}>
                        {approvedCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}{myExperiences.some((e) => e.category === c && e.status !== "rejected") ? " (already used)" : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className={`${inputCls} text-on-surface-variant dark:text-zinc-500 cursor-not-allowed opacity-60`}>
                        No approved categories
                      </div>
                    )}
                    {categoryTaken ? (
                      <p className="mt-1.5 text-xs text-error dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />
                        You already have an active experience in this category. Each category allows only one experience.
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">
                        Limited to your approved host categories.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">Max Guests <span className="text-error">*</span></label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="e.g. 8"
                      value={form.maxGuests}
                      onChange={set("maxGuests")}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Short Summary <span className="text-on-surface-variant dark:text-zinc-400 font-normal">(shown on listing cards)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="One sentence describing the core experience…"
                    value={form.summary}
                    onChange={set("summary")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Full Description <span className="text-error">*</span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Describe the soul of your experience. What will guests smell, see, and feel?"
                    value={form.description}
                    onChange={set("description")}
                    className={`${inputCls} resize-none`}
                  />
                  <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">{form.description.length} characters</p>
                </div>
              </div>
            </section>

            {/* ─ Schedule & Pricing ─ */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-[#ffddb8]/40 text-[#653e00]">
                  <Banknote className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">Schedule &amp; Pricing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Price (ETB) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant dark:text-zinc-400">ETB</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="1200"
                      value={form.price}
                      onChange={set("price")}
                      className={`${inputCls} pl-14`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Duration <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3 hours, Half day"
                    value={form.duration}
                    onChange={set("duration")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Next Occurrence <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.nextOccurrenceAt}
                    onChange={set("nextOccurrenceAt")}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="mt-5 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl flex items-start gap-3">
                <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  You keep <strong className="text-on-surface dark:text-white">85%</strong> of each booking. Endebeto's 15% platform commission is automatically deducted. You can update the next occurrence date anytime after approval.
                </p>
              </div>
            </section>

            {/* ─ Gallery ─ */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 text-primary dark:text-green-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">Gallery</h2>
              </div>

              <div className="space-y-6">
                {/* cover upload */}
                {coverPreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-outline-variant/20 dark:border-zinc-700 group">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => setCoverFile(null)}
                        className="bg-white/90 text-error rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow"
                      >
                        <X className="h-3.5 w-3.5" /> Remove Cover
                      </button>
                    </div>
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">Cover Image</span>
                  </div>
                ) : (
                  <div
                    onClick={() => coverRef.current?.click()}
                    className="relative border-2 border-dashed border-outline-variant/50 dark:border-zinc-600 rounded-2xl p-12 text-center hover:border-primary/40 dark:hover:border-green-400/40 hover:bg-primary/3 dark:hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-primary dark:text-green-400 mx-auto mb-3 opacity-60" />
                    <p className="text-base font-headline font-bold text-primary dark:text-green-400">Upload Cover Image</p>
                    <p className="text-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                      Required · Recommended: 1600×900px, JPG or PNG
                    </p>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 rounded-full text-xs font-semibold">
                      Browse files
                    </span>
                  </div>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCoverFile(f); }} />

                {/* gallery grid */}
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 mb-3">
                    Additional Photos <span className="font-normal">(up to 5 — optional but strongly recommended)</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {galleryPreview.map((url, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden relative group border border-outline-variant/10 dark:border-zinc-700">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGallery(i)}
                          className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        >
                          <X className="h-3 w-3 text-error" />
                        </button>
                      </div>
                    ))}
                    {galleryFiles.length < 5 && (
                      <button
                        type="button"
                        onClick={() => galleryRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/40 dark:border-zinc-600 flex flex-col items-center justify-center text-on-surface-variant dark:text-zinc-500 hover:border-primary/40 dark:hover:border-green-400/30 hover:bg-primary/3 dark:hover:bg-primary/10 transition-all cursor-pointer gap-1"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Add photo</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && galleryFiles.length < 5) setGalleryFiles((p) => [...p, f]);
                    }}
                  />
                </div>
              </div>
            </section>

            {/* ─ Location ─ */}
            <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-[#ffddb8]/40 text-[#653e00]">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">Meetup Location</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Location Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomoca Coffee Roasters, Piazza — Addis Ababa"
                    value={form.location}
                    onChange={set("location")}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">Street Address</label>
                  <textarea
                    rows={2}
                    placeholder="Woreda 01, House Number 42, Addis Ababa"
                    value={form.address}
                    onChange={set("address")}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <LocationPicker
                  onChange={(loc) => {
                    setPin(loc.lat ? loc : null);
                    if (loc.displayName && !form.location) {
                      setForm((p) => ({ ...p, location: loc.displayName.split(",").slice(0, 2).join(",").trim() }));
                    }
                  }}
                />
              </div>
            </section>

            {/* ─ Form actions ─ */}
            <div className="flex items-center justify-between pt-2 pb-8 gap-3 flex-wrap">
              <button
                type="button"
                disabled={savingDraft || submitting || !form.title.trim()}
                onClick={handleSaveDraft}
                className="px-6 py-3 rounded-xl border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white font-bold hover:bg-surface dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingDraft ? (
                  <><div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />Saving…</>
                ) : (
                  <><Save className="h-4 w-4" />Save as Draft</>
                )}
              </button>

              <button
                type="submit"
                disabled={!canSubmit || submitting || categoryTaken}
                className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-3"
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                ) : (
                  <><ShieldCheck className="h-5 w-5" />Post Experience</>
                )}
              </button>
            </div>
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

            {/* Host Success Tip */}
            <div className="bg-primary-container dark:bg-[#064e3b] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(6,78,59,0.6)" }} />
              <div className="relative z-10">
                <h3 className="text-xl font-headline font-bold mb-4">Host Success Tip</h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  "Experiences with at least 4 high-quality photos receive <strong className="text-[#ffddb8]">2.5×</strong> more bookings than those with only one."
                </p>
                <div className="flex items-center gap-2 text-[#ffddb8]">
                  <Star className="h-4 w-4 fill-[#ffddb8]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Heritage Level: Pro</span>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="bg-tertiary-container dark:bg-[#3d2400] rounded-2xl p-8 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <h3 className="text-lg font-headline font-bold text-white mb-5">Verification Steps</h3>
              <ul className="space-y-4">
                {[
                  { done: true,  label: "Identity Confirmed",  sub: "Government ID verified on 12/04/24" },
                  { done: true,  label: "Host Onboarding",     sub: "Heritage Standards course completed" },
                  { done: false, label: "Experience Audit",    sub: "Will begin after submission" },
                ].map((item) => (
                  <li key={item.label} className={`flex items-start gap-3 ${!item.done ? "opacity-50" : ""}`}>
                    {item.done
                      ? <CheckCircle2 className="h-5 w-5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                      : <Circle className="h-5 w-5 text-white/50 shrink-0 mt-0.5" />
                    }
                    <div>
                      <p className="text-sm font-bold text-white">{item.label}</p>
                      <p className="text-xs text-white/60 mt-0.5">{item.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form completeness */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-outline-variant/10 dark:border-zinc-700 shadow-sm">
              <h3 className="text-sm font-headline font-bold text-on-surface dark:text-white uppercase tracking-widest mb-4">
                Form Progress
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Basic Information", done: infoFilled },
                  { label: "Schedule & Pricing", done: scheduleFilled },
                  { label: "Cover Photo", done: mediaFilled },
                  { label: "Location", done: locationFilled },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    {item.done
                      ? <CheckCircle2 className="h-4 w-4 text-primary dark:text-green-400 shrink-0" />
                      : <Circle className="h-4 w-4 text-outline-variant dark:text-zinc-600 shrink-0" />
                    }
                    <span className={`text-sm ${item.done ? "text-on-surface dark:text-white font-medium" : "text-on-surface-variant dark:text-zinc-400"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 h-1.5 bg-outline-variant/20 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary dark:bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${([infoFilled, scheduleFilled, mediaFilled, locationFilled].filter(Boolean).length / 4) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mt-2 text-right">
                {[infoFilled, scheduleFilled, mediaFilled, locationFilled].filter(Boolean).length} / 4 sections complete
              </p>
            </div>

            {/* Need Help */}
            <div className="p-6 border-2 border-dashed border-outline-variant/40 dark:border-zinc-700 rounded-2xl">
              <h3 className="text-sm font-headline font-bold text-primary dark:text-green-400 uppercase tracking-widest mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-zinc-400 mb-4 leading-relaxed">
                Our curator support team is available 24/7 to help you craft the perfect experience listing.
              </p>
              <button
                type="button"
                className="w-full py-2.5 rounded-xl border border-primary dark:border-green-400 text-primary dark:text-green-400 font-bold text-sm hover:bg-primary hover:text-white dark:hover:bg-green-400/10 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with an Expert
              </button>
            </div>
          </div>
        </form>
      </main>
    </HostLayout>
  );
}
