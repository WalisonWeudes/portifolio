---
name: Ventura Contabilidade
description: Institutional site for a fictional Piauí accounting firm, built as the modern service-business category standard executed at full craft.
colors:
  white: "#ffffff"
  mint-ground: "#f2f6f3"
  mint-ground-2: "#e6eee9"
  hairline: "#dfe7e2"
  ink: "#0f1a17"
  ink-2: "#44514c"
  ink-3: "#66736e"
  forest: "#0a2e22"
  forest-2: "#12402f"
  forest-text: "#b7cbc0"
  forest-divider: "#234b3b"
  night-bar: "#050f0b"
  brand: "#0f7a4a"
  brand-dark: "#0b5e39"
  brand-tint: "#e3f2ea"
  lime: "#c6ec7a"
  lime-dark: "#b3dd5f"
  star: "#f2a83b"
  whatsapp: "#1fa855"
  error: "#b42318"
typography:
  display:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(2.8rem, 5.8vw, 5.2rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.045em"
  display-page:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3.8rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  figure:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "clamp(1.9rem, 3vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum', 'lnum'"
  title:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body-lead:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 700
    lineHeight: 1.2
  caption:
    fontFamily: "Manrope, Segoe UI, Arial, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.3
rounded:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  xxl: "28px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  container: "1200px"
  section: "clamp(4rem, 8vw, 6.5rem)"
  grid-gap: "1.4rem"
  card-pad: "1.5rem"
  card-pad-lg: "1.8rem"
  stack: "1rem"
  inline: "0.8rem"
components:
  button-brand:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.35rem"
    height: "46px"
  button-brand-hover:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.white}"
  button-brand-lg:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.85rem 1.7rem"
    height: "54px"
  button-lime:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.forest}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.35rem"
    height: "46px"
  button-lime-hover:
    backgroundColor: "{colors.lime-dark}"
    textColor: "{colors.forest}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.35rem"
    height: "46px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
  button-ghost-light:
    backgroundColor: "transparent"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.7rem 1.35rem"
    height: "46px"
  chip:
    backgroundColor: "{colors.brand-tint}"
    textColor: "{colors.brand-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.75rem"
  chip-line:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.75rem"
  card-service:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "2.2rem 1.4rem 1.4rem"
  card-info:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-pad}"
  card-featured:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "2rem 1.8rem"
  float-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "0.9rem 1.1rem"
  icon-tile:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    size: "46px"
  step-number:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    size: "40px"
  field-input:
    backgroundColor: "{colors.mint-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 1rem"
    height: "50px"
  field-input-focus:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
  nav-link:
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
  nav-link-active:
    textColor: "{colors.ink}"
  stats-tile:
    backgroundColor: "rgba(255, 255, 255, 0.05)"
    textColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "1.3rem 1.4rem"
  cta-band:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.white}"
    rounded: "{rounded.xxl}"
---

# Design System: Ventura Contabilidade

## Overview

**Creative North Star: "The Well-Run Practice"**

The site looks like the office of a firm that already has its house in order: bright white and soft mint-grey rooms, a deep forest-green that anchors every dark band and the footer, one confident brand green for every action, and real photographs of people at work in nearly every block. It plays the modern service-business category standard straight (big photo hero with floating cards, photo service cards, a dark numbers band, process steps, testimonial cards, plans, a two-column FAQ, a colour CTA band, a dark footer with newsletter) and earns its distinction through execution, not novelty: tight Manrope display type, generous rounded corners, quiet neutral shadows, and small live details that prove the firm actually tracks things.

Density is comfortable, never sparse. Sections breathe on a fluid 4 to 6.5rem rhythm, cards sit on a 1.4rem gap, and every block resolves into a two- or three-column grid on desktop that collapses to one column on phones. Light grounds alternate between pure white and mint so the page reads in clear chapters; forest-green bands interrupt that rhythm at the moments that carry proof (numbers, the featured plan, the featured testimonial, the footer).

Motion is earned and small: a logo loop of client marks, figures that count up once when the numbers band enters the viewport, a cursor-following glow on service cards, deadline rows that settle in sequence, arrows that nudge on hover. Every one of them has a reduced-motion fallback that shows the final state.

**Key Characteristics:**
- White and mint-grey grounds, forest-green bands, one brand green for action, lime only on green.
- Manrope 800 display with tight negative tracking; 400 body at 1.6 line-height.
- Rounded everything: 12 to 28px cards and media, pill buttons and chips, round step numbers.
- Real photography in the hero, every service card, the process block, page heads, team and CTA.
- Soft, neutral, downward shadows; no hard offsets, no coloured glows.
- Live, honest details: a monthly deadlines panel computed for the current month, figures that count up.

## Colors

