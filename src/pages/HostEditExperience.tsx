import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileEdit, Banknote, ImageIcon, MapPin, Upload, X,
  CheckCircle2, Circle, Star, MessageCircle, ArrowLeft,
  ShieldCheck, Plus, Lock, AlertTriangle, Loader2,
} from "lucide-react";
import HostLayout from "@/components/HostLayout";
import LocationPicker, { type PinLocation } from "@/components/LocationPicker";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { experiencesService, type Experience } from "@/services/experiences.service";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── types ──────────────────────────────────────────── */
interface FormFields {
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
function SuccessModal({ onDashboard, onList }: { onDashboard: () => void; onList: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-2xl p-8 text-center shadow-2xl border border-outline-variant/10 dark:border-zinc-700">
        <div className="w-20 h-20 bg-secondary-container/50 dark:bg-emerald-900/40 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-primary dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-headline font-extrabold text-primary dark:text-green-400 mb-3">Changes Saved</h2>
        <p className="text-on-surface-variant dark:text-zinc-400 mb-8 leading-relaxed">
          Your experience has been updated successfully.
        </p>
        <div className="space-y-3">
          <button onClick={onDashboard} className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
            Go to Dashboard
          </button>
          <button onClick={onList} className="w-full py-4 text-primary dark:text-green-400 font-bold hover:bg-surface dark:hover:bg-zinc-800 rounded-xl transition-colors">
            View My Experiences
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostEditExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const approvedCategories = user?.approvedCategories ?? [];

  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedReason, setLockedReason] = useState("");

  const [form, setForm] = useState<FormFields>({
    title: "", summary: "", description: "", category: approvedCategories[0] ?? "",
    price: "", duration: "", maxGuests: "", nextOccurrenceAt: "",
    location: "", address: "",
  });

  const [pin, setPin] = useState<PinLocation | null>(null);

  /* existing image state — separate from new file uploads */
  const [existingCover, setExistingCover] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const coverRef   = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  /* ── load experience + check booking lock ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [expRes, availRes] = await Promise.all([
          experiencesService.getMyOne(id),
          experiencesService.getAvailability(id),
        ]);
        const exp = expRes.data.data.data;
        setExperience(exp);

        /* Pre-fill form */
        const toLocal = (iso?: string) => {
          if (!iso) return "";
          const d = new Date(iso);
          const pad = (n: number) => String(n).padStart(2, "0");
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        setForm({
          title: exp.title ?? "",
          summary: exp.summary ?? "",
          description: exp.description ?? "",
          category: exp.category ?? approvedCategories[0] ?? "",
          price: exp.price != null ? String(exp.price) : "",
          duration: exp.duration ?? "",
          maxGuests: exp.maxGuests != null ? String(exp.maxGuests) : "",
          nextOccurrenceAt: toLocal(exp.nextOccurrenceAt),
          location: exp.location ?? "",
          address: "",
        });
        setExistingCover(exp.imageCover ?? null);
        setExistingImages(exp.images ?? []);

        if (exp.latitude && exp.longitude) {
          setPin({ lat: exp.latitude, lng: exp.longitude, displayName: exp.location ?? "" });
        }

        /* Check booking lock. Mirrors backend `checkBookingLock`:
           only lock when there are upcoming bookings AND the listing is still
           scheduled for a future date. Expired or unscheduled listings stay
           editable so the host can update info before rescheduling. */
        const { booked, maxGuests: mg } = availRes.data.data;
        const nextAt = exp.nextOccurrenceAt ? new Date(exp.nextOccurrenceAt) : null;
        const hasFutureDate = !!nextAt && nextAt.getTime() > Date.now();
        if (booked > 0 && hasFutureDate) {
          setIsLocked(true);
          setLockedReason(`${booked} of ${mg} guest slot${booked > 1 ? "s" : ""} already booked — sensitive fields are locked.`);
        }
      } catch {
        toast.error("Failed to load experience.");
        navigate("/host/experiences");
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = (k: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const coverPreview   = newCoverFile ? URL.createObjectURL(newCoverFile) : existingCover;
  const galleryPreview = [
    ...existingImages.map((url) => ({ url, isNew: false })),
    ...newGalleryFiles.map((f) => ({ url: URL.createObjectURL(f), isNew: true })),
  ];

  const removeExistingImage = (url: string) =>
    setExistingImages((p) => p.filter((u) => u !== url));
  const removeNewGallery = (idx: number) =>
    setNewGalleryFiles((p) => p.filter((_, i) => i !== idx));

  /* step completeness */
  const infoFilled     = !!form.title && !!form.description;
  const scheduleFilled = !!form.price && !!form.duration && !!form.nextOccurrenceAt;
  const mediaFilled    = !!(newCoverFile || existingCover);
  const locationFilled = !!form.location;
  const stepStatus     = [infoFilled, scheduleFilled, mediaFilled, locationFilled];
  const canSubmit      = infoFilled && scheduleFilled && mediaFilled && locationFilled;

  const suspended = experience?.suspended === true;
  /** Bookings normally lock sensitive fields; platform suspension unlocks them so the host can remediate. */
  const effectiveLocked = isLocked && !suspended;

  /* locked input class */
  const inputCls = "w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-on-surface dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-green-400/50 transition-all placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500";
  const lockedCls = `${inputCls} opacity-60 cursor-not-allowed bg-surface-container dark:bg-zinc-800/60 border-outline-variant/20`;

  const fieldCls = (sensitive: boolean) => (effectiveLocked && sensitive ? lockedCls : inputCls);

  const isDraft = experience?.status === "draft";

  /** Builds the FormData payload shared by both save and post actions. */
  const buildFormData = (publish = false) => {
    const fd = new FormData();
    fd.append("summary", form.summary);
    fd.append("description", form.description);
    if (!effectiveLocked) {
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("maxGuests", form.maxGuests);
      fd.append("nextOccurrenceAt", form.nextOccurrenceAt);
      fd.append("location", form.location);
      if (form.address) fd.append("address", form.address);
    }
    if (pin?.lat) { fd.append("latitude", String(pin.lat)); fd.append("longitude", String(pin.lng)); }
    if (newCoverFile) fd.append("imageCover", newCoverFile);
    newGalleryFiles.forEach((f) => fd.append("images", f));
    existingImages.forEach((url) => fd.append("keepImages", url));
    // Promote draft: approved hosts go directly live, others go to pending review
    if (publish) {
      fd.append("status", user?.hostStatus === "approved" ? "approved" : "pending");
    }
    return fd;
  };

  /* ── save changes (keep current status) ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !id) return;
    setSubmitting(true);
    try {
      await experiencesService.update(id, buildFormData(false));
      setSuccess(true);
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Failed to save changes. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── post draft → live ── */
  const [posting, setPosting] = useState(false);
  const handlePost = async () => {
    if (!canSubmit || !id) return;
    setPosting(true);
    try {
      await experiencesService.update(id, buildFormData(true));
      toast.success("Experience posted! It will go live after admin review.");
      navigate("/host/experiences");
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Failed to post experience."));
    } finally {
      setPosting(false);
    }
  };

  /* ── loading state ── */
  if (loading) {
    return (
      <HostLayout hostName={user?.name ?? "Host"} hostTitle="Host">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary dark:text-green-400" />
        </div>
      </HostLayout>
    );
  }

  if (!experience) return null;

  return (
    <HostLayout hostName={user?.name ?? "Host"} hostTitle="Host">
      {success && (
        <SuccessModal
          onDashboard={() => navigate("/host-dashboard")}
          onList={() => navigate("/host/experiences")}
        />
      )}

      <main className="px-6 md:px-10 lg:px-12 py-10 max-w-7xl mx-auto">

        {/* ── Page Header ─────────────────────────────────── */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-headline font-extrabold text-primary dark:text-green-400 tracking-tight mb-8">
            Edit Experience
          </h1>

          {/* step indicator */}
          <div className="relative flex items-center justify-between w-full">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-surface-container-high dark:bg-zinc-700" />
            {STEPS.map((label, i) => {
              const done   = stepStatus[i];
              const active = !done && stepStatus.slice(0, i).every(Boolean);
              return (
                <div key={label} className="flex flex-col items-center gap-2 bg-surface dark:bg-zinc-950 px-2 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-headline font-bold text-sm shadow-sm transition-all ${done ? "bg-primary text-white shadow-primary/30" : active ? "bg-primary text-white shadow-primary/20" : "bg-surface-container-highest dark:bg-zinc-700 text-on-surface-variant dark:text-zinc-400"}`}>
                    {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${done || active ? "text-primary dark:text-green-400" : "text-on-surface-variant dark:text-zinc-500"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* ── Platform suspension ─────────────────────────── */}
        {suspended && (
          <div className="mb-8 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-xl max-w-4xl mx-auto">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Listing suspended by the platform</p>
              <p className="text-xs text-red-700/90 dark:text-red-400/90 mt-0.5 leading-relaxed">
                {experience.suspensionReason?.trim()
                  ? experience.suspensionReason
                  : "Update your listing to address the platform request. All fields are editable while suspended."}
              </p>
            </div>
          </div>
        )}

        {/* ── Booking-lock banner (not applied during platform suspension) ── */}
        {effectiveLocked && (
          <div className="mb-8 flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-xl max-w-4xl mx-auto">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Some fields are locked</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                {lockedReason} You can still update the description and photos.
              </p>
            </div>
          </div>
        )}

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
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Experience Title <span className="text-error">*</span>
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Coffee Ceremony in the Simien Foothills"
                    value={form.title}
                    onChange={set("title")}
                    disabled={effectiveLocked}
                    className={fieldCls(true)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                      Category <Lock className="h-3 w-3 text-on-surface-variant dark:text-zinc-500" />
                    </label>
                    {approvedCategories.length > 0 ? (
                      <select
                        value={form.category}
                        onChange={set("category")}
                        disabled={effectiveLocked}
                        className={fieldCls(true)}
                      >
                        {approvedCategories.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <div className={`${lockedCls}`}>{form.category || "No approved categories"}</div>
                    )}
                    <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">Limited to your approved host categories.</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                      Max Guests <span className="text-error">*</span>
                      {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                    </label>
                    <input
                      type="number" min={1} max={100} placeholder="e.g. 8"
                      value={form.maxGuests}
                      onChange={set("maxGuests")}
                      disabled={effectiveLocked}
                      className={fieldCls(true)}
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
                    placeholder="Describe the soul of your experience…"
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
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Price (ETB) <span className="text-error">*</span>
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant dark:text-zinc-400">ETB</span>
                    <input
                      type="number" min={0} placeholder="1200"
                      value={form.price}
                      onChange={set("price")}
                      disabled={effectiveLocked}
                      className={`${fieldCls(true)} pl-14`}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Duration <span className="text-error">*</span>
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <input
                    type="text" placeholder="e.g. 3 hours, Half day"
                    value={form.duration}
                    onChange={set("duration")}
                    disabled={effectiveLocked}
                    className={fieldCls(true)}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Next Occurrence <span className="text-error">*</span>
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <input
                    type="datetime-local"
                    value={form.nextOccurrenceAt}
                    onChange={set("nextOccurrenceAt")}
                    disabled={effectiveLocked}
                    className={fieldCls(true)}
                  />
                </div>
              </div>

              <div className="mt-5 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl flex items-start gap-3">
                <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  You keep <strong className="text-on-surface dark:text-white">85%</strong> of each booking. Endebeto's 15% platform commission is automatically deducted.
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
                {/* cover */}
                {coverPreview ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-video border border-outline-variant/20 dark:border-zinc-700 group">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => { setNewCoverFile(null); setExistingCover(null); }}
                        className="bg-white/90 text-error rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow">
                        <X className="h-3.5 w-3.5" /> Remove Cover
                      </button>
                    </div>
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">Cover Image</span>
                  </div>
                ) : (
                  <div onClick={() => coverRef.current?.click()}
                    className="relative border-2 border-dashed border-outline-variant/50 dark:border-zinc-600 rounded-2xl p-12 text-center hover:border-primary/40 dark:hover:border-green-400/40 hover:bg-primary/3 dark:hover:bg-primary/10 transition-all cursor-pointer">
                    <Upload className="h-10 w-10 text-primary dark:text-green-400 mx-auto mb-3 opacity-60" />
                    <p className="text-base font-headline font-bold text-primary dark:text-green-400">Upload Cover Image</p>
                    <p className="text-sm text-on-surface-variant dark:text-zinc-400 mt-1">Required · Recommended: 1600×900px, JPG or PNG</p>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 rounded-full text-xs font-semibold">Browse files</span>
                  </div>
                )}
                <input ref={coverRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setNewCoverFile(f); setExistingCover(null); } }} />

                {/* gallery grid */}
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 mb-3">
                    Additional Photos <span className="font-normal">(up to 5)</span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {galleryPreview.map((item, i) => (
                      <div key={item.url + i} className="aspect-square rounded-xl overflow-hidden relative group border border-outline-variant/10 dark:border-zinc-700">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                        <button type="button"
                          onClick={() => item.isNew ? removeNewGallery(i - existingImages.length) : removeExistingImage(item.url)}
                          className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-zinc-800/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                          <X className="h-3 w-3 text-error" />
                        </button>
                      </div>
                    ))}
                    {galleryPreview.length < 5 && (
                      <button type="button" onClick={() => galleryRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-outline-variant/40 dark:border-zinc-600 flex flex-col items-center justify-center text-on-surface-variant dark:text-zinc-500 hover:border-primary/40 dark:hover:border-green-400/30 hover:bg-primary/3 dark:hover:bg-primary/10 transition-all cursor-pointer gap-1">
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-semibold">Add photo</span>
                      </button>
                    )}
                  </div>
                  <input ref={galleryRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f && galleryPreview.length < 5) setNewGalleryFiles((p) => [...p, f]); }} />
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
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Location Name <span className="text-error">*</span>
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <input type="text" placeholder="e.g. Tomoca Coffee Roasters, Piazza — Addis Ababa"
                    value={form.location}
                    onChange={set("location")}
                    disabled={effectiveLocked}
                    className={fieldCls(true)}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                    Street Address
                    {effectiveLocked && <Lock className="h-3 w-3 text-amber-500" />}
                  </label>
                  <textarea rows={2} placeholder="Woreda 01, House Number 42, Addis Ababa"
                    value={form.address}
                    onChange={set("address")}
                    disabled={effectiveLocked}
                    className={`${fieldCls(true)} resize-none`}
                  />
                </div>

                <LocationPicker
                  initialLat={pin?.lat ?? experience.latitude}
                  initialLng={pin?.lng ?? experience.longitude}
                  disabled={effectiveLocked}
                  onChange={(loc) => {
                    setPin(loc.lat ? loc : null);
                    if (loc.displayName && !form.location) {
                      setForm((p) => ({ ...p, location: loc.displayName.split(",").slice(0, 2).join(",").trim() }));
                    }
                  }}
                />
              </div>
            </section>

            {/* ─ Actions ─ */}
            <div className="flex items-center justify-between pt-2 pb-8 gap-3 flex-wrap">
              <button type="button" onClick={() => navigate("/host/experiences")}
                className="px-6 py-3 rounded-xl text-primary dark:text-green-400 font-bold hover:bg-surface dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm">
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </button>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Save draft changes without publishing */}
                <button type="submit" disabled={!canSubmit || submitting || posting}
                  className="px-8 py-3 border border-outline-variant/40 dark:border-zinc-600 text-on-surface dark:text-white rounded-xl font-bold hover:bg-surface dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  ) : (
                    <><ShieldCheck className="h-5 w-5" />{isDraft ? "Save Draft" : "Save Changes"}</>
                  )}
                </button>

                {/* Post experience — only for drafts */}
                {isDraft && (
                  <button type="button" disabled={!canSubmit || posting || submitting}
                    onClick={handlePost}
                    className="px-10 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center gap-3 text-sm">
                    {posting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Posting…</>
                    ) : (
                      <><ShieldCheck className="h-5 w-5" />Post Experience</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

            {/* Lock / suspension status card */}
            {effectiveLocked ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/40 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-sm font-headline font-bold text-amber-700 dark:text-amber-300">Partial Edit Mode</h3>
                </div>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                  Guests have already booked this experience. Title, price, capacity, date, location, and duration are locked to protect their booking.
                </p>
                <div className="mt-4 space-y-1.5">
                  {["Description", "Photos"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-emerald-600 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {f} — editable
                    </div>
                  ))}
                </div>
              </div>
            ) : suspended ? (
              <div className="bg-red-50 dark:bg-red-950/25 border border-red-200/60 dark:border-red-800/40 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-sm font-headline font-bold text-red-800 dark:text-red-300">Full edit (suspended)</h3>
                </div>
                <p className="text-xs text-red-700/90 dark:text-red-400/90 leading-relaxed">
                  The listing is hidden from the catalog. You can change any field to address the platform request. Existing guest bookings still apply—be careful changing date, price, or capacity.
                </p>
              </div>
            ) : (
              <div className="bg-primary-container dark:bg-[#064e3b] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(6,78,59,0.6)" }} />
                <div className="relative z-10">
                  <h3 className="text-xl font-headline font-bold mb-4">Edit Tips</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-6">
                    All fields are editable now. Once guests start booking, sensitive fields like price and date will be locked to protect their experience.
                  </p>
                  <div className="flex items-center gap-2 text-[#ffddb8]">
                    <Star className="h-4 w-4 fill-[#ffddb8]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Full Edit Access</span>
                  </div>
                </div>
              </div>
            )}

            {/* Form progress */}
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
                  style={{ width: `${(stepStatus.filter(Boolean).length / 4) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mt-2 text-right">
                {stepStatus.filter(Boolean).length} / 4 sections complete
              </p>
            </div>

            {/* Need Help */}
            <div className="p-6 border-2 border-dashed border-outline-variant/40 dark:border-zinc-700 rounded-2xl">
              <h3 className="text-sm font-headline font-bold text-primary dark:text-green-400 uppercase tracking-widest mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-zinc-400 mb-4 leading-relaxed">
                Our curator support team is available 24/7 to help you update your listing.
              </p>
              <button type="button"
                className="w-full py-2.5 rounded-xl border border-primary dark:border-green-400 text-primary dark:text-green-400 font-bold text-sm hover:bg-primary hover:text-white dark:hover:bg-green-400/10 transition-all flex items-center justify-center gap-2">
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
