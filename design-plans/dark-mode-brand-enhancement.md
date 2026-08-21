# Obsidian Core Dark Mode & Brand Kit System Alignment

Written against: ded168e

## Evidence chain

- Surface: `index.html`, `css/style.css`, `js/main.js`
- Problem: The landing page is currently styled on a light-mode palette (`#FDFBF7`), conflicting with the user's requested switch to dark mode (`#050608`) and the Master Brand Kit's flagship dark identity system (`#050608`, `#0D1015`, `#D4AF37`, `#E2E8F0`).
- Design evidence: `branding/diamora-design-brand-kit.html` (lines 12–25, 155–218, 464–495), `branding/diamora-loader-animation.html` (lines 12–22, 45–116)
- Owner: `css/style.css`, `index.html`, `js/main.js`
- Scope and affected surfaces: Preloader, Pre-Footer VIP card, 4-Column Footer, Contact Cards, Trust Marks strip, Bottom Legal bar, and WhatsApp button.
- Uncertainty: none

## Design decision

Migrate the landing page theme to Obsidian Core (`#050608`) with architectural radial emerald-and-gold ambient backdrops (`rgba(212, 175, 55, 0.05)` and `rgba(5, 26, 15, 0.3)`), dark luxury elevated cards (`#0D1015` with `rgba(212, 175, 55, 0.15)` borders), high-contrast typography (`#E2E8F0` headings, `#8E9BAE` secondary), and the exact gold-gradient vector SVG lockups from the Brand Design Kit.

## Reuse

- Palette tokens from `branding/diamora-design-brand-kit.html`:
  - `--bg-dark: #050608;` (Obsidian Core)
  - `--bg-card: #0D1015;` / `--bg-card-hover: #13171F;`
  - `--gold-primary: #D4AF37;` / `--gold-light: #FBE6A2;` / `--gold-dark: #8C6A18;`
  - `--gold-gradient: linear-gradient(135deg, #FFF0BE 0%, #D4AF37 50%, #765811 100%);`
  - `--emerald-deep: #051A0F;`
  - `--text-main: #E2E8F0;`
  - `--text-muted: #8E9BAE;`
- Exemplar: `branding/diamora-design-brand-kit.html`

## Changes

1. `css/style.css`
   - Change: Replace light tokens with Obsidian Core tokens (`#050608`), dark card surfaces (`#0D1015`), gold border glows, dark preloader styles, and hover elevation (`transform: translateY(-8px)` with gold glow).
   - Preserve: Responsive breakpoints, GSAP timing hooks, and layout hierarchy.
   - Verify: Body background is `#050608`, cards are `#0D1015`, text is `#E2E8F0` and `#8E9BAE`.

2. `index.html`
   - Change: Update footer logo SVG fill from dark text to gold gradient (`url(#f-gold1)`) and white contrast, dark preloader styles, dark contact cards.
   - Preserve: Contact data (Email, Landline, WhatsApp, P.O. Box, Social handles).
   - Verify: Header and footer SVGs render with crisp gold gradient and high contrast on `#050608`.

3. `js/main.js`
   - Change: Maintain GSAP preloader sequence and ScrollTrigger reveals with dark mode smooth transitions.
   - Preserve: Back-to-top handler and newsletter state transition.
   - Verify: Preloader transitions seamlessly without flash of unstyled content.

## Scope

- Inherit: All landing page sections, preloader, cards, footer, forms, and floating controls.
- Verify: Mobile (<768px), Tablet (768–1080px), and Desktop (>1080px) viewports.
- Exclude: Unrelated backend endpoints or third-party CRM scripts.

## Validation

- Product: Full visual presentation in Obsidian Core `#050608` with Imperial Gold accents and animated preloader.
- Interface: Verify contrast ratio on text (`#E2E8F0` on `#050608` yields 17.5:1, passing AAA).
- System: Confirm single token owner in `css/style.css` without duplicate inline colors.
- Repository: `curl -I http://localhost:8080/index.html` → HTTP 200 OK.

## Stop conditions

- Stop if token values diverge from `branding/diamora-design-brand-kit.html`.

## Design documentation

- After acceptance and validation: Record theme switch and token update in `.ui-craft/tokens.md` and `.ui-craft/brief.md`.
