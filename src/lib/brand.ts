export const BRAND = {
  name: "Tuition Wallah",
  nameUpper: "TUITION WALLAH",
  tagline: "Find the Right Tutor, Build a Better Future.",
  mission: "YOUR SUCCESS IS OUR MISSION",
  phone: "8081918275",
  phoneHref: "tel:+918081918275",
  whatsapp: "https://wa.me/918081918275",
  address: "Vikas Nagar, Bargdwa, Gorakhpur",
  social: {
    whatsapp: "https://wa.me/918081918275",
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);

export const BOARDS = ["CBSE", "ICSE", "U.P. Board"] as const;

export const SUBJECTS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Science",
  "History",
  "Geography",
  "Computer Science",
  "Accountancy",
  "Economics",
  "Sanskrit",
  "All Subjects",
] as const;

export const MODES = ["Home Tuition", "Online"] as const;

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const TEACHER_STATUSES = [
  "pending",
  "under_review",
  "interview",
  "approved",
  "rejected",
  "suspended",
] as const;

export const COMPLAINT_CATEGORIES = [
  "Teacher",
  "Tuition",
  "Scheduling",
  "Communication",
  "Other",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  interview: "Interview",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  open: "Open",
  assigned: "Assigned",
  closed: "Closed",
  cancelled: "Cancelled",
  resolved: "Resolved",
  active: "Active",
  ended: "Ended",
  replaced: "Replaced",
};

/** Normalises an Indian mobile number to 10 digits. */
export function normalisePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Auth identity email derived from the mobile number (login is mobile-based). */
export function phoneToEmail(phone: string): string {
  return `${normalisePhone(phone)}@tuitionwallah.app`;
}

export function teacherPhotoUrl(path?: string | null): string | null {
  if (!path) return null;
  return `/api/public/teacher-photo/${path}`;
}
