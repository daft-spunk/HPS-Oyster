import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

type Seed = {
  name: string;
  sector: string;
  description: string;
  notes?: string;
  defaultSlotLimit?: number;
};

const SEED: Seed[] = [
  { name: "Continental Coffee", sector: "Food & Beverages (Coffee Manufacturing & Export)", description: "Continental Coffee, part of CCL Products (India) Ltd., is one of the world's largest coffee manufacturers and exporters.", notes: "Website: https://www.cclproducts.com/ | Good for: Students interested in food & beverage industry, global supply chains, manufacturing, exports, private label businesses, entrepreneurship, branding, international markets. Takeaway: Knowledge of large-scale coffee manufacturing, global trade, supply chains, branding, and product development." },
  { name: "Caspian Investments", sector: "Impact Investing / Financial Services", description: "Caspian Investments is an India-focused impact investment firm that provides debt and equity capital to enterprises driving social and environmental change.", notes: "Website: https://www.caspian.in/ | Typical date: 11th May. Good for: students interested in impact investing, sustainable finance, mission-driven enterprises, finance, development sector, inclusive growth." },
  { name: "Peer Mediation", sector: "Conflict Resolution & Social Emotional Learning (SEL)", description: "A mentored, student-led project where Grades 11-12 students collaboratively research, design, and publish a peer mediation manual to build practical conflict resolution and legal skills.", notes: "Reference: https://youtu.be/GA7rOGMUTAY | Typical window: 29 Dec - 2 Jan. Mentors include Mr. AJ Jawad (IAMC), Mr. Jonathan (The Pact), Ms. Tara Ollapally (CAMP), Mr. Mohit Mokal Mediation, Ms. Anjali (SpringUp), Mr. KS Sarma (Life Skills India). Ms. Ekta Bahl of Samvad Partners is the school contact. 2 deliverables: Concept Paper, then drafting the Peer Mediation Manual. Entry question: Describe a conflict you have seen or experienced at school and explain how you think it could have been resolved differently through dialogue or mediation." },
  { name: "Centuary Mattresses (Retail Survey)", sector: "Retail Customer Research / Consumer Behavior", description: "Conduct retail customer surveys to understand who customers are, how they decide, and what shapes their buying journey, and turn insights into actionable recommendations.", notes: "Website: https://www.centuaryindia.com | Typical window: 29 Dec - 2 Jan. Good for Class 11-12 students interested in psychology, consumer behavior, market research, retail operations, marketing, business studies." },
  { name: "Centuary Mattresses (E-commerce Benchmarking)", sector: "E-commerce Market Research & Retail Analysis", description: "Analyze and benchmark mattress and pillow listings across leading e-commerce platforms to compare product mix, pricing, reviews, and cataloguing, and identify best practices.", notes: "Website: https://www.centuaryindia.com | Typical window: 29 Dec - 2 Jan. Class 11-12 students interested in market research, consumer behavior, e-commerce, retail analytics, marketing, business strategy. Platforms: Amazon, Flipkart, Pepperfry, etc." },
  { name: "Conçu", sector: "Food & Beverage / Boutique Patisserie & Cafés", description: "A boutique patisserie-café chain serving European-style desserts, artisanal cakes, and gourmet treats across Hyderabad.", notes: "Website: https://concu.in | Good for students passionate about food, hospitality, customer experience, F&B/bakery business, pastry/culinary arts, branding. Walkthrough of a patisserie/café, dessert-making, café operations, food safety. Wear closed shoes; maintain hygiene standards." },
  { name: "MosChip Technologies Ltd", sector: "Semiconductor / Silicon & Product Engineering", description: "A pioneering semiconductor company building the chips, systems, and intelligent technologies that power tomorrow's innovation.", notes: "Website: https://moschip.com | Typical date: 30 Dec. Behind-the-scenes look at advanced semiconductors and ASICs, embedded systems, mixed-signal design, AI-driven engineering. Follow lab/access guidelines." },
  { name: "Arete Hospitals", sector: "Healthcare / Multi-specialty Hospitals", description: "A state-of-the-art hospital in Gachibowli, Hyderabad, combining medical excellence with high-quality patient care.", notes: "Website: https://aretehospitals.com | Department tours, patient care & diagnostics exposure, critical care, healthcare technology. Wear closed shoes & follow hospital safety rules." },
  { name: "DarwinBox", sector: "Human Capital Management / Software", description: "A cloud-based HCM platform managing the entire employee journey through smart, AI-driven tools.", notes: "Website: https://darwinbox.com | For students interested in HR tech, tech + business workflow, AI in organisations. Recruitment to payroll workflows, performance & talent modules, HR analytics, automation." },
  { name: "Dhruva Space", sector: "Space Technology / Satellite Engineering", description: "A fast-growing Indian space-tech company building satellites and mission-ready space systems.", notes: "Website: https://www.dhruvaspace.com/ | Typical date: 20 Dec. IMPORTANT: A soft copy of Aadhaar card must be submitted in advance for entry. Satellite design & space missions, build/test/operate. Follow all safety and security instructions." },
  { name: "Jayanti Reddy Designs", sector: "Fashion / Couture", description: "A luxury fashion label offering contemporary Indian wear, blending traditional craftsmanship with modern silhouettes.", notes: "Website: https://jayantireddy.com | Typical date: 27 Dec. Tour of design studio and boutique, design process, fabric sourcing, embroidery techniques, production. Bring a notebook." },
  { name: "Labonel Fine Baking", sector: "Fine Baking / Food & Beverage", description: "A luxury bakery brand known for artisanal brownies, cakes, and gourmet desserts.", notes: "Website: https://www.labonelfinebaking.shop | Typical date: 25 Sep. Bakery walkthrough & demo, kitchen & packaging, brand positioning, customer relations. Maintain food-safe environment, closed shoes preferred." },
  { name: "Yacht Club of Hyderabad", sector: "Sports / Recreation / Hospitality", description: "A premier sailing and water sports club offering training, recreation, and world-class facilities on Hussain Sagar Lake.", notes: "Website: https://www.ychfoundation.com | Typical date: 27 Sep. Tour of sailing facilities, training programs, hospitality. Follow safety instructions carefully around water and equipment." },
  { name: "Redmatter Integrated Marketing", sector: "Marketing, Advertising, Brand Strategy", description: "A full-service marketing agency helping brands grow through strategy, creativity, and digital innovation.", notes: "Website: https://www.redmatter.in | Marketing principles, hands-on strategy work for fictitious brands, real-world campaigns, agency workflows. Bring a notebook/laptop." },
  { name: "Care Hospitals", sector: "Healthcare / Multi-specialty Hospitals", description: "One of India's leading multi-specialty hospital networks providing advanced medical care.", notes: "Website: https://www.carehospitals.com | Typical date: 29 Sep. Hospital tour, shadow doctors and administrators, healthcare careers and ethics talk. Respect patient privacy; closed shoes preferred." },
  { name: "Keus Automation", sector: "Smart Home Automation / Technology", description: "A Hyderabad-based smart home automation company creating integrated solutions for lighting, security, climate, and entertainment control.", notes: "Website: http://www.keus.in | Typical date: 30 Sep. Walk-through of how smart home automation products are designed and developed, IoT, hardware-software integration." },
  { name: "Deloitte", sector: "Professional Services (Consulting, Audit, Tax & Advisory)", description: "A global leader in consulting and professional services, helping organizations solve complex problems, innovate, and grow.", notes: "Website: https://www.deloitte.com/in/en.html | Typical date: 29 Sep. Overview of consulting, audit, tax, and advisory; professional journeys; structured problem-solving and teamwork." },
  { name: "Samvad Partners", sector: "Law / Mediation & Dispute Resolution", description: "An award-winning Indian law firm specializing in mediation, ADR, M&A, and dispute resolution.", notes: "Website: https://www.samvadpartners.com | Mediation and dispute resolution work, deals and corporate law, case discussions, client interactions. Maintain confidentiality and professionalism." },
  { name: "GolfTripz", sector: "Travel / Tourism / Sports", description: "A leading golf travel company organizing experiences, tours, and events for golfers worldwide. Booking platform for global golf holidays, tee times, lessons, and curated stay & play packages.", notes: "Website: https://www.golftripz.com/ | Typical dates: 24-26 Sep. How golf tours are designed and sold, event planning, itinerary design, sports tourism, luxury travel." },
  { name: "T-Hub", sector: "Startup Incubator / Innovation", description: "South Asia's largest startup incubator helping founders build and scale.", notes: "Website: https://t-hub.co | Typical dates: 22-23 Sep. Ecosystem tour, shadow a stand-up, mini brief; how ideas become products, pitching basics, agile teams. Bring a notebook; closed shoes preferred." },
  { name: "CVN Law", sector: "Legal Services / Corporate Law", description: "A law firm offering services in corporate, commercial, and dispute resolution matters.", notes: "LinkedIn: https://www.linkedin.com/in/narasimham-c-v-87a62510/ | Typical dates: 23-25 Sep. Client consultation/briefing, contracts, compliance, dispute resolution, case preparation. Take notes actively, follow office rules." },
  { name: "Atumobile Pvt Ltd", sector: "Electric Two-Wheelers / EV Manufacturing", description: "Designs and makes stylish, made-for-India electric bikes with a focus on sustainability and green energy.", notes: "Website: https://atumobile.co | Typical date: 22 Sep. EV production facility tour, electric vehicle models and assembly lines, solar energy and battery technologies. Closed shoes mandatory; follow all safety guidelines." },
  { name: "Fourth Partner Energy Pvt Ltd", sector: "Renewable Energy / Solar Power", description: "A leading renewable energy solutions provider specializing in solar, wind, and battery storage systems for commercial and industrial clients.", notes: "Website: https://www.fourthpartner.co | Typical dates: 24-25 Sep. Live solar/hybrid project site, energy storage, EV charging infrastructure, financing models (PPAs, RE100). Follow safety instructions." },
  { name: "InvAscent", sector: "Private Equity / Life Sciences Investment", description: "A life sciences private equity firm partnering with Indian pharma, healthcare delivery, MedTech, and animal health businesses to create market leaders.", notes: "Website: https://invascent.com | Typical date: 26 Sep. Growth capital investment in life sciences, partnering with small and mid-sized businesses, market opportunities. Bring a notebook." },
  { name: "Aragen Life Sciences", sector: "Contract R&D & Biopharma Manufacturing", description: "A Hyderabad-based R&D and manufacturing partner transforming ideas into drug discovery, development, and biologics.", notes: "Website: https://aragen.com | Typical date: 30 Sep. R&D labs and manufacturing facilities, drug discovery, safety assessment, GMP, small molecule and biologics workflows. Wear closed shoes; follow safety and hygiene protocols." },
  { name: "Doctor C", sector: "Diagnostics & Preventive Healthcare", description: "A tech-driven healthcare provider offering diagnostics, health checks, and home-sample services.", notes: "Website: https://doctorc.in/about/ | Typical date: 26 Sep. How tests/scans are done, home diagnostics, sample collection, patient service & report generation. Closed shoes preferred; follow hygiene rules." },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  console.log(`Seeding ${SEED.length} companies...`);
  let added = 0;
  for (const c of SEED) {
    try {
      await sql`
        INSERT INTO companies (name, sector, description, default_slot_limit, notes)
        VALUES (${c.name}, ${c.sector}, ${c.description}, ${c.defaultSlotLimit ?? 2}, ${c.notes ?? null})
      `;
      added++;
      console.log(`  ✓ ${c.name}`);
    } catch (e) {
      console.log(`  ✗ ${c.name}:`, (e as Error).message);
    }
  }
  console.log(`\nDone. Added ${added}/${SEED.length} companies.`);
  await sql.end();
  process.exit(0);
}

main();
