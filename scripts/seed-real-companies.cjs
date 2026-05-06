// One-off: clear test sponsors/registrations on Summer 26 Internships - May,
// then seed Continental Coffee, Caspian Investments, Arete Hospitals, Samvad Partners
// pulled from https://www.hpsoyster.com/form.php
require("dotenv").config({ path: ".env.local" });
const postgres = require("postgres");
const sql = postgres(process.env.DATABASE_URL, { max: 1, idle_timeout: 5 });

const SESSION_ID = "d82fa83b-5469-4e24-9e53-97a87f963ae5";

const COMPANIES = [
  {
    name: "Continental Coffee",
    sector: "Food & Beverages (Coffee Manufacturing & Export)",
    description:
      "Continental Coffee, part of CCL Products (India) Ltd., is one of world’s largest coffee manufacturers and exporters.",
    websiteUrl: "https://www.cclproducts.com/",
    internshipDate: "2026-05-22",
    aboutInternship:
      "Continental Coffee, part of CCL Products (India) Ltd., is one of world’s largest coffee manufacturers and exporters.",
    whoFor:
      "• Students interested in the food & beverage industry and global supply chains.\n• Those curious about manufacturing, exports, and private label businesses.\n• Students keen on entrepreneurship, branding, and international markets.",
    whatToExpect:
      "• Knowledge of how large-scale coffee manufacturing and exports operate.\n• Insights into global trade, supply chains, and market expansion strategies.\n• Understanding branding, product development, and customer-focused solutions.",
    whatToBring: null,
  },
  {
    name: "Caspian Investments",
    sector: "Impact Investing / Financial Services",
    description:
      "Caspian Investments is an India-focused impact investment firm that provides debt and equity capital to enterprises driving social and environmental change.",
    websiteUrl: "https://www.caspian.in/",
    internshipDate: "2026-05-11",
    aboutInternship:
      "Caspian Investments is an India-focused impact investment firm that provides debt and equity capital to enterprises driving social and environmental change.",
    whoFor:
      "• Students interested in impact investing and sustainable finance.\n• Those curious about businesses creating social and environmental impact.\n• Students keen on finance, development sector, and inclusive growth.",
    whatToExpect:
      "• Overview of impact investing and its role in emerging markets.\n• Insights into funding mission-driven enterprises.\n• Understanding how capital can drive both financial returns and social impact.",
    whatToBring: null,
  },
  {
    name: "Arete Hospitals",
    sector: "Healthcare / Multi-specialty Hospitals",
    description:
      "A state-of-the-art hospital in Gachibowli, Hyderabad, combining medical excellence with high-quality patient care.",
    websiteUrl: "https://aretehospitals.com",
    internshipDate: null, // To be decided
    aboutInternship:
      "A state-of-the-art hospital in Gachibowli, Hyderabad, combining medical excellence with high-quality patient care.",
    whoFor:
      "• Students exploring healthcare & hospital operations\n• Those curious about key medical specialties\n• Individuals interested in modern hospital systems",
    whatToExpect:
      "• Department tours\n• Patient care & diagnostics exposure\n• Insights into critical care requirements\n• Discussions on healthcare\n\nYou’ll take away:\n• Understanding of hospital workflows\n• Awareness of different medical specialties\n• Perspective on how technology enhances patient care",
    whatToBring:
      "• Go through the organisation website and come prepared to ask questions and clear your doubts.\n• Participate enthusiastically in the discussions.\n• Wear closed shoes and follow hospital safety rules.\n• Be respectful, attentive, and take notes.",
  },
  {
    name: "Samvad Partners",
    sector: "Law / Mediation & Dispute Resolution",
    description:
      "An award-winning Indian law firm specializing in mediation, ADR, M&A, and dispute resolution.",
    websiteUrl: "https://www.samvadpartners.com",
    internshipDate: "2026-05-14", // first of two dates; second (May 20) noted in description
    aboutInternship:
      "An award-winning Indian law firm specializing in mediation, ADR, M&A, and dispute resolution. Internship runs across two dates: 14th May, 2026 and 20th May, 2026.",
    whoFor:
      "• Law students & ADR enthusiasts\n• People interested in negotiations & mediation\n• Aspiring scholars in corporate law & ESG\n• Curious about startup and IP law",
    whatToExpect:
      "• Overview of mediation and dispute resolution work\n• Insight into how deals and corporate law practices function\n• Exposure to case discussions and client interactions\n\nYou’ll take away:\n• Insight into real-world legal practices\n• Basics of mediation and dispute resolution\n• Understanding of client interaction and case flow",
    whatToBring:
      "• Bring a notebook for taking notes during discussions.\n• Maintain confidentiality and professionalism at all times.",
  },
];

(async () => {
  try {
    // 1. Clear test registrations + test sponsors from the session
    await sql`DELETE FROM internship_registrations WHERE session_id = ${SESSION_ID}`;
    await sql`DELETE FROM session_companies WHERE session_id = ${SESSION_ID}`;
    console.log("Cleared test registrations and test session_companies");

    // 2. Update session metadata (description + target both classes + max prefs = 3)
    await sql`UPDATE internship_sessions SET
      title = 'HPS World is My Oyster - May 2026',
      target_class = '9_10',
      max_preferences = 3,
      description = 'HPS World is My Oyster one-day internships for Classes 9 and 10. You may choose up to three internships. The last date to register for each is 2 days before its date. This is an expression of interest; sponsors may contact you as part of the selection process.'
      WHERE id = ${SESSION_ID}`;

    // 3. Insert each company into library if it doesn't already exist (by name).
    //    Then link to the session via session_companies.
    for (let i = 0; i < COMPANIES.length; i++) {
      const c = COMPANIES[i];
      const existing = await sql`SELECT id FROM companies WHERE name = ${c.name} LIMIT 1`;
      let companyId;
      if (existing.length > 0) {
        companyId = existing[0].id;
        await sql`UPDATE companies SET
          sector = ${c.sector},
          description = ${c.description},
          website_url = ${c.websiteUrl}
          WHERE id = ${companyId}`;
        console.log(`Updated existing library entry: ${c.name}`);
      } else {
        const [row] = await sql`INSERT INTO companies (name, sector, description, website_url)
          VALUES (${c.name}, ${c.sector}, ${c.description}, ${c.websiteUrl})
          RETURNING id`;
        companyId = row.id;
        console.log(`Created library entry: ${c.name}`);
      }

      await sql`INSERT INTO session_companies (
        session_id, company_id, internship_date, slots_available, display_order,
        about_internship, who_for, what_to_expect, what_to_bring, is_active
      ) VALUES (
        ${SESSION_ID}, ${companyId}, ${c.internshipDate}, 999, ${i},
        ${c.aboutInternship}, ${c.whoFor}, ${c.whatToExpect}, ${c.whatToBring}, true
      )`;
      console.log(`Linked ${c.name} to session`);
    }

    const linked = await sql`SELECT c.name, sc.id, sc.internship_date FROM session_companies sc
      JOIN companies c ON c.id = sc.company_id
      WHERE sc.session_id = ${SESSION_ID}
      ORDER BY sc.display_order`;
    console.log("\nFinal linked sponsors:");
    console.log(JSON.stringify(linked, null, 2));
  } finally {
    await sql.end({ timeout: 1 });
  }
})();
