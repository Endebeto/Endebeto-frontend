import { useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { hostQueryKeys } from "@/lib/hostQueryKeys";
import {
  FileEdit,
  Banknote,
  ImageIcon,
  MapPin,
  Upload,
  X,
  CheckCircle2,
  Circle,
  Star,
  MessageCircle,
  ShieldCheck,
  Plus,
  Lock,
  AlertCircle,
  Info,
  Calendar,
  Repeat,
  Clock,
  Sparkles,
} from "lucide-react";
import LocationPicker, { type PinLocation } from "@/components/LocationPicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  experiencesService,
  type Experience,
} from "@/services/experiences.service";
import { slotsService } from "@/services/slots.service";
import { normalizeApiList } from "@/lib/normalizeApiList";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { HOST_EXPERIENCE_CATEGORY_OPTIONS } from "@/lib/hostExperienceCategories";
import { EXPERIENCE_DESCRIPTION_FORMAT_HINT } from "@/components/ExperienceDescriptionMarkdown";
import { HostExperienceDescriptionToolbar } from "@/components/HostExperienceDescriptionToolbar";

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

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const STEPS = ["Info", "Schedule", "Media", "Location"];

/** Mount above host layout + Leaflet (see index.html `#modal-root`, z-index in index.css). */
function getHostModalContainer(): HTMLElement {
  return document.getElementById("modal-root") ?? document.body;
}

/* ─── success modal ──────────────────────────────────── */
function SuccessModal({
  onDashboard,
  onPreview,
  onManageSchedule,
  sessionsCreated,
}: {
  onDashboard: () => void;
  onPreview: () => void;
  onManageSchedule: () => void;
  sessionsCreated?: number;
}) {
  return createPortal(
    <div
      className="fixed inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-create-success-title"
    >
      <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl p-8 text-center shadow-2xl border border-outline-variant/10 dark:border-zinc-700">
        <div className="w-20 h-20 bg-secondary-container/50 dark:bg-emerald-900/40 text-primary rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-10 w-10 text-primary dark:text-green-400" />
        </div>
        <h2
          id="host-create-success-title"
          className="text-2xl font-headline font-extrabold text-primary dark:text-green-400 mb-2"
        >
          Experience Submitted!
        </h2>
        {sessionsCreated != null && sessionsCreated > 0 ? (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-green-400 bg-primary/10 dark:bg-primary/20 py-1.5 px-3.5 rounded-full mb-3">
            <Repeat className="h-3.5 w-3.5" /> {sessionsCreated} {sessionsCreated === 1 ? "session" : "sessions"} pre-scheduled
          </div>
        ) : null}
        <p className="text-on-surface-variant dark:text-zinc-400 mb-6 leading-relaxed text-xs">
          Your listing has been submitted for review. Our editorial team will review the
          details and notify you within 48 hours. Your scheduled dates are active and saved!
        </p>
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onManageSchedule}
            className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <Calendar className="h-4 w-4" /> View &amp; Manage Schedule
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="w-full py-3 text-primary dark:text-green-400 font-bold hover:bg-surface dark:hover:bg-zinc-800 rounded-xl transition-colors text-sm"
          >
            View My Experiences
          </button>
          <button
            type="button"
            onClick={onDashboard}
            className="w-full py-2.5 text-on-surface-variant dark:text-zinc-400 hover:text-on-surface text-xs font-semibold transition-colors"
          >
            Go to Host Dashboard
          </button>
        </div>
      </div>
    </div>,
    getHostModalContainer(),
  );
}

