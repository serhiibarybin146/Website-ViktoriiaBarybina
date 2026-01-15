---
description: 
---

# Structure & Architecture (Lock the foundation)
Your task: refactor the current codebase to a clean, scalable structure WITHOUT changing the visual design noticeably.

## 1) Semantic Layout (must)
- Use a strict page skeleton:
  - <header> for top navigation
  - <main> for page content
  - <footer> for bottom area
- Place the Hero as a separate section inside <main> (NOT inside <header>).
- Add clear block separators as comments in BOTH HTML and CSS, e.g.
  <!-- ===== HEADER ===== -->
  /* ===== HERO ===== */

## 2) Modularity & Expandability (must)
- Ensure each section is independent and easy to extend.
- Prepare future anchors (even if sections are not created yet):
  - #hero, #benefits, #services, #faq, #contact
- Navigation links must point to these anchors.

## 3) Container & Layout System (must)
- Use ONE shared `.container` class for header, sections, and footer.
- `.container` must:
  - have a sensible max-width (1120–1200px)
  - be centered (margin: 0 auto)
  - include safe side padding for mobile (e.g., 16–24px)
- Introduce base section spacing via a shared `.section` class:
  - consistent vertical padding using CSS variables

## 4) CSS Organization (must)
Refactor styles.css into this order (use section comments):
1) CSS variables (:root) — colors, spacing, radius, shadows, typography sizes
2) Base reset / base elements (box-sizing, body, img, a, buttons)
3) Layout utilities (.container, .section, .grid helpers if needed)
4) Components (header/nav/button/cards/hero)
5) States & accessibility (:focus-visible, reduced motion)

## 5) Typography & Rhythm (must)
- Keep typography consistent:
  - headings scale (h1/h2/h3)
  - readable line-heights
  - consistent spacing between text blocks
- Avoid random margins; use variables and a spacing scale.

## 6) Accessibility (must)
- Add `nav aria-label="Primary"`.
- Ensure keyboard navigation works:
  - visible focus states (:focus-visible)
  - burger button has aria-expanded and aria-controls
- Add a basic “skip to content” link at the top (optional but preferred).

## 7) JavaScript cleanup (only if needed)
- Keep JS minimal and organized:
  - menu toggle
  - FAQ accordion (if already present)
- No new libraries.

## 8) Output
- Update ONLY these files:
  - index.html
  - styles.css
  - app.js (only if needed)
- After changes, provide a short summary of what you refactored and why.
