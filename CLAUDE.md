# CLAUDE.md — Sidechain Security Site

This file is read automatically by Claude Code at the start of every session in this repo. Its purpose is to keep new sections and pages visually consistent with the existing site.

**If you're editing this site with Claude Code, you don't need to do anything — Claude will follow the rules below.** If you're a human reading this, the same rules apply when making manual edits.

---

## The golden rule

**Use the existing design tokens. Don't hardcode colors, fonts, spacing, or radii.**

Everything visual on this site is defined as a CSS variable in `:root` at the top of [styles.css](styles.css). When you add anything new, reach for those variables instead of typing raw values like `#00e5c8` or `2rem`. This is what keeps the site feeling like one site instead of a patchwork.

If you find yourself wanting a color or size that doesn't exist as a token, **stop and ask** — either there's an existing token that fits, or the new value belongs in `:root` so the rest of the site can use it too.

---

## Design tokens (use these — don't invent new ones)

### Colors

| Purpose | Token | Value |
|---|---|---|
| Page background | `--color-bg` | `#0a0d10` (near-black slate) |
| Alternate section background | `--color-bg-alt` | `#0e1217` |
| Raised surface | `--color-bg-surface` | `#141920` |
| Glass card background | `--color-bg-card` | `rgba(255,255,255,0.05)` |
| Card on hover | `--color-bg-card-hover` | `rgba(255,255,255,0.09)` |
| Accent (links, highlights) | `--color-accent` | `#4a7cff` (muted blue) |
| Accent glow | `--color-accent-glow` | translucent blue |
| **Primary CTA buttons** | `--color-cta` | `#00e5c8` (vibrant teal) |
| CTA hover | `--color-cta-hover` | `#00ccb3` |
| Primary text | `--color-text-primary` | `#ffffff` |
| Secondary text (descriptions) | `--color-text-secondary` | white at 70% |
| Tertiary text (footnotes, captions) | `--color-text-tertiary` | white at 50% |
| Borders | `--color-border` | white at 8% |
| Border on hover | `--color-border-hover` | white at 15% |

**Two-color rule of thumb:** the muted blue (`--color-accent`) is for *atmosphere* — gradients, glows, backgrounds. The vibrant teal (`--color-cta`) is for *action* — buttons, links you want clicked, anything where you're asking the user to do something. Don't swap them.

### Typography

```css
--font-display: 'Plus Jakarta Sans', ...   /* headings, hero text */
--font-body:    'Plus Jakarta Sans', ...   /* body copy (same family, different weights) */
--font-mono:    'Space Mono', ...          /* labels, eyebrows, button text, technical accents */
```

**Heading weight is light (300), not bold.** This is intentional — large headings use `font-weight: 300` with tight letter-spacing (`-0.03em`) to match the rest of the site. Don't make new headings bold unless they're tiny.

**Mono font is for short technical bursts** — section eyebrows ("ASSESSMENT" above a heading), button labels in the shimmer button, and stat labels. Don't set body copy in mono.

### Spacing

Use the spacing scale, not arbitrary rems:

```css
--space-xs:  0.5rem;    /* 8px  — tight gaps between related items */
--space-sm:  1rem;      /* 16px — paragraph spacing, small gaps */
--space-md:  1.5rem;    /* 24px — between heading and body */
--space-lg:  2.5rem;    /* 40px — between distinct elements */
--space-xl:  4rem;      /* 64px — between major content groups */
--space-2xl: 6rem;      /* 96px — section-to-section padding */
--space-3xl: 8rem;      /* 128px — hero-scale breathing room */
```

### Layout

- `--max-width: 1200px` — every section's content wrapper uses this.
- Radii: `--radius-sm: 4px` (chips, small elements), `--radius-md: 6px` (buttons), `--radius-lg: 10px` (cards).
- Easing: `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` — use this on every transition for a consistent feel.
- Durations: `--dur-fast: 0.2s` (hovers), `--dur-med: 0.45s` (reveals, larger transitions), `--dur-slow: 0.8s` (page-level effects).

---

