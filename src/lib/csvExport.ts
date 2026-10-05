import type {
  AdminPlatformBooking,
  AdminUser,
  AdminHostApplication,
  AdminExperience,
} from "@/services/admin.service";

const CSV_INJECTION_RE = /^[=+\-@\t\r]/;

/**
 * Sanitizes a cell value to prevent CSV formula injection in spreadsheet software (Excel, Sheets).
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  let s = String(val);
  if (CSV_INJECTION_RE.test(s)) {
    s = `'${s}`;
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Downloads generated CSV with UTF-8 BOM so Excel opens with proper character encoding.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][],
) {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const rowLines = rows
    .map((row) => row.map(sanitizeCsvCell).join(","))
    .join("\r\n");

  const csvContent = `\uFEFF${headerLine}\r\n${rowLines}`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportBookingsCsv(
  bookings: AdminPlatformBooking[],
  filenamePrefix = "bookings",
) {
  const headers = [
    "Booking ID",
    "Reference",
    "Status",
    "Paid",
    "Total Price (ETB)",
    "Guests",
    "Experience Title",
    "Experience Location",
    "Host Name",
    "Host Email",
    "Host Phone",
    "Guest Name",
    "Guest Email",
    "Guest Phone",
    "Scheduled Date",
    "Booked Date",
  ];

  const rows = bookings.map((b) => [
    b._id,
    b.txRef || "",
    b.status,
    b.paid ? "Yes" : "No",
    b.price != null ? (b.price / 100).toFixed(2) : "0.00",
    b.quantity ?? 1,
    b.experience?.title ?? "N/A",
    b.experience?.location ?? "",
    b.experience?.host?.name ?? "",
    b.experience?.host?.email ?? "",
    b.experience?.host?.phone ?? "",
    b.user?.name ?? "Guest",
    b.user?.email ?? "",
    b.user?.phone ?? "",
    b.experienceDate ? new Date(b.experienceDate).toISOString() : "",
    b.createdAt ? new Date(b.createdAt).toISOString() : "",
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  downloadCsv(`${filenamePrefix}-${timestamp}.csv`, headers, rows);
}

export function exportUsersCsv(users: AdminUser[], filenamePrefix = "users") {
  const headers = [
    "User ID",
    "Name",
    "Email",
    "Role",
    "Account Status",
    "Host Status",
    "Host Listings Suspended",
    "Email Verified",
    "Auth Provider",
    "Phone Number",
    "Joined Date",
  ];

  const rows = users.map((u) => [
    u._id,
    u.name,
    u.email,
    u.role,
    u.active === false ? "Suspended" : "Active",
    u.hostStatus ?? "none",
    u.hostListingSuspended ? "Yes" : "No",
    u.isVerified ? "Yes" : "No",
    u.authProvider || "local",
    u.phone || "",
    u.createdAt ? new Date(u.createdAt).toISOString() : "",
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  downloadCsv(`${filenamePrefix}-${timestamp}.csv`, headers, rows);
}

export function exportHostApplicationsCsv(
  apps: AdminHostApplication[],
  filenamePrefix = "host-applications",
) {
  const headers = [
    "Application ID",
    "Applicant Name",
    "Account Email",
    "Phone",
    "City / Region",
    "Full Address",
    "Experience Types",
    "Specialties",
    "Status",
    "Submitted Date",
    "Created Date",
    "Rejection Reason",
  ];

  const rows = apps.map((a) => [
    a._id,
    a.personalInfo?.fullName?.trim() || a.user?.name || "",
    a.user?.email || a.personalInfo?.email || "",
    a.personalInfo?.phoneNumber || a.user?.phone || "",
    a.personalInfo?.cityRegion || "",
    a.personalInfo?.fullAddress || "",
    (a.experienceDetails?.experienceTypes || []).join("; "),
    (a.experienceDetails?.specialties || []).join("; "),
    a.status,
    a.submittedAt ? new Date(a.submittedAt).toISOString() : "",
    a.createdAt ? new Date(a.createdAt).toISOString() : "",
    a.rejectionReason || "",
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  downloadCsv(`${filenamePrefix}-${timestamp}.csv`, headers, rows);
}

export function exportExperiencesCsv(
  experiences: AdminExperience[],
  filenamePrefix = "experiences",
) {
  const headers = [
    "Experience ID",
    "Title",
    "Status",
    "Host Name",
    "Host Email",
    "Price (ETB)",
    "Max Guests",
    "Duration (Hours)",
    "Location",
    "Average Rating",
    "Reviews Count",
    "Suspended",
    "Suspension Reason",
    "Created Date",
  ];

  const rows = experiences.map((e) => [
    e._id,
    e.title,
    e.status,
    e.host?.name ?? "",
    e.host?.email ?? "",
    e.price != null ? (e.price / 100).toFixed(2) : "0.00",
    e.maxGuests ?? 1,
    e.duration ?? "",
    e.location?.address ?? "",
    e.ratingsAverage ?? 0,
    e.ratingsQuantity ?? 0,
    e.suspended ? "Yes" : "No",
    e.suspensionReason ?? "",
    e.createdAt ? new Date(e.createdAt).toISOString() : "",
  ]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  downloadCsv(`${filenamePrefix}-${timestamp}.csv`, headers, rows);
}
