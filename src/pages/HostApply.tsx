import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Check, Upload, X, User, Briefcase,
  Camera, Globe, AlertCircle, Heart, DollarSign, ShieldCheck,
  Leaf, Star, Loader2, ClipboardCheck, Pencil,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { hostApplicationsService } from "@/services/hostApplications.service";
import { useAuth } from "@/context/AuthContext";
import { getFriendlyErrorMessage } from "@/lib/errors";

/* ─── types ──────────────────────────────────────────── */
interface Step1 { fullName: string; phoneNumber: string; cityRegion: string; fullAddress: string; languagesSpoken: string[]; aboutYou: string; }
interface Step2 { experienceTypes: string[]; specialties: string[]; previousExperience: string; }

type SlotState = { status: "idle" } | { status: "uploading" } | { status: "done"; url: string } | { status: "error"; msg: string };
interface Step3 {
  nationalIdFront:  SlotState;
  nationalIdBack:   SlotState;
  personalPhoto:    SlotState;
  envPhotos: SlotState[]; // each entry = one env photo slot
}

/* ─── options ────────────────────────────────────────── */
const LANGUAGES      = ["Amharic", "English", "Oromiffa", "Tigrinya", "French", "Arabic", "Other"];
const EXPERIENCE_TYPES = ["Cultural Tour", "Food & Cooking", "Adventure", "History & Heritage", "Nature & Wildlife", "Spiritual", "Arts & Crafts", "Music & Dance", "Coffee Ceremony", "Photography", "Language Exchange", "Wellness"];
const SPECIALTIES    = ["Solo Travelers", "Families", "Group Tours", "Luxury", "Budget-Friendly", "Senior-Friendly", "Accessibility-Focused", "Photography Spots", "Off-the-Beaten-Path", "Local Cuisine", "Storytelling", "Night Tours"];

const STEPS = [
  { label: "About You",        short: "Personal Info",      icon: User },
  { label: "Your Expertise",   short: "Experience Details", icon: Briefcase },
  { label: "Verification",     short: "Media & Documents",  icon: Camera },
  { label: "Review & Submit",  short: "Review",             icon: ClipboardCheck },
];

/* ─── Right-panel content per step ───────────────────── */
const SIDE_CONTENT = [
  {
    heading: "Why host with us?",
    benefits: [
      { icon: Heart,       title: "Preserve Culture",   desc: "Turn your ancestral knowledge into sustainable income while keeping traditions alive." },
      { icon: DollarSign,  title: "Direct Revenue",     desc: "Keep 85% of every experience booking. We only take a small commission for platform support." },
      { icon: ShieldCheck, title: "Host Protection",    desc: "Every guest is verified and every experience is covered by our Host Guarantee." },
    ],
    insight: { label: "Heritage Insight", quote: "'Buna fetū' is more than drinking coffee; it's the heart of our community." },
  },
  {
    heading: "What makes a great host?",
    benefits: [
      { icon: Star,   title: "Deep Local Knowledge", desc: "Guests book you because they want to see Ethiopia through your eyes, not a guidebook." },
      { icon: Leaf,   title: "Storytelling Matters", desc: "The best hosts don't just show a place — they share its living, breathing story." },
      { icon: Globe,  title: "Multilingual Edge",    desc: "Hosts who speak 2+ languages receive 40% more booking inquiries on average." },
    ],
    insight: { label: "Host Tip", quote: "Experiences with 4+ photos receive 2.5× more bookings than those with only one." },
  },
  {
    heading: "Almost there!",
    benefits: [
      { icon: ShieldCheck, title: "Secure & Private",    desc: "Documents are encrypted and only used for ID verification — never shared with guests." },
      { icon: Heart,       title: "Fast Review",         desc: "Our editorial team reviews applications within 48 hours and notifies you by email." },
      { icon: Star,        title: "Superhost Programme", desc: "Top-performing hosts earn the Superhost badge and get promoted in search results." },
    ],
    insight: { label: "What happens next?", quote: "After approval you can create your first experience and start earning within days." },
  },
  {
    heading: "One last check",
    benefits: [
      { icon: ClipboardCheck, title: "Review Everything",  desc: "Make sure all your details are accurate before submission — edits after approval require a support request." },
      { icon: ShieldCheck,    title: "Identity Verified",  desc: "Your documents are already securely uploaded. Submission is instant." },
      { icon: Heart,          title: "You're Almost In",   desc: "Hosts who complete their profiles fully are 3× more likely to be approved on first review." },
    ],
    insight: { label: "Reminder", quote: "Once submitted, our editorial team will contact you within 48 hours with a decision." },
  },
];