A green-on-white palette: two neutral light grounds, a near-black green ink family, one deep forest for dark surfaces, one saturated brand green for action, and a lime spark reserved for green grounds.

### Primary
- **Ventura Green** (brand): every primary action (pill buttons, the round call button, step numbers, icon tiles, the "Próximo" stamp), the highlighted words in the hero headline, the nav underline, link arrows, focus rings, and the full-bleed CTA band. Also the ground of the first hero info card.
- **Deep Ventura Green** (brand-dark): hover state of the brand button and the text colour on brand-tint chips, badges and the active process track.
- **Green Wash** (brand-tint): chip and badge fills, the floating-card icon tile, tick-mark discs, the highlighted "next" row in the deadlines table, the hover of process steps, and success notices.

### Secondary
- **Forest** (forest): the dark band colour. Utility bar, the numbers band, the bottom strip of the hero, the featured testimonial, the featured plan, the "next deadline" pill, and the footer. Also the browser theme colour.
- **Forest Ring** (forest-2): the thick decorative ring inside the numbers band.
- **Forest Mist** (forest-text): body text on forest surfaces (footer copy, numbers-band labels, featured-plan price line, hero footnote over the band).
- **Forest Seam** (forest-divider): the hairline between footer columns and the footer bottom row.
- **Night Bar** (night-bar): the portfolio "Voltar ao portfólio" demo strip above everything; darker than forest so it reads as outside the firm's site.

### Tertiary
- **Lime Spark** (lime): small highlights on green grounds only: the lime pill button, featured-plan price and tick discs, the "Mais escolhido" tag, utility-bar and footer icons, numbers-band icons, the logo mark's V, footer link hover, the newsletter focus ring, and text selection.
- **Lime Pressed** (lime-dark): hover of the lime button.

### Neutral
- **White** (white): the main page ground, every card, the sticky header (at 94% with blur), and the floating hero cards.
- **Mint Ground** (mint-ground): alternating section ground, client-logo strip, page heads, input fill, process-step fill, FAQ toggle disc, table header row.
- **Mint Ground 2** (mint-ground-2): inactive segments of the progress track.
- **Hairline** (hairline): 1px borders on cards, FAQ items, tables, header bottom edge, inputs (1.5px).
- **Ink** (ink): headings and primary text.
- **Ink 2** (ink-2): body copy, support lines, nav links at rest.
- **Ink 3** (ink-3): captions, footnotes, table metadata, completed deadlines. Passes 4.5:1 on both white and mint.
- **Star** (star): rating stars only, always paired with a numeric rating.
- **WhatsApp** (whatsapp): the fixed WhatsApp button only.
- **Error** (error): field error border and message.

### Named Rules
**The Lime-On-Green Rule.** Lime never touches white or mint. It appears only on forest or brand-green grounds (and as the text-selection highlight), and only in small doses: a button, a tag, a figure, an icon.

**The One Action Colour Rule.** On light grounds, every clickable call to action is brand green (filled pill, text link with arrow) or ink outline. No second accent competes for the click.

**The Forest Means Proof Rule.** A forest surface marks evidence or a featured choice: the numbers, the featured testimonial, the featured plan, the deadline that is next. Don't spend it on ordinary content.

## Typography

**Display Font:** Manrope 800 (with Segoe UI, Arial, sans-serif). The home hero headline is set very large on the dark forest hero, with its key phrase in lime over a thick lime underline.
**Body Font:** Manrope (same family), loaded 400 to 800 from Google Fonts

**Character:** One geometric-humanist sans carries everything. Heavy 800 headings with tight negative tracking give the firm its confident, modern voice; 400 body at a relaxed 1.6 keeps long explanations easy for a busy owner on a phone.

### Hierarchy
- **Display** (800, clamp(2.5rem, 5.4vw, 4.4rem), 1.04, -0.035em): the home hero headline only. Two key phrases are set in brand green via emphasis, upright.
- **Display Page** (800, clamp(2.4rem, 5vw, 3.8rem), 1.1, -0.03em): inner-page head titles.
- **Headline** (800, clamp(2rem, 3.8vw, 3rem), 1.1, -0.03em): section titles. Dark bands and the CTA band use a slightly smaller clamp (up to 2.6 to 2.8rem). Balanced wrapping.
- **Figure** (800, clamp(1.9rem, 3vw, 2.4rem), 1.1, -0.03em, tabular lining numerals): counted statistics, plan prices (2.4rem), the 4,9 rating (2.6rem), the hero info-card figure (2rem).
- **Title** (800, 1.25rem, -0.02em): card titles (services, plans at 1.3rem, the contact form at 1.6rem).
- **Body Lead** (400, 1.05 to 1.12rem, 1.6): the support line under hero and section titles, capped at 32 to 36rem.
- **Body** (400, 1rem, 1.6): paragraphs, FAQ answers, card text.
- **Label** (700, 0.95rem): buttons, nav links (600), FAQ questions, small bold labels.
- **Caption** (600 to 700, 0.75 to 0.85rem): chips, badges, footnotes, table headers, testimonial roles.

