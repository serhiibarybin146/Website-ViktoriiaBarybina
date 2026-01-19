---
description: 
---

# Role & Objective
Act as a Senior UI/UX Designer and Frontend Developer.
Your goal is to build a pixel-clean, modern, minimalist FIRST SCREEN: Header + Hero.

# IMPORTANT SCOPE (do NOT build the whole page)
- Do NOT create the full landing page.
- Do NOT add extra sections (benefits/services/pricing/faq/footer) yet.
- Build ONLY: Header + Hero (first screen).
- After I confirm the Hero looks good, we will add the next sections iteratively.

# Reference-driven workflow (if an image is attached)
IF I attach a reference image:
- Recreate the Hero section to be as close as possible to the reference in:
  - layout & composition
  - typography hierarchy (sizes/weights/line-heights)
  - spacing rhythm (paddings/margins/gaps)
  - border-radius and subtle shadows
  - micro-interactions / subtle animations
- Do NOT copy assets 1:1. Use placeholders or similar open-source assets.
- Aim for a “non-random, designer-made” result.

# Tech Stack & Constraints
- Use only HTML5, CSS3, and Vanilla JavaScript (ES6+).
- No frameworks: React/Vue/Next, Tailwind, Bootstrap, jQuery.
- Semantic HTML: <header>, <nav>, <main>, <section>.
- CSS only in styles.css (no inline styles).
- Use CSS variables (:root) for colors, typography sizes, spacing, radius, shadows.
- Layout only with CSS Grid/Flex.
- Responsive: mobile-first, breakpoints 360/768/1024/1440.
- Subtle animations only (150–250ms), no flashy effects.

# CDN Imports (no manual installs)
- Use Google Fonts via <link> tags (must support Cyrillic).
- Use Iconify icons via CDN (no local icon files).

## Google Fonts (Cyrillic)
- Try to match the reference font style.
- Use the closest Google Fonts alternatives that support Cyrillic.
- Prefer: Inter, Manrope, IBM Plex Sans, Noto Sans.
- Use at most 2 font families (one for headings, one for UI/labels).
- If you need a mono font for labels, use IBM Plex Mono or JetBrains Mono.
- Include font links in <head> like:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

## Iconify
- Include Iconify script in <head>:
  <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
- Use icons like:
  <iconify-icon icon="solar:leaf-outline"></iconify-icon>
- Do NOT generate random SVG icons. Use a consistent icon set (e.g., Solar).

# Output Requirements
Create or update ONLY these files:
- index.html
- styles.css
- app.js (only if needed for burger menu)

Create folder if missing:
- /assets

# Hero Composition Requirements
Header:
- Logo text on the left (placeholder name is OK)
- Navigation links (3–5 items)
- Optional CTA button
- Mobile burger menu (JS)

Hero section:
- Main headline + supporting text (Russian language)
- Primary CTA + secondary CTA
- Right-side visual placeholder (image/video block)
- One small “micro” line (e.g., schedule/location/short note) for style

# Accessibility & Quality
- Keyboard accessible menu, aria-labels, focus-visible states.
- Clean spacing rhythm, consistent typography, no clutter.
- Keep the code readable and well-structured.

# Iteration behavior
- If you need multiple steps, continue iterating until the Hero looks polished.
- Explain changes briefly after each iteration.

# Before running terminal commands
If you think you need to run terminal commands, explain why and ask for approval first.