/* ─── shared input classes ───────────────────────────── */
const inputCls = "w-full px-4 py-3 rounded-xl border border-outline-variant/35 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-on-surface dark:text-white text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500 transition-all";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400 mb-1.5";

/* ─── TagPicker ──────────────────────────────────────── */
function TagPicker({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
              active
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-300 border-outline-variant/40 dark:border-zinc-600 hover:border-primary/50 hover:text-primary dark:hover:text-green-400"
            }`}
          >
            {active && <Check className="h-3 w-3 shrink-0" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ─── ImageUploadBox ─────────────────────────────────── */
function ImageUploadBox({ label, sublabel, slot, onPick, onRemove, square = false }: {
  label?: string; sublabel?: string;
  slot: SlotState;
  onPick: (f: File) => void;
  onRemove: () => void;
  square?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const aspectCls = square ? "aspect-square" : "aspect-[4/3]";

  const previewUrl = slot.status === "done" ? slot.url : null;
  const uploading  = slot.status === "uploading";
  const hasError   = slot.status === "error";

  return (
    <div>
      {label && <p className={labelCls}>{label}</p>}
      {sublabel && <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mb-2">{sublabel}</p>}

      {previewUrl ? (
        <div className={`relative rounded-xl overflow-hidden border-2 border-primary/40 dark:border-green-500/40 ${aspectCls}`}>
          <img src={previewUrl} alt="" className="w-full h-full object-cover" />
          {/* Uploaded badge */}
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Check className="h-2.5 w-2.5" /> Uploaded
          </span>
          <button type="button" onClick={onRemove}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors">
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : uploading ? (
        <div className={`w-full rounded-xl border-2 border-primary/40 dark:border-green-500/40 bg-primary/[0.03] dark:bg-primary/10 flex flex-col items-center justify-center gap-2 text-primary dark:text-green-400 ${aspectCls}`}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-[11px] font-semibold">Uploading…</span>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
            hasError
              ? "border-error/60 bg-error/5 dark:bg-red-900/10 text-error dark:text-red-400"
              : "border-outline-variant/40 dark:border-zinc-600 text-on-surface-variant dark:text-zinc-500 hover:border-primary/50 hover:bg-primary/[0.03] dark:hover:bg-primary/10"
          } ${aspectCls}`}
        >
          <Upload className="h-5 w-5 opacity-50" />
          <span className="text-[11px] font-semibold">
            {hasError ? "Retry upload" : "Click to upload"}
          </span>
          {hasError && (
            <span className="text-[10px] px-2 text-center leading-tight opacity-80">
              {(slot as { status: "error"; msg: string }).msg}
            </span>
          )}
        </button>
      )}

      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { onPick(f); e.target.value = ""; } }} />
    </div>
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostApply() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting]   = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [step1, setStep1] = useState<Step1>({ fullName: "", phoneNumber: "", cityRegion: "", fullAddress: "", languagesSpoken: [], aboutYou: "" });
  const [step2, setStep2] = useState<Step2>({ experienceTypes: [], specialties: [], previousExperience: "" });
  const IDLE: SlotState = { status: "idle" };
  const [step3, setStep3] = useState<Step3>({
    nationalIdFront: IDLE, nationalIdBack: IDLE, personalPhoto: IDLE, envPhotos: [],
  });

  const step1Valid = step1.fullName.trim() && step1.phoneNumber.trim() && step1.cityRegion.trim() && step1.languagesSpoken.length > 0 && step1.aboutYou.trim().length >= 30;
  const step2Valid = step2.experienceTypes.length > 0 && step2.specialties.length > 0;
  const step3Valid =
    step3.nationalIdFront.status === "done" &&
    step3.nationalIdBack.status  === "done" &&
    step3.personalPhoto.status   === "done" &&
    step3.envPhotos.some(s => s.status === "done");
  const step3Uploading =
    step3.nationalIdFront.status === "uploading" ||
    step3.nationalIdBack.status  === "uploading" ||
    step3.personalPhoto.status   === "uploading" ||
    step3.envPhotos.some(s => s.status === "uploading");
  const step4Valid = step1Valid && step2Valid && step3Valid; // all sections complete
  const canAdvance = [step1Valid, step2Valid, step3Valid, step4Valid][currentStep];

  const toggleLang = (lang: string) =>
    setStep1((p) => ({ ...p, languagesSpoken: p.languagesSpoken.includes(lang) ? p.languagesSpoken.filter((l) => l !== lang) : [...p.languagesSpoken, lang] }));

  const envPhotoRef = useRef<HTMLInputElement>(null);

  /* ── helper: upload a single file slot ── */
  type SingleSlotKey = "nationalIdFront" | "nationalIdBack" | "personalPhoto";

  const uploadSlot = async (field: SingleSlotKey, file: File) => {
    setStep3(p => ({ ...p, [field]: { status: "uploading" } }));
    try {
      const res = await hostApplicationsService.uploadSingleFile(field, file);
      const url = res.data.data.media?.[field] as string | undefined;
      if (!url) throw new Error("URL not returned");
      setStep3(p => ({ ...p, [field]: { status: "done", url } }));
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err, "Upload failed");
      setStep3(p => ({ ...p, [field]: { status: "error", msg } }));
      toast.error(`${field}: ${msg}`);
    }
  };

  const uploadEnvPhoto = async (file: File) => {
    const idx = step3.envPhotos.length;
    setStep3(p => ({ ...p, envPhotos: [...p.envPhotos, { status: "uploading" }] }));
    try {
      const res = await hostApplicationsService.uploadSingleFile("hostingEnvironmentPhotos", file);
      const urls = res.data.data.media?.hostingEnvironmentPhotos ?? [];
      const url = urls[urls.length - 1];
      if (!url) throw new Error("URL not returned");
      setStep3(p => {
        const envPhotos = [...p.envPhotos];
        envPhotos[idx] = { status: "done", url };
        return { ...p, envPhotos };
      });
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(err, "Upload failed");
      setStep3(p => {
        const envPhotos = [...p.envPhotos];
        envPhotos[idx] = { status: "error", msg };
        return { ...p, envPhotos };
      });
      toast.error(`Hosting photo: ${msg}`);
    }
  };

  const removeEnvPhoto = async (i: number) => {
    const slot = step3.envPhotos[i];
    if (slot.status === "done") {
      try { await hostApplicationsService.removeEnvPhoto(slot.url); } catch { /* best-effort */ }
    }
    setStep3(p => ({ ...p, envPhotos: p.envPhotos.filter((_, idx) => idx !== i) }));
  };

  /* ── on mount: check for existing application ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await hostApplicationsService.getMyApplication();
        const app = res.data.data.application;
        if (cancelled) return;
        if (!app) { setCheckingExisting(false); return; }

        const { status } = app;
        if (status === "submitted" || status === "pending" || status === "approved") {
          navigate("/host/application-status", { replace: true });
          return;
        }

        // draft or rejected → allow apply; pre-fill from saved draft
        if (status === "draft" && app.personalInfo) {
          setStep1({
            fullName:        app.personalInfo.fullName        ?? "",
            phoneNumber:     app.personalInfo.phoneNumber     ?? "",
            cityRegion:      app.personalInfo.cityRegion      ?? "",
            fullAddress:     app.personalInfo.fullAddress     ?? "",
            languagesSpoken: app.personalInfo.languagesSpoken ?? [],
            aboutYou:        app.personalInfo.aboutYou        ?? "",
          });
        }
        if (status === "draft" && app.experienceDetails) {
          setStep2({
            experienceTypes:    app.experienceDetails.experienceTypes    ?? [],
            specialties:        app.experienceDetails.specialties        ?? [],
            previousExperience: app.experienceDetails.previousExperience ?? "",
          });
        }
        // Restore already-uploaded media URLs from the saved draft
        if (status === "draft" && app.media) {
          const m = app.media;
          setStep3(p => ({
            ...p,
            nationalIdFront: m.nationalIdFront ? { status: "done", url: m.nationalIdFront } : p.nationalIdFront,
            nationalIdBack:  m.nationalIdBack  ? { status: "done", url: m.nationalIdBack  } : p.nationalIdBack,
            personalPhoto:   m.personalPhoto   ? { status: "done", url: m.personalPhoto   } : p.personalPhoto,
            envPhotos: (m.hostingEnvironmentPhotos ?? []).map(url => ({ status: "done" as const, url })),
          }));
        }
      } catch {
        // no application yet — that's fine
      } finally {
        if (!cancelled) setCheckingExisting(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  /* ── step advance with API call ── */
  const handleNext = async () => {
    if (!canAdvance) return;
    setSubmitting(true);
    try {
      if (currentStep === 0) {
        await hostApplicationsService.start({
          fullName:        step1.fullName,
          email:           user?.email,
          phoneNumber:     step1.phoneNumber,
          cityRegion:      step1.cityRegion,
          fullAddress:     step1.fullAddress,
          languagesSpoken: step1.languagesSpoken,
          aboutYou:        step1.aboutYou,
        });
      } else if (currentStep === 1) {
        await hostApplicationsService.updateExperienceDetails({
          experienceTypes:    step2.experienceTypes,
          specialties:        step2.specialties,
          previousExperience: step2.previousExperience,
        });
      }
      setCurrentStep((p) => p + 1);
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Failed to save. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── final submit — all files are already saved, just finalize ── */
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await hostApplicationsService.submit();
      toast.success("Application submitted! We'll be in touch within 48 hours.");
      navigate("/host/application-status");
    } catch (err: unknown) {
      toast.error(getFriendlyErrorMessage(err, "Submission failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  /* ── renderStep4: review summary ── */
  const renderStep4 = () => {
    const doneEnvPhotos = step3.envPhotos.filter(s => s.status === "done") as { status: "done"; url: string }[];
    const doneSingle = (s: SlotState) => s.status === "done" ? s : null;

    const Section = ({ title, step, children }: { title: string; step: number; children: React.ReactNode }) => (
      <div className="rounded-xl border border-outline-variant/15 dark:border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low/60 dark:bg-zinc-800/50 border-b border-outline-variant/10 dark:border-zinc-700">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant dark:text-zinc-400">{title}</p>
          <button type="button" onClick={() => setCurrentStep(step)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-green-400 hover:underline underline-offset-2 transition-colors">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </div>
        <div className="px-5 py-4 space-y-2">{children}</div>
      </div>
    );

    const Row = ({ label, value }: { label: string; value?: string }) =>
      value ? (
        <div className="flex gap-3">
          <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-0.5">{label}</span>
          <span className="text-sm text-on-surface dark:text-white flex-1 leading-relaxed">{value}</span>
        </div>
      ) : null;

    return (
      <div className="space-y-5">

        {/* Personal Info */}
        <Section title="Personal Info" step={0}>
          <Row label="Full Name"   value={step1.fullName} />
          <Row label="Phone"       value={step1.phoneNumber} />
          <Row label="City/Region" value={step1.cityRegion} />
          {step1.fullAddress && <Row label="Address" value={step1.fullAddress} />}
          {step1.languagesSpoken.length > 0 && (
            <div className="flex gap-3">
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-1">Languages</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {step1.languagesSpoken.map(l => (
                  <span key={l} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400">{l}</span>
                ))}
              </div>
            </div>
          )}
          {step1.aboutYou && (
            <div className="flex gap-3">
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-0.5">Your Story</span>
              <p className="text-sm text-on-surface dark:text-white flex-1 leading-relaxed line-clamp-4">{step1.aboutYou}</p>
            </div>
          )}
        </Section>

        {/* Experience Details */}
        <Section title="Your Expertise" step={1}>
          {step2.experienceTypes.length > 0 && (
            <div className="flex gap-3">
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-1">Experience Types</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {step2.experienceTypes.map(t => (
                  <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400">{t}</span>
                ))}
              </div>
            </div>
          )}
          {step2.specialties.length > 0 && (
            <div className="flex gap-3">
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-1">Specialties</span>
              <div className="flex flex-wrap gap-1.5 flex-1">
                {step2.specialties.map(s => (
                  <span key={s} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-on-surface-variant dark:text-zinc-300 border border-outline-variant/20 dark:border-zinc-600">{s}</span>
                ))}
              </div>
            </div>
          )}
          {step2.previousExperience && (
            <div className="flex gap-3">
              <span className="text-[11px] font-semibold text-on-surface-variant dark:text-zinc-500 w-28 shrink-0 pt-0.5">Background</span>
              <p className="text-sm text-on-surface dark:text-white flex-1 leading-relaxed line-clamp-3">{step2.previousExperience}</p>
            </div>
          )}
        </Section>

        {/* Documents & Media */}
        <Section title="Documents & Media" step={2}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              { label: "ID Front",    slot: doneSingle(step3.nationalIdFront) },
              { label: "ID Back",     slot: doneSingle(step3.nationalIdBack)  },
              { label: "Your Photo",  slot: doneSingle(step3.personalPhoto)   },
            ].map(({ label, slot }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 mb-1.5">{label}</p>
                {slot ? (
                  <div className="relative rounded-lg overflow-hidden aspect-[4/3] border border-primary/30 dark:border-green-500/30">
                    <img src={slot.url} alt={label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 bg-emerald-600/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      <Check className="h-2 w-2" /> Uploaded
                    </span>
                  </div>
                ) : (
                  <div className="aspect-[4/3] rounded-lg bg-surface-container dark:bg-zinc-800 border border-outline-variant/20 dark:border-zinc-700 flex items-center justify-center">
                    <span className="text-[11px] text-error font-semibold">Missing</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {doneEnvPhotos.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant dark:text-zinc-500 mb-1.5">
                Hosting Environment ({doneEnvPhotos.length} photo{doneEnvPhotos.length > 1 ? "s" : ""})
              </p>
              <div className="grid grid-cols-4 gap-2">
                {doneEnvPhotos.map((s, i) => (
                  <div key={i} className="rounded-lg overflow-hidden aspect-[4/3] border border-primary/30 dark:border-green-500/30">
                    <img src={s.url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Declaration */}
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-xl">
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
            By submitting you confirm that all information is accurate and you agree to our <span className="font-semibold">Host Terms & Conditions</span>.
          </p>
        </div>
      </div>
    );
  };

  const side = SIDE_CONTENT[currentStep];

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-surface-container-low dark:bg-zinc-950 font-body flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── step renders ── */
  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Legal Full Name <span className="text-error normal-case">*</span></label>
          <input type="text" placeholder="As it appears on your ID" value={step1.fullName}
            onChange={(e) => setStep1((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Phone Number <span className="text-error normal-case">*</span></label>
          <input type="tel" placeholder="+251 9XX XXX XXXX" value={step1.phoneNumber}
            onChange={(e) => setStep1((p) => ({ ...p, phoneNumber: e.target.value }))} className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>City / Region <span className="text-error normal-case">*</span></label>
          <input type="text" placeholder="e.g. Lalibela, Amhara" value={step1.cityRegion}
            onChange={(e) => setStep1((p) => ({ ...p, cityRegion: e.target.value }))} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Full Address</label>
          <input type="text" placeholder="Street, Kebele, Woreda" value={step1.fullAddress}
            onChange={(e) => setStep1((p) => ({ ...p, fullAddress: e.target.value }))} className={inputCls} />
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className={labelCls}>Languages Spoken <span className="text-error normal-case">*</span></label>
        <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-outline-variant/35 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[48px]">
          {step1.languagesSpoken.map((lang) => (
            <span key={lang} className="inline-flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
              {lang}
              <button type="button" onClick={() => toggleLang(lang)} className="hover:text-error transition-colors"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <input
            type="text"
            placeholder={step1.languagesSpoken.length === 0 ? "e.g. Amharic, English, Oromo…" : "Add more…"}
            className="flex-1 min-w-[120px] text-sm outline-none bg-transparent text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500"
            onKeyDown={(e) => {
              const val = (e.target as HTMLInputElement).value.trim();
              if ((e.key === "Enter" || e.key === ",") && val) {
                e.preventDefault();
                const match = LANGUAGES.find((l) => l.toLowerCase() === val.toLowerCase());
                if (match && !step1.languagesSpoken.includes(match)) toggleLang(match);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
        </div>
        {/* language pill shortcuts */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {LANGUAGES.filter((l) => !step1.languagesSpoken.includes(l)).map((lang) => (
            <button key={lang} type="button" onClick={() => toggleLang(lang)}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-outline-variant/30 dark:border-zinc-600 text-on-surface-variant dark:text-zinc-400 hover:border-primary/50 hover:text-primary dark:hover:text-green-400 transition-colors">
              + {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className={labelCls}>Your Story (Bio) <span className="text-error normal-case">*</span></label>
        <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mb-2">Describe your connection to Ethiopian heritage and why you want to share it.</p>
        <textarea rows={5} placeholder="I have been roasting coffee in the Sidamo region for twenty years…"
          value={step1.aboutYou} onChange={(e) => setStep1((p) => ({ ...p, aboutYou: e.target.value }))}
          className={`${inputCls} resize-none`} />
        <div className="flex justify-between mt-1.5">
          <p className={`text-[11px] ${step1.aboutYou.length >= 30 ? "text-primary dark:text-green-400" : "text-on-surface-variant dark:text-zinc-500"}`}>
            {step1.aboutYou.length >= 30 ? "✓ Minimum reached" : `${30 - step1.aboutYou.length} more characters needed`}
          </p>
          <p className="text-[11px] text-on-surface-variant dark:text-zinc-500">{step1.aboutYou.length} chars</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-7">
      <div>
        <label className={labelCls}>Experience Types <span className="text-error normal-case">*</span></label>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3">What kinds of experiences will you host? Select all that apply.</p>
        <TagPicker options={EXPERIENCE_TYPES} selected={step2.experienceTypes}
          onChange={(v) => setStep2((p) => ({ ...p, experienceTypes: v }))} />
        {step2.experienceTypes.length > 0 && (
          <p className="text-[11px] text-primary dark:text-green-400 mt-2 font-semibold">{step2.experienceTypes.length} selected</p>
        )}
      </div>

      <div>
        <label className={labelCls}>Specialties <span className="text-error normal-case">*</span></label>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-3">Who do you specialise in hosting, or what sets you apart?</p>
        <TagPicker options={SPECIALTIES} selected={step2.specialties}
          onChange={(v) => setStep2((p) => ({ ...p, specialties: v }))} />
        {step2.specialties.length > 0 && (
          <p className="text-[11px] text-primary dark:text-green-400 mt-2 font-semibold">{step2.specialties.length} selected</p>
        )}
      </div>

      <div>
        <label className={labelCls}>Previous Experience <span className="font-normal normal-case text-on-surface-variant dark:text-zinc-500">(optional)</span></label>
        <textarea rows={4} placeholder="Describe any guiding, hosting, or tourism background you have…"
          value={step2.previousExperience} onChange={(e) => setStep2((p) => ({ ...p, previousExperience: e.target.value }))}
          className={`${inputCls} resize-none`} />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-7">
      <div className="flex items-start gap-3 p-4 bg-primary/8 dark:bg-primary/15 border border-primary/20 dark:border-primary/30 rounded-xl">
        <AlertCircle className="h-4 w-4 text-primary dark:text-green-400 shrink-0 mt-0.5" />
        <p className="text-xs text-primary/80 dark:text-green-300 leading-relaxed">
          Each file is uploaded immediately when you select it — no waiting at submission. Documents are encrypted and only used for identity verification.
        </p>
      </div>

      <div>
        <label className={labelCls}>National ID / Passport <span className="text-error normal-case">*</span></label>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">Upload both sides of your Ethiopian National ID or Passport.</p>
        <div className="grid grid-cols-2 gap-4">
          <ImageUploadBox label="Front Side" slot={step3.nationalIdFront}
            onPick={(f) => uploadSlot("nationalIdFront", f)}
            onRemove={() => setStep3(p => ({ ...p, nationalIdFront: IDLE }))} />
          <ImageUploadBox label="Back Side" slot={step3.nationalIdBack}
            onPick={(f) => uploadSlot("nationalIdBack", f)}
            onRemove={() => setStep3(p => ({ ...p, nationalIdBack: IDLE }))} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Profile Photo <span className="text-error normal-case">*</span></label>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">A clear, recent headshot. This appears on your public host profile.</p>
        <div className="max-w-[200px]">
          <ImageUploadBox label="" slot={step3.personalPhoto} square
            onPick={(f) => uploadSlot("personalPhoto", f)}
            onRemove={() => setStep3(p => ({ ...p, personalPhoto: IDLE }))} />
        </div>
      </div>

      <div>
        <label className={labelCls}>
          Hosting Environment Photos
          <span className="text-error normal-case ml-1">*</span>
          <span className="font-normal normal-case text-on-surface-variant dark:text-zinc-500 ml-1">(1–4 photos)</span>
        </label>
        <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">
          Photos of the space or location where you'll host. Help guests get excited!
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {step3.envPhotos.map((slot, i) => (
            <ImageUploadBox key={i} slot={slot}
              onPick={(f) => {
                setStep3(p => { const envPhotos = [...p.envPhotos]; envPhotos[i] = { status: "uploading" }; return { ...p, envPhotos }; });
                (async () => {
                  try {
                    const res = await hostApplicationsService.uploadSingleFile("hostingEnvironmentPhotos", f);
                    const urls = res.data.data.media?.hostingEnvironmentPhotos ?? [];
                    const url = urls[urls.length - 1];
                    if (!url) throw new Error("URL not returned");
                    setStep3(p => { const envPhotos = [...p.envPhotos]; envPhotos[i] = { status: "done", url }; return { ...p, envPhotos }; });
                  } catch (err: unknown) {
                    const msg = getFriendlyErrorMessage(err, "Upload failed");
                    setStep3(p => { const envPhotos = [...p.envPhotos]; envPhotos[i] = { status: "error", msg }; return { ...p, envPhotos }; });
                    toast.error(`Hosting photo: ${msg}`);
                  }
                })();
              }}
              onRemove={() => removeEnvPhoto(i)} />
          ))}
          {step3.envPhotos.length < 4 && (
            <button type="button" onClick={() => envPhotoRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-outline-variant/40 dark:border-zinc-600 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant dark:text-zinc-500 hover:border-primary/50 hover:bg-primary/[0.03] dark:hover:bg-primary/10 transition-all">
              <Upload className="h-5 w-5 opacity-40" />
              <span className="text-[11px] font-semibold">Add photo</span>
            </button>
          )}
        </div>
        <input ref={envPhotoRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { uploadEnvPhoto(f); e.target.value = ""; } }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-zinc-950 font-body">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">

        {/* Back link */}
        <Link to="/become-host"
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant dark:text-zinc-400 hover:text-primary dark:hover:text-green-400 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Host Overview
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-green-400 mb-1">Host Application</p>
          <h1 className="font-headline font-extrabold text-2xl md:text-3xl text-on-surface dark:text-white">
            {STEPS[currentStep].label}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                    done   ? "bg-primary border-primary text-white" :
                    active ? "bg-white dark:bg-zinc-900 border-primary text-primary shadow-sm shadow-primary/20" :
                             "bg-white dark:bg-zinc-800 border-outline-variant/30 dark:border-zinc-600 text-on-surface-variant dark:text-zinc-500"
                  }`}>
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:block whitespace-nowrap ${
                    active ? "text-on-surface dark:text-white" : done ? "text-primary/70 dark:text-green-500/70" : "text-on-surface-variant dark:text-zinc-500"
                  }`}>
                    {s.short}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors duration-500 ${done ? "bg-primary" : "bg-outline-variant/25 dark:bg-zinc-700"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── Left: form card ── */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* card header */}
            <div className="px-6 md:px-8 pt-7 pb-5 border-b border-outline-variant/10 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => { const Icon = STEPS[currentStep].icon; return <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center"><Icon className="h-4 w-4 text-primary dark:text-green-400" /></div>; })()}
                  <div>
                    <h2 className="font-headline font-bold text-base text-on-surface dark:text-white">{STEPS[currentStep].label}</h2>
                    <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mt-0.5">Step {currentStep + 1} of {STEPS.length}</p>
                  </div>
                </div>
                {/* mini progress */}
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < currentStep ? "w-5 bg-primary" : i === currentStep ? "w-8 bg-primary" : "w-5 bg-outline-variant/25 dark:bg-zinc-700"}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* card body */}
            <div className="px-6 md:px-8 py-7">
              {currentStep === 0 && renderStep1()}
              {currentStep === 1 && renderStep2()}
              {currentStep === 2 && renderStep3()}
              {currentStep === 3 && renderStep4()}
            </div>

            {/* card footer / navigation */}
            <div className="px-6 md:px-8 py-5 border-t border-outline-variant/10 dark:border-zinc-800 bg-surface-container-low/40 dark:bg-zinc-800/30 flex items-center justify-between gap-4">
              <button type="button" onClick={() => setCurrentStep((p) => p - 1)} disabled={currentStep === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/35 dark:border-zinc-600 text-on-surface dark:text-white text-sm font-medium hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? "Back" : `Back to ${STEPS[currentStep - 1].short}`}
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-on-surface-variant dark:text-zinc-500 hidden sm:block">
                  {currentStep === 3 ? "Review then submit" : "Progress auto-saved"}
                </span>
                {currentStep < STEPS.length - 1 ? (
                  /* Steps 0-2: "Next" — steps 0 & 1 save via handleNext, step 2 just advances */
                  <button type="button"
                    onClick={currentStep === 2 ? () => setCurrentStep(3) : handleNext}
                    disabled={!canAdvance || submitting || (currentStep === 2 && step3Uploading)}
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md min-w-[140px] justify-center">
                    {currentStep === 2 && step3Uploading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Uploading…</>
                    ) : submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                    ) : (
                      <>Next: {STEPS[currentStep + 1].short}<ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                ) : (
                  /* Step 3 (Review): final submit */
                  <button type="button" onClick={handleSubmit} disabled={!canAdvance || submitting}
                    className="inline-flex items-center gap-2 bg-primary text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md min-w-[170px] justify-center">
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" />Submitting…</>
                    ) : (
                      <><Check className="h-4 w-4" />Submit Application</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: sticky benefit panel ── */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* Benefits card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-outline-variant/15 dark:border-zinc-800 shadow-sm p-6">
              <h3 className="font-headline font-bold text-base text-on-surface dark:text-white mb-5">{side.heading}</h3>
              <div className="space-y-5">
                {side.benefits.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-primary dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface dark:text-white leading-snug">{title}</p>
                      <p className="text-xs text-on-surface-variant dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Heritage insight card */}
            <div className="relative bg-primary dark:bg-[#063a28] rounded-2xl overflow-hidden p-6 shadow-lg">
              {/* decorative blob */}
              <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-10 blur-2xl" style={{ background: "#ffddb8" }} />
              <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full opacity-10 blur-xl" style={{ background: "#ffddb8" }} />
              <div className="relative z-10">
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-accent dark:text-amber-300 mb-3">
                  {side.insight.label}
                </span>
                <p className="text-white/90 text-sm leading-relaxed italic">
                  "{side.insight.quote}"
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
