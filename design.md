# Comprehensive Design System & Architecture Specification
**Template Reference:** [RBP Imageworks Template](https://rbp-imageworks-template.vercel.app/)  
**Target Client:** Harshu Computers (Yeola, Maharashtra)  
**Document Target:** `design.md`  

---

## 1. Executive Design Philosophy & Aesthetic Vision

The target website design is inspired by the ultra-refined, award-winning **React Bits Pro / Linear-grade Dark Neumorphic Editorial Aesthetic**. It combines:
1. **Monochrome Mastery with Kinetic Accents:**
   - Deep obsidian background (`#0a0a0a` / `#000000`) paired with crisp milk white (`#fafafa` / `#ffffff`) typography.
   - Micro-spectrum animated borders and neon cyan/emerald status highlights (`#00bcfe`, `#00d294`).
2. **Kinetic 3D Curved Parallax Plane (Three.js WebGL):**
   - High-fidelity curved plane geometry with custom vertex deformation (`p.z += uBend * p.x * p.x`) and mouse-driven inertia tracking.
   - Smooth floating hardware/rig components that react to mouse position and scroll velocity.
3. **Editorial Typography Hierarchy:**
   - Expressive Editorial Serif headers (`Instrument Serif` / `Playfair Display`) juxtaposed with precision engineered geometric sans (`Geist` / `Inter`) and tabular technical mono fonts (`Geist Mono` / `JetBrains Mono`).
4. **Liquid Micro-Interactions & Glassmorphism:**
   - Pill-shaped floating navigation with frosted backdrop filter (`backdrop-blur-md`).
   - Spectrum drift linear gradients (`linear-gradient(90deg, #ff5c7a, #ffb340, #57e6a8, #4cc9ff, #8b7bff)`).
   - High tactile cards with subtle `1px` translucent borders (`rgba(255, 255, 255, 0.08)`).

---

## 2. Color Palette & Design Tokens

### 2.1 Core Dark & Light Mode Tokens
| Token Name | Light Value | Dark Value (Primary Mode) | Purpose |
|:---|:---|:---|:---|
| `--background` | `#ffffff` | `#0a0a0a` | Global canvas backdrop |
| `--foreground` | `#0a0a0a` | `#fafafa` | Primary text & high-contrast elements |
| `--muted` | `#f5f5f5` | `#171717` | Card surfaces & secondary containers |
| `--muted-foreground` | `#737373` | `#a3a3a3` | Body copy, secondary labels, metadata |
| `--border` | `#e5e5e5` | `#262626` | 1px clean architectural divider lines |
| `--border-subtle` | `rgba(0,0,0,0.06)`| `rgba(255,255,255,0.08)` | Frosted glass card border outlines |
| `--ring` | `#0066ff` | `#3b82f6` | Focus indicators & brand highlights |

### 2.2 Accent & Semantic Signals
- **Electric Cyan / Sky:** `#00bcfe` (Highlights, Tech badges, 3D glint)
- **Status Green / Open Indicator:** `#00d294` / `#058a07` (Pulsing "Open Now - Closes 9:00 PM" badge)
- **Spectrum Gradient Strip:** `linear-gradient(90deg, #ff5c7a, #ffb340, #ffe14d, #57e6a8, #4cc9ff, #8b7bff, #ff5cd3, #ff5c7a)`
- **Glass Shading:** `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`

---

## 3. Typography Hierarchy

| Style Role | Font Family | Weight | Size / Clamp | Line Height & Tracking |
|:---|:---|:---|:---|:---|
| **Editorial Hero Headline** | `Instrument Serif`, Georgia, serif | 400 (Regular) | `clamp(2.75rem, 5.6vw, 4.75rem)` | `leading-[1.02] tracking-[-0.03em]` |
| **Section Headings (H2)** | `Instrument Serif`, Georgia, serif | 400 (Regular) | `clamp(2rem, 4.2vw, 3.5rem)` | `leading-[1.05] tracking-[-0.02em]` |
| **Component Titles (H3)** | `Geist`, `Inter`, sans-serif | 600 (SemiBold)| `1.25rem - 1.5rem` | `leading-snug tracking-[-0.01em]` |
| **Body & Descriptions** | `Geist`, `Inter`, sans-serif | 400 (Regular) | `1rem` (16px) | `leading-relaxed text-muted-foreground` |
| **Technical Specs / Metrics** | `Geist Mono`, monospace | 500 (Medium) | `0.875rem` / `clamp(2.5rem, 5vw, 4rem)` | `tabular-nums tracking-wider uppercase` |
| **Floating Nav & Buttons** | `Geist`, `Inter`, sans-serif | 500 (Medium) | `0.875rem` (14px) | `leading-none tracking-normal` |

---

## 4. 3D WebGL & Kinetic Animation Mechanics

### 4.1 Three.js Curved Stage Shader Engine
The template's signature visual hook is a full-bleed WebGL canvas executing custom vertex curve displacement and anti-aliased fragment rounding:

- **Vertex Shader:**
  ```glsl
  uniform float uBend;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += uBend * p.x * p.x; // Cylindrical parabolic warp
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
  ```
- **Fragment Shader:**
  ```glsl
  precision highp float;
  uniform sampler2D uMap;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform float uOpacity;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uExposure;
  uniform float uLift;
  varying vec2 vUv;

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 half_ = vec2(uAspect, 1.0) * 0.5 - uRadius;
    vec2 q = abs(p) - half_;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float aa = fwidth(d);
    float mask = 1.0 - smoothstep(-aa, aa, d);
    vec4 c = texture2D(uMap, vUv * uRepeat + uOffset);
    vec3 rgb = clamp(c.rgb * uExposure + uLift, 0.0, 1.0);
    gl_FragColor = vec4(rgb, c.a * mask * uOpacity);
  }
  ```
- **Mouse Inertia Physics:**
  - Pointer position tracking with exponential damping:
    `targetX += (mouseX - targetX) * (1 - exp(-9 * dt))`
  - Dynamic camera drift and tilt on mouse move (`max angle ±12deg`).
- **Scroll Parallax (GSAP ScrollTrigger / Lenis):**
  - Section elements translate on the Y-axis at decoupled speeds (`0.2x`, `0.5x`, `1.2x`).
  - Stage cards rotate and fan out as the user scrolls past the Hero fold.

---

## 5. Site Architecture & Section Blueprint (Adapted for Harshu Computers)

Following the structure of `rbp-imageworks-template`, the website sections are mapped seamlessly to Harshu Computers' offerings:

### 1. Floating Island Header (`header`)
- **Left:** Geometric monogram logo `[HC]` + "Harshu Computers".
- **Center Floating Nav Capsule:** Glass pill with links (`Products`, `Services`, `PC Builder`, `Reviews`, `Contact`). Active item gets an illuminated dot indicator.
- **Right:** "Get in Touch" / "Call Now" CTA button with dark/light glow pill.

### 2. 3D Kinetic Hero Section (`#hero`)
- **Headline (Instrument Serif):** *"Precision Computing,<br> Built for What’s Next."*
- **Subheadline:** Premium laptops, custom gaming & workstation rigs, genuine parts, and expert hardware care in Yeola.
- **3D Canvas:** Interactive curved 3D plane displaying high-spec custom rigs, GPU, motherboard, and ultra-crisp hardware renders that respond to mouse physics.
- **Live Status Badge:** Pulsing green radar badge: `Open Now • Mon - Sun: 9:00 AM - 9:00 PM`.

### 3. The Hardware Showcase / Variant Grid (`#features`)
- **Headline:** *"From Budget Laptops to Beast Rigs."*
- **Interactive Carousel / 12-Card Grid:** 12 curated variations (Gaming, Creator Workstation, Office Desktop, Thin & Light Laptop, Student PC, Server Grade, etc.).
- **Card Styling:** Dark frosted cards with subtle image zoom on hover and technical chip badge (`RTX 4070 Ti`, `Intel Core i9 / Ryzen 9`, `DDR5 6000MHz`).

### 4. Real-World Benchmarks & Trust Metrics (`#benchmarks`)
- **Metric 1:** `5.0 ★` – 100% Satisfied Customer Rating.
- **Metric 2:** `30 Min` – Rapid turnaround diagnostics & repairs.
- **Metric 3:** `100%` – Genuine components with official warranty.
- **Timeline Comparison Bar:** Logarithmic scale comparison showing repair/assembly times vs typical local shops.

### 5. Services & Solutions Catalog (`#services`)
- **Modular Cards:**
  1. **Custom PC Crafting:** Precision wire routing, liquid cooling, tailored performance tuning.
  2. **Laptop & Desktop Sales:** Top brands (Dell, HP, Lenovo, ASUS, Acer).
  3. **Hardware Upgrades:** High-speed NVMe SSDs, RAM, Graphic Cards, Power Supplies.
  4. **Motherboard & Chip-Level Repair:** Thermal servicing, display replacement, virus removal, OS deployment.
  5. **Network & CCTV Infrastructure:** Routers, switches, office LAN wiring, surveillance.

### 6. Client Stories & Reviews (`#stories`)
- **Tabbed Testimonial Panel:** High-contrast editorial quote typography (`"Tomas Reyes style"`), with interactive tab switcher between Gamers, Engineers, Local Businesses, and Students.
- **Verified Badge:** Justdial verified review integration.

### 7. Transparent Service Packages (`#pricing`)
- **Tier 1 - Essential Tune-up:** Deep cleaning, thermal paste repaste, OS optimization, driver updates.
- **Tier 2 - Performance Upgrade:** SSD clone & migration, RAM addition, speed boost diagnostic.
- **Tier 3 - Custom Pro Build:** Full component sourcing, bench testing, cable management, 1-year local support.
- **Annual Maintenance (AMC):** For local schools, offices, and institutions in Yeola & Erandgaon.

### 8. Interactive Location & Contact Section (`#contact` & CTA Stage)
- **Visual:** Mirror 3D Three.js canvas framing the closing call-to-action.
- **Interactive Details:** Full address (*Near Samarth Mobile, Manmad Road, Erandgaon Jeur, Yeola*), Google Maps direct navigation button (Lat `20.046299`, Long `74.4825491`), One-click WhatsApp link, and Phone direct call.

### 9. FAQ Section (`#faq`)
- Smooth accordion FAQs answering warranty terms, turn-around times, custom orders, and repair policies.

---

## 6. Micro-Interactions, Sound & Motion Specifications

1. **Magnetic Buttons:**
   - Buttons slightly translate towards the cursor upon entering a 30px bounding radius.
2. **Dynamic Rainbow Spectrum Borders:**
   - `spectrum-drift` animation running infinitely on highlighted cards and badges.
3. **Card Tilt Physics:**
   - Subtle 3D perspective tilt on mouse enter (`transform: perspective(1000px) rotateX(...) rotateY(...) scale3d(1.02, 1.02, 1.02)`).
4. **Smooth Scroll Engine:**
   - Fluid scroll momentum with buttery deceleration (using modern CSS scroll behavior or lightweight Lenis).

---

## 7. Implementation Roadmap & Tech Stack

- **Framework:** Next.js (App Router) or Vite + Vanilla CSS / Tailwind tokens.
- **3D Graphics Engine:** Three.js (`r184`) with custom WebGL ShaderMaterial.
- **Animation Engine:** GSAP (ScrollTrigger) & CSS hardware-accelerated animations.
- **Assets:** High-resolution hardware assets and 3D device renders generated to match the exact photographic and 3D palette.
