import api from "@/lib/api";

export interface ExperienceSlot {
  _id: string;
  experience: string;
  host: string;
  startTime: string;
  endTime: string;
  maxGuests: number;
  bookedGuests: number;
  availableSpots: number;
  price: number | null;
  status: "open" | "full" | "cancelled" | "completed";
  cutoffHours: number;
  isRecurring?: boolean;
  recurringRuleId?: string | null;
  note?: string;
  isBookable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecurringSlotRule {
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeOfDay: string; // "HH:MM" 24h
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
}

export interface CreateSingleSlotPayload {
  startTime: string;
  endTime?: string;
  maxGuests?: number;
  price?: number | null;
  cutoffHours?: number;
  note?: string;
}

export interface CreateRecurringSlotsPayload {
  recurring: RecurringSlotRule;
  maxGuests?: number;
  price?: number | null;
  cutoffHours?: number;
  note?: string;
}

export interface UpdateSlotPayload {
  maxGuests?: number;
  price?: number | null;
  cutoffHours?: number;
  status?: "open" | "cancelled";
  note?: string;
}

export interface SlotsResponse {
  status: string;
  results: number;
  data: {
    slots: ExperienceSlot[];
    experience: {
      id: string;
      title: string;
      defaultMaxGuests: number;
      defaultPrice: number;
      duration?: string;
    };
  };
}

export interface SingleSlotResponse {
  status: string;
  data: {
    slot: ExperienceSlot;
  };
}

export interface BatchSlotsResponse {
  status: string;
  results: number;
  data: {
    slots: ExperienceSlot[];
    recurringRuleId: string;
  };
}

export const slotsService = {
  getExperienceSlots: (
    experienceId: string,
    params?: { from?: string; to?: string; includeCancelled?: boolean }
  ) =>
    api.get<SlotsResponse>(`/experiences/${experienceId}/slots`, {
      params,
    }),

  createSingleSlot: (experienceId: string, payload: CreateSingleSlotPayload) =>
    api.post<SingleSlotResponse>(`/experiences/${experienceId}/slots`, payload),

  createRecurringSlots: (
    experienceId: string,
    payload: CreateRecurringSlotsPayload
  ) =>
    api.post<BatchSlotsResponse>(`/experiences/${experienceId}/slots`, payload),

  updateSlot: (
    experienceId: string,
    slotId: string,
    payload: UpdateSlotPayload
  ) =>
    api.patch<SingleSlotResponse>(
      `/experiences/${experienceId}/slots/${slotId}`,
      payload
    ),

  deleteSlot: (experienceId: string, slotId: string) =>
    api.delete<{ status: string; message?: string }>(
      `/experiences/${experienceId}/slots/${slotId}`
    ),
};
