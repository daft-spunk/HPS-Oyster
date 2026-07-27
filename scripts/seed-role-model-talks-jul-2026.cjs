// Seed for the July 2026 Role Model Talks (Grade 10 on 27th, Grade 11 & 12 on 28th)
// Source: HPSB Chapter.xlsx, "HPSB Dialogues date" sheet (rows 11-32, 38-40)
require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1 });

// ─── Bios (from the sheet, verbatim where present) ────────────────────────
const BIO_MEHERNOSH = `Max Healthcare Institute — Vice President, Talent Development & NABH Internal Auditor. Directed end-to-end talent development and HR strategies across 13 super-specialty hospitals in North India. Served as Internal Auditor for NABH, spearheading compliance audits and hospital-wide staff training. Senior HR / L&D leadership roles at Airtel, Aditya Birla Group / Aditya Birla Retail, Godrej Group, NIS Sparta (NIIT), and Vanguard Ltd. Key clients across banking (RBI, SBI, Standard Chartered), global tech & conglomerates (Microsoft, IBM Daksh, Mercedes-Benz, Mitsubishi, TVS Motors, Coca-Cola), and national infrastructure (Indian Railways, Gati Cargo, TCI).`;
const BIO_RAGHUVEER = `Raghuveer Kovuru spends his time helping people turn ideas into reality. Over the past 16 years, he has worked with startups, entrepreneurs, universities, governments, and some of India's leading companies to build new products, launch ventures, and solve real-world problems. A four-time entrepreneur, he previously led innovation programs at T-Hub, one of India's leading startup ecosystems, and today works with organizations across the country through Innokraft Consulting. Outside work, Raghuveer is an avid reader, writer, traveler and lifelong learner who is fascinated by technology, business, and the future of work.`;
const BIO_RAJIV = `Rajiv brings over two decades of hands-on experience in IT systems integration through his association with Sara Infoway, a Hyderabad-based IT systems integrator that has supported businesses for more than 25 years — and has more recently expanded into advanced manufacturing with SLS 3D printing for industrial applications. Consultant to the First Railway Automation Project in India (2004), solution provider for a Forensic lab (2022), and the first AI Lab for defence (2025). As an amputee himself, Rajiv co-founded Addiwise Technologies (affordable 3D-printed orthotics and prosthetics) and established SoraStride to bring Addiwalk — a hands-free assistive walking brace — to market; he holds the patent and trademark for Addiwalk.`;
const BIO_SISTLA = `Sistla V Abhishek, class of 2006, has been building communities since 2008, helping organizations, open source projects and independent ventures go from zero to one. He holds three national records in speedcubing and has spent years working on cryptography & decentralized resource-sharing protocols powered by blockchain. Having focused on media-tech for the last decade, today he'll discuss the details of becoming a media-preneur — using media to grow your venture, project, side hustle or ideas, especially in a future enabled by AI.`;
const BIO_HARSHA = `Harsha T is an entrepreneur with a focus on real estate. Advisory Board and Entrepreneurship Board member at the School of Business, University of Wisconsin–Madison; inducted into the Entrepreneurship Center Hall of Fame in 2019 at UW–Madison. Advisory Board member at a research lab at UCLA. His trust has pledged money and land toward financial assistance for under-privileged students pursuing higher education. MBA (Entrepreneurship) and MS (International Business) from UW-Madison; M.Com and B.Com (Hons.) from Osmania University. Studied at HPS from PP-1 to 12th; former HPS Tennis Captain.`;
const BIO_MMP_RAJU = `M. M. Pallam Raju — Former Union Cabinet Minister, Government of India. Founder & Director of Advanced System in Package Technologies (ASIP Technologies), setting up a global-standard Semiconductor OSAT facility in Andhra Pradesh; founder of two prior companies in Semiconductor Design Services and IP Development with successful exits. Served as Union Cabinet Minister for Human Resources Development (2012–2014) and Minister of State for Defence (2006–2012). Chairman of the Parliamentary Standing Committee on Information Technology (2004–2006). Elected to the Lok Sabha thrice from Kakinada. BE (Andhra University) and MBA (Temple University, Philadelphia). Honorary Fellow, IETE; Honorary Doctor of Humane Letters, Temple University; Honorary Doctorate, JNTU Hyderabad. Author of "A Contribution in Time — India's Electronics Revolution".`;
const BIO_NAVJITH = `Navjit is CEO of AM Green, leading the development of a low-carbon, 0.6 million tonne primary aluminium smelter and ~2GW of compute capacity for Artificial Intelligence and Green Data Centres. 37 years of experience in Power, Infrastructure and Marine sectors. Previously Country Head at Gentari (Petronas), CCO at SB Energy (2017–2021), Regional GM–Sales at GE Renewables India, MD–India & Regional Director MESA at Rolls-Royce Marine (6 years to 2014), Executive Director–Business Development at KSK Energy Ventures (2006–2009), and 17 years at Wartsila. Bachelor of Engineering (Mechanical) and MBA (Finance) from Osmania University; IDL Chemicals Gold Medal; Executive MBA from S.P. Jain; Alumnus of Harvard Business School (SELP-2025); BEE certified Energy Manager & Auditor.`;