## Section anatomy (copy this structure)

Every section on the site follows the same shell. Match it.

```html
<section class="<section-name>" id="<section-id>">
  <div class="container container-relative">

    <!-- Section header (almost always present) -->
    <div class="<section-name>-header reveal">
      <span class="section-label">EYEBROW LABEL</span>
      <h2 class="section-title">
        <span class="text-gradient">Section Title Here</span>
      </h2>
      <p class="section-subtitle">
        One- or two-sentence description that frames what this section is about.
      </p>
    </div>

    <!-- Section content -->
    <div class="<section-name>-content reveal reveal-delay-2">
      ...
    </div>

  </div>
</section>
```

**Required pieces:**
- `<section>` with a kebab-case class and an `id` (the id is what nav anchors link to).
- `.container.container-relative` wrapper — handles max-width and side padding.
- A header block with `.section-label` (eyebrow), `.section-title`, and usually `.section-subtitle`.
- The `<span class="text-gradient">` wraps the part of the title that should glow blue.
- `.reveal` class on elements that should fade-in on scroll. Add `.reveal-delay-1` through `.reveal-delay-4` to stagger groups of elements.

**Existing section IDs already in use:** `#hero`, `#why`, `#assess`, `#services`, `#data-security`, `#compliance`, `#pricing`, `#about`, `#testimonials`, `#contact`. Pick a new id that won't collide.

---

## Buttons (don't invent new button styles)

The site uses three button styles. Pick one — don't make a fourth.

| When to use | Class | Looks like |
|---|---|---|
| **Primary CTA** ("Schedule an Assessment", "Get Started") | `shimmer-btn` | Teal outline → solid teal on hover, mono font, uppercase letterspacing |
| **Secondary action inside a card** ("Learn More" inside pricing card) | `btn btn-primary` or `btn btn-secondary` | Filled or outlined slate button |
| **Inline arrow link** ("Read more →") | `btn-arrow` | Text + arrow, no chrome |

Primary CTA example:

```html
<a href="#contact" class="shimmer-btn">Schedule an Assessment</a>
```

That's it — no inline styles unless you're tweaking width for a specific layout.

---

## Animation conventions

The site uses **scroll-triggered fade-up reveals**, not flashy entrance animations. To make a new element animate in:

```html
<div class="<your-element> reveal">...</div>
```

To stagger multiple siblings:

```html
<div class="card reveal reveal-delay-1">...</div>
<div class="card reveal reveal-delay-2">...</div>
<div class="card reveal reveal-delay-3">...</div>
<div class="card reveal reveal-delay-4">...</div>
```

The reveal logic is wired up in [script.js](script.js) — you don't need to touch JS to use it.

**Don't add new animation libraries.** GSAP, ScrollTrigger, and Three.js are already loaded; React is loaded for the background visual layers. Adding more JS is almost never the right move.

---

## Adding a new section — checklist

Before merging a new section, check:

- [ ] Section uses the standard shell (`<section class>` + `.container.container-relative`).
- [ ] Section has a unique `id` for nav anchoring.
- [ ] Header uses `.section-label` + `.section-title` + `.section-subtitle`.
- [ ] All colors, fonts, spacing reference CSS variables — no hardcoded `#...`, `rgb(...)`, or pixel/rem values that should be tokens.
- [ ] Headings use `font-weight: 300` (light), not bold.
- [ ] CTAs use `.shimmer-btn` for primary action.
- [ ] Body text uses `--color-text-secondary`, not pure white, unless it's a heading.
- [ ] `.reveal` is on elements that should fade in.
- [ ] Section spacing top/bottom uses `--space-2xl` or larger (sections breathe).
- [ ] Mobile layout works at 480px and 768px (resize the browser to check).
- [ ] No new fonts, no new color values introduced without adding them to `:root`.

Then add a nav link if it's a top-level section: find the `<nav>` element near the top of [index.html](index.html) and add an `<a href="#your-id">Your Section</a>` matching the pattern of the others.

---

## Adding a new page

The site is currently single-page. If you add a new page (e.g., a blog post, a case study), follow this:

