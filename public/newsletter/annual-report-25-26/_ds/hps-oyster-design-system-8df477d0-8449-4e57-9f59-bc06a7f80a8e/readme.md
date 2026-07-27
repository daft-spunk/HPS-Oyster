# HPS Oyster — Design System

> **The World is My Oyster.** Shadow · Discover · Connect — *Take Your First Dip.*
> A Hyderabad Public School alumni initiative that bridges classroom and career by letting students shadow a professional for a day.

This is the design system for **HPS Oyster**, the internship programme — dressed in the **heritage visual language of its parent institution, The Hyderabad Public School Society**. Oyster is an HPS alumni initiative, so it inherits the Society's crest-led, navy-and-gold, classical-serif identity rather than a generic playful look. The result: a youthful, aspirational programme wearing a century of institutional gravitas.

**The split to remember:** the **content & voice are Oyster** (warm, aspirational, "take your first dip"); the **visual system is HPS heritage** (slate navy + gold, parchment, Cormorant/EB Garamond, roman numerals, gold rules, the HPS crest).

---

## Sources used to build this system

- **Brand / programme:** https://hpsoyster.com/ — "HPS World is My Oyster", the *Take Your First Dip* one-day internship initiative. All programme content, pillars, career streams, stats, and FAQs come from here.
- **Visual design language:** https://www.hpss.org.in/ — The Hyderabad Public School Society (est. 1923). The heraldic look — the crest, navy + gold palette, classical serif typography, roman-numeral sections, gold rules, dignified restraint — is taken from here, per the brief ("take the design from HPSS, make it for Oyster").
- **Crest asset:** https://www.hpss.org.in/images/crest.png — the HPS crest (gold soaring eagle on slate navy, motto "Be Vigilant"). Sampled directly for the palette; used as the endorsing mark on the Oyster lockup. HPS students are "Eagles," so the eagle ties the two together.
- No codebase or Figma was provided. The live Oyster site uses raster assets (logo, photography) that could not be downloaded; this system references the HPS crest by URL and recreates the wordmark in type. See **Caveats**.

### What HPS Oyster is
A one-day "shadow a mentor" internship run by HPS alumni for HPS students (classes 9–12). Students spend a full day inside a real workplace across career streams. 2024 inaugural run: **120 internships, 110 students, 25 alumni host-companies** (T-Hub, RGIA Airport, CARE Hospitals, 24 Mantra…), **11 career streams**. Three pillars: **Industry Dive**, **Guidance Spectrum**, **Engaged Learning**.

---

## CONTENT FUNDAMENTALS

**Voice (Oyster):** warm, aspirational, invitational — an older mentor encouraging a student to be brave and curious. It sells *possibility*, not a product. The heritage visuals lend it poise, but the words stay youthful and direct.

- **Person:** speaks to the student as **"you"** ("Ever wondered what it's like to walk in the shoes of a professional in your dream career?"). The programme speaks as **"we"** ("we've got mentors… ready to guide you").
- **Light marine metaphor.** The programme name — *Take Your First Dip* — and "World is My Oyster" carry a gentle swim/discovery metaphor. Use it sparingly (one figure per passage); the heritage visuals keep it from feeling gimmicky.
- **Casing:** Title Case headings ("What's In Store", "Why Embark on This Journey?"); sentence case prose; tracked UPPERCASE labels and roman-numeral section markers ("— I —").
- **Benefit pattern:** a 2–3 word evocative noun-phrase title (**Industry Dive**, **Guidance Spectrum**, **Engaged Learning**, **Real-World Experience**, **Career Clarity**) + one or two energetic sentences. Bold lead-in word, then explanation: *"**Startups:** Immerse yourself in innovation and entrepreneurship."*
- **Numbers tell the story** — concrete programme stats (120 / 110 / 25 / 11) are a recurring proof device. Set them in display serif.
- **Restraint borrowed from the parent:** trim the exclamation marks and avoid hype/rankings ("#1", "world-class"). Warmth comes from verbs and invitation, not punctuation. **No emoji.**
- **Sign-off:** *"A Hyderabad Public School Alumni Initiative"* — stated plainly, the heritage endorsement.

**Example phrases to echo:** "Time to take your first dip." · "a front-row seat to the real-world action" · "shadow a mentor and observe the day-to-day workings" · "see firsthand what your future career could look like."

---

## VISUAL FOUNDATIONS  *(inherited from HPS Society)*

**Overall vibe:** a heraldic crest plate. Warm parchment paper, deep slate-navy, and regal gold, set in high-contrast classical serif with generous air. Squared corners, hairline + gold rules, roman numerals, ornamental gold dividers. Prestige and restraint.

- **Color:**
  - *Heritage Blue* (`--heritage-600 #2D4168`, sampled from the crest roundel) is the primary — mastheads, dark sections, headings, primary buttons; deepens to `--heritage-900/950` for hero and footer.
  - *Gold* (`--gold-500 #C29A45`, the crest eagle & stars) is the singular ceremonial accent — rules, "Est." badges, the italic subtitle, the **Express Interest** CTA, hover borders. Used sparingly so it stays precious.
  - *Parchment / Stone* warm neutrals (`--paper-50/100`, `--stone-200`) are the page and card surfaces — never cold white as the base.
  - *Ink* ramp leans warm navy-black for text. *Garnet* (`--garnet-500`) is a rare ceremonial accent.
