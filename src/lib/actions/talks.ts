"use server";

import { db } from "@/lib/db";
import {
  talkSessions,
  speakers,
  sessionSpeakers,
  talkRegistrations,
} from "@/lib/db/schema";
import {
  talkRegistrationSchema,
  talkSessionSchema,
  addSpeakerToSessionSchema,
  updateSessionSpeakerSchema,
} from "@/lib/validators";
import { isAuthenticated } from "@/lib/auth";
import { eq, and, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { istLocalInputToUtc } from "@/lib/format";
import { detectBotSubmission } from "@/lib/anti-bot";

// ─── PUBLIC ─────────────────────────────────────────────

export async function getActiveTalkSessions() {
  try {
    return await db
      .select()
      .from(talkSessions)
      .where(eq(talkSessions.isActive, true));
  } catch {
    return [];
  }
}

export async function getSessionWithSpeakers(sessionId: string) {
  const [session] = await db
    .select()
    .from(talkSessions)
    .where(eq(talkSessions.id, sessionId));
  if (!session) return null;

  const linked = await db
    .select({
      sessionSpeakerId: sessionSpeakers.id,
      speakerId: speakers.id,
      name: speakers.name,
      bio: speakers.bio,
      topic: sessionSpeakers.topic,
      topicDescription: sessionSpeakers.topicDescription,
      house: speakers.house,
      batchYear: speakers.batchYear,
      photoUrl: speakers.photoUrl,
      linkedinUrl: speakers.linkedinUrl,
      venue: sessionSpeakers.venue,
      slotLimit: sessionSpeakers.slotLimit,
      displayOrder: sessionSpeakers.displayOrder,
      isActive: sessionSpeakers.isActive,
      registrationCount: sql<number>`(
        SELECT COUNT(*) FROM talk_registrations
        WHERE talk_registrations.session_speaker_id = ${sql.raw('"session_speakers"."id"')}
      )`.as("registration_count"),
    })
    .from(sessionSpeakers)
    .innerJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
    .where(eq(sessionSpeakers.sessionId, sessionId))
    .orderBy(sessionSpeakers.displayOrder);

  return { ...session, speakers: linked };
}

export async function registerForTalk(
  _prev: { success?: boolean; error?: string } | null,
  formData: FormData
) {
  // Silent-drop bot submissions. Returning success keeps attackers from
  // learning the honeypot exists; nothing is written to the DB.
  const bot = detectBotSubmission(formData);
  if (!bot.ok) {
    console.warn(`[talks] dropped suspected bot submission (${bot.reason})`);
    return { success: true as const };
  }

  const parsed = talkRegistrationSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  const [session] = await db
    .select()
    .from(talkSessions)
    .where(eq(talkSessions.id, data.sessionId));

  if (!session || !session.isActive) return { error: "This session is not active" };
  if (!session.regOpen) return { error: "Registration is closed" };
  if (session.regDeadline && new Date(session.regDeadline) < new Date()) {
    return { error: "Registration deadline has passed" };
  }

  try {
    const result = await db.execute(sql`
      INSERT INTO talk_registrations (
        session_speaker_id, session_id, student_name, class_section, roll_number,
        parent_name, parent_email, parent_phone, why_attend
      )
      SELECT
        ${data.sessionSpeakerId}, ${data.sessionId}, ${data.studentName},
        ${data.classSection}, ${data.rollNumber}, ${data.parentName},
        ${data.parentEmail}, ${data.parentPhone}, ${data.whyAttend}
      WHERE (
        SELECT COUNT(*) FROM talk_registrations
        WHERE session_speaker_id = ${data.sessionSpeakerId}
      ) < (
        SELECT slot_limit FROM session_speakers WHERE id = ${data.sessionSpeakerId}
      )
      RETURNING id
    `);

    if (result.length === 0) {
      return { error: "This speaker's slots are full. Please choose another." };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.message} ${(e as { cause?: Error }).cause?.message ?? ""}` : "";
    if (msg.includes("unique_talk_reg")) {
      return { error: "You have already registered for this session" };
    }
    throw e;
  }

  revalidatePath("/talks");
  revalidatePath("/admin");
  revalidatePath("/admin/talk-sessions");
  revalidatePath(`/admin/talk-sessions/${data.sessionId}`);
  revalidatePath(`/admin/talk-sessions/${data.sessionId}/registrations`);
  return { success: true };
}

// ─── ADMIN ──────────────────────────────────────────────

export async function getAllTalkSessions() {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: talkSessions.id,
      title: talkSessions.title,
      editionLabel: talkSessions.editionLabel,
      targetClass: talkSessions.targetClass,
      sessionDate: talkSessions.sessionDate,
      timeSlot: talkSessions.timeSlot,
      isActive: talkSessions.isActive,
      regOpen: talkSessions.regOpen,
      regDeadline: talkSessions.regDeadline,
      createdAt: talkSessions.createdAt,
      speakerCount: sql<number>`(SELECT COUNT(*) FROM session_speakers WHERE session_speakers.session_id = ${sql.raw('"talk_sessions"."id"')})`.as("speaker_count"),
      registrationCount: sql<number>`(SELECT COUNT(*) FROM talk_registrations WHERE talk_registrations.session_id = ${sql.raw('"talk_sessions"."id"')})`.as("registration_count"),
    })
    .from(talkSessions)
    .orderBy(desc(talkSessions.createdAt));
}

export async function createTalkSession(
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = talkSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [created] = await db
    .insert(talkSessions)
    .values({
      title: parsed.data.title,
      editionLabel: parsed.data.editionLabel,
      targetClass: parsed.data.targetClass,
      description: parsed.data.description || null,
      sessionDate: parsed.data.sessionDate || null,
      timeSlot: parsed.data.timeSlot || null,
      regDeadline: istLocalInputToUtc(parsed.data.regDeadline ?? null),
    })
    .returning({ id: talkSessions.id });

  revalidatePath("/admin/talk-sessions");
  return { success: true, id: created.id };
}

export async function updateTalkSession(
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = talkSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(talkSessions)
    .set({
      title: parsed.data.title,
      editionLabel: parsed.data.editionLabel,
      targetClass: parsed.data.targetClass,
      description: parsed.data.description || null,
      sessionDate: parsed.data.sessionDate || null,
      timeSlot: parsed.data.timeSlot || null,
      regDeadline: istLocalInputToUtc(parsed.data.regDeadline ?? null),
      updatedAt: new Date(),
    })
    .where(eq(talkSessions.id, sessionId));

  revalidatePath("/admin/talk-sessions");
  revalidatePath("/talks");
  revalidatePath("/");
  return { success: true };
}

export async function toggleTalkActive(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [s] = await db.select().from(talkSessions).where(eq(talkSessions.id, sessionId));
  if (!s) throw new Error("Not found");

  if (s.isActive) {
    await db.update(talkSessions).set({ isActive: false, updatedAt: new Date() }).where(eq(talkSessions.id, sessionId));
  } else {
    await db
      .update(talkSessions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(talkSessions.targetClass, s.targetClass), eq(talkSessions.isActive, true)));
    await db.update(talkSessions).set({ isActive: true, updatedAt: new Date() }).where(eq(talkSessions.id, sessionId));
  }

  revalidatePath("/admin/talk-sessions");
  revalidatePath("/talks");
  revalidatePath("/");
}

export async function toggleTalkRegOpen(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [s] = await db.select().from(talkSessions).where(eq(talkSessions.id, sessionId));
  if (!s) throw new Error("Not found");
  await db
    .update(talkSessions)
    .set({ regOpen: !s.regOpen, updatedAt: new Date() })
    .where(eq(talkSessions.id, sessionId));
  revalidatePath("/admin/talk-sessions");
  revalidatePath("/talks");
}

export async function deleteTalkSession(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(talkSessions).where(eq(talkSessions.id, sessionId));
  revalidatePath("/admin/talk-sessions");
  revalidatePath("/talks");
  revalidatePath("/");
}

// Linking speakers to sessions
export async function addSpeakerToSession(
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = addSpeakerToSessionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await db.insert(sessionSpeakers).values({
      sessionId,
      speakerId: parsed.data.speakerId,
      topic: parsed.data.topic,
      topicDescription: parsed.data.topicDescription || null,
      venue: parsed.data.venue || null,
      slotLimit: parsed.data.slotLimit,
      displayOrder: parsed.data.displayOrder,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("unique_speaker_per_session")) {
      return { error: "This speaker is already added to this session" };
    }
    throw e;
  }

  revalidatePath(`/admin/talk-sessions/${sessionId}`);
  revalidatePath("/talks");
  return { success: true };
}

export async function updateSessionSpeaker(
  sessionSpeakerId: string,
  sessionId: string,
  _prev: { error?: string } | null,
  formData: FormData
) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = updateSessionSpeakerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await db
    .update(sessionSpeakers)
    .set({
      topic: parsed.data.topic,
      topicDescription: parsed.data.topicDescription || null,
      venue: parsed.data.venue || null,
      slotLimit: parsed.data.slotLimit,
      displayOrder: parsed.data.displayOrder,
    })
    .where(eq(sessionSpeakers.id, sessionSpeakerId));

  revalidatePath(`/admin/talk-sessions/${sessionId}`);
  revalidatePath("/talks");
  return { success: true };
}

export async function toggleSessionSpeakerActive(sessionSpeakerId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const [row] = await db
    .select({ isActive: sessionSpeakers.isActive })
    .from(sessionSpeakers)
    .where(eq(sessionSpeakers.id, sessionSpeakerId));
  if (!row) throw new Error("Not found");
  await db
    .update(sessionSpeakers)
    .set({ isActive: !row.isActive })
    .where(eq(sessionSpeakers.id, sessionSpeakerId));
  revalidatePath(`/admin/talk-sessions/${sessionId}`);
  revalidatePath("/talks");
}

export async function deleteTalkRegistration(registrationId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(talkRegistrations).where(eq(talkRegistrations.id, registrationId));
  revalidatePath(`/admin/talk-sessions/${sessionId}/registrations`);
  revalidatePath(`/admin/talk-sessions/${sessionId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/talk-sessions");
  revalidatePath("/talks");
}

export async function removeSpeakerFromSession(sessionSpeakerId: string, sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  await db.delete(sessionSpeakers).where(eq(sessionSpeakers.id, sessionSpeakerId));
  revalidatePath(`/admin/talk-sessions/${sessionId}`);
  revalidatePath("/talks");
}

export async function getTalkRegistrations(sessionId: string) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  return db
    .select({
      id: talkRegistrations.id,
      studentName: talkRegistrations.studentName,
      classSection: talkRegistrations.classSection,
      rollNumber: talkRegistrations.rollNumber,
      parentName: talkRegistrations.parentName,
      parentEmail: talkRegistrations.parentEmail,
      parentPhone: talkRegistrations.parentPhone,
      whyAttend: talkRegistrations.whyAttend,
      speakerName: speakers.name,
      speakerTopic: sessionSpeakers.topic,
      createdAt: talkRegistrations.createdAt,
    })
    .from(talkRegistrations)
    .innerJoin(sessionSpeakers, eq(talkRegistrations.sessionSpeakerId, sessionSpeakers.id))
    .innerJoin(speakers, eq(sessionSpeakers.speakerId, speakers.id))
    .where(eq(talkRegistrations.sessionId, sessionId))
    .orderBy(desc(talkRegistrations.createdAt));
}