1. **Create a new HTML file** at the repo root (e.g., `blog/security-assessment-overview.html`).
2. **Copy the `<head>` from [index.html](index.html)** verbatim — same fonts, same favicon, same meta tags. Update the `<title>`, `og:title`, and `og:description` for the new page.
3. **Reference the same `styles.css`** with `<link href="../styles.css">` (adjust path depending on folder depth).
4. **Reuse the section shell** described above. New pages should look like they belong to the same site, not like microsites.
5. **Don't duplicate `script.js` if you don't need it** — for static content pages (blog posts), you can include just the parts you need (e.g., the reveal animation) or skip JS entirely.
6. **Update [index.html](index.html)** if the page should be linked from somewhere (nav, footer, a card on the home page).
7. **Update [README.md](README.md)** if the project structure changes meaningfully.

If you're adding a blog and expect more than one post, ask Claude Code to scaffold a `/blog/` folder, a post template, and an index page upfront — it's much easier to keep posts consistent if there's a template to copy.

---

## Things to avoid (these will break visual consistency)

- **Hardcoded colors anywhere.** Always use a token.
- **New fonts.** Plus Jakarta Sans and Space Mono are the only fonts. Don't add a third.
- **Bold large headings.** The site's voice is *light + spacious*. Bold headings make it feel like a different site.
- **Pure-white body copy.** Use `--color-text-secondary` for descriptions and paragraphs. Pure white is reserved for headings and emphasized stats.
- **Drop shadows on cards.** Cards use a subtle border (`--color-border`) and sometimes a glow on hover. Shadows look wrong here.
- **Solid bright backgrounds.** Backgrounds are dark slate. If you need contrast, use the `--color-bg-card` glass effect, not a colored fill.
- **New animation libraries.** Use what's already loaded.
- **Inline styles for things that have a class.** If you're writing `style="color: white; font-size: 2rem"`, there's a class for that — find it.
- **Skipping the `.reveal` class** on new content. It looks jarring when one section appears statically while the rest fade in.

---

## When to bring in a developer

Claude Code can confidently handle:

- Editing copy and content.
- Adding new sections following the patterns above.
- Adding new partner logos to the marquee.
- Adding new pages that reuse the existing styles.
- Tweaking colors/spacing if you decide to update the design tokens (a single change in `:root` cascades everywhere).
- Writing new blog posts.

Get a developer involved when:

- You want to change the **3D cyber-core animation** (the rotating geometry behind the hero) — lives in [three-core.js](three-core.js) and is genuinely complex.
- You want to change the **background visual layers** ([react-bg.js](react-bg.js), [react-beam.js](react-beam.js)) — these are React components rendered into specific containers and aren't typical web code.
- You're seeing **performance issues** on mobile — the lazy-load logic for Three.js is in [index.html](index.html) around line 1445 and tuning it requires care.
- You want to **integrate a CMS, contact form backend, or analytics** — these touch hosting and external services, not just the static files.
- The browser console is showing **errors** you don't understand — don't ship over them.

---

## Quick reference: where things live

| Want to change... | Edit... |
|---|---|
| Any text on the page | [index.html](index.html) — search for the visible text |
| Colors, spacing, typography | `:root` block at top of [styles.css](styles.css) |
| A specific section's styles | [styles.css](styles.css) — search for the section's class name |
| Page interactions / hover effects / scroll behavior | [script.js](script.js) |
| 3D cyber-core scene | [three-core.js](three-core.js) — careful, complex |
| Background visual / beam effects | [react-bg.js](react-bg.js), [react-beam.js](react-beam.js) — careful |
| Site nav links | `<nav>` near the top of [index.html](index.html) |
| Footer links / contact info | `<footer class="footer-sc">` near the bottom of [index.html](index.html) |
| Partner logos | [assets/logos/](assets/logos/) — and the logo `<img>` rows in [index.html](index.html) |
| Brand logo | [assets/sidechain-logo.png](assets/sidechain-logo.png) |
| SEO title/description | `<head>` of [index.html](index.html) |
