import api from "@/lib/api";

export interface Booking {
  _id: string;
  experience: {
    _id: string;
    title: string;
    imageCover?: string;
    location?: string;
    price: number;
    duration?: string;
    nextOccurrenceAt?: string;
    host?: { _id: string; name: string; email: string };
  };
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  quantity: number;
  price: number;
  txRef?: string;
  experienceDate?: string;
  status: "upcoming" | "completed" | "expired" | "cancelled";
  paid: boolean;
  completedAt?: string;
  createdAt: string;
}

// Backend wraps bookings directly in `data` (array), not `data.bookings`
export interface BookingListResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  pages: number;
  summary?: { upcoming: number; completed: number; expired: number };
  totalEarnings?: number;
  totalRevenue?: number;
  data: Booking[];
}

// Backend returns snake_case checkout_url
export interface CheckoutSessionResponse {
  status: string;
  checkout_url: string;
  tx_ref: string;
}

export const bookingsService = {
  getCheckoutSession: (experienceId: string, qty = 1) =>
    api.get<CheckoutSessionResponse>(
      `/bookings/checkout-session/${experienceId}`,
      { params: { qty } }
    ),

  verifyPayment: (txRef: string) =>
    api.post(`/bookings/verify`, { tx_ref: txRef }),

  getMyBookings: (params?: { page?: number; limit?: number }) =>
    api.get<BookingListResponse>("/bookings/me", { params }),

  getHostBookings: (params?: { page?: number; limit?: number }) =>
    api.get<BookingListResponse>("/bookings/host/bookings", { params }),

  getAllBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<BookingListResponse>("/bookings", { params }),

  cancelBooking: (bookingId: string) =>
    api.patch<{ status: string; message: string; data: { booking: Booking } }>(
      `/bookings/${bookingId}/cancel`
    ),

  getAvailability: (experienceId: string) =>
    api.get<{
      status: string;
      data: { booked: number; available: number; maxGuests: number; nextOccurrenceAt?: string };
    }>(`/bookings/availability/${experienceId}`),
};
