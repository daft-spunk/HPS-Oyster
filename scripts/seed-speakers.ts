import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import postgres from "postgres";

type Seed = {
  name: string;
  topic: string;
  bio: string;
  batchYear?: string;
  photoUrl?: string;
  linkedinUrl?: string;
  defaultSlotLimit?: number;
  notes?: string;
};

const SEED: Seed[] = [
  {
    name: "Kishore Krishnamurthy",
    topic: "A career in the creative industry",
    batchYear: "2007 (ISC)",
    photoUrl: "https://www.hpsoyster.com/assets/role_model/Kishore-Krishnamurthy.jpg",
    linkedinUrl: "https://www.linkedin.com/in/kishor-krishnamoorthi-a7795337/",
    bio: "Renowned wedding and documentary photographer based in Hyderabad. HPS Begumpet alumnus who studied Commerce with Business Maths in 11th/12th. Earned degrees in Economics & Politics from the University of Essex in England. Previously worked as an Oil Trader in London before establishing his creative career. Over 15 years of professional work shooting movie posters, celebrities, and documentary projects with global exhibitions and media features.",
    notes: "Default venue (last edition): Class 10E",
  },
  {
    name: "Gopikrishna Lingala",
    topic: "Career planning in an AI world",
    batchYear: "1998 (ISC)",
    photoUrl: "https://www.hpsoyster.com/assets/role_model/gopikrishna-lingala.jpeg",
    linkedinUrl: "https://in.linkedin.com/in/gopikl",
    bio: "Career spanning four continents, three degrees, and multiple languages. Started in Hyderabad creating over 1500 jobs, then pursued social work in Latin America while learning Spanish. Analyzed supply chains for Fortune 100 companies in Singapore. Currently transforms operations using AI and analytics at Microsoft while developing a nutrition startup.",
    notes: "Default venue (last edition): Class 10A",
  },
  {
    name: "Dr. Anuj Kapadiya",
    topic: "Importance of Cardiology in Medicine",
    batchYear: "1993 (ISC)",
    photoUrl: "https://www.hpsoyster.com/assets/role_model/anuj.png",
    bio: "Renowned cardiologist with 18 years of experience. Established Primary Angioplasty program at Osmania General Hospital during fellowship. Served as Cath Lab Director for Care Hospital, where he established radial primary angioplasty procedures. Co-established TAVR programs at Care Hospitals and AIG Hospitals. Trained senior electrophysiologists internationally in septal puncture techniques.",
    notes: "Default venue (last edition): Class 10D",
  },
  {
    name: "Ekta Bahl",
    topic: "Law",
    linkedinUrl: "https://www.samvadpartners.com/ekta-bahl",
    bio: "Partner at Samvad Partners and Partner-in-Charge of the Hyderabad office. Seasoned corporate and commercial lawyer specializing in corporate restructuring, insolvency, private equity, and mergers & acquisitions. Graduated from the National Law School of India University, Bengaluru (1997). Qualified mediator with advanced training in negotiation. Active in TiE Hyderabad, CII-IWN, and FTCCI. Recognized by Chambers Asia-Pacific and Legal 500.",
    notes: "Default venue (last edition): Class 10B. Also serves as school contact for Peer Mediation internship.",
  },
  {
    name: "C. Ram Manohar Reddy",
    topic: "Journalism",
    bio: "Journalist for nearly 40 years starting 1988 at Deccan Herald, Bangalore. Worked over a decade with The Hindu in Madras/Chennai. Appointed Editor of Economic and Political Weekly in 2004 — only the third editor in the publication's 50-year history. Oversaw the digital transition and strengthened finances during a 10+ year tenure. Founded The India Forum in 2019, now a leading independent digital commentary publication. Holds an undergraduate degree in Physics from Madras University, postgraduate diploma from Indian Institute of Management Calcutta, and PhD in Economics from Centre for Development Studies.",
    notes: "Default venue (last edition): Class 10C",
  },
  {
    name: "Yashovardhan Shetty",
    topic: "Digital Design: Everything is an Interface",
    batchYear: "2020",
    photoUrl: "https://www.hpsoyster.com/assets/role_model/yashpvardhan.png",
    bio: "Designer working at the intersection of physical computing and AI. Currently employed at a startup collaborating with MIT and NVIDIA researchers developing AI systems for wildfire prevention in the U.S. Focuses on straightforward explanations and appropriate medium selection. Projects include VR for wildlife conservation, Delhi Metro passenger flow improvements, and archival systems. Teaching experience at IIT Jodhpur. Emphasizes tangible, practical technology interactions.",
    notes: "Default venue (last edition): Class 10F",
  },
  {
    name: "Srikant Rajasekharuni",
    topic: "Entrepreneurship mindset and career evolution",
    batchYear: "HPS alumnus",
    bio: "Founder and Director of Redmatter Integrated Marketing, a full-funnel marketing and growth agency in Hyderabad. MBA from MICA specializing in Branding and Advertising. BTech in Information Technology from VNRVJIET. Early career as a game developer on India's first PlayStation 2 and PlayStation 3 games. Over a decade working across FMCG, real estate, healthcare, education, media, and technology sectors. Committed to mentoring and building platforms supporting young professionals.",
  },
  {
    name: "Mani Shankar",
    topic: "AI-integrated cinema & holographic media",
    bio: "Guinness World Record holder for maximum simultaneous live holograms during Narendra Modi's 2012 campaign. Inventor of the Mobile Holographic Unit and the world's first mobile holographic campaign. Pioneering filmmaker exploring AI-integrated cinema. Created 2,000+ ad films, short films, and music videos for major brands. Directed six feature films collaborating with acclaimed Bollywood actors. Conducted 10,000+ holographic rallies worldwide.",
  },
  {
    name: "Shujath Bin Ali",
    topic: "Corporate law, governance, ethics, and ESG",
    bio: "Chief Legal Officer at Fourth Partner Energy. 24 years of experience across pharma, IT, professional services, manufacturing, energy, and sustainability. Previously Global General Counsel & Chief Compliance Officer at Re Sustainability Ltd. Senior roles at PAREXEL, International Paper, and Deloitte US-India. Commerce and Law graduate, Fellow Member of the Institute of Company Secretaries of India. Executive programs from Harvard, ISB Hyderabad, NLSIU Bengaluru. Recognized among India's Top 100 General Counsels.",
  },
  {
    name: "Siddharth Velakacharla",
    topic: "Global finance, investing, and entrepreneurship",
    bio: "Retired General Partner of Indus Capital Partners, a premier multi-billion dollar hedge fund in New York. Helped build and structure Neonyoyo's sale to Nasdaq-listed Interwoven. Over 25 years managing equity portfolios at leading investment firms and tech startups. Engaged with hundreds of CEOs evaluating business strategy and value creation. MBA from Ross School of Business, University of Michigan. Mechanical engineering degree from Osmania University.",
  },
];

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  console.log(`Seeding ${SEED.length} speakers...`);
  let added = 0;
  for (const s of SEED) {
    try {
      await sql`
        INSERT INTO speakers (name, topic, bio, batch_year, photo_url, linkedin_url, default_slot_limit, notes)
        VALUES (
          ${s.name}, ${s.topic}, ${s.bio},
          ${s.batchYear ?? null}, ${s.photoUrl ?? null}, ${s.linkedinUrl ?? null},
          ${s.defaultSlotLimit ?? 30}, ${s.notes ?? null}
        )
      `;
      added++;
      console.log(`  ✓ ${s.name}`);
    } catch (e) {
      console.log(`  ✗ ${s.name}:`, (e as Error).message);
    }
  }
  console.log(`\nDone. Added ${added}/${SEED.length} speakers.`);
  await sql.end();
  process.exit(0);
}

main();