// Shared topic descriptions (used when a speaker appears in both grades)
const TD_MEHERNOSH = "Building people, building careers — lessons from Max Healthcare, Airtel, Aditya Birla, Godrej and more.";
const TD_YUDISH = "Practical stories from building and running business development at Amazon and beyond.";
const TD_HARSHA = "Real-estate entrepreneurship, UW–Madison Hall of Fame, and giving back — the real work behind the label 'entrepreneur'.";
const TD_MMP_RAJU = "From engineering and business school to Cabinet Minister — and the story behind my book 'A Contribution in Time — India's Electronics Revolution'.";
const TD_SISTLA = "Introducing students to media — the business, finance and legal aspects — and using media to grow ventures in a future enabled by AI.";

// ─── Grade 10 — 27 July 2026, 2:45 PM – 3:45 PM, Shaheen Lounge/Hall (~50 seats) ──
const GRADE_10 = [
  { name: "Akshay Kumar Ahuja", bio: "Biotechnology.",
    topic: "Biotechnology — the road less travelled",
    topicDescription: "What challenges led me to biotechnology, and what the field looks like from the inside." },
  { name: "Sardar Sukhvinder Singh", bio: "Journey from Process Excellence to Entrepreneurship to Wells Fargo.",
    topic: "Building a Career You Didn't Plan For",
    topicDescription: "My journey from Process Excellence to Entrepreneurship to Wells Fargo — and why the best careers are almost never linear." },
  { name: "Dr. Sashidhar", bio: "Nephrologist.",
    topic: "Careers in Science — and Why I Became a Nephrologist",
    topicDescription: "What the many careers in the field of science look like, and the story of why I chose nephrology." },
  { name: "Mehernosh Bazun Dittia", bio: BIO_MEHERNOSH,
    topic: "Entrepreneurship & Talent Development",
    topicDescription: TD_MEHERNOSH },
  { name: "M. M. Pallam Raju", bio: BIO_MMP_RAJU,
    topic: "A Career in Public Service",
    topicDescription: TD_MMP_RAJU },
  { name: "Sistla Venkata Abhishek", bio: BIO_SISTLA,
    topic: "Mediapreneurship post AGI",
    topicDescription: TD_SISTLA },
  { name: "Yudish Kalluri", bio: "Senior Manager at Amazon.",
    topic: "How I Built My Business Development System",
    topicDescription: TD_YUDISH },
  { name: "Bhavishya Gupta", bio: "Hospitality; wealth creation.",
    topic: "How to Create Everlasting Wealth",
    topicDescription: "Building wealth that lasts — a view from the hospitality industry." },
  { name: "Harsha Tipireneni", bio: BIO_HARSHA,
    topic: "What is Entrepreneurship — Really?",
    topicDescription: TD_HARSHA },
];

// ─── Grade 11 & 12 — 28 July 2026, 8:15 AM – 9:15 AM, Shaheen Lounge/Hall (~60 seats) ──
const GRADE_11_12 = [
  { name: "Mehernosh Bazun Dittia",
    topic: "Entrepreneurship & Talent Development",
    topicDescription: TD_MEHERNOSH },
  { name: "Raghuveer Kovuru", bio: BIO_RAGHUVEER,
    topic: "Building Tomorrow: How Ideas Become Products, Companies and Careers",
    topicDescription: "16 years turning ideas into ventures with startups, universities, governments and India's leading companies — ex-T-Hub, now Innokraft Consulting." },
  { name: "Yudish Kalluri",
    topic: "How I Built My Business Development System",
    topicDescription: TD_YUDISH },
  { name: "Rajiv Gupta", bio: BIO_RAJIV,
    topic: "Healthcare + Tech — IT Systems Integration at Sara Infoway",
    topicDescription: "Two decades of systems integration — first Railway Automation Project (2004), first Defence AI Lab (2025); co-founder of Addiwise / Addiwalk. Building lean, scaling smart, turning tech into real business value." },
  { name: "Sistla Venkata Abhishek",
    topic: "Mediapreneurship post AGI",
    topicDescription: TD_SISTLA },
  { name: "Harsha Tipireneni",
    topic: "What is Entrepreneurship — Really?",
    topicDescription: TD_HARSHA },
  { name: "Navjith Gill", bio: BIO_NAVJITH,
    topic: "AI, Robotics & the Green Future",
    topicDescription: "CEO of AM Green — building a low-carbon aluminium smelter and 2GW of AI / Green Data Centre compute. 37 years across Power, Infrastructure and Marine at Rolls-Royce, GE, Wartsila and more; Harvard SELP 2025." },
  { name: "Gopikrishna Lingala",
    topic: "AI — How to Best Understand and Harness It",
    topicDescription: "Making sense of AI beyond the hype — practical ways to learn it, work with it, and use it well." },
];

