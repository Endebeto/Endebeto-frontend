import api from "@/lib/api";

export interface HostApplication {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    photo?: string;
  };
  status: "draft" | "submitted" | "pending" | "approved" | "rejected";
  personalInfo?: {
    fullName: string;
    email?: string;
    phoneNumber: string;
    cityRegion: string;
    fullAddress?: string;
    languagesSpoken: string[];
    aboutYou: string;
  };
  experienceDetails?: {
    experienceTypes: string[];
    specialties: string[];
    previousExperience?: string;
  };
  media?: {
    nationalIdFront?: string;
    nationalIdBack?: string;
    personalPhoto?: string;
  };
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ApplicationResponse {
  status: string;
  data: { application: HostApplication };
}

export type SingleFileField = "nationalIdFront" | "nationalIdBack" | "personalPhoto";

export interface UploadSingleFileResponse {
  status: string;
  message: string;
  data: {
    savedField: Partial<Record<SingleFileField, string>>;
    media: HostApplication["media"];
  };
}

export const hostApplicationsService = {
  /** Step 1: create or update personal info. Backend reads req.body.personalInfo */
  start: (personalInfo: HostApplication["personalInfo"]) =>
    api.post<ApplicationResponse>("/host-applications", { personalInfo }),

  /** Step 2: update experience details. Backend reads req.body.experienceDetails */
  updateExperienceDetails: (experienceDetails: HostApplication["experienceDetails"]) =>
    api.patch<ApplicationResponse>("/host-applications/experience-details", { experienceDetails }),

  /** Upload a single file immediately on selection.
   *  `field` must match one of the multer field names.
   *  Timeout is 2 min — Cloudinary can be slow on larger images. */
  uploadSingleFile: (field: SingleFileField, file: File) => {
    const fd = new FormData();
    fd.append(field, file);
    return api.post<UploadSingleFileResponse>("/host-applications/upload-media", fd, {
      timeout: 120_000,
    });
  },

  /** Step 3: finalize submission (all files must already be saved via uploadSingleFile) */
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
    api.patch<ApplicationResponse>(`/host-applications/${applicationId}/reject`, { rejectionReason: reason }),
};
