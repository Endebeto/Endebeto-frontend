import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Repeat,
  Trash2,
  Pencil,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import {
  slotsService,
  type ExperienceSlot,
  type CreateSingleSlotPayload,
  type CreateRecurringSlotsPayload,
  type UpdateSlotPayload,
} from "@/services/slots.service";
import type { Experience } from "@/services/experiences.service";

interface HostScheduleManagerModalProps {
  experience: Experience;
  onClose: () => void;
}

type TabType = "slots" | "single" | "recurring";

const DAYS_OF_WEEK = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export function HostScheduleManagerModal({
  experience,
  onClose,
}: HostScheduleManagerModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("slots");
  const expId = experience._id || experience.id;

  // Query slots
  const {
    data: slotsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["experience-slots", expId],
    queryFn: () => slotsService.getExperienceSlots(expId, { includeCancelled: true }),
    enabled: !!expId,
  });

  const slots: ExperienceSlot[] = useMemo(() => {
    return slotsData?.data?.data?.slots || [];
  }, [slotsData]);

  // Single slot form state
  const [singleDate, setSingleDate] = useState("");
  const [singleMaxGuests, setSingleMaxGuests] = useState(
    experience.maxGuests || 4,
  );
  const [singlePrice, setSinglePrice] = useState<string>("");
  const [singleCutoff, setSingleCutoff] = useState<number>(2);
  const [singleNote, setSingleNote] = useState("");

  // Recurring form state
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 6]); // Default weekends
  const [recurringTime, setRecurringTime] = useState("10:00");
  const [recurringStartDate, setRecurringStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [recurringEndDate, setRecurringEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28); // 4 weeks ahead
    return d.toISOString().slice(0, 10);
  });
  const [recurringMaxGuests, setRecurringMaxGuests] = useState(
    experience.maxGuests || 4,
  );
  const [recurringPrice, setRecurringPrice] = useState<string>("");
  const [recurringCutoff, setRecurringCutoff] = useState<number>(2);

  // Edit slot inline state
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editMaxGuests, setEditMaxGuests] = useState<number>(experience.maxGuests || 4);
  const [editPrice, setEditPrice] = useState<string>("");
  const [editCutoff, setEditCutoff] = useState<number>(2);
  const [editNote, setEditNote] = useState<string>("");

  // Custom delete confirmation modal state
  const [slotToDelete, setSlotToDelete] = useState<ExperienceSlot | null>(null);

  // Mutations
  const updateSlotMutation = useMutation({
    mutationFn: ({
      slotId,
      payload,
    }: {
      slotId: string;
      payload: UpdateSlotPayload;
    }) => slotsService.updateSlot(expId, slotId, payload),
    onSuccess: () => {
      toast.success("Session updated successfully");
      setEditingSlotId(null);
      queryClient.invalidateQueries({ queryKey: ["experience-slots", expId] });
      queryClient.invalidateQueries({ queryKey: ["host", "experiences"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update session");
    },
  });

  const startEditingSlot = (slot: ExperienceSlot) => {
    setEditingSlotId(slot._id);
    setEditMaxGuests(slot.maxGuests);
    setEditPrice(
      slot.price != null &&
        Number(slot.price) > 0 &&
        Number(slot.price) !== experience.price
        ? String(slot.price)
        : "",
    );
    setEditCutoff(slot.cutoffHours ?? 2);
    setEditNote(slot.note || "");
  };

  const handleSaveEdit = (slotId: string) => {
    updateSlotMutation.mutate({
      slotId,
      payload: {
        maxGuests: Number(editMaxGuests) || experience.maxGuests,
        price: editPrice && Number(editPrice) > 0 ? Number(editPrice) : null,
        cutoffHours: Number(editCutoff) || 0,
        note: editNote.trim(),
      },
    });
  };

  const createSingleMutation = useMutation({
    mutationFn: (payload: CreateSingleSlotPayload) =>
      slotsService.createSingleSlot(expId, payload),
    onSuccess: () => {
      toast.success("Time slot scheduled successfully!");
      setSingleDate("");
      setSingleNote("");
      setActiveTab("slots");
      queryClient.invalidateQueries({ queryKey: ["experience-slots", expId] });
      queryClient.invalidateQueries({ queryKey: ["host", "experiences"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create slot");
    },
  });

  const createRecurringMutation = useMutation({
    mutationFn: (payload: CreateRecurringSlotsPayload) =>
      slotsService.createRecurringSlots(expId, payload),
    onSuccess: (res) => {
      const count = res.data?.results || 0;
      toast.success(`Successfully generated ${count} recurring sessions!`);
      setActiveTab("slots");
      queryClient.invalidateQueries({ queryKey: ["experience-slots", expId] });
      queryClient.invalidateQueries({ queryKey: ["host", "experiences"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to generate recurring slots",
      );
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => slotsService.deleteSlot(expId, slotId),
    onSuccess: (res) => {
      if (res.data?.message) {
        toast.info(res.data.message);
      } else {
        toast.success("Session removed successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["experience-slots", expId] });
      queryClient.invalidateQueries({ queryKey: ["host", "experiences"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove slot");
    },
  });

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleDate) {
      toast.error("Please pick a date and start time");
      return;
    }
    const startTime = new Date(singleDate);
    if (startTime <= new Date()) {
      toast.error("Start time must be in the future");
      return;
    }

    createSingleMutation.mutate({
      startTime: startTime.toISOString(),
      maxGuests: Number(singleMaxGuests) || experience.maxGuests,
      price: singlePrice && Number(singlePrice) > 0 ? Number(singlePrice) : null,
      cutoffHours: Number(singleCutoff) || 0,
      note: singleNote.trim(),
    });
  };

  const handleCreateRecurring = (e: React.FormEvent) => {
    e.preventDefault();
    if (recurringDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }
    if (!recurringTime) {
      toast.error("Please specify a session time (HH:MM)");
      return;
    }
    if (!recurringStartDate || !recurringEndDate) {
      toast.error("Please specify both start date and end date");
      return;
    }
    if (new Date(recurringEndDate) < new Date(recurringStartDate)) {
      toast.error("End date must be after start date");
      return;
    }

    createRecurringMutation.mutate({
      recurring: {
        daysOfWeek: recurringDays,
        timeOfDay: recurringTime,
        startDate: recurringStartDate,
        endDate: recurringEndDate,
      },
      maxGuests: Number(recurringMaxGuests) || experience.maxGuests,
      price: recurringPrice && Number(recurringPrice) > 0 ? Number(recurringPrice) : null,
      cutoffHours: Number(recurringCutoff) || 0,
    });
  };

  const toggleDay = (dayVal: number) => {
    setRecurringDays((prev) =>
      prev.includes(dayVal)
        ? prev.filter((d) => d !== dayVal)
        : [...prev, dayVal].sort(),
    );
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-lowest dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface dark:text-white leading-tight">
                Schedule &amp; Availability
              </h2>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 line-clamp-1">
                {experience.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant/15 px-6 gap-2 bg-surface-container-lowest/50">
          <button
            type="button"
            onClick={() => setActiveTab("slots")}
            className={`py-3 px-4 font-headline text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "slots"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Upcoming Sessions ({slots.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("single")}
            className={`py-3 px-4 font-headline text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "single"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Single Session
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("recurring")}
            className={`py-3 px-4 font-headline text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "recurring"
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Repeat className="h-3.5 w-3.5" />
            Recurring Schedule
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: SLOTS LIST */}
          {activeTab === "slots" && (
            <div>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-xs text-on-surface-variant">Loading schedule...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-14 px-4 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-primary">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline font-bold text-sm text-on-surface mb-1">
                    No active sessions scheduled
                  </h3>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto mb-5">
                    Guests can only book your experience when you have upcoming open sessions.
                    Add a single date or set up a recurring rule.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("single")}
                      className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Date
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("recurring")}
                      className="px-4 py-2 border border-outline-variant/30 rounded-xl text-xs font-bold hover:bg-surface-container flex items-center gap-1.5"
                    >
                      <Repeat className="h-3.5 w-3.5" /> Set Recurrence
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {slots.map((slot) => {
                    const start = new Date(slot.startTime);
                    const end = new Date(slot.endTime);
                    const isCancelled = slot.status === "cancelled";
                    const isFull = slot.status === "full" || slot.availableSpots === 0;

                    return (
                      <div
                        key={slot._id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCancelled
                            ? "bg-red-50/50 dark:bg-red-950/20 border-red-200/50 dark:border-red-900/30 opacity-75"
                            : isFull
                            ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30"
                            : "bg-surface-container-lowest dark:bg-zinc-800/40 border-outline-variant/20 hover:border-primary/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-headline font-bold text-sm text-on-surface dark:text-zinc-100">
                                {start.toLocaleDateString(undefined, {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {start.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" – "}
                                {end.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {slot.isRecurring && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  <Repeat className="h-2.5 w-2.5" /> Recurring
                                </span>
                              )}

                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  isCancelled
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                    : isFull
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                    : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                }`}
                              >
                                {slot.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-1">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <strong>
                                  {slot.bookedGuests} / {slot.maxGuests} booked
                                </strong>
                                <span className="opacity-75">
                                  ({slot.availableSpots} left)
                                </span>
                              </span>

                              <span>
                                Price:{" "}
                                <strong className="text-on-surface dark:text-zinc-200">
                                  {slot.price != null &&
                                  Number(slot.price) > 0 &&
                                  Number(slot.price) !== experience.price
                                    ? `${Number(slot.price).toLocaleString()} ETB`
                                    : `${experience.price.toLocaleString()} ETB (Default)`}
                                </strong>
                              </span>

                              {slot.cutoffHours > 0 && (
                                <span>Cutoff: {slot.cutoffHours}h before</span>
                              )}
                            </div>

                            {slot.note && (
                              <p className="text-[11px] text-on-surface-variant italic pt-0.5">
                                Note: "{slot.note}"
                              </p>
                            )}
                          </div>

                          {!isCancelled && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  editingSlotId === slot._id
                                    ? setEditingSlotId(null)
                                    : startEditingSlot(slot)
                                }
                                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                                title="Edit session capacity and price"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                disabled={deleteSlotMutation.isPending}
                                onClick={() => setSlotToDelete(slot)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 dark:hover:bg-red-900/30 transition-colors"
                                title="Delete or cancel session"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Inline Slot Editing Form */}
                        {editingSlotId === slot._id && (
                          <div className="mt-3 pt-3 border-t border-outline-variant/20 space-y-3 bg-surface-container/30 p-3 rounded-xl">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                                  Max Capacity (Guests) *
                                </label>
                                <input
                                  type="number"
                                  min={Math.max(1, slot.bookedGuests)}
                                  max={50}
                                  value={editMaxGuests}
                                  onChange={(e) => setEditMaxGuests(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs bg-surface-container-lowest text-on-surface focus:border-primary focus:outline-none"
                                />
                                {slot.bookedGuests > 0 && (
                                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                    Cannot be less than {slot.bookedGuests} booked guests
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                                  Custom Price (ETB, Optional)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder={`${experience.price} ETB (listing default)`}
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs bg-surface-container-lowest text-on-surface focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                                  Booking Cutoff (Hours Before Session)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={editCutoff}
                                  onChange={(e) => setEditCutoff(Number(e.target.value))}
                                  className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs bg-surface-container-lowest text-on-surface focus:border-primary focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                                  Session Note (Optional)
                                </label>
                                <input
                                  type="text"
                                  maxLength={100}
                                  placeholder="e.g. Sunset golden hour edition"
                                  value={editNote}
                                  onChange={(e) => setEditNote(e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs bg-surface-container-lowest text-on-surface focus:border-primary focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingSlotId(null)}
                                className="px-3 py-1 rounded-lg border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={updateSlotMutation.isPending}
                                onClick={() => handleSaveEdit(slot._id)}
                                className="px-3.5 py-1 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                              >
                                {updateSlotMutation.isPending && (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                )}
                                Save Changes
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADD SINGLE SESSION */}
          {activeTab === "single" && (
            <form onSubmit={handleCreateSingle} className="space-y-4">
              <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-2xl border border-primary/20 text-xs text-primary flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Add a specific date and time for this experience. You can customize capacity,
                  price, and booking cutoff for this session.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  Start Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={singleDate}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Max Guest Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={singleMaxGuests}
                    onChange={(e) => setSingleMaxGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Defaults to listing capacity ({experience.maxGuests})
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Price Override (ETB, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${experience.price} ETB`}
                    value={singlePrice}
                    onChange={(e) => setSinglePrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Leave blank to use experience default price
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Booking Cutoff (Hours Before Session)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={singleCutoff}
                    onChange={(e) => setSingleCutoff(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    e.g. 2 means bookings close 2 hours before start time
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Host Session Note (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    placeholder="e.g. Sunset golden hour edition"
                    value={singleNote}
                    onChange={(e) => setSingleNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("slots")}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSingleMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {createSingleMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Create Session
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BATCH RECURRING SCHEDULE */}
          {activeTab === "recurring" && (
            <form onSubmit={handleCreateRecurring} className="space-y-4">
              <div className="bg-primary/5 dark:bg-primary/10 p-3.5 rounded-2xl border border-primary/20 text-xs text-primary flex items-start gap-2">
                <Repeat className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Automatically generate multiple future sessions on chosen weekdays within a
                  date window. Duplicates will be skipped automatically.
                </span>
              </div>

              {/* Day of Week Selector */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">
                  Repeat On Days *
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = recurringDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`w-11 h-10 rounded-xl font-headline text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary/40"
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time of Day */}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  Session Start Time (24h) *
                </label>
                <input
                  type="time"
                  required
                  value={recurringTime}
                  onChange={(e) => setRecurringTime(e.target.value)}
                  className="w-full sm:w-48 px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Start From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={recurringStartDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setRecurringStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Until End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={recurringEndDate}
                    min={recurringStartDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Capacity and Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Guest Capacity Per Session
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={recurringMaxGuests}
                    onChange={(e) => setRecurringMaxGuests(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    Price Override (ETB, Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={`Default: ${experience.price} ETB`}
                    value={recurringPrice}
                    onChange={(e) => setRecurringPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("slots")}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRecurringMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {createRecurringMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Generate Schedule
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal for Deleting/Cancelling Slots */}
      {slotToDelete && (
        <div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-outline-variant/20 dark:border-zinc-800 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-headline font-bold text-base text-on-surface dark:text-white">
                {slotToDelete.bookedGuests > 0 ? "Cancel This Session?" : "Delete Time Slot?"}
              </h3>
              <p className="text-xs text-on-surface-variant dark:text-zinc-400 leading-relaxed">
                {slotToDelete.bookedGuests > 0
                  ? `This session has ${slotToDelete.bookedGuests} booked guest(s). Cancelling will stop further bookings while keeping past booking records intact.`
                  : "This session will be permanently removed from your calendar. This action cannot be undone."}
              </p>
              <div className="mt-3 text-xs font-semibold text-on-surface dark:text-zinc-200 bg-surface-container-low dark:bg-zinc-800/60 py-2 px-3 rounded-xl border border-outline-variant/15 flex items-center justify-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {new Date(slotToDelete.startTime).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {" at "}
                  {new Date(slotToDelete.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSlotToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container transition-colors"
              >
                Keep Session
              </button>
              <button
                type="button"
                disabled={deleteSlotMutation.isPending}
                onClick={() => {
                  deleteSlotMutation.mutate(slotToDelete._id);
                  setSlotToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                {deleteSlotMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : slotToDelete.bookedGuests > 0 ? (
                  "Yes, Cancel"
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
