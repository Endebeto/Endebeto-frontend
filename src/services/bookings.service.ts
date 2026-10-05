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
    /** Present when populated; true if platform hid the listing from the catalog */
    suspended?: boolean;
    suspensionReason?: string;
    host?: { _id: string; name: string; email: string };
    latestAnnouncement?: {
      subject: string;
      message: string;
      sentAt: string;
    };
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
  status: "upcoming" | "completed" | "paymentExpired" | "cancelled";
  paid: boolean;
  attendanceStatus?: "unmarked" | "checked_in" | "no_show";
  checkedInAt?: string;
  /** From GET /bookings/me: whether this user already left a review for this experience. */
  userHasReviewed?: boolean;
  completedAt?: string;
  createdAt: string;
}

// §3.17: canonical paginated shape — { status, results, total, page, limit, pages, data: T[] }
export interface BookingListResponse {
  status: string;
  /** True when using dashboard snapshot mode (aggregates + recent rows only). */
  dashboard?: boolean;
  /** Count of items in the current page (or recent rows when dashboard). */
  results: number;
  /** Total count across all pages (matches current filters). For dashboard: recent row count. */
  total: number;
  /** Host bookings: total rows for this host ignoring tab/search (stats strip). */
  totalBookings?: number;
  /** Dashboard: sum of guest quantities for stored-status upcoming bookings. */
  upcomingGuestsTotal?: number;
  /** Dashboard: booking counts grouped by experience id. */
  bookingCountByExperience?: { experienceId: string; count: number }[];
  page: number;
  limit: number;
  pages: number;
  // §5A: cancelled added to match backend summarizeBookings output
  summary?: { upcoming: number; completed: number; paymentExpired: number; cancelled: number };
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

/** POST /bookings/verify — shape varies by Chapa outcome */
export interface VerifyPaymentResponse {
  status: "success" | "failed";
  message?: string;
  booking?: Booking;
  raw?: unknown;
}

export const bookingsService = {
  getCheckoutSession: (experienceId: string, qty = 1) =>
    api.get<CheckoutSessionResponse>(
      `/bookings/checkout-session/${experienceId}`,
      { params: { qty } }
    ),

  /** Chapa return / callback: confirms payment and may create booking (requires matching gateway meta). */
  verifyPayment: (txRef: string) =>
    api.post<VerifyPaymentResponse>(`/bookings/verify`, { tx_ref: txRef }),

  getMyBookings: (params?: { page?: number; limit?: number }) =>
    api.get<BookingListResponse>("/bookings/me", { params }),

  getHostBookings: (params?: {
    page?: number;
    limit?: number;
    tab?: "upcoming" | "completed" | "paymentExpired" | "cancelled";
    q?: string;
    /** Lightweight dashboard snapshot: aggregates + up to `recentLimit` recent bookings (default 5). */
    dashboard?: boolean;
    recentLimit?: number;
  }) => api.get<BookingListResponse>("/bookings/host/bookings", { params }),

  getAllBookings: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<BookingListResponse>("/bookings", { params }),

  cancelBooking: (bookingId: string) =>
    api.patch<{ status: string; message: string; data: { booking: Booking } }>(
      `/bookings/${bookingId}/cancel`
    ),

  updateAttendance: (
    bookingId: string,
    status: "unmarked" | "checked_in" | "no_show"
  ) =>
    api.patch<{ status: string; data: { data: Booking } }>(
      `/bookings/${bookingId}/attendance`,
      { status }
    ),

  getAvailability: (experienceId: string) =>
    api.get<{
      status: string;
      data: { booked: number; available: number; maxGuests: number; nextOccurrenceAt?: string };
    }>(`/bookings/availability/${experienceId}`),

  getInvoice: (bookingId: string, context?: "guest" | "host") =>
    api.get<TaxInvoiceResponse>(`/bookings/${bookingId}/invoice`, {
      params: context ? { context } : undefined,
    }),
};

export interface TaxInvoice {
  invoiceNumber: string;
  issueDate: string;
  bookingId: string;
  txRef?: string | null;
  status: string;
  paid: boolean;
  paymentMethod: string;
  currency: string;
  viewerRole?: "guest" | "host" | "admin";
  experience: {
    id: string;
    title: string;
    slug?: string;
    imageCover?: string;
    location: string;
    duration?: string;
  };
  host: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    tinNumber?: string | null;
  };
  guest: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
  };
  experienceDate?: string | null;
  guestsCount: number;
  pricePerGuest: number;
  grossTotal: number;
  breakdown: {
    platformFeeRate?: number;
    platformFee?: number;
    taxType: string;
    taxRate: number;
    taxAmount: number;
    taxInclusive: boolean;
    netHostPayout?: number;
  };
  issuer: {
    legalEntity: string;
    tradeName: string;
    tin: string;
    vatNumber: string;
    address: string;
    supportEmail: string;
    supportPhone: string;
  };
}

export interface TaxInvoiceResponse {
  status: string;
  data: {
    invoice: TaxInvoice;
  };
}

