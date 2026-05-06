import Link from "next/link";
import Image from "next/image";
import { getActiveTalkSessions } from "@/lib/actions/talks";
import { getActiveInternshipSessions } from "@/lib/actions/internships";
import { formatTargetClass } from "@/lib/format";
import { PublicNavbar } from "@/components/PublicNavbar";
import { HighlightsCarousel } from "@/components/HighlightsCarousel";
import { FaqList } from "@/components/FaqList";
import { StickyCtaBar, type StickyCta } from "@/components/StickyCtaBar";

const CAREER_FIELDS = [
  { icon: "/assets/icons/Bag.png", title: "Startups:", desc: "Immerse yourself in the world of innovation and entrepreneurship." },
  { icon: "/assets/icons/SolarPanel.png", title: "Renewable Energy:", desc: "Discover the power of green technology and sustainability." },
  { icon: "/assets/icons/Hamburger.png", title: "Food Industry:", desc: "Taste the journey from farm to fork in the culinary world." },
  { icon: "/assets/icons/Planet.png", title: "Aerospace:", desc: "Soar high by learning what it takes to explore the skies and beyond." },
  { icon: "/assets/icons/Cpu.png", title: "Engineering:", desc: "Solve real-world problems with cutting-edge solutions." },
  { icon: "/assets/icons/Warehouse.png", title: "Manufacturing:", desc: "See how products are brought to life from concept to market." },
  { icon: "/assets/icons/Monitor.png", title: "Marketing & Advertising:", desc: "Unleash your creativity in telling compelling brand stories." },
  { icon: "/assets/icons/Ambulance.png", title: "Pharmaceuticals:", desc: "Contribute to health and wellbeing by understanding medicine and research." },
  { icon: "/assets/icons/ChartPieSlice.png", title: "Accounting:", desc: "Receive financial insights and regulatory guidance from a leading accounting firm." },
];

const WHY_FIELDS = [
  { icon: "/assets/icons/BookOpenText.png", title: "Real-World Experience:", desc: "Gain an authentic glimpse into a professional environment, beyond textbooks and theories." },
  { icon: "/assets/icons/MicrophoneStage.png", title: "Mentorship:", desc: "Connect with HPS alumni and industry professionals who are eager to share their knowledge and experiences." },
  { icon: "/assets/icons/CardsThree.png", title: "Career Clarity:", desc: "Discover firsthand what excites you and where your passion lies, helping to illuminate your ideal career path." },
];

const FAQS = [
  { q: "What is the purpose of the program?", a: "The program aims to provide students with exposure to both futuristic and conventional career options, helping them make informed decisions about their academic and career paths through real-life, hands-on exposure to the working environment, opportunities, and challenges involved by letting the students spend a day with a professional." },
  { q: "Who is eligible to participate in the internship program?", a: "Students from classes 9-12 at The Hyderabad Public School are eligible to participate." },
  { q: "How is the program structured?", a: "Internships typically involve students shadowing alumni of the school at their workplace for a day to gain insight into various career fields. The students spend an entire day, from morning to evening walking, talking and working with an industry professional to gain hands on exposure and align their interests." },
  { q: "What types of careers are covered in the program?", a: "The program covers a wide range of futuristic career options along with conventional career paths to provide students with a holistic understanding of different industries." },
  { q: "How are students assigned to internships?", a: "Students express interest in their top 3 preferred companies. The program team matches students based on preferences and host company availability." },
  { q: "How long is each internship?", a: "Each internship is a one-day shadowing experience, giving students a focused look at a specific industry." },
  { q: "Will I receive a certificate?", a: "Yes, students who complete the program receive a certificate of participation." },
];

