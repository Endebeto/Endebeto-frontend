import api from "@/lib/api";

export interface HostApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  status: "draft" | "pending" | "approved" | "rejected";
  currentStep: number;
  personalInfo?: {
    fullName: string;
    phoneNumber: string;
    cityRegion: string;
    fullAddress: string;
    languagesSpoken: string[];
    aboutYou: string;
  };
  experienceDetails?: {
    title: string;
    description: string;
    location: string;
    duration: string;
    maxGuests: number;
    price: number;
    category?: string;
  };
  mediaUrls?: string[];
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ApplicationResponse {
  status: string;
  data: { application: HostApplication };
}

export const hostApplicationsService = {
  start: (personalInfo: HostApplication["personalInfo"]) =>
    api.post<ApplicationResponse>("/host-applications", personalInfo),

  updateExperienceDetails: (data: HostApplication["experienceDetails"]) =>
    api.patch<ApplicationResponse>("/host-applications/experience-details", data),

  updateMedia: (mediaUrls: string[]) =>
    api.patch<ApplicationResponse>("/host-applications/media", { mediaUrls }),

  uploadMedia: (formData: FormData) =>
    api.post<{ status: string; urls: string[] }>("/host-applications/upload-media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  submit: () =>
    api.post<ApplicationResponse>("/host-applications/submit"),

  reapply: () =>
    api.post<ApplicationResponse>("/host-applications/reapply"),

  getMyApplication: () =>
    api.get<ApplicationResponse>("/host-applications/my-application"),

  // Admin endpoints
  getPending: () =>
    api.get<{ status: string; results: number; data: { applications: HostApplication[] } }>(
      "/host-applications/pending"
    ),

  getByUserId: (userId: string) =>
    api.get<ApplicationResponse>(`/host-applications/user/${userId}`),

  approve: (applicationId: string) =>
    api.patch<ApplicationResponse>(`/host-applications/${applicationId}/approve`),

  reject: (applicationId: string, reason: string) =>
    api.patch<ApplicationResponse>(`/host-applications/${applicationId}/reject`, { reason }),
};
