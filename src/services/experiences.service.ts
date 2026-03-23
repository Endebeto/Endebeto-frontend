import api from "@/lib/api";

export interface Review {
  _id: string;
  review: string;
  rating: number;
  user: { _id: string; name: string; photo?: string };
  createdAt?: string;
}

export interface Experience {
  _id: string;
  id: string;
  title: string;
  slug: string;
  description: string;
  summary: string;
  price: number;
  priceDiscount?: number;
  duration: string;
  maxGuests: number;
  nextOccurrenceAt?: string;
  host: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  location: string;
  images: string[];
  imageCover: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  status?: "draft" | "pending" | "approved" | "rejected";
  updatedAt: string;
  reviews?: Review[];
}

// factory.getAll  → { status, results: totalCount, data: { data: T[] } }
export interface ExperienceListResponse {
  status: string;
  results: number;
  data: { data: Experience[] };
}

// factory.getOne  → { status, data: { data: T } }
export interface ExperienceResponse {
  status: string;
  data: { data: Experience };
}

// factory.getAll for reviews  → { status, results: totalCount, data: { data: Review[] } }
export interface ReviewListResponse {
  status: string;
  results: number;
  data: { data: Review[] };
}

export interface ExperienceFilters {
  page?: number;
  limit?: number;
  sort?: string;
  location?: string;
  "price[gte]"?: number;
  "price[lte]"?: number;
  "ratingsAverage[gte]"?: number;
  fields?: string;
}

export const experiencesService = {
  getAll: (params?: ExperienceFilters) =>
    api.get<ExperienceListResponse>("/experiences", { params }),

  getOne: (id: string) =>
    api.get<ExperienceResponse>(`/experiences/${id}`),

  getSummary: () =>
    api.get<ExperienceListResponse>("/experiences/summary"),

  getStats: () =>
    api.get("/experiences/experience-stats"),

  getPending: () =>
    api.get<ExperienceListResponse>("/experiences/pending"),

  create: (data: FormData) =>
    api.post<ExperienceResponse>("/experiences", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id: string, data: Partial<Experience>) =>
    api.patch<ExperienceResponse>(`/experiences/${id}`, data),

  delete: (id: string) =>
    api.delete(`/experiences/${id}`),

  approve: (id: string) =>
    api.patch<ExperienceResponse>(`/experiences/${id}/approve`),

  reject: (id: string, reason?: string) =>
    api.patch<ExperienceResponse>(`/experiences/${id}/reject`, { reason }),

  updateNextOccurrence: (id: string, nextOccurrenceAt: string) =>
    api.patch<ExperienceResponse>(`/experiences/${id}/next-occurrence`, { nextOccurrenceAt }),

  getMyExperiences: (params?: { page?: number; limit?: number }) =>
    api.get<ExperienceListResponse>("/experiences/mine", { params }),

  getAvailability: (id: string) =>
    api.get<{
      status: string;
      data: { booked: number; available: number; maxGuests: number; nextOccurrenceAt?: string };
    }>(`/bookings/availability/${id}`),

  // Paginated reviews for a single experience
  // GET /experiences/:experienceId/reviews?page=1&limit=5&sort=-createdAt
  getReviews: (experienceId: string, params: { page?: number; limit?: number }) =>
    api.get<ReviewListResponse>(`/experiences/${experienceId}/reviews`, {
      params: { sort: "-createdAt", ...params },
    }),
};
