import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  date,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const targetClassEnum = pgEnum("target_class", ["9", "10", "9_10"]);

// ─────────────────────────────────────────────────────────
// LIBRARY: Global pools (reusable entities)
// ─────────────────────────────────────────────────────────

export const speakers = pgTable("speakers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  bio: text("bio").notNull(),
  house: text("house"),
  batchYear: text("batch_year"),
  photoUrl: text("photo_url"),
  linkedinUrl: text("linkedin_url"),
  defaultSlotLimit: integer("default_slot_limit").notNull().default(30),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  defaultSlotLimit: integer("default_slot_limit").notNull().default(2),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─────────────────────────────────────────────────────────
// TALK SESSIONS
// ─────────────────────────────────────────────────────────

export const talkSessions = pgTable("talk_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  editionLabel: text("edition_label").notNull(),
  targetClass: targetClassEnum("target_class").notNull(),
  description: text("description"),
  sessionDate: date("session_date"),
  timeSlot: text("time_slot"),
  isActive: boolean("is_active").notNull().default(false),
  regOpen: boolean("reg_open").notNull().default(true),
  regDeadline: timestamp("reg_deadline", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Junction: speakers in a specific session (with per-session venue/slot)
export const sessionSpeakers = pgTable(
  "session_speakers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => talkSessions.id, { onDelete: "cascade" }),
    speakerId: uuid("speaker_id")
      .notNull()
      .references(() => speakers.id, { onDelete: "restrict" }),
    topic: text("topic").notNull(),
    topicDescription: text("topic_description"),
    venue: text("venue"),
    slotLimit: integer("slot_limit").notNull().default(30),
    displayOrder: integer("display_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("unique_speaker_per_session").on(table.sessionId, table.speakerId)]
);

export const talkRegistrations = pgTable(
  "talk_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionSpeakerId: uuid("session_speaker_id")
      .notNull()
      .references(() => sessionSpeakers.id, { onDelete: "cascade" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => talkSessions.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    classSection: text("class_section").notNull(),
    rollNumber: text("roll_number").notNull(),
    parentName: text("parent_name").notNull(),
    parentEmail: text("parent_email").notNull(),
    parentPhone: text("parent_phone").notNull(),
    whyAttend: text("why_attend").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("unique_talk_reg").on(table.sessionId, table.rollNumber)]
);

// ─────────────────────────────────────────────────────────
// INTERNSHIP SESSIONS
// ─────────────────────────────────────────────────────────

export const internshipSessions = pgTable("internship_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  editionLabel: text("edition_label").notNull(),
  targetClass: targetClassEnum("target_class").notNull().default("10"),
  maxPreferences: integer("max_preferences").notNull().default(3),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(false),
  regOpen: boolean("reg_open").notNull().default(true),
  regDeadline: timestamp("reg_deadline", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Junction: companies in a specific internship session
export const sessionCompanies = pgTable(
  "session_companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => internshipSessions.id, { onDelete: "cascade" }),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id, { onDelete: "restrict" }),
    internshipDate: date("internship_date"),
    slotsAvailable: integer("slots_available").notNull().default(2),
    displayOrder: integer("display_order").notNull().default(0),
    aboutInternship: text("about_internship"),
    whoFor: text("who_for"),
    whatToExpect: text("what_to_expect"),
    whatToBring: text("what_to_bring"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("unique_company_per_session").on(table.sessionId, table.companyId)]
);

export const internshipRegistrations = pgTable(
  "internship_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => internshipSessions.id, { onDelete: "cascade" }),
    studentName: text("student_name").notNull(),
    classSection: text("class_section").notNull(),
    rollNumber: text("roll_number").notNull(),
    parentName: text("parent_name").notNull(),
    parentEmail: text("parent_email").notNull(),
    parentPhone: text("parent_phone").notNull(),
    interests: text("interests"),
    pref1SessionCompanyId: uuid("pref_1_session_company_id")
      .notNull()
      .references(() => sessionCompanies.id),
    pref1Reason: text("pref_1_reason").notNull(),
    pref2SessionCompanyId: uuid("pref_2_session_company_id").references(
      () => sessionCompanies.id
    ),
    pref2Reason: text("pref_2_reason"),
    pref3SessionCompanyId: uuid("pref_3_session_company_id").references(
      () => sessionCompanies.id
    ),
    pref3Reason: text("pref_3_reason"),
    assignedSessionCompanyId: uuid("assigned_session_company_id").references(
      () => sessionCompanies.id
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("unique_internship_reg").on(table.sessionId, table.classSection, table.rollNumber)]
);