(async () => {
  // 1. Add "11_12" to the target_class enum (ADD VALUE must be outside a transaction)
  try {
    await sql.unsafe(`ALTER TYPE target_class ADD VALUE IF NOT EXISTS '11_12'`);
    console.log("enum: 11_12 present");
  } catch (e) {
    console.log("enum alter:", e.message);
  }

  // 2. Upsert speakers by name
  async function upsertSpeaker(name, bio) {
    const [existing] = await sql`SELECT id, bio FROM speakers WHERE name = ${name} LIMIT 1`;
    if (existing) {
      // Update bio if we now have a fuller one
      if (bio && bio.length > (existing.bio ?? "").length) {
        await sql`UPDATE speakers SET bio = ${bio}, updated_at = now() WHERE id = ${existing.id}`;
      }
      return existing.id;
    }
    const [inserted] = await sql`
      INSERT INTO speakers (name, bio, default_slot_limit)
      VALUES (${name}, ${bio ?? name}, 60)
      RETURNING id`;
    return inserted.id;
  }

  const speakerIds = {};
  for (const s of [...GRADE_10, ...GRADE_11_12]) {
    if (!speakerIds[s.name]) {
      speakerIds[s.name] = await upsertSpeaker(s.name, s.bio ?? null);
    } else if (s.bio) {
      // Second appearance may bring a bio we didn't have first time
      await upsertSpeaker(s.name, s.bio);
    }
  }
  console.log(`speakers: ${Object.keys(speakerIds).length} unique`);

  // 3. Upsert talk_sessions
  // Business key: (edition_label, target_class, session_date) — same edition on
  // the same date for the same class = same session.
  async function upsertSession({ title, editionLabel, targetClass, sessionDate, timeSlot, description }) {
    const [existing] = await sql`
      SELECT id FROM talk_sessions
      WHERE edition_label = ${editionLabel}
        AND target_class = ${targetClass}
        AND session_date = ${sessionDate}
      LIMIT 1`;
    if (existing) {
      await sql`
        UPDATE talk_sessions
        SET title = ${title}, time_slot = ${timeSlot}, description = ${description}, updated_at = now()
        WHERE id = ${existing.id}`;
      return existing.id;
    }
    const [inserted] = await sql`
      INSERT INTO talk_sessions (title, edition_label, target_class, session_date, time_slot, description, is_active, reg_open)
      VALUES (${title}, ${editionLabel}, ${targetClass}, ${sessionDate}, ${timeSlot}, ${description}, false, true)
      RETURNING id`;
    return inserted.id;
  }

  const sessionA = await upsertSession({
    title: "Role Model Talks",
    editionLabel: "July 2026",
    targetClass: "10",
    sessionDate: "2026-07-27",
    timeSlot: "2:45 PM – 3:45 PM",
    description: "",
  });
  const sessionB = await upsertSession({
    title: "Role Model Talks",
    editionLabel: "July 2026",
    targetClass: "11_12",
    sessionDate: "2026-07-28",
    timeSlot: "8:15 AM – 9:15 AM",
    description: "",
  });
  console.log("session A (Gr 10):", sessionA);
  console.log("session B (Gr 11-12):", sessionB);

  // 4. Wire session_speakers (idempotent via unique(session_id, speaker_id))
  async function linkSpeaker(sessionId, speakerId, topic, topicDescription, displayOrder, slotLimit) {
    const [existing] = await sql`
      SELECT id FROM session_speakers
      WHERE session_id = ${sessionId} AND speaker_id = ${speakerId} LIMIT 1`;
    if (existing) {
      await sql`
        UPDATE session_speakers
        SET topic = ${topic}, topic_description = ${topicDescription}, display_order = ${displayOrder}, slot_limit = ${slotLimit}
        WHERE id = ${existing.id}`;
      return existing.id;
    }
    const [inserted] = await sql`
      INSERT INTO session_speakers (session_id, speaker_id, topic, topic_description, slot_limit, display_order, is_active)
      VALUES (${sessionId}, ${speakerId}, ${topic}, ${topicDescription}, ${slotLimit}, ${displayOrder}, true)
      RETURNING id`;
    return inserted.id;
  }

  // Slot limits: sheet says 50 seats for Gr10 (10 speakers → ~50 each? no — 50 total room capacity).
  // Assume each speaker meets one section of ~35, and KL-clubbed speaker gets ~50.
  // Simpler: default 50 for everyone; admin can tune.
  const G10_SLOT = 35;
  const G11_SLOT = 35;

  let order = 0;
  for (const s of GRADE_10) {
    await linkSpeaker(sessionA, speakerIds[s.name], s.topic, s.topicDescription ?? null, order++, G10_SLOT);
  }
  order = 0;
  for (const s of GRADE_11_12) {
    await linkSpeaker(sessionB, speakerIds[s.name], s.topic, s.topicDescription ?? null, order++, G11_SLOT);
  }
  console.log(`linked ${GRADE_10.length} speakers into Gr10, ${GRADE_11_12.length} into Gr11-12`);

  await sql.end();
})();