- **Type:** **Cormorant Garamond** (high-contrast display serif) for the masthead and headings — runs large and light, often italic for emphasis words ("Take Your *First Dip*"). **EB Garamond** (old-style serif) for body prose. **Archivo** (quiet grotesque) for nav, buttons, labels, roman numerals, tracked UPPERCASE captions.
- **Backgrounds:** parchment by default; deep-navy gradient (`--grad-midnight`) for the hero, the 2024-stats band, the CTA, and the footer. Photography (when supplied) sits under a navy protection gradient. No busy patterns — the crest and type carry it.
- **Gradients:** few and purposeful — `--grad-midnight`/`--grad-heritage` (navy) for depth; `--grad-gold` for rare ceremonial moments; `--grad-parchment` for soft paper glow. No SaaS purple/teal/coral gradients.
- **Corner radii:** restrained and squared — cards/buttons `--radius-md 6px`, chips `--radius-sm 4px`; only avatars/medallions are fully round. Heritage reads in the lack of rounding.
- **Cards:** parchment-white, hairline border, very quiet shadow. Featured/pillar cards carry a **gold top-rule** (`tone="gold"`). Clickable cards lift only 2px.
- **Shadows:** warm, low-spread, understated (`rgba(28,34,48,…)`). A `--shadow-gold` glow is reserved for ceremonial emphasis.
- **Borders & rules:** hairlines everywhere; the ornamental `Rule` (gold line + center diamond) and tracked roman numerals ("— I —") head sections.
- **Hover:** navy buttons darken a step; gold buttons deepen; outline buttons gain a faint navy-50 fill + gold/navy border; cards lift 2px. Dignified — no glow, no bounce.
- **Press:** a barely-perceptible 0.5px settle. No scaling, no inversion.
- **Focus:** 3px heritage-blue ring (`--focus-ring`). Always visible.
- **Motion:** slow and dignified (`--dur-base 260ms`, `--ease-out`). Gentle fades; masthead frosts on scroll. No overshoot/spin/bounce. Respect `prefers-reduced-motion`.
- **Transparency & blur:** sparing — masthead transparent over the navy hero, frosting to translucent parchment on scroll; glass medallions over navy use white ~10% + hairline + gold glyph.
- **Layout:** centered max-width containers (`--container-lg 1120px`, `--container-md 860px`), `--section-pad-y 96px` rhythm, alternating parchment / subtle-parchment bands, navy hero & footer. Symmetry and centering are the heritage tell.

---

## ICONOGRAPHY

Crest- and type-led; icons are sparse and supporting.

- **Set:** **Phosphor Icons** (CDN), *regular* + *light* weights. Used for small affordances (arrows, external-link, the career-stream glyphs) inside `IconChip` medallions in **gold or navy**, never as decorative clutter.
  ```html
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
  <link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/light/style.css">
  <i class="ph ph-rocket-launch"></i>
  ```
- **The HPS crest is the primary mark.** Reach for `OysterMark` / `CrestLogo` (the crest) before any icon. The eagle, stars and motto live in the crest — never redraw them.
- **Career-stream mapping** (Phosphor): Startups → `ph-rocket-launch`, Renewable Energy → `ph-solar-panel`, Food → `ph-fork-knife`, Aerospace → `ph-airplane-tilt`, Engineering → `ph-cpu`, Manufacturing → `ph-warehouse`, Marketing → `ph-monitor`, Pharmaceuticals → `ph-first-aid-kit`, Accounting → `ph-chart-pie-slice`. Pillars: Industry Dive → `ph-handshake`, Guidance Spectrum → `ph-magnifying-glass`, Engaged Learning → `ph-lightbulb`. Benefits: Real-World Experience → `ph-book-open-text`, Mentorship → `ph-medal`, Career Clarity → `ph-compass`.
- **Emoji / unicode-as-icon:** never. **Hand-drawn SVG crests/eagles:** never — use the crest asset.

---

## Index / manifest

Root:
- `styles.css` — the single entry point consumers link (`@import`s all tokens + fonts).
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `assets/` — notes; the crest is referenced from the live HPS site (see Caveats).
- `readme.md` — this guide · `SKILL.md` — Agent-Skills entry.

Components (`window.HPSOysterDesignSystem_8df477.*`):
- `components/core/` — `Button`, `OysterMark` (programme lockup), `CrestLogo` (parent HPS mark), `Eyebrow` (label + roman-numeral marker), `Rule` (gold ornament), `Pullquote`, `Stat`, `Card`, `Badge`, `Tag`, `IconChip`, `Avatar`, `Input`, `Select`, `Checkbox`, `Switch`. Each has a `.prompt.md`.

UI kits:
- `ui_kits/oyster_site/` — interactive recreation of the Oyster programme site (hero, pillars, streams, 2024 stats, why, CTA, FAQ, interest flow) in the heritage visual language.

Foundation cards populate the **Design System** tab — groups: Colors, Type, Spacing, Brand, Components, HPS Oyster Site.

---

## Caveats / what to verify
- **Fonts are Google-Fonts substitutes** (Cormorant Garamond, EB Garamond, Archivo) — the licensed brand fonts weren't provided. Swap when available.
- **The HPS crest loads from `hpss.org.in` by URL** (used as the endorsing mark); cards/kits need a network connection. For an offline package, download `crest.png` into `assets/` and repoint `OysterMark`/`CrestLogo`'s `src`.
- **Oyster's own raster assets** (its logo, programme photography) could not be downloaded; the wordmark is recreated in type and photo areas are left for real imagery.
- **Palette is sampled from the HPS crest**, not an official Oyster brand spec — confirm exact hex values if an official guide exists.
