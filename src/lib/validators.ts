import { z } from "zod";

// ─── LIBRARY ────────────────────────────────────────────

export const speakerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  house: z.string().optional(),
  batchYear: z.string().optional(),
  photoUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  defaultSlotLimit: z.coerce.number().int().min(1).default(30),
  notes: z.string().optional(),
});

export const companySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sector: z.string().min(1, "Sector is required"),
  description: z.string().min(1, "Description is required"),
  websiteUrl: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  defaultSlotLimit: z.coerce.number().int().min(1).default(2),
  notes: z.string().optional(),
});

// ─── SESSIONS ───────────────────────────────────────────

export const talkSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  editionLabel: z.string().min(1, "Edition label is required"),
  targetClass: z.enum(["9", "10", "9_10"]),
  description: z.string().optional(),
  sessionDate: z.string().optional(),
  timeSlot: z.string().optional(),
  regDeadline: z.string().optional(),
});

export const internshipSessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  editionLabel: z.string().min(1, "Edition label is required"),
  targetClass: z.enum(["9", "10", "9_10"]),
  maxPreferences: z.coerce.number().int().min(1).max(3).default(3),
  description: z.string().optional(),
  regDeadline: z.string().optional(),
});

// Adding speaker to session (link)
export const addSpeakerToSessionSchema = z.object({
  speakerId: z.string().uuid(),
  topic: z.string().min(1, "Topic is required"),
  topicDescription: z.string().optional(),
  venue: z.string().optional(),
  slotLimit: z.coerce.number().int().min(1).default(30),
  displayOrder: z.coerce.number().int().default(0),
});

// Updating an existing session_speaker
export const updateSessionSpeakerSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  topicDescription: z.string().optional(),
  venue: z.string().optional(),
  slotLimit: z.coerce.number().int().min(1).default(30),
  displayOrder: z.coerce.number().int().default(0),
});

// Adding company to session (link)
export const addCompanyToSessionSchema = z.object({
  companyId: z.string().uuid(),
  internshipDate: z.string().optional(),
  slotsAvailable: z.coerce.number().int().min(1).default(2),
  displayOrder: z.coerce.number().int().default(0),
  aboutInternship: z.string().optional(),
  whoFor: z.string().optional(),
  whatToExpect: z.string().optional(),
  whatToBring: z.string().optional(),
});

// Updating an existing session_company
export const updateSessionCompanySchema = z.object({
  internshipDate: z.string().optional(),
  slotsAvailable: z.coerce.number().int().min(1).default(2),
  displayOrder: z.coerce.number().int().default(0),
  aboutInternship: z.string().optional(),
  whoFor: z.string().optional(),
  whatToExpect: z.string().optional(),
  whatToBring: z.string().optional(),
});

// ─── REGISTRATIONS ──────────────────────────────────────

export const talkRegistrationSchema = z.object({
  studentName: z.string().min(1, "Name is required"),
  classSection: z.string().min(1, "Class/Section is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  parentName: z.string().min(1, "Parent name is required"),
  parentEmail: z.string().email("Invalid email"),
  parentPhone: z.string().min(10, "Invalid phone number"),
  whyAttend: z.string().min(10, "Please write at least 10 characters"),
  sessionSpeakerId: z.string().uuid("Please select a speaker"),
  sessionId: z.string().uuid(),
});

const optionalUuid = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => v === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v), {
    message: "Invalid company selection",
  });

const optionalReason = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined))
  .refine((v) => v === undefined || v.length >= 10, {
    message: "Please write at least 10 characters",
  });

export const internshipRegistrationSchema = z
  .object({
    studentName: z.string().min(1, "Name is required"),
    classSection: z.string().min(1, "Class/Section is required"),
    rollNumber: z.string().min(1, "Roll number is required"),
    parentName: z.string().min(1, "Parent name is required"),
    parentEmail: z.string().email("Invalid email"),
    parentPhone: z.string().min(10, "Invalid phone number"),
    interests: z.string().optional(),
    sessionId: z.string().uuid(),
    pref1SessionCompanyId: z.string().uuid("Please select your first preference"),
    pref1Reason: z.string().min(10, "Please write at least 10 characters"),
    pref2SessionCompanyId: optionalUuid,
    pref2Reason: optionalReason,
    pref3SessionCompanyId: optionalUuid,
    pref3Reason: optionalReason,
  })
  .refine(
    (data) => {
      const prefs = [
        data.pref1SessionCompanyId,
        data.pref2SessionCompanyId,
        data.pref3SessionCompanyId,
      ].filter(Boolean) as string[];
      return new Set(prefs).size === prefs.length;
    },
    { message: "Each preference must be a different company", path: ["pref3SessionCompanyId"] }
  )
  .refine(
    (data) =>
      // If a company is picked, a reason must be provided (and vice versa)
      (!data.pref2SessionCompanyId || !!data.pref2Reason) &&
      (!data.pref3SessionCompanyId || !!data.pref3Reason),
    { message: "Please add a reason for each preference you pick" }
  );