### Named Rules
**The Tabular Figures Rule.** Every number that can be compared (statistics, prices, dates, phone numbers, years) uses tabular lining numerals.

**The Heavy Head, Light Body Rule.** Headings are always 800 with negative tracking; body copy is always 400. Nothing in between carries a heading role.

## Layout

A centred container of 1200px with a fluid gutter (16px on phones up to 40px), so content never touches the screen edge. Sections are full-bleed colour bands holding that container, spaced on a fluid vertical rhythm (4rem to 6.5rem). Section heads come in three shapes: left-aligned, centred (plans, FAQ, team), and split (title left, a button or rating right, aligned to the bottom).

Desktop compositions are asymmetric two-column splits (roughly 1.1 / 0.9 for hero and page heads, 0.9 / 1.1 for numbers and contact) and even three-column card grids with a 1.4rem gap. The hero's three info cards overlap its bottom edge: the hero ground fades from white to mint and ends in a forest strip, so the cards sit half on light, half on dark.

Responsive steps at 1020px (splits stack, three-column grids go to two, footer to two columns), 860px (header collapses to a menu button and a full-width dropdown; utility bar keeps only the phone) and 640px (everything single-column, hero cards stack below the photo on a plain light ground, the deadlines table reflows into two-column rows). The footer keeps extra bottom padding so the fixed WhatsApp button never covers the legal line.

## Elevation & Depth

A hybrid system: tonal layering does most of the work (white cards on mint, mint panels on white, forest bands), and soft, neutral, downward shadows lift only what floats or what is featured. Shadows are never coloured and never hard-offset.

### Shadow Vocabulary
- **Resting lift** (`box-shadow: 0 12px 32px rgba(0, 0, 0, 0.07)`): cards that sit on a ground without a border (hero info cards, deadlines panel, open FAQ item, team cards, row process steps, page-head photo, mobile menu).
- **Floating lift** (`box-shadow: 0 24px 56px rgba(0, 0, 0, 0.12)`): things that hover above the page: the hero photo, floating info cards, the featured testimonial and plan, the contact form, and service cards on hover.
- **Round button lift** (`box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18)`): the round call button and the fixed WhatsApp button (0.2 alpha).

### Named Rules
**The Border Or Shadow Rule.** A light card has either a 1px hairline border (service, review, plan, FAQ at rest) or a resting shadow, not both. Hover or open state trades the border for lift.

## Shapes

Generously rounded, friendly but not bubbly. Inputs, icon tiles and the menu button use 12px; floating cards, process steps, FAQ items and the "next deadline" pill use 16px; the standard card radius is 20px; large media (process photo, page-head photo, contact form) use 24px; the hero photo and the CTA band use 28px. Buttons, chips, badges, the newsletter field and tags are full pills; step numbers, avatars, the call button, the WhatsApp button and the FAQ toggle are circles. Photos are always clipped to their container's radius; the CTA band's photo is rounded only on top and bleeds off the band's bottom edge.

Two decorative thick rings (a circle drawn as a heavy border, forest-2 in the numbers band, translucent white in the CTA band) bleed off the corner of the large green bands. They are the only ornament.

## Components

### Buttons
Confident, rounded, always carrying a verb.
- **Shape:** full pill (999px), 46px tall (54px large), 1.5px border slot, 700 weight, no wrapping.
- **Brand:** brand green fill, white text. The default primary action on light grounds.
- **Lime:** lime fill, forest text. The primary action on forest and brand-green grounds.
- **Outline:** transparent with an ink border and ink text; fills ink with white text on hover. The secondary action on light grounds.
- **Ghost light:** translucent white border on green grounds; brightens to a solid white border with an 8% white wash on hover.
- **Hover / Focus:** colour change in 0.2s; the trailing arrow icon nudges 3px right with the house ease. Focus is a 2px brand-green outline offset 3px. Disabled drops to 60% opacity.
- **Text link ("Saiba mais"):** brand green, 700, trailing arrow that nudges 4px on hover.

### Chips
- **Style:** filled chips are brand-tint with brand-dark 700 text; line chips are transparent with a hairline border and ink-2 600 text. Both are pills at 0.82rem.
- **Use:** tax regimes on the hero card, "Também fazemos" extras. Not interactive.

