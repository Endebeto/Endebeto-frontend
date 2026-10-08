import React, { useMemo, useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, Check, AlertCircle } from "lucide-react";
import type { ExperienceSlot } from "@/services/slots.service";

interface ExperienceSlotSelectorProps {
  slots: ExperienceSlot[];
  selectedSlot: ExperienceSlot | null;
  onSelectSlot: (slot: ExperienceSlot) => void;
  defaultPrice: number;
  bookedSlotIds?: Set<string>;
  disabled?: boolean;
}

// Helper to get local YYYY-MM-DD date key from ISO string
function getSlotLocalDateKey(isoString: string): string {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function ExperienceSlotSelector({
  slots,
  selectedSlot,
  onSelectSlot,
  defaultPrice,
  bookedSlotIds,
  disabled = false,
}: ExperienceSlotSelectorProps) {
  // Filter only upcoming bookable or open slots
  const validSlots = useMemo(() => {
    return slots.filter((s) => s.status === "open" || s.status === "full");
  }, [slots]);

  // Group slots by local date string YYYY-MM-DD
  const slotsByDate = useMemo(() => {
    const map = new Map<string, ExperienceSlot[]>();
    validSlots.forEach((slot) => {
      const dateKey = getSlotLocalDateKey(slot.startTime);
      const list = map.get(dateKey) || [];
      list.push(slot);
      map.set(dateKey, list);
    });
    return map;
  }, [validSlots]);

  const sortedDates = useMemo(() => {
    return Array.from(slotsByDate.keys()).sort();
  }, [slotsByDate]);

  // Active date selection tab
  const [activeDate, setActiveDate] = useState<string>(() => {
    if (selectedSlot) {
      return getSlotLocalDateKey(selectedSlot.startTime);
    }
    return sortedDates[0] || "";
  });

  // Ensure active date is in sync if selectedSlot or sortedDates change
  React.useEffect(() => {
    if (selectedSlot) {
      const slotDate = getSlotLocalDateKey(selectedSlot.startTime);
      setActiveDate(slotDate);
    } else if (!activeDate && sortedDates.length > 0) {
      setActiveDate(sortedDates[0]);
    }
  }, [selectedSlot, sortedDates]);

  const activeDateSlots = useMemo(() => {
    if (!activeDate) return [];
    return slotsByDate.get(activeDate) || [];
  }, [activeDate, slotsByDate]);

  if (validSlots.length === 0) {
    return null;
  }

  const formatSlotTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-primary" />
          Select Date &amp; Time
        </label>
        {selectedSlot && (
          <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
            <Check className="h-3 w-3" /> Slot selected
          </span>
        )}
      </div>

      {/* Date selector pills (horizontal scrollable) */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-outline-variant/30">
        {sortedDates.map((dateStr) => {
          const d = new Date(dateStr + "T12:00:00");
          const isSelectedDate = activeDate === dateStr;
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = d.toLocaleDateString("en-US", { day: "numeric" });
          const monthName = d.toLocaleDateString("en-US", { month: "short" });
          const dateSlots = slotsByDate.get(dateStr) || [];
          const hasBookable = dateSlots.some((s) => s.isBookable);
          const isDateBooked = dateSlots.some((s) => bookedSlotIds?.has(String(s._id)));

          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              onClick={() => {
                setActiveDate(dateStr);
                const unbooked = dateSlots.find(
                  (s) => s.isBookable && !bookedSlotIds?.has(String(s._id)),
                );
                const target = unbooked || dateSlots.find((s) => s.isBookable) || dateSlots[0];
                if (target) {
                  onSelectSlot(target);
                }
              }}
              className={`shrink-0 flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-center transition-all ${
                isSelectedDate
                  ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold shadow-sm"
                  : "border-outline-variant/20 bg-surface-container-low dark:bg-zinc-800/60 text-on-surface hover:border-primary/40"
              } ${!hasBookable && !isDateBooked ? "opacity-60" : ""}`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                {dayName}
              </span>
              <span className="text-base font-extrabold font-headline leading-tight">
                {dayNum}
              </span>
              <span className="text-[10px] opacity-75">{monthName}</span>
              <span
                className={`mt-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  isDateBooked
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold"
                    : hasBookable
                    ? "bg-primary/15 text-primary"
                    : "bg-red-500/15 text-red-500"
                }`}
              >
                {isDateBooked
                  ? "Attending"
                  : `${dateSlots.length} ${dateSlots.length === 1 ? "slot" : "slots"}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot times for active date */}
      <div className="space-y-2 pt-1">
        <p className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Available times for{" "}
          <span className="font-bold text-on-surface">
            {new Date(activeDate + "T12:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              weekday: "short",
            })}
          </span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeDateSlots.map((slot) => {
            const isChosen = selectedSlot?._id === slot._id;
            const isBookedByMe = bookedSlotIds?.has(String(slot._id));
            const startTimeFormatted = formatSlotTime(slot.startTime);
            const endTimeFormatted = formatSlotTime(slot.endTime);
            const isFull = slot.availableSpots <= 0 || slot.status === "full";
            const isNotBookable = !slot.isBookable && !isBookedByMe;

            return (
              <button
                key={slot._id}
                type="button"
                disabled={disabled || isNotBookable}
                onClick={() => onSelectSlot(slot)}
                className={`relative flex flex-col p-2.5 rounded-xl border text-left transition-all ${
                  isChosen
                    ? "border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/40 shadow-sm"
                    : isBookedByMe
                    ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500"
                    : "border-outline-variant/25 bg-surface-container-low dark:bg-zinc-800/40 hover:border-primary/50"
                } ${isNotBookable ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800/20" : ""}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-on-surface dark:text-zinc-100">
                      {startTimeFormatted}
                      {endTimeFormatted ? ` – ${endTimeFormatted}` : ""}
                    </span>
                  </div>
                  {isBookedByMe ? (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                      <Check className="h-2.5 w-2.5" /> Booked
                    </span>
                  ) : isChosen ? (
                    <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[11px]">
                  <span
                    className={`flex items-center gap-1 font-medium ${
                      isFull
                        ? "text-red-500 font-bold"
                        : slot.availableSpots <= 2
                        ? "text-amber-600 dark:text-amber-400 font-bold"
                        : "text-on-surface-variant"
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    {isFull
                      ? "Sold out"
                      : `${slot.availableSpots} spot${
                          slot.availableSpots === 1 ? "" : "s"
                        } left`}
                  </span>

                  {slot.price != null &&
                  Number(slot.price) > 0 &&
                  Number(slot.price) !== defaultPrice ? (
                    <span className="font-bold text-primary">
                      {Number(slot.price).toLocaleString()} ETB
                    </span>
                  ) : null}
                </div>

                {slot.note && (
                  <p className="mt-1 text-[10px] text-on-surface-variant italic line-clamp-1">
                    "{slot.note}"
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
