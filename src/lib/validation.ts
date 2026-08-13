import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, "").slice(-10))
  .refine((v) => /^[6-9]\d{9}$/.test(v), { message: "Enter a valid 10-digit mobile number" });

export const passwordSchema = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(72, { message: "Password is too long" });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Please enter a name" })
  .max(80, { message: "Name is too long" });

export const optionalEmail = z
  .string()
  .trim()
  .max(255)
  .email({ message: "Enter a valid email" })
  .optional()
  .or(z.literal(""));

export const studentRegistrationSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: optionalEmail,
  password: passwordSchema,
  studentClass: z.string().min(1, { message: "Select a class" }),
  board: z.string().min(1, { message: "Select a board" }),
  subjects: z.array(z.string()).min(1, { message: "Select at least one subject" }),
  location: z.string().trim().min(2, { message: "Enter your locality" }).max(160),
  preferredTiming: z.string().trim().max(80).optional().or(z.literal("")),
  teachingMode: z.string().min(1),
});
export type StudentRegistrationInput = z.infer<typeof studentRegistrationSchema>;

export const teacherRegistrationSchema = z.object({
  fullName: nameSchema,
  phone: phoneSchema,
  email: optionalEmail,
  password: passwordSchema,
  qualification: z.string().trim().min(2, { message: "Enter your qualification" }).max(160),
  experienceYears: z.coerce.number().int().min(0).max(60),
  subjects: z.array(z.string()).min(1, { message: "Select at least one subject" }),
  classes: z.array(z.string()).min(1, { message: "Select at least one class" }),
  boards: z.array(z.string()).min(1, { message: "Select at least one board" }),
  location: z.string().trim().min(2, { message: "Enter your area" }).max(160),
  teachingModes: z.array(z.string()).min(1, { message: "Select at least one mode" }),
  availableDays: z.array(z.string()).min(1, { message: "Select your available days" }),
  availableFrom: z.string().trim().max(20).optional().or(z.literal("")),
  availableTo: z.string().trim().max(20).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  photoPath: z.string().trim().max(300).optional().or(z.literal("")),
});
export type TeacherRegistrationInput = z.infer<typeof teacherRegistrationSchema>;

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, { message: "Enter your password" }),
});

export const tuitionRequestSchema = z.object({
  studentClass: z.string().min(1, { message: "Select a class" }),
  board: z.string().min(1, { message: "Select a board" }),
  subjects: z.array(z.string()).min(1, { message: "Select at least one subject" }),
  location: z.string().trim().min(2, { message: "Enter the location" }).max(160),
  preferredDays: z.array(z.string()).min(1, { message: "Select preferred days" }),
  preferredTime: z.string().trim().max(60).optional().or(z.literal("")),
  teachingMode: z.string().min(1),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
  preferredTeacherId: z.string().uuid().optional().or(z.literal("")),
});

export const complaintSchema = z.object({
  category: z.string().min(1, { message: "Select a category" }),
  teacherId: z.string().uuid().optional().or(z.literal("")),
  details: z
    .string()
    .trim()
    .min(10, { message: "Please describe the issue (min 10 characters)" })
    .max(2000),
});

export const replacementSchema = z.object({
  assignmentId: z.string().uuid({ message: "Select the current tuition" }),
  reason: z.string().trim().min(10, { message: "Please tell us the reason" }).max(1000),
  requirements: z.string().trim().max(1000).optional().or(z.literal("")),
  preferredTiming: z.string().trim().max(120).optional().or(z.literal("")),
  extraInfo: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  teacherId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().or(z.literal("")),
});
