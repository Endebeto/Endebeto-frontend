import api from "@/lib/api";

export interface Review {
  _id: string;
  review: string;
  rating: number;
  experience: string;
  user: {
    _id: string;
    name: string;
    photo?: string;
  };
  createdAt: string;
}

export interface ReviewListResponse {
  status: string;
  results: number;
  data: { reviews: Review[] };
}

export const reviewsService = {
  getForExperience: (experienceId: string) =>
    api.get<ReviewListResponse>(`/experiences/${experienceId}/reviews`),

  create: (experienceId: string, payload: { review: string; rating: number }) =>
    api.post<{ status: string; data: { review: Review } }>(
      `/experiences/${experienceId}/reviews`,
      payload
    ),

  update: (reviewId: string, payload: { review?: string; rating?: number }) =>
    api.patch(`/reviews/${reviewId}`, payload),

  delete: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}`),
};