export default async function HomePage() {
  const [activeTalks, activeInternships] = await Promise.all([
    getActiveTalkSessions(),
    getActiveInternshipSessions(),
  ]);

  const stickyCtas: StickyCta[] = [
    ...activeTalks.map((s) => ({
      label: `Register for ${formatTargetClass(s.targetClass)} Role Model Talks`,
      href: "/talks",
    })),
    ...activeInternships.map((s) => ({
      label: `Register for ${formatTargetClass(s.targetClass)} 1-Day Internships`,
      href: s.targetClass === "9_10" ? "/internships" : `/internships?class=${s.targetClass}`,
    })),
  ];

  return (
    <div className="bg-white text-gray-900">
      <PublicNavbar />

      {/* HERO — full viewport, dark overlay, school bg, white heading + gold button */}
      <section className="relative h-[70vh] min-h-[450px] flex flex-col items-center justify-center text-center text-white overflow-hidden">
        <Image
          src="/assets/bg.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-[1] px-4 max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-8 leading-tight">
            Shadow. Discover. Connect.
            <br />
            Time to take your first dip!
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            {activeTalks.map((s) => (
              <Link
                key={s.id}
                href="/talks"
                className="inline-block px-5 py-2.5 bg-[#BD974A] hover:bg-[#a4843d] text-white rounded-lg font-medium transition"
              >
                Register for {formatTargetClass(s.targetClass)} Role Model Talks
              </Link>
            ))}
            {activeInternships.map((s) => {
              const href =
                s.targetClass === "9_10"
                  ? "/internships"
                  : `/internships?class=${s.targetClass}`;
              return (
                <Link
                  key={s.id}
                  href={href}
                  className="inline-block px-5 py-2.5 bg-[#BD974A] hover:bg-[#a4843d] text-white rounded-lg font-medium transition"
                >
                  Register for {formatTargetClass(s.targetClass)} 1-Day Internships
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* BLUE DIVIDER — quote banner */}
      <section className="bg-[#004B9C] text-white">
        <div className="container mx-auto px-4 py-10 md:py-14 flex flex-col md:flex-row items-center gap-8">
          <h2 className="md:w-1/2 text-xl md:text-2xl font-bold leading-snug">
            Ever wondered what it&apos;s like to walk in the shoes of a professional in
            your dream career?
          </h2>
          <p className="md:w-1/2 text-base md:text-lg leading-relaxed md:pl-12">
            &quot;Take Your First Dip,&quot; an innovative one-day internship initiative by
            the HPS alumni, offers you just that — a unique opportunity to shadow a
            mentor and observe the day-to-day workings of various industries.
          </p>
        </div>
      </section>

      {/* WHAT'S IN STORE — 3 cards with gold icon tile */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          What&apos;s In Store?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="/assets/icons/ShakeHand.png"
            title="Industry Dive"
            text="Spend an entire day with an industry professional, observing their daily routines, tasks, and the challenges they tackle. It's a front-row seat to the real-world action!"
          />
          <FeatureCard
            icon="/assets/icons/Search.png"
            title="Guidance Spectrum"
            text="Whether it's launching startups, generating renewable energy, engineering the future, or crafting health solutions in pharmaceuticals, we've got mentors from a spectrum of fields ready to guide you."
          />
          <FeatureCard
            icon="/assets/icons/AI.png"
            title="Engaged Learning"
            text="This isn't just about watching; it's about understanding the why and how behind every task. Ask questions, get involved in discussions, and gain insights that only come from real-life experiences."
          />
        </div>
      </section>

      {/* 2024 HIGHLIGHTS — text + image */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          2024 Oyster Internship Program Highlights
        </h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-base leading-relaxed mb-5">
              Our inaugural one-day internship series let HPS Grade 9 &amp; 10 Eagles
              shadow alumni inside real workplaces — from kitchens to cockpits, clinics
              to coding floors — sparking bigger dreams in just one day.
            </p>
            <p className="font-bold mb-2">Highlights</p>
            <ul className="list-disc pl-6 space-y-2 mb-6 text-base">
              <li>120 internships completed</li>
              <li>110 students involved</li>
              <li>
                25 alumni host-companies, including T-Hub, RGIA Airport, CARE
                Hospitals, and 24 Mantra
              </li>
              <li>11 career streams explored</li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <span className="inline-block px-5 py-2.5 bg-[#BD974A] text-white rounded-lg font-medium">
                View first year report
              </span>
            </div>
          </div>
          <HighlightsCarousel />
        </div>
      </section>

      {/* SPEND A DAY — image + career list */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div className="rounded-lg overflow-hidden shadow-md md:sticky md:top-4">
            <Image
              src="/assets/bg1.png"
              alt="Students learning"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Spend a Day in the Life of a Professional
            </h2>
            <ul className="space-y-4">
              {CAREER_FIELDS.map((field) => (
                <li key={field.title} className="flex items-start gap-3">
                  <Image
                    src={field.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-base leading-relaxed">
                    <b>{field.title}</b> {field.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHY EMBARK — list + image */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Why Embark on This Journey?
            </h2>
            <ul className="space-y-5">
              {WHY_FIELDS.map((field) => (
                <li key={field.title} className="flex items-start gap-3">
                  <Image
                    src={field.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <p className="text-base leading-relaxed">
                    <b>{field.title}</b> {field.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg overflow-hidden shadow-md">
            <Image
              src="/assets/bg2.png"
              alt="Mentor session"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* FOOTER WITH HPS AERIAL — Join Us (parallax) */}
      <section
        className="relative bg-cover bg-center bg-no-repeat bg-fixed py-24 md:py-32 px-4"
        style={{ backgroundImage: `url(/assets/HPS-Aerial.png)` }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-[1] container mx-auto text-white text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Us On This Adventure
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-2">
            &quot;Take Your First Dip&quot; is more than an internship; it&apos;s your
            chance to begin shaping your future. Follow a day in the life of a mentor
            in your field of interest and see firsthand what your future career could
            look like.
          </p>
          <p className="font-bold mb-6">
            Upcoming Details: Stay Tuned for More Information!
          </p>
          <a
            href="https://chat.whatsapp.com/FX98sOoqJrDGtCZ6YACZyi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 bg-[#BD974A] hover:bg-[#a4843d] text-white rounded-lg font-medium transition"
          >
            Join our Oyster WhatsApp Community
          </a>
        </div>
      </section>

      {/* FAQs */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">FAQs</h2>
        <FaqList faqs={FAQS} />
      </section>

      <StickyCtaBar ctas={stickyCtas} />

      {/* Bottom footer bar */}
      <footer className="bg-[#132E5A] text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            A Hyderabad Public School Alumni Initiative
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bg-[#F4F4F4] rounded-lg p-5">
      <div className="flex items-center gap-4 mb-3">
        <div className="bg-[#BD974A] rounded-lg p-3 flex items-center justify-center w-16 h-16 flex-shrink-0">
          <Image src={icon} alt="" width={36} height={36} />
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}