### Cards / Containers
- **Corner Style:** 20px (standard), 16px for small floating cards.
- **Background:** white on mint or white grounds; forest for the featured variant.
- **Shadow Strategy:** border or resting shadow at rest, floating lift for featured or hovered cards (see Elevation & Depth).
- **Border:** 1px hairline when not shadowed; featured forest cards drop the border.
- **Internal Padding:** 1.5rem (info cards), 1.8rem (reviews), 2rem 1.8rem (plans).

### Inputs / Fields
- **Style:** 50px tall, mint fill, 1.5px hairline border, 12px radius, 1rem 500 text, bold 0.88rem label above.
- **Focus:** border turns brand green and the fill turns white; no glow.
- **Error:** border and a 0.82rem 600 message in the error red, cleared as soon as the user types. Success shows a brand-tint notice that states nothing was sent.
- **Newsletter (on forest):** a pill track of 8% white holding a transparent input and a lime button; focus draws a 2px lime ring around the track.

### Navigation
- **Style:** sticky white header (94% opacity, 10px blur, hairline bottom), 76px tall; logo left, links and a brand pill "Falar com um contador" right.
- **Links:** 0.95rem 600 ink-2; hover and current page turn ink and grow a 2px brand-green underline from the centre.
- **Mobile:** below 860px, a 44px rounded menu button whose two bars cross into an X; the menu drops as a full-width white panel with hairline-separated rows and the pill button last.
- **Above the header:** the night-bar portfolio strip and the forest utility bar (phone, e-mail, hours, lime icons).

### Service Photo Card (signature)
A white card with a hairline border and a photo on top (480:300). A 52px brand-green icon tile with a 4px white border straddles the photo's bottom edge. Title, one line of text, optional tick list, and a "Saiba mais" link pinned to the bottom. On hover the card rises 4px with the floating lift and a soft brand-green radial glow follows the cursor (SpotlightCard port).

### Floating Info Card (signature)
A small white card (16px radius, floating lift) with a 42px icon tile and a bold line over a caption. Two of them float over the hero photo's edges; one sits inside the process photo. The icon tile is brand-tint/brand, or forest/lime for the figure card.

### Numbers Band (signature)
A full-bleed forest band: intro and lime button left, a 2×2 grid of translucent tiles right (5% white fill, 10% white border, 20px radius), each with a large white figure, a forest-mist label and a lime icon in a lime-tinted 12px tile at the top-right. Figures count up once with an ease-out-expo curve over 1.4s; the final number is always in the HTML.

### Deadlines Panel (signature)
A white panel with resting lift: a header with the current month in a brand-tint badge, and a table of the month's obligations computed in the browser (weekend due dates move to the prior business day). Past rows are muted and struck through, the next one sits on a brand-tint row with a brand "Próximo" stamp, and a forest pill beside it states the next deadline in words with a lime calendar icon. Rows settle in sequence (90ms stagger) when the panel scrolls into view.

### Logo Loop (signature)
A mint strip of fictional client wordmarks, each with its own monochrome lettering and a simple geometric mark, scrolling in a 38s linear loop with soft faded edges; it pauses on hover and becomes a static centred grid (four columns, two on phones) under reduced motion.

### Testimonials, Plans, FAQ
Three fixed testimonial cards, never a carousel; the middle one is forest, lifted 12px with the floating shadow. Three plan cards; the featured one is forest with a lime price, lime ticks, a lime "Mais escolhido" tag and a lime button. FAQ items are bordered 16px cards in two columns with a round toggle that turns brand green and morphs + into − when open.

## Do's and Don'ts

### Do:
- **Do** put brand green on every primary action on light grounds and lime on every primary action on forest or brand-green grounds.
- **Do** use real photographs of people and work in the hero, service cards, process block, page heads, team and CTA, clipped to the container radius.
- **Do** alternate white and mint section grounds and reserve forest bands for numbers, featured items and the footer.
- **Do** set every heading in Manrope 800 with negative tracking, and every comparable number with tabular lining numerals.
- **Do** keep shadows neutral black at 7 to 12% alpha and pointing down; use a hairline border instead when a card sits flat.
- **Do** give every motion (loop, count-up, row sequence, hover lift) a reduced-motion fallback that shows the final state.
- **Do** label fictional figures, plans and forms as examples in a visible footnote or notice.

### Don't:
- **Don't** put lime on white or mint grounds, or use it for body text.
- **Don't** introduce a second accent hue (no stock blue, no orange) beyond the star rating and the WhatsApp button.
- **Don't** use hard offset shadows, coloured glows, or shadow and border together on the same resting card.
- **Don't** use square corners on cards, media or buttons; the smallest radius is 12px except focus rings and logo micro-marks.
- **Don't** turn testimonials into a carousel; show them as fixed cards.
- **Don't** use empty icon tiles as a substitute for imagery in service cards.
