import Link from "next/link";
import Image from "next/image";
import { getActiveTalkSessions, getSessionWithSpeakers } from "@/lib/actions/talks";
import { TalkRegistrationForm } from "./TalkRegistrationForm";
import { SpeakerBio } from "./SpeakerBio";
import { PublicNavbar } from "@/components/PublicNavbar";
import { formatTargetClass } from "@/lib/format";

export default async function TalksPage() {
  const activeSessions = await getActiveTalkSessions();

  if (activeSessions.length === 0) {
    return (
      <div className="min-h-screen">
        <PublicNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Role Model Talks</h1>
          <p className="text-gray-600">
            No active talk sessions right now. Check back soon!
          </p>
          <Link href="/" className="text-primary hover:underline mt-4 inline-block">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const sessionsWithSpeakers = await Promise.all(
    activeSessions.map((s) => getSessionWithSpeakers(s.id))
  );

  return (
    <div className="min-h-screen">
      <PublicNavbar />
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Role Model Talks</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about different careers and academic streams from HPS alumni who
            have been there. Choose a speaker whose topic interests you and register below.
          </p>
        </div>

        {sessionsWithSpeakers.map((session) => {
          if (!session) return null;
          const isRegOpen =
            session.regOpen &&
            (!session.regDeadline || new Date(session.regDeadline) > new Date());

          return (
            <div key={session.id} className="mb-16">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">
                  {formatTargetClass(session.targetClass)} &mdash; {session.title}
                </h2>
                {session.editionLabel && (
                  <p className="text-gray-500 mb-1">{session.editionLabel}</p>
                )}
                {(session.sessionDate || session.timeSlot) && (
                  <p className="text-gray-500 text-sm">
                    {[session.sessionDate, session.timeSlot].filter(Boolean).join(" · ")}
                  </p>
                )}
                {session.regDeadline && (
                  <p className="text-sm text-orange-600 mt-3 font-medium">
                    Registration deadline:{" "}
                    {new Date(session.regDeadline).toLocaleString("en-IN", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
              {session.description && (
                <p className="text-gray-700 max-w-3xl mx-auto text-center leading-relaxed mb-6">
                  {session.description}
                </p>
              )}

              {/* Speaker Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
                {session.speakers.map((speaker) => {
                  const slotsLeft = speaker.slotLimit - Number(speaker.registrationCount);
                  const isFull = slotsLeft <= 0;

                  const speakerMeta = [
                    speaker.house,
                    speaker.batchYear ? `Batch ${speaker.batchYear}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ");

                  return (
                    <div
                      key={speaker.sessionSpeakerId}
                      className={`bg-white border rounded-lg p-5 flex flex-col ${isFull ? "opacity-60" : ""}`}
                    >
                      {/* 1. Topic — primary heading */}
                      <h3 className="text-xl font-bold text-gray-900 leading-snug mb-2">
                        {speaker.topic}
                      </h3>

                      {/* 2. About the topic */}
                      {speaker.topicDescription && (
                        <p className="text-gray-600 text-sm mb-4">
                          {speaker.topicDescription}
                        </p>
                      )}

                      {/* Status pill */}
                      <div className="mb-4">
                        {isFull ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                            Full
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {slotsLeft} slots left
                          </span>
                        )}
                      </div>

                      {/* Speaker section */}
                      <div className="border-t pt-4 mt-auto">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                          Speaker
                        </p>
                        <div className="flex gap-3 items-start">
                          {speaker.photoUrl ? (
                            <Image
                              src={speaker.photoUrl}
                              alt={speaker.name}
                              width={56}
                              height={56}
                              className="w-14 h-14 rounded-full object-cover flex-shrink-0 border"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 font-semibold">
                              {speaker.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{speaker.name}</p>
                            {speakerMeta && (
                              <p className="text-xs text-gray-500 mt-0.5">{speakerMeta}</p>
                            )}
                          </div>
                        </div>
                        {/* About the speaker */}
                        <div className="mt-3">
                          <SpeakerBio bio={speaker.bio} />
                        </div>
                        {speaker.linkedinUrl && (
                          <a
                            href={speaker.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-3"
                          >
                            Learn more about {speaker.name}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3.5 h-3.5"
                            >
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                            </svg>
                          </a>
                        )}
                      </div>

                      {/* Venue */}
                      {speaker.venue && (
                        <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                          <span className="bg-gray-100 px-2 py-0.5 rounded">📍 {speaker.venue}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Registration Form */}
              {isRegOpen ? (
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Register for this Session</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Please bring a book and pen for note-taking. You can only register once per session.
                  </p>
                  <TalkRegistrationForm
                    sessionId={session.id}
                    sessionDate={session.sessionDate}
                    speakers={session.speakers
                      .filter(
                        (s) =>
                          s.slotLimit - Number(s.registrationCount) > 0
                      )
                      .map((s) => ({
                        sessionSpeakerId: s.sessionSpeakerId,
                        name: s.name,
                        topic: s.topic,
                        slotsLeft: s.slotLimit - Number(s.registrationCount),
                        venue: s.venue,
                      }))}
                  />
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
                  <p className="text-orange-700 font-medium">
                    Registration for this session is closed.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