/* ─── main component ─────────────────────────────────── */
export default function HostCreateExperience() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use only the categories the host was approved to offer.
  // Hosts approved before the approvedCategories field was introduced
  // have an empty array — fall back to the full list so they aren't blocked.
  const approvedCategories = user?.approvedCategories ?? [];
  const categoryOptions =
    approvedCategories.length > 0
      ? approvedCategories
      : [...HOST_EXPERIENCE_CATEGORY_OPTIONS];
  const defaultCategory = categoryOptions[0] ?? "";

  const [form, setForm] = useState<FormData>({
    title: "",
    summary: "",
    description: "",
    category: defaultCategory,
    price: "",
    duration: "",
    maxGuests: "",
    nextOccurrenceAt: "",
    location: "",
    address: "",
  });
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState<"hours" | "days">("hours");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [pin, setPin] = useState<PinLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Schedule Mode & Recurring Configuration ──
  const [scheduleMode, setScheduleMode] = useState<"recurring" | "single">("recurring");
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 6]); // Default weekends: Sunday (0) & Saturday (6)
  const [recurringTime, setRecurringTime] = useState("10:00");
  const [recurringStartDate, setRecurringStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Tomorrow
    return d.toISOString().slice(0, 10);
  });
  const [recurringEndDate, setRecurringEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28); // 4 weeks ahead
    return d.toISOString().slice(0, 10);
  });
  const [createdExperienceId, setCreatedExperienceId] = useState<string | null>(null);
  const [generatedSessionsCount, setGeneratedSessionsCount] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleDay = (dayVal: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayVal)
        ? prev.filter((d) => d !== dayVal)
        : [...prev, dayVal].sort(),
    );
    if (errors.schedule) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.schedule;
        return next;
      });
    }
  };

  // Computes the earliest matching occurrence at least 24h from now
  const computedFirstOccurrenceIso = useMemo(() => {
    if (scheduleMode === "single") {
      return form.nextOccurrenceAt
        ? new Date(form.nextOccurrenceAt).toISOString()
        : "";
    }
    if (
      recurringDays.length === 0 ||
      !recurringTime ||
      !recurringStartDate ||
      !recurringEndDate
    ) {
      return "";
    }
    const [h, m] = recurringTime.split(":").map(Number);
    const start = new Date(`${recurringStartDate}T00:00:00`);
    const end = new Date(`${recurringEndDate}T23:59:59`);
    const minFutureMs = Date.now() + 24 * 60 * 60 * 1000; // backend requires >= 24h
    const cur = new Date(start);
    while (cur <= end) {
      if (recurringDays.includes(cur.getDay())) {
        const slotDate = new Date(cur);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate.getTime() >= minFutureMs) {
          return slotDate.toISOString();
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    return "";
  }, [
    scheduleMode,
    form.nextOccurrenceAt,
    recurringDays,
    recurringTime,
    recurringStartDate,
    recurringEndDate,
  ]);

  const estimatedRecurringCount = useMemo(() => {
    if (
      scheduleMode !== "recurring" ||
      recurringDays.length === 0 ||
      !recurringStartDate ||
      !recurringEndDate
    ) {
      return 0;
    }
    const start = new Date(`${recurringStartDate}T00:00:00`);
    const end = new Date(`${recurringEndDate}T23:59:59`);
    const minFutureMs = Date.now() + 24 * 60 * 60 * 1000;
    const [h, m] = (recurringTime || "10:00").split(":").map(Number);
    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (recurringDays.includes(cur.getDay())) {
        const d = new Date(cur);
        d.setHours(h, m, 0, 0);
        if (d.getTime() >= minFutureMs) count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }, [
    scheduleMode,
    recurringDays,
    recurringStartDate,
    recurringEndDate,
    recurringTime,
  ]);

  const handleDurationValueChange = (valStr: string) => {
    setDurationValue(valStr);
    const parsed = parseInt(valStr.trim(), 10);
    const formatted =
      parsed && parsed > 0
        ? `${parsed} ${parsed === 1 ? durationUnit.slice(0, -1) : durationUnit}`
        : "";
    setForm((p) => ({ ...p, duration: formatted }));
    if (errors.duration) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.duration;
        return next;
      });
    }
  };

  const handleDurationUnitChange = (unit: "hours" | "days") => {
    setDurationUnit(unit);
    const parsed = parseInt(durationValue.trim(), 10);
    const formatted =
      parsed && parsed > 0
        ? `${parsed} ${parsed === 1 ? unit.slice(0, -1) : unit}`
        : "";
    setForm((p) => ({ ...p, duration: formatted }));
    if (errors.duration) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.duration;
        return next;
      });
    }
  };

  // Fetch existing experiences to enforce anti-clone title check.
  const { data: myExpData } = useQuery({
    queryKey: hostQueryKeys.experiences.list(),
    queryFn: () => experiencesService.getMyExperiences(),
    staleTime: 30_000,
  });
  const myExperiences = normalizeApiList<Experience>(myExpData?.data).items;

  // Anti-clone check: prevent duplicate titles by the same host
  const duplicateTitle = myExperiences.some(
    (e) =>
      e.title.trim().toLowerCase() === form.title.trim().toLowerCase() &&
      e.status !== "rejected",
  );

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const set =
    (k: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((p) => ({ ...p, [k]: e.target.value }));
      if (errors[k]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[k];
          return next;
        });
      }
    };

  const coverPreview = coverFile ? URL.createObjectURL(coverFile) : null;
  const galleryPreview = galleryFiles.map((f) => URL.createObjectURL(f));

  const removeGallery = (i: number) =>
    setGalleryFiles((p) => p.filter((_, idx) => idx !== i));

  /* determine which sections have content (for step indicator) */
  const infoFilled =
    !!form.title.trim() &&
    form.title.trim().length >= 10 &&
    !!form.description.trim() &&
    form.description.trim().length >= 20;
  const scheduleFilled =
    !!form.price &&
    Number(form.price) > 0 &&
    !!form.duration &&
    !!form.maxGuests &&
    Number(form.maxGuests) >= 1 &&
    (scheduleMode === "single"
      ? !!form.nextOccurrenceAt &&
        new Date(form.nextOccurrenceAt).getTime() >=
          Date.now() + 24 * 60 * 60 * 1000
      : !!computedFirstOccurrenceIso && estimatedRecurringCount > 0);
  const mediaFilled = !!coverFile;
  const locationFilled = !!form.location.trim();
  const stepStatus = [infoFilled, scheduleFilled, mediaFilled, locationFilled];

  const validateForm = (): {
    isValid: boolean;
    firstErrorId?: string;
    missingLabels: string[];
  } => {
    const errs: Record<string, string> = {};
    const missing: string[] = [];
    let firstId: string | undefined = undefined;

    // 1. Title
    const trimmedTitle = form.title.trim();
    if (!trimmedTitle) {
      errs.title = "Experience title is required";
      missing.push("Title");
      if (!firstId) firstId = "field-title";
    } else if (trimmedTitle.length < 10) {
      errs.title = `Title must be at least 10 characters (currently ${trimmedTitle.length})`;
      missing.push("Title (at least 10 chars)");
      if (!firstId) firstId = "field-title";
    } else if (trimmedTitle.length > 100) {
      errs.title = "Title must be 100 characters or less";
      missing.push("Title (max 100 chars)");
      if (!firstId) firstId = "field-title";
    } else if (duplicateTitle) {
      errs.title = "You already have an active experience with this title";
      missing.push("Unique title");
      if (!firstId) firstId = "field-title";
    }

    // 2. Category
    if (!form.category) {
      errs.category = "Please select an experience category";
      missing.push("Category");
      if (!firstId) firstId = "field-category";
    }

    // 3. Max Guests
    const maxG = Number(form.maxGuests);
    if (!form.maxGuests || isNaN(maxG) || maxG < 1) {
      errs.maxGuests = "Max guests must be at least 1";
      missing.push("Max Guests");
      if (!firstId) firstId = "field-maxGuests";
    }

    // 4. Description
    const trimmedDesc = form.description.trim();
    if (!trimmedDesc) {
      errs.description = "Full description is required";
      missing.push("Description");
      if (!firstId) firstId = "field-description";
    } else if (trimmedDesc.length < 20) {
      errs.description = `Description must be at least 20 characters (currently ${trimmedDesc.length})`;
      missing.push("Description (min 20 chars)");
      if (!firstId) firstId = "field-description";
    }

    // 5. Price
    const priceNum = Number(form.price);
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      errs.price = "Price must be greater than 0 ETB";
      missing.push("Price");
      if (!firstId) firstId = "field-price";
    }

    // 6. Duration
    const durNum = parseInt(durationValue.trim(), 10);
    if (!durationValue || isNaN(durNum) || durNum <= 0) {
      errs.duration = "Please enter a valid duration (e.g. 3 hours)";
      missing.push("Duration");
      if (!firstId) firstId = "field-duration";
    } else if (durNum > 365) {
      errs.duration = "Duration cannot exceed 365";
      missing.push("Duration (max 365)");
      if (!firstId) firstId = "field-duration";
    }

    // 7. Schedule
    if (scheduleMode === "recurring") {
      if (recurringDays.length === 0) {
        errs.schedule = "Please select at least one day of the week";
        missing.push("Recurring weekdays");
        if (!firstId) firstId = "field-schedule";
      } else if (!recurringTime) {
        errs.schedule = "Please specify a session start time";
        missing.push("Session time");
        if (!firstId) firstId = "field-schedule";
      } else if (!recurringStartDate || !recurringEndDate) {
        errs.schedule = "Please specify both start date and end date";
        missing.push("Schedule dates");
        if (!firstId) firstId = "field-schedule";
      } else if (new Date(recurringEndDate) < new Date(recurringStartDate)) {
        errs.schedule = "End date must be after start date";
        missing.push("Valid schedule date range");
        if (!firstId) firstId = "field-schedule";
      } else if (!computedFirstOccurrenceIso || estimatedRecurringCount === 0) {
        errs.schedule =
          "No upcoming sessions found matching these days. The first session must be at least 24 hours in the future.";
        missing.push("Upcoming sessions (min 24h ahead)");
        if (!firstId) firstId = "field-schedule";
      }
    } else {
      if (!form.nextOccurrenceAt) {
        errs.schedule = "Please select a date and start time";
        missing.push("Schedule date & time");
        if (!firstId) firstId = "field-schedule";
      } else {
        const occTime = new Date(form.nextOccurrenceAt).getTime();
        if (isNaN(occTime) || occTime < Date.now() + 24 * 60 * 60 * 1000) {
          errs.schedule = "Next occurrence must be at least 24 hours in the future";
          missing.push("Occurrence date (min 24h ahead)");
          if (!firstId) firstId = "field-schedule";
        }
      }
    }

    // 8. Cover Photo
    if (!coverFile) {
      errs.coverFile = "Please upload a cover photo for your listing";
      missing.push("Cover photo");
      if (!firstId) firstId = "field-cover";
    }

    // 9. Location
    if (!form.location.trim()) {
      errs.location = "Please enter a location or drop a pin on the map";
      missing.push("Location");
      if (!firstId) firstId = "field-location";
    }

    setErrors(errs);
    return {
      isValid: Object.keys(errs).length === 0,
      firstErrorId: firstId,
      missingLabels: missing,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      toast.error(
        `Please complete required fields: ${validation.missingLabels.slice(0, 3).join(", ")}${validation.missingLabels.length > 3 ? "..." : ""}`,
      );
      if (validation.firstErrorId) {
        const el = document.getElementById(validation.firstErrorId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const focusable = el.querySelector(
            "input, textarea, select",
          ) as HTMLElement;
          if (focusable) focusable.focus();
        }
      }
      return;
    }

    const nextOccIso =
      scheduleMode === "recurring"
        ? computedFirstOccurrenceIso
        : form.nextOccurrenceAt
        ? new Date(form.nextOccurrenceAt).toISOString()
        : "";

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title.trim());
      // Auto-generate summary from description / title to satisfy backend requirement
      const autoSummary =
        (form.description.trim().split("\n")[0] || form.title.trim()).slice(0, 140) ||
        "Authentic local Ethiopian experience";
      fd.append("summary", autoSummary);
      fd.append("description", form.description.trim());
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("duration", form.duration);
      fd.append("maxGuests", form.maxGuests);
      fd.append("nextOccurrenceAt", nextOccIso);
      fd.append("location", form.location.trim());
      if (form.address) fd.append("address", form.address.trim());
      if (pin?.lat) fd.append("latitude", String(pin.lat));
      if (pin?.lng) fd.append("longitude", String(pin.lng));
      if (coverFile) fd.append("imageCover", coverFile);
      galleryFiles.forEach((f) => fd.append("images", f));

      const res = await experiencesService.create(fd);
      const createdExp = (res.data?.data as any)?.data || (res.data as any)?.data || res.data;
      const expId = createdExp?._id || createdExp?.id;

      if (expId) {
        setCreatedExperienceId(expId);
        if (scheduleMode === "recurring" && recurringDays.length > 0) {
          try {
            const batchRes = await slotsService.createRecurringSlots(expId, {
              recurring: {
                daysOfWeek: recurringDays,
                timeOfDay: recurringTime,
                startDate: recurringStartDate,
                endDate: recurringEndDate,
              },
              maxGuests: Number(form.maxGuests) || undefined,
              price: Number(form.price) || undefined,
            });
            const createdCount =
              batchRes.data?.results || estimatedRecurringCount;
            setGeneratedSessionsCount(createdCount);
            toast.success(`Generated ${createdCount} recurring sessions!`);
          } catch (slotErr) {
            console.warn("Could not batch-generate slots immediately:", slotErr);
          }
        } else if (nextOccIso) {
          try {
            await slotsService.createSingleSlot(expId, {
              startTime: nextOccIso,
              maxGuests: Number(form.maxGuests) || undefined,
              price: Number(form.price) || undefined,
            });
            setGeneratedSessionsCount(1);
          } catch (slotErr) {
            console.warn("Could not create initial slot:", slotErr);
          }
        }
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: hostQueryKeys.experiences.all(),
        }),
        queryClient.invalidateQueries({ queryKey: hostQueryKeys.dashboard() }),
      ]);
      setSuccess(true);
    } catch (err: unknown) {
      const backendMsg = (err as any)?.response?.data?.message;
      toast.error(
        backendMsg ||
        getFriendlyErrorMessage(
          err,
          "Failed to submit experience. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* shared input class */
  const inputCls =
    "w-full bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-600 rounded-xl px-4 py-3 text-on-surface dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 dark:focus:border-green-400/50 transition-all placeholder:text-on-surface-variant/50 dark:placeholder:text-zinc-500";

  return (
    <>
      {success && (
        <SuccessModal
          onDashboard={() => navigate("/host-dashboard")}
          onPreview={() => navigate("/host/experiences")}
          onManageSchedule={() =>
            navigate(
              createdExperienceId
                ? `/host/experiences?scheduleExp=${createdExperienceId}`
                : "/host/experiences",
            )
          }
          sessionsCreated={generatedSessionsCount}
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
              const done = stepStatus[i];
              const active = !done && stepStatus.slice(0, i).every(Boolean);
              return (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 bg-surface dark:bg-zinc-950 px-2 relative z-10"
                >
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
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      done || active
                        ? "text-primary dark:text-green-400"
                        : "text-on-surface-variant dark:text-zinc-500"
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </header>

        {/* ── Form + Sidebar ────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* ── LEFT: form sections ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* ─ Basic Information ─ */}
            <section
              id="section-info"
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 text-primary dark:text-green-400">
                  <FileEdit className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">
                  Basic Information
                </h2>
              </div>

              <div className="space-y-6">
                <div id="field-title">
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Experience Title <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Traditional Coffee Ceremony in the Simien Foothills"
                    value={form.title}
                    onChange={set("title")}
                    className={cn(
                      inputCls,
                      errors.title &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                    )}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.title}
                    </p>
                  )}
                  {duplicateTitle && !errors.title && (
                    <p className="mt-1.5 text-xs text-error dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      You already have an active experience with this title.
                      Please choose a unique title.
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">
                    Keep it catchy and descriptive (minimum 10 characters).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div id="field-category">
                    <label className="flex items-center gap-1.5 text-sm font-bold text-on-surface dark:text-white mb-2">
                      Category <span className="text-error">*</span>
                      <Lock className="h-3 w-3 text-on-surface-variant dark:text-zinc-500" />
                    </label>
                    <select
                      value={form.category}
                      onChange={set("category")}
                      className={cn(
                        inputCls,
                        errors.category &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                      )}
                    >
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors.category}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">
                      Limited to your approved host categories.
                    </p>
                  </div>
                  <div id="field-maxGuests">
                    <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                      Max Guests <span className="text-error">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      placeholder="e.g. 8"
                      value={form.maxGuests}
                      onChange={set("maxGuests")}
                      className={cn(
                        inputCls,
                        errors.maxGuests &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                      )}
                    />
                    {errors.maxGuests && (
                      <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        {errors.maxGuests}
                      </p>
                    )}
                  </div>
                </div>

                <div id="field-description">
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Full Description <span className="text-error">*</span>
                  </label>
                  <HostExperienceDescriptionToolbar
                    textareaRef={descriptionRef}
                    value={form.description}
                    onChange={(next) =>
                      setForm((p) => ({ ...p, description: next }))
                    }
                  />
                  <textarea
                    ref={descriptionRef}
                    rows={8}
                    placeholder="Describe the soul of your experience. What will guests smell, see, and feel?"
                    value={form.description}
                    onChange={set("description")}
                    className={cn(
                      `${inputCls} resize-y min-h-[140px]`,
                      errors.description &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                    )}
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.description}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">
                    {form.description.length} characters (minimum 20 characters)
                  </p>
                  <p className="mt-1.5 text-[11px] text-on-surface-variant dark:text-zinc-500 leading-snug">
                    {EXPERIENCE_DESCRIPTION_FORMAT_HINT}
                  </p>
                </div>
              </div>
            </section>

            {/* ─ Schedule & Pricing ─ */}
            <section
              id="section-schedule"
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-[#ffddb8]/40 text-[#653e00]">
                  <Banknote className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">
                  Schedule &amp; Pricing
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div id="field-price">
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Price Per Guest (ETB) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-on-surface-variant dark:text-zinc-400">
                      ETB
                    </span>
                    <input
                      type="number"
                      min={1}
                      placeholder="1200"
                      value={form.price}
                      onChange={set("price")}
                      className={cn(
                        `${inputCls} pl-14`,
                        errors.price &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                      )}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div id="field-duration">
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Duration <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1 min-w-0">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="e.g. 3"
                        value={durationValue}
                        onChange={(e) =>
                          handleDurationValueChange(e.target.value)
                        }
                        className={cn(
                          inputCls,
                          "w-full min-w-0 px-3.5 py-3.5",
                          errors.duration &&
                            "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                        )}
                      />
                    </div>
                    <select
                      value={durationUnit}
                      onChange={(e) =>
                        handleDurationUnitChange(
                          e.target.value as "hours" | "days",
                        )
                      }
                      className="w-28 sm:w-32 shrink-0 bg-white dark:bg-zinc-800 border border-outline-variant/40 dark:border-zinc-700 rounded-xl px-4 py-3.5 text-sm font-medium text-on-surface dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                    >
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                  {errors.duration ? (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.duration}
                    </p>
                  ) : form.duration ? (
                    <p className="mt-1.5 text-xs text-on-surface-variant dark:text-zinc-400">
                      Standardized format:{" "}
                      <strong className="text-primary dark:text-green-400 font-semibold">
                        {form.duration}
                      </strong>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* ── Schedule Configuration & Recurrence ── */}
              <div
                id="field-schedule"
                className="pt-6 border-t border-outline-variant/20 dark:border-zinc-800 space-y-6"
              >
                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    How do you want to schedule this experience? <span className="text-error">*</span>
                  </label>
                  <p className="text-xs text-on-surface-variant dark:text-zinc-400 mb-4">
                    Choose whether this experience repeats regularly or starts on a single date.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleMode("recurring");
                        if (errors.schedule) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.schedule;
                            return n;
                          });
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        scheduleMode === "recurring"
                          ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-outline-variant/30 hover:border-primary/40 bg-surface-container-lowest dark:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Repeat className="h-4 w-4 text-primary" />
                        <span className="font-headline font-bold text-sm text-on-surface dark:text-white">
                          Recurring Schedule (Recommended)
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                        Automatically generates sessions across selected weekdays within your date window.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScheduleMode("single");
                        if (errors.schedule) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.schedule;
                            return n;
                          });
                        }
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        scheduleMode === "single"
                          ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                          : "border-outline-variant/30 hover:border-primary/40 bg-surface-container-lowest dark:bg-zinc-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="font-headline font-bold text-sm text-on-surface dark:text-white">
                          Single Date Only
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                        Pick one specific date &amp; time now. You can add more sessions later from Manage Schedule.
                      </p>
                    </button>
                  </div>
                </div>

                {errors.schedule && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{errors.schedule}</span>
                  </div>
                )}

                {/* ─ Mode A: Recurring Schedule Builder ─ */}
                {scheduleMode === "recurring" && (
                  <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-zinc-800/40 border border-outline-variant/20 dark:border-zinc-700/60 space-y-5">
                    {/* Repeat on Days */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider mb-2">
                        Repeat On Days of Week *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((d) => {
                          const isSelected = recurringDays.includes(d.value);
                          return (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleDay(d.value)}
                              className={`w-12 h-11 rounded-xl font-headline text-xs font-bold transition-all border ${
                                isSelected
                                    ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-white dark:bg-zinc-800 border-outline-variant/30 text-on-surface dark:text-zinc-200 hover:border-primary/40"
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time & Date Range */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant dark:text-zinc-400 mb-1.5">
                          Session Start Time (24h) *
                        </label>
                        <input
                          type="time"
                          value={recurringTime}
                          onChange={(e) => {
                            setRecurringTime(e.target.value);
                            if (errors.schedule) {
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.schedule;
                                return n;
                              });
                            }
                          }}
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant dark:text-zinc-400 mb-1.5">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                          value={recurringStartDate}
                          onChange={(e) => {
                            setRecurringStartDate(e.target.value);
                            if (errors.schedule) {
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.schedule;
                                return n;
                              });
                            }
                          }}
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant dark:text-zinc-400 mb-1.5">
                          End Date *
                        </label>
                        <input
                          type="date"
                          min={recurringStartDate}
                          value={recurringEndDate}
                          onChange={(e) => {
                            setRecurringEndDate(e.target.value);
                            if (errors.schedule) {
                              setErrors((prev) => {
                                const n = { ...prev };
                                delete n.schedule;
                                return n;
                              });
                            }
                          }}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Live Calculation / Schedule Summary Preview */}
                    <div className="p-3.5 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 flex items-start gap-2.5 text-xs text-primary dark:text-green-300">
                      <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                      <div>
                        {estimatedRecurringCount > 0 && computedFirstOccurrenceIso ? (
                          <span>
                            <strong>{estimatedRecurringCount} sessions</strong> will be automatically scheduled, starting on{" "}
                            <strong>
                              {new Date(computedFirstOccurrenceIso).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at {recurringTime}
                            </strong>.
                          </span>
                        ) : (
                          <span>
                            Please select at least one weekday and ensure start date is at least 1 day from today.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─ Mode B: Single Date Picker ─ */}
                {scheduleMode === "single" && (
                  <div className="p-5 rounded-2xl bg-surface-container-lowest dark:bg-zinc-800/40 border border-outline-variant/20 dark:border-zinc-700/60 space-y-3">
                    <label className="block text-xs font-bold text-on-surface dark:text-white uppercase tracking-wider mb-1">
                      Next Occurrence Date &amp; Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={form.nextOccurrenceAt}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, nextOccurrenceAt: e.target.value }));
                        if (errors.schedule) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.schedule;
                            return n;
                          });
                        }
                      }}
                      className={cn(
                        inputCls,
                        errors.schedule &&
                          "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                      )}
                    />
                    <p className="text-xs text-on-surface-variant dark:text-zinc-400">
                      Must be at least 24 hours from now. You can manage and add more sessions anytime.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 p-4 bg-surface-container-low dark:bg-zinc-800 rounded-xl flex items-start gap-3">
                <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                  You keep{" "}
                  <strong className="text-on-surface dark:text-white">
                    85%
                  </strong>{" "}
                  of each booking. Endebeto's 15% platform commission is
                  automatically deducted. You can update the next occurrence
                  date anytime after approval.
                </p>
              </div>
            </section>

            {/* ─ Gallery ─ */}
            <section
              id="section-media"
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-secondary-container/40 dark:bg-emerald-900/30 text-primary dark:text-green-400">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">
                  Gallery
                </h2>
              </div>

              <div className="space-y-6">
                {/* cover upload */}
                <div id="field-cover">
                  {coverPreview ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video border border-outline-variant/20 dark:border-zinc-700 group">
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setCoverFile(null)}
                          className="bg-white/90 text-error rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <X className="h-3.5 w-3.5" /> Remove Cover
                        </button>
                      </div>
                      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        Cover Image
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed border-outline-variant/50 dark:border-zinc-600 rounded-2xl p-12 text-center hover:border-primary/40 dark:hover:border-green-400/40 hover:bg-primary/3 dark:hover:bg-primary/10 transition-all cursor-pointer",
                        errors.coverFile &&
                          "border-red-500 bg-red-50/20 dark:bg-red-950/20 hover:border-red-500",
                      )}
                    >
                      <Upload className="h-10 w-10 text-primary dark:text-green-400 mx-auto mb-3 opacity-60" />
                      <p className="text-base font-headline font-bold text-primary dark:text-green-400">
                        Upload Cover Image <span className="text-error">*</span>
                      </p>
                      <p className="text-sm text-on-surface-variant dark:text-zinc-400 mt-1">
                        Required · Recommended: 1600×900px, JPG or PNG
                      </p>
                      <span className="inline-block mt-3 px-4 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary dark:text-green-400 rounded-full text-xs font-semibold">
                        Browse files
                      </span>
                    </div>
                  )}
                  {errors.coverFile && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.coverFile}
                    </p>
                  )}
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setCoverFile(f);
                        if (errors.coverFile) {
                          setErrors((prev) => {
                            const n = { ...prev };
                            delete n.coverFile;
                            return n;
                          });
                        }
                      }
                    }}
                  />
                </div>

                {/* gallery grid */}
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant dark:text-zinc-400 mb-3">
                    Additional Photos{" "}
                    <span className="font-normal">
                      (up to 5 — optional but strongly recommended)
                    </span>
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {galleryPreview.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl overflow-hidden relative group border border-outline-variant/10 dark:border-zinc-700"
                      >
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
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
                        <span className="text-[10px] font-semibold">
                          Add photo
                        </span>
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
                      if (f && galleryFiles.length < 5)
                        setGalleryFiles((p) => [...p, f]);
                    }}
                  />
                </div>
              </div>
            </section>

            {/* ─ Location ─ */}
            <section
              id="section-location"
              className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/10 dark:border-zinc-700"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-[#ffddb8]/40 text-[#653e00]">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-primary dark:text-green-400">
                  Meetup Location
                </h2>
              </div>

              <div className="space-y-5">
                <div id="field-location">
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Location Name <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tomoca Coffee Roasters, Piazza — Addis Ababa"
                    value={form.location}
                    onChange={set("location")}
                    className={cn(
                      inputCls,
                      errors.location &&
                        "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/20 dark:bg-red-950/20",
                    )}
                  />
                  {errors.location && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {errors.location}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface dark:text-white mb-2">
                    Street Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Woreda 01, House Number 42, Addis Ababa"
                    value={form.address}
                    onChange={set("address")}
                    className={`${inputCls} resize-none`}
                  />
                </div>

                <div className="flex gap-3 rounded-xl border border-primary/20 dark:border-green-500/25 bg-primary/5 dark:bg-emerald-950/35 px-4 py-3 text-sm text-on-surface-variant dark:text-zinc-300 leading-relaxed">
                  <Info
                    className="h-5 w-5 shrink-0 text-primary dark:text-green-400 mt-0.5"
                    aria-hidden
                  />
                  <p>
                    <span className="font-semibold text-on-surface dark:text-zinc-100">
                      Use the map
                    </span>
                    {" — "}
                    Search for your meetup spot or tap the map to drop a pin. We
                    use those coordinates (not just the text above) to place
                    your listing on the map and set the city guests can search
                    by.
                  </p>
                </div>

                <LocationPicker
                  onChange={(loc) => {
                    setPin(loc.lat ? loc : null);
                    if (loc.displayName && !form.location) {
                      setForm((p) => ({
                        ...p,
                        location: loc.displayName
                          .split(",")
                          .slice(0, 2)
                          .join(",")
                          .trim(),
                      }));
                    }
                    if (errors.location) {
                      setErrors((prev) => {
                        const n = { ...prev };
                        delete n.location;
                        return n;
                      });
                    }
                  }}
                />
              </div>
            </section>

            {/* ─ Form actions ─ */}
            <div className="flex items-center justify-end pt-2 pb-8 gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── RIGHT: sticky sidebar ── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            {/* Host Success Tip */}
            <div className="bg-primary-container dark:bg-[#064e3b] text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div
                className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(6,78,59,0.6)" }}
              />
              <div className="relative z-10">
                <h3 className="text-xl font-headline font-bold mb-4">
                  Host Success Tip
                </h3>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  "Experiences with at least 4 high-quality photos receive{" "}
                  <strong className="text-[#ffddb8]">2.5×</strong> more bookings
                  than those with only one."
                </p>
                <div className="flex items-center gap-2 text-[#ffddb8]">
                  <Star className="h-4 w-4 fill-[#ffddb8]" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Heritage Level: Pro
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Steps */}
            <div className="bg-tertiary-container dark:bg-[#3d2400] rounded-2xl p-8 shadow-sm border border-outline-variant/10 dark:border-zinc-700">
              <h3 className="text-lg font-headline font-bold text-white mb-5">
                Verification Steps
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    done: true,
                    label: "Identity Confirmed",
                    sub: "Government ID verified on 12/04/24",
                  },
                  {
                    done: true,
                    label: "Host Onboarding",
                    sub: "Heritage Standards course completed",
                  },
                  {
                    done: false,
                    label: "Experience Audit",
                    sub: "Will begin after submission",
                  },
                ].map((item) => (
                  <li
                    key={item.label}
                    className={`flex items-start gap-3 ${!item.done ? "opacity-50" : ""}`}
                  >
                    {item.done ? (
                      <CheckCircle2 className="h-5 w-5 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-white/50 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.label}
                      </p>
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
                  {
                    id: "section-info",
                    label: "Basic Information",
                    done: infoFilled,
                    hasError: !!(
                      errors.title ||
                      errors.category ||
                      errors.maxGuests ||
                      errors.description
                    ),
                  },
                  {
                    id: "section-schedule",
                    label: "Schedule & Pricing",
                    done: scheduleFilled,
                    hasError: !!(
                      errors.price ||
                      errors.duration ||
                      errors.schedule
                    ),
                  },
                  {
                    id: "section-media",
                    label: "Cover Photo",
                    done: mediaFilled,
                    hasError: !!errors.coverFile,
                  },
                  {
                    id: "section-location",
                    label: "Location",
                    done: locationFilled,
                    hasError: !!errors.location,
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      document
                        .getElementById(item.id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="w-full flex items-center justify-between text-left group p-1.5 -mx-1.5 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.hasError ? (
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      ) : item.done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary dark:text-green-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-outline-variant dark:text-zinc-600 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          item.hasError
                            ? "text-red-600 dark:text-red-400 font-semibold"
                            : item.done
                            ? "text-on-surface dark:text-white font-medium"
                            : "text-on-surface-variant dark:text-zinc-400"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-primary dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      Jump to &rarr;
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-4 h-1.5 bg-outline-variant/20 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary dark:bg-green-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${([infoFilled, scheduleFilled, mediaFilled, locationFilled].filter(Boolean).length / 4) * 100}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-on-surface-variant dark:text-zinc-400 mt-2 text-right">
                {
                  [
                    infoFilled,
                    scheduleFilled,
                    mediaFilled,
                    locationFilled,
                  ].filter(Boolean).length
                }{" "}
                / 4 sections complete
              </p>
            </div>

            {/* Need Help */}
            <div className="p-6 border-2 border-dashed border-outline-variant/40 dark:border-zinc-700 rounded-2xl">
              <h3 className="text-sm font-headline font-bold text-primary dark:text-green-400 uppercase tracking-widest mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-on-surface-variant dark:text-zinc-400 mb-4 leading-relaxed">
                Our curator support team is available 24/7 to help you craft the
                perfect experience listing.
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
    </>
  );
}
