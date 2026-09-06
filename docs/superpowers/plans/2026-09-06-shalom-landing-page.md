# Shalom Financial & Accounting Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-page static marketing site for Shalom Financial & Accounting that captures leads via a free-diagnostic form and direct WhatsApp links.

**Architecture:** One static `index.html` with all sections, one `css/style.css`, one `js/main.js` handling nav toggle, smooth scroll, the diagnostic modal/form, the FAQ accordion, and the floating FAQ chat widget. No backend, no build step, no framework.

**Tech Stack:** Plain HTML5, CSS3 (custom properties, flexbox/grid), vanilla JavaScript (ES6+, no libraries). Google Fonts (Playfair Display + Inter) as the only external dependency.

## Global Constraints

- WhatsApp number for every `wa.me` link/button: `18494836468` (E.164 without `+`), per spec `docs/superpowers/specs/2026-09-06-shalom-landing-page-design.md`.
- Do not display the two other phone numbers from the original flyer — they are being replaced.
- No backend, no database, no build tooling, no npm dependencies for the site itself.
- Mobile-first responsive design.
- FAQ chat widget uses a fixed button menu only — no free-text/keyword matching.
- Testimonials section must use clearly, visibly marked placeholder content (not just an HTML comment) since no real testimonials exist yet.
- Language: Spanish (República Dominicana).
- Testing approach is manual browser verification (per spec), not automated unit/e2e tests — this is a static marketing page with no business logic worth unit testing. Do not treat the absence of a test framework/suite as a spec gap; each task's own "manually verify in a browser" step is its required verification.
- Footer social links intentionally use `href="#"` placeholders (flagged inline for the stakeholder to fill in with real URLs later) since no real social media URLs were provided — this is expected, not a bug, but is fine to note as a minor/deferred item.

---

### Task 1: Project scaffold, base styles, header, hero

**Files:**
- Create: `images/logo.png` (copied from `../Logo de Shalom Financial.png`)
- Create: `images/julissa.jpg` (copied from `../WhatsApp Image 2026-09-06 at 4.38.42 PM.jpeg`)
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/main.js`

**Interfaces:**
- Produces CSS custom properties later tasks rely on: `--color-navy`, `--color-navy-dark`, `--color-gold`, `--color-gold-light`, `--color-white`, `--color-offwhite`, `--color-text`, `--font-heading`, `--font-body`, `--header-height`.
- Produces `.container`, `.btn`, `.btn-primary`, `.btn-whatsapp`, `.btn-whatsapp-outline`, `.text-gold` utility classes.
- Produces global rule `section[id] { scroll-margin-top: var(--header-height); }` so anchor nav works once later sections exist.
- Produces `js/main.js` globals: `WHATSAPP_NUMBER` (string constant) and `openWhatsApp(message)` (opens a `wa.me` link in a new tab) — every later task that sends a WhatsApp message calls this function.
- Produces section ids in the DOM already present after this task: `#inicio`.
- Leaves HTML comments marking insertion points for Tasks 2–7 inside `<main>`.

- [ ] **Step 1: Copy image assets into the project**

```bash
mkdir -p images
cp "../Logo de Shalom Financial.png" images/logo.png
cp "../WhatsApp Image 2026-09-06 at 4.38.42 PM.jpeg" images/julissa.jpg
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shalom Financial & Accounting | Contabilidad y Finanzas en República Dominicana</title>
<meta name="description" content="Contabilidad, impuestos, nómina y asesoría financiera para tu negocio en República Dominicana. Solicita tu diagnóstico contable gratis.">
<link rel="icon" href="images/logo.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
</head>
<body>
<header class="site-header" id="inicio">
  <div class="container header-inner">
    <a href="#inicio" class="logo-link">
      <img src="images/logo.png" alt="Shalom Financial & Accounting" class="logo-img">
    </a>
    <nav class="main-nav" id="main-nav">
      <a href="#servicios">Servicios</a>
      <a href="#sobre-julissa">Sobre Julissa</a>
      <a href="#testimonios">Testimonios</a>
      <a href="#faq">FAQ</a>
      <a href="#contacto">Contacto</a>
    </nav>
    <button class="btn btn-whatsapp" id="header-whatsapp-btn" type="button">Escríbenos por WhatsApp</button>
    <button class="nav-toggle" id="nav-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main>
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <h1>Números que organizan, decisiones que <span class="text-gold">hacen crecer</span> tu negocio.</h1>
        <p class="hero-subtitle">Contabilidad, impuestos, nómina y asesoría financiera para tu negocio en República Dominicana — atención presencial y virtual.</p>
        <div class="hero-actions">
          <button class="btn btn-primary" id="hero-diagnostic-btn" type="button">Quiero mi diagnóstico gratis</button>
          <button class="btn btn-whatsapp-outline" id="hero-whatsapp-btn" type="button">Escríbenos por WhatsApp</button>
        </div>
      </div>
      <div class="hero-media">
        <img src="images/julissa.jpg" alt="Julissa Fernández, Contadora y Fundadora de Shalom Financial & Accounting" class="hero-photo">
      </div>
    </div>
  </section>

  <!-- TASK2:SERVICIOS -->
  <!-- TASK3:SOBRE_JULISSA_DIAGNOSTICO_PORQUE -->
  <!-- TASK4:TESTIMONIOS_FAQ -->
  <!-- TASK6:DIAGNOSTIC_MODAL -->
  <!-- TASK7:CHAT_WIDGET -->
</main>

<!-- TASK5:FOOTER -->

<script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `css/style.css`**

```css
:root {
  --color-navy: #0A1A3C;
  --color-navy-dark: #071229;
  --color-gold: #C9A24B;
  --color-gold-light: #E8D5A3;
  --color-white: #FFFFFF;
  --color-offwhite: #F7F5F0;
  --color-text: #1C1C1C;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --header-height: 76px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

section[id] { scroll-margin-top: var(--header-height); }

body {
  font-family: var(--font-body);
  color: var(--color-text);
  line-height: 1.6;
  background: var(--color-white);
}

h1, h2, h3 { font-family: var(--font-heading); color: var(--color-navy); line-height: 1.2; }
h2 { font-size: 2rem; margin-bottom: 32px; text-align: center; }

.container { max-width: 1140px; margin: 0 auto; padding: 0 24px; }

.text-gold { color: var(--color-gold); }

.btn {
  display: inline-block;
  border: none;
  border-radius: 6px;
  padding: 14px 28px;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn:hover { transform: translateY(-2px); }

.btn-primary { background: var(--color-gold); color: var(--color-navy-dark); }
.btn-whatsapp { background: #25D366; color: #fff; }
.btn-whatsapp-outline { background: transparent; color: var(--color-navy); border: 2px solid #25D366; }

/* Header */
.site-header { position: sticky; top: 0; z-index: 100; background: var(--color-navy); height: var(--header-height); }
.header-inner { height: 100%; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.logo-img { height: 48px; width: auto; display: block; }
.main-nav { display: flex; gap: 24px; }
.main-nav a { color: var(--color-white); text-decoration: none; font-weight: 500; font-size: 0.95rem; }
.main-nav a:hover { color: var(--color-gold); }
.nav-toggle { display: none; background: none; border: none; cursor: pointer; padding: 8px; }
.nav-toggle span { display: block; width: 24px; height: 2px; background: var(--color-white); margin: 5px 0; }

@media (max-width: 860px) {
  .main-nav { display: none; }
  .header-inner > .btn-whatsapp { display: none; }
  .nav-toggle { display: block; }
  .main-nav.is-open {
    display: flex; flex-direction: column;
    position: absolute; top: var(--header-height); left: 0; right: 0;
    background: var(--color-navy); padding: 16px 24px; gap: 16px;
  }
}

/* Hero */
.hero { background: var(--color-offwhite); padding: 64px 0; }
.hero-inner { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; }
.hero h1 { font-size: 2.4rem; margin-bottom: 16px; }
.hero-subtitle { font-size: 1.1rem; margin-bottom: 28px; color: #444; }
.hero-actions { display: flex; flex-wrap: wrap; gap: 16px; }
.hero-photo { width: 100%; max-width: 380px; border-radius: 12px; box-shadow: 0 20px 40px rgba(10,26,60,0.2); display: block; margin: 0 auto; }

@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; text-align: center; }
  .hero-actions { justify-content: center; }
  .hero h1 { font-size: 1.8rem; }
}
```

- [ ] **Step 4: Create `js/main.js`**

```js
const WHATSAPP_NUMBER = "18494836468";

function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function initNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initWhatsAppButtons() {
  const defaultMessage = "Hola, me gustaría más información sobre los servicios de Shalom Financial & Accounting.";
  document.querySelectorAll("#header-whatsapp-btn, #hero-whatsapp-btn").forEach((btn) => {
    btn.addEventListener("click", () => openWhatsApp(defaultMessage));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
});
```

- [ ] **Step 5: Manually verify in a browser**

Open `index.html` directly in a browser (double-click or `start index.html` on Windows). Confirm:
- The navy header is sticky at the top with the Shalom logo visible.
- Nav links are visible on desktop width; resizing below ~860px collapses them behind the hamburger button, which toggles them open/closed.
- The hero shows the headline, subtitle, both buttons, and Julissa's photo.
- Clicking "Escríbenos por WhatsApp" (header or hero) opens a new tab to `https://wa.me/18494836468?text=...` with the default message.

- [ ] **Step 6: Commit**

```bash
git add images index.html css js
git commit -m "Scaffold landing page: base styles, header, hero"
```

---

### Task 2: Servicios section

**Files:**
- Modify: `index.html` (replace `<!-- TASK2:SERVICIOS -->` with the section markup)
- Modify: `css/style.css` (append services styles)

**Interfaces:**
- Consumes: `.container`, `.btn` and CSS variables from Task 1.
- Produces: section `#servicios` (nav link from Task 1 now resolves).

- [ ] **Step 1: Replace the `<!-- TASK2:SERVICIOS -->` marker in `index.html` with:**

```html
<section class="services" id="servicios">
  <div class="container">
    <h2>Nuestros servicios</h2>
    <div class="services-grid">
      <article class="service-card">
        <span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
        <h3>Contabilidad y Finanzas</h3>
        <ul>
          <li>Contabilidad por iguala</li>
          <li>Contabilidad general</li>
          <li>Organización y revisión contable</li>
          <li>Estados financieros</li>
        </ul>
      </article>
      <article class="service-card">
        <span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg></span>
        <h3>Servicios Tributarios</h3>
        <ul>
          <li>Declaraciones de impuestos</li>
          <li>ITBIS / ISR / ISF</li>
          <li>Asesoría tributaria</li>
          <li>Cumplimiento fiscal</li>
        </ul>
      </article>
      <article class="service-card">
        <span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
        <h3>Gestión Humana y Nómina</h3>
        <ul>
          <li>Nómina y pago de salarios</li>
          <li>TSS y SFS</li>
          <li>Reportes y formularios</li>
          <li>Asesoría laboral</li>
        </ul>
      </article>
      <article class="service-card">
        <span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
        <h3>Asesoría y Consultoría</h3>
        <ul>
          <li>Asesoría financiera</li>
          <li>Control interno</li>
          <li>Análisis y planificación financiera</li>
          <li>Consultoría administrativa</li>
        </ul>
      </article>
      <article class="service-card">
        <span class="service-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
        <h3>Organización Empresarial</h3>
        <ul>
          <li>Organización contable y documental</li>
          <li>Implementación de procesos</li>
          <li>Acompañamiento empresarial</li>
        </ul>
      </article>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* Services */
.services { padding: 72px 0; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card { background: var(--color-offwhite); border-radius: 12px; padding: 28px; }
.service-icon { display: inline-flex; width: 48px; height: 48px; border-radius: 50%; background: var(--color-navy); color: var(--color-gold); align-items: center; justify-content: center; margin-bottom: 16px; }
.service-icon svg { width: 24px; height: 24px; }
.service-card h3 { font-size: 1.15rem; margin-bottom: 12px; }
.service-card ul { list-style: none; color: #444; font-size: 0.92rem; }
.service-card li { padding-left: 18px; position: relative; margin-bottom: 6px; }
.service-card li::before { content: "•"; color: var(--color-gold); position: absolute; left: 0; font-weight: 700; }

@media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .services-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Manually verify in a browser**

Reload `index.html`. Confirm the "Servicios" nav link scrolls to a grid of 5 cards, each with an icon, title, and bullet list; grid collapses to 2 then 1 column as the window narrows.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Add servicios section"
```

---

### Task 3: Sobre Julissa, Diagnóstico gratis banner, Por qué elegirnos

**Files:**
- Modify: `index.html` (replace `<!-- TASK3:SOBRE_JULISSA_DIAGNOSTICO_PORQUE -->`)
- Modify: `css/style.css` (append styles)

**Interfaces:**
- Produces: sections `#sobre-julissa`, `#diagnostico`, `#por-que-elegirnos`.
- Produces: button `#banner-diagnostic-btn` — Task 6 wires this (and `#hero-diagnostic-btn` from Task 1) to open the diagnostic modal. No click handler is attached in this task.

- [ ] **Step 1: Replace the `<!-- TASK3:SOBRE_JULISSA_DIAGNOSTICO_PORQUE -->` marker with:**

```html
<section class="about" id="sobre-julissa">
  <div class="container about-inner">
    <img src="images/julissa.jpg" alt="Julissa Fernández" class="about-photo">
    <div class="about-copy">
      <h2 style="text-align:left">Sobre Julissa</h2>
      <p>Julissa Fernández es contadora y fundadora de Shalom Financial & Accounting. Con años de experiencia acompañando negocios en República Dominicana, ayuda a sus clientes a poner en orden su contabilidad, cumplir con sus obligaciones fiscales y tomar decisiones financieras con confianza.</p>
      <p>Su enfoque es cercano y personalizado: cada negocio recibe atención directa y soluciones a la medida de su realidad, ya sea de forma presencial o virtual.</p>
    </div>
  </div>
</section>

<section class="diagnostic-banner" id="diagnostico">
  <div class="container diagnostic-inner">
    <h2 style="color:var(--color-white)">¿Tu contabilidad tiene áreas de mejora?</h2>
    <p>Julissa realiza un diagnóstico contable <strong>gratuito</strong> para identificar oportunidades de ahorro, cumplimiento y organización en tu negocio — sin costo ni compromiso.</p>
    <button class="btn btn-primary" id="banner-diagnostic-btn" type="button">Quiero mi diagnóstico gratis</button>
  </div>
</section>

<section class="why-us" id="por-que-elegirnos">
  <div class="container">
    <h2>¿Por qué elegirnos?</h2>
    <div class="why-us-grid">
      <div class="why-us-item"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>Atención personalizada</div>
      <div class="why-us-item"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>Confidencialidad</div>
      <div class="why-us-item"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>Experiencia y profesionalismo</div>
      <div class="why-us-item"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>Soluciones a la medida</div>
      <div class="why-us-item"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></span>Compromiso con tu crecimiento</div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* About */
.about { padding: 72px 0; }
.about-inner { display: grid; grid-template-columns: 320px 1fr; gap: 48px; align-items: center; }
.about-photo { width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(10,26,60,0.15); }
.about-copy p { color: #444; margin-bottom: 16px; }

@media (max-width: 860px) { .about-inner { grid-template-columns: 1fr; text-align: center; } }

/* Diagnostic banner */
.diagnostic-banner { background: var(--color-navy); color: var(--color-white); padding: 64px 0; text-align: center; }
.diagnostic-inner p { max-width: 640px; margin: 0 auto 28px; font-size: 1.05rem; opacity: 0.9; }

/* Why us */
.why-us { padding: 72px 0; background: var(--color-offwhite); }
.why-us-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.why-us-item { display: flex; align-items: center; gap: 12px; background: #fff; border-radius: 10px; padding: 18px 20px; font-weight: 600; color: var(--color-navy); }
.check-icon { display: inline-flex; width: 28px; height: 28px; border-radius: 50%; background: var(--color-gold); color: var(--color-navy-dark); align-items: center; justify-content: center; flex-shrink: 0; }
.check-icon svg { width: 16px; height: 16px; }

@media (max-width: 860px) { .why-us-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 3: Manually verify in a browser**

Reload. Confirm "Sobre Julissa" shows her photo and bio, the navy diagnostic banner shows the offer and a button (not yet clickable/functional — that's Task 6), and "Por qué elegirnos" shows 5 checkmarked items.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Add sobre-julissa, diagnostico banner, por-que-elegirnos sections"
```

---

### Task 4: Testimonios (placeholder) and FAQ accordion

**Files:**
- Modify: `index.html` (replace `<!-- TASK4:TESTIMONIOS_FAQ -->`)
- Modify: `css/style.css` (append styles)
- Modify: `js/main.js` (add `initFaqAccordion`)

**Interfaces:**
- Produces: sections `#testimonios`, `#faq`.
- Produces: `initFaqAccordion()` in `main.js`, called from the `DOMContentLoaded` listener.

- [ ] **Step 1: Replace the `<!-- TASK4:TESTIMONIOS_FAQ -->` marker with:**

```html
<section class="testimonials" id="testimonios">
  <div class="container">
    <h2>Testimonios</h2>
    <div class="testimonial-grid">
      <blockquote class="testimonial-card is-placeholder">
        <p>"Shalom organizó nuestra contabilidad desde el primer mes. Ahora tomamos decisiones con números claros."</p>
        <cite>Cliente de Contabilidad General</cite>
      </blockquote>
      <blockquote class="testimonial-card is-placeholder">
        <p>"El acompañamiento en nuestras declaraciones de impuestos nos quitó un enorme dolor de cabeza."</p>
        <cite>Cliente de Servicios Tributarios</cite>
      </blockquote>
      <blockquote class="testimonial-card is-placeholder">
        <p>"La asesoría financiera nos ayudó a planificar el crecimiento del negocio con mucha más confianza."</p>
        <cite>Cliente de Asesoría y Consultoría</cite>
      </blockquote>
    </div>
  </div>
</section>

<section class="faq" id="faq">
  <div class="container">
    <h2>Preguntas frecuentes</h2>
    <div class="faq-list" id="faq-list">
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="false"><span>¿Qué documentos necesito para empezar a trabajar con ustedes?</span><span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>Depende del servicio, pero generalmente pedimos el RNC de tu empresa, tus últimas declaraciones fiscales y estados financieros si ya cuentas con ellos. Te confirmamos el detalle exacto al conversar por WhatsApp.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="false"><span>¿Atienden fuera de Santo Domingo?</span><span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>Sí, ofrecemos atención presencial y virtual en toda República Dominicana.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="false"><span>¿Trabajan con negocios pequeños o profesionales independientes?</span><span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>Sí, trabajamos con negocios de todos los tamaños, incluyendo profesionales independientes y pequeñas empresas.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="false"><span>¿Cómo solicito el diagnóstico contable gratis?</span><span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>Hacé clic en cualquier botón "Quiero mi diagnóstico gratis" de esta página, completá tus datos y te contactamos por WhatsApp para coordinarlo.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-question" type="button" aria-expanded="false"><span>¿Cuánto cuesta una consulta inicial?</span><span class="faq-icon">+</span></button>
        <div class="faq-answer"><p>El diagnóstico contable inicial es completamente gratuito. Los costos de servicios continuos se cotizan según las necesidades específicas de tu negocio.</p></div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* Testimonials */
.testimonials { padding: 72px 0; background: var(--color-offwhite); }
.testimonial-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
.testimonial-card { position: relative; background: #fff; border-radius: 12px; padding: 28px; }
.testimonial-card p { color: #333; margin-bottom: 12px; font-style: italic; }
.testimonial-card cite { color: var(--color-navy); font-weight: 600; font-size: 0.9rem; font-style: normal; }
.testimonial-card.is-placeholder::after {
  content: "Contenido de ejemplo";
  position: absolute; top: 12px; right: 12px;
  background: var(--color-gold); color: var(--color-navy-dark);
  font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  padding: 4px 8px; border-radius: 4px;
}

@media (max-width: 900px) { .testimonial-grid { grid-template-columns: 1fr; } }

/* FAQ */
.faq { padding: 72px 0; }
.faq-item { border-bottom: 1px solid #e2e2e2; }
.faq-question { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 16px; background: none; border: none; text-align: left; font-size: 1.02rem; font-weight: 600; padding: 18px 0; cursor: pointer; color: var(--color-navy); font-family: var(--font-body); }
.faq-icon { flex-shrink: 0; color: var(--color-gold); font-size: 1.3rem; }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
.faq-item.is-open .faq-answer { max-height: 300px; }
.faq-answer p { padding-bottom: 18px; color: #444; }
```

- [ ] **Step 3: Add to `js/main.js`**

```js
function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });
}
```

Update the `DOMContentLoaded` listener at the bottom of `js/main.js` to also call it:

```js
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
});
```

- [ ] **Step 4: Manually verify in a browser**

Reload. Confirm 3 testimonial cards each show a small "Contenido de ejemplo" gold badge in the corner. In the FAQ section, clicking a question expands its answer and rotates/reveals it; clicking again collapses it.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "Add testimonios placeholder and FAQ accordion"
```

---

### Task 5: Footer / contact

**Files:**
- Modify: `index.html` (replace `<!-- TASK5:FOOTER -->`)
- Modify: `css/style.css` (append styles)
- Modify: `js/main.js` (add footer year script)

**Interfaces:**
- Produces: section `#contacto` (as a `<footer>`).

- [ ] **Step 1: Replace the `<!-- TASK5:FOOTER -->` marker (right after `</main>`, before the `<script>` tag) with:**

```html
<footer class="site-footer" id="contacto">
  <div class="container footer-inner">
    <div class="footer-brand">
      <img src="images/logo.png" alt="Shalom Financial & Accounting" class="footer-logo">
      <p>Números que organizan, decisiones que hacen crecer tu negocio.</p>
    </div>
    <div class="footer-contact">
      <h4>Contacto</h4>
      <p><a href="https://wa.me/18494836468" target="_blank" rel="noopener">WhatsApp: +1 849-483-6468</a></p>
      <p><a href="mailto:financialshalom51@gmail.com">financialshalom51@gmail.com</a></p>
      <p>República Dominicana — Atención presencial y virtual</p>
    </div>
    <div class="footer-social">
      <h4>Síguenos</h4>
      <!-- Reemplazar "#" por las URLs reales de las redes sociales de Shalom -->
      <div class="social-links">
        <a href="#">Facebook</a>
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
      </div>
    </div>
  </div>
  <p class="footer-bottom">© <span id="footer-year"></span> Shalom Financial & Accounting. Todos los derechos reservados.</p>
</footer>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* Footer */
.site-footer { background: var(--color-navy-dark); color: var(--color-white); padding: 56px 0 24px; }
.footer-inner { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 32px; margin-bottom: 32px; }
.footer-logo { height: 40px; margin-bottom: 12px; }
.footer-brand p { color: #b9c2d6; font-size: 0.9rem; }
.footer-contact h4, .footer-social h4 { color: var(--color-gold); font-family: var(--font-body); font-size: 0.95rem; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
.footer-contact p { margin-bottom: 8px; font-size: 0.9rem; }
.footer-contact a, .social-links a { color: #d7dcea; text-decoration: none; }
.footer-contact a:hover, .social-links a:hover { color: var(--color-gold); }
.social-links { display: flex; flex-direction: column; gap: 8px; }
.footer-bottom { text-align: center; font-size: 0.8rem; color: #8b93a8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }

@media (max-width: 700px) { .footer-inner { grid-template-columns: 1fr; text-align: center; } .social-links { align-items: center; } }
```

- [ ] **Step 3: Add to `js/main.js`**

```js
function initFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = new Date().getFullYear();
}
```

Update `DOMContentLoaded`:

```js
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
});
```

- [ ] **Step 4: Manually verify in a browser**

Reload. Confirm the footer shows the logo, tagline, WhatsApp/email/location, social placeholder links, and the current year in the copyright line. Clicking "Contacto" in the nav scrolls here.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "Add footer/contact section"
```

---

### Task 6: Diagnostic modal and form → WhatsApp

**Files:**
- Modify: `index.html` (replace `<!-- TASK6:DIAGNOSTIC_MODAL -->`)
- Modify: `css/style.css` (append styles)
- Modify: `js/main.js` (add modal + form logic)

**Interfaces:**
- Consumes: `openWhatsApp(message)` from Task 1; buttons `#hero-diagnostic-btn` (Task 1) and `#banner-diagnostic-btn` (Task 3), previously inert.
- Produces: `openDiagnosticModal()`, `closeDiagnosticModal()`, `initDiagnosticModal()` in `main.js`.

- [ ] **Step 1: Replace the `<!-- TASK6:DIAGNOSTIC_MODAL -->` marker (inside `<main>`, after the other sections) with:**

```html
<div class="modal-overlay" id="diagnostic-modal">
  <div class="modal-box">
    <button class="modal-close" id="diagnostic-modal-close" type="button" aria-label="Cerrar">&times;</button>
    <h3>Solicita tu diagnóstico contable gratis</h3>
    <p>Cuéntanos un poco sobre tu negocio y te contactamos por WhatsApp para coordinar tu diagnóstico sin costo.</p>
    <form id="diagnostic-form">
      <label for="diag-name">Nombre completo</label>
      <input type="text" id="diag-name" name="name" required>
      <label for="diag-company">Empresa</label>
      <input type="text" id="diag-company" name="company" required>
      <label for="diag-phone">Teléfono</label>
      <input type="tel" id="diag-phone" name="phone" required>
      <button type="submit" class="btn btn-primary">Enviar y continuar por WhatsApp</button>
    </form>
  </div>
</div>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* Diagnostic modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(7,18,41,0.6); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; z-index: 200; padding: 24px; }
.modal-overlay.is-open { opacity: 1; pointer-events: auto; }
.modal-box { background: #fff; border-radius: 12px; padding: 32px; max-width: 420px; width: 100%; position: relative; }
.modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888; line-height: 1; }
.modal-box h3 { margin-bottom: 12px; }
.modal-box p { color: #555; margin-bottom: 20px; font-size: 0.95rem; }
#diagnostic-form label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem; color: var(--color-navy); }
#diagnostic-form input { width: 100%; padding: 10px 12px; margin-bottom: 16px; border: 1px solid #ccc; border-radius: 6px; font-family: var(--font-body); font-size: 1rem; }
#diagnostic-form .btn { width: 100%; }
body.modal-open { overflow: hidden; }
```

- [ ] **Step 3: Add to `js/main.js`**

```js
function openDiagnosticModal() {
  document.getElementById("diagnostic-modal").classList.add("is-open");
  document.body.classList.add("modal-open");
}

function closeDiagnosticModal() {
  document.getElementById("diagnostic-modal").classList.remove("is-open");
  document.body.classList.remove("modal-open");
}

function initDiagnosticModal() {
  document.querySelectorAll("#hero-diagnostic-btn, #banner-diagnostic-btn").forEach((btn) => {
    btn.addEventListener("click", openDiagnosticModal);
  });
  document.getElementById("diagnostic-modal-close").addEventListener("click", closeDiagnosticModal);
  document.getElementById("diagnostic-modal").addEventListener("click", (event) => {
    if (event.target.id === "diagnostic-modal") closeDiagnosticModal();
  });
  document.getElementById("diagnostic-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("diag-name").value.trim();
    const company = document.getElementById("diag-company").value.trim();
    const phone = document.getElementById("diag-phone").value.trim();
    const message = `Hola, soy ${name} de ${company} (tel: ${phone}). Quiero solicitar mi diagnóstico contable gratis.`;
    openWhatsApp(message);
    closeDiagnosticModal();
    event.target.reset();
  });
}
```

Update `DOMContentLoaded`:

```js
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
  initDiagnosticModal();
});
```

- [ ] **Step 4: Manually verify in a browser**

Reload. Click "Quiero mi diagnóstico gratis" in the hero — the modal opens. Click the backdrop or the × — it closes. Reopen, fill in Nombre/Empresa/Teléfono, submit — confirm a new tab opens to `https://wa.me/18494836468?text=...` containing the name, company, and phone in the message, and that the modal closes and the form resets. Repeat by opening the modal via the diagnostic banner's button.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "Add diagnostic modal with WhatsApp handoff"
```

---

### Task 7: Floating FAQ chat widget

**Files:**
- Modify: `index.html` (replace `<!-- TASK7:CHAT_WIDGET -->`)
- Modify: `css/style.css` (append styles)
- Modify: `js/main.js` (add chat widget logic)

**Interfaces:**
- Consumes: `openWhatsApp(message)` from Task 1.
- Produces: `CHAT_FAQS` array, `renderChatMenu()`, `showChatAnswer(index)`, `initChatWidget()` in `main.js`.

- [ ] **Step 1: Replace the `<!-- TASK7:CHAT_WIDGET -->` marker (inside `<main>`, last section) with:**

```html
<div class="chat-widget" id="chat-widget">
  <button class="chat-toggle" id="chat-toggle" type="button" aria-label="Abrir chat de preguntas frecuentes">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  </button>
  <div class="chat-panel" id="chat-panel">
    <div class="chat-header">
      <span>Asistente Shalom</span>
      <button id="chat-close" type="button" aria-label="Cerrar chat">&times;</button>
    </div>
    <div class="chat-body" id="chat-body"></div>
  </div>
</div>
```

- [ ] **Step 2: Append to `css/style.css`**

```css
/* Chat widget */
.chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 300; }
.chat-toggle { width: 60px; height: 60px; border-radius: 50%; background: var(--color-navy); border: none; cursor: pointer; box-shadow: 0 8px 24px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; }
.chat-toggle svg { width: 28px; height: 28px; stroke: var(--color-gold); }
.chat-panel { position: absolute; bottom: 76px; right: 0; width: 320px; max-height: 420px; background: #fff; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.25); display: none; flex-direction: column; overflow: hidden; }
.chat-panel.is-open { display: flex; }
.chat-header { background: var(--color-navy); color: #fff; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; }
.chat-header button { background: none; border: none; color: #fff; font-size: 1.3rem; cursor: pointer; line-height: 1; }
.chat-body { padding: 16px; overflow-y: auto; flex: 1; }
.chat-message { padding: 10px 12px; border-radius: 8px; margin-bottom: 10px; font-size: 0.9rem; }
.chat-message-bot { background: var(--color-offwhite); color: var(--color-text); }
.chat-message-user { background: var(--color-navy); color: #fff; margin-left: 20%; }
.chat-options { display: flex; flex-direction: column; gap: 8px; }
.chat-option { text-align: left; background: #fff; border: 1px solid var(--color-gold); color: var(--color-navy); border-radius: 8px; padding: 10px 12px; font-size: 0.88rem; cursor: pointer; font-family: var(--font-body); }
.chat-option:hover { background: var(--color-gold-light); }
.chat-handoff { display: block; width: 100%; margin-top: 12px; text-align: center; }
.chat-back { display: block; margin-top: 10px; background: none; border: none; color: var(--color-navy); text-decoration: underline; cursor: pointer; font-size: 0.85rem; }

@media (max-width: 480px) { .chat-panel { width: calc(100vw - 32px); right: -8px; } }
```

- [ ] **Step 3: Add to `js/main.js`**

```js
const CHAT_FAQS = [
  { question: "¿Qué servicios ofrecen?", answer: "Ofrecemos contabilidad y finanzas, servicios tributarios, gestión de nómina, asesoría financiera y organización empresarial. Puedes ver el detalle completo en la sección Servicios de esta página." },
  { question: "¿Atienden fuera de Santo Domingo?", answer: "Sí, ofrecemos atención presencial y virtual en toda República Dominicana." },
  { question: "¿Cómo pido el diagnóstico gratis?", answer: "Hacé clic en cualquier botón \"Quiero mi diagnóstico gratis\" de la página, completá tus datos y te contactamos por WhatsApp para coordinarlo." },
  { question: "¿Trabajan con empresas pequeñas o independientes?", answer: "Sí, trabajamos con negocios de todos los tamaños, incluyendo profesionales independientes y pequeñas empresas." },
  { question: "¿Cómo los contacto directamente?", answer: "Podés escribirnos por WhatsApp en cualquier momento usando el botón de esta ventana o los que aparecen en toda la página." }
];

function renderChatMenu() {
  const body = document.getElementById("chat-body");
  const optionsHtml = CHAT_FAQS.map((faq, index) => `<button class="chat-option" data-index="${index}">${faq.question}</button>`).join("");
  body.innerHTML = `
    <div class="chat-message chat-message-bot">Hola, soy el asistente virtual de Shalom. ¿En qué puedo ayudarte?</div>
    <div class="chat-options">${optionsHtml}</div>
  `;
  body.querySelectorAll(".chat-option").forEach((btn) => {
    btn.addEventListener("click", () => showChatAnswer(Number(btn.dataset.index)));
  });
}

function showChatAnswer(index) {
  const faq = CHAT_FAQS[index];
  const body = document.getElementById("chat-body");
  body.innerHTML = `
    <div class="chat-message chat-message-user">${faq.question}</div>
    <div class="chat-message chat-message-bot">${faq.answer}</div>
    <button class="btn btn-whatsapp chat-handoff" id="chat-handoff-btn" type="button">Continuar por WhatsApp</button>
    <button class="chat-back" id="chat-back-btn" type="button">&larr; Ver otras preguntas</button>
  `;
  document.getElementById("chat-handoff-btn").addEventListener("click", () => {
    openWhatsApp(`Hola, tengo una pregunta sobre: "${faq.question}"`);
  });
  document.getElementById("chat-back-btn").addEventListener("click", renderChatMenu);
}

function initChatWidget() {
  const toggle = document.getElementById("chat-toggle");
  const panel = document.getElementById("chat-panel");
  const closeBtn = document.getElementById("chat-close");
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
    if (panel.classList.contains("is-open")) renderChatMenu();
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("is-open"));
}
```

Update `DOMContentLoaded`:

```js
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
  initDiagnosticModal();
  initChatWidget();
});
```

- [ ] **Step 4: Manually verify in a browser**

Reload. Click the floating chat bubble bottom-right — a panel opens showing a greeting and 5 question buttons. Click one — it shows the question, the canned answer, a "Continuar por WhatsApp" button, and a "Ver otras preguntas" link. Click the handoff button — confirm a new tab opens to `wa.me` with the question referenced in the message. Click "Ver otras preguntas" — confirm it returns to the menu. Click the × — confirm the panel closes.

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/main.js
git commit -m "Add floating FAQ chat widget"
```

---

### Task 8: Responsive polish and full manual QA pass

**Files:**
- Modify: `css/style.css` (fix any issues found)
- Modify: `index.html` (fix any issues found)

**Interfaces:** None (polish/bugfix task; no new interfaces).

- [ ] **Step 1: Resize the browser window (or use device toolbar) to test at ~375px (mobile), ~768px (tablet), and ~1280px (desktop) widths**

Check at each width:
- Header: logo + hamburger fit without overlap on mobile; nav collapses/expands correctly.
- Hero: stacks vertically on mobile, photo isn't cropped oddly, buttons don't overflow.
- Services/testimonials grids: 1 column on mobile, 2 on tablet, 3/5 on desktop as defined.
- Diagnostic banner and why-us section: text and button remain centered and readable.
- Modal: fits within the viewport on mobile with no horizontal scroll; inputs are usable.
- Chat panel: doesn't overflow the viewport edge on narrow screens (uses the `@media (max-width: 480px)` rule from Task 7).
- Footer: columns stack on mobile and stay centered.

- [ ] **Step 2: Fix any overflow, spacing, or alignment issues found**

Apply targeted CSS fixes directly in `css/style.css` near the relevant existing rules (e.g., adjust a `@media` breakpoint value, add `overflow-x: hidden` to `body` if any horizontal scroll is found, adjust `.hero-photo` `max-width` on very small screens). Document what was changed in the commit message.

- [ ] **Step 3: Run the full functional checklist end-to-end once more**

- Every nav link scrolls to the correct section without being hidden under the sticky header.
- Every WhatsApp-triggering control (header button, hero secondary button, diagnostic form, chat handoff) opens `https://wa.me/18494836468` with an appropriate pre-filled message.
- FAQ accordion opens/closes correctly for all 5 items.
- Testimonials are visibly marked as example content.
- No console errors in the browser dev tools on page load or after interacting with the modal, accordion, and chat widget.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css
git commit -m "Responsive polish and QA fixes"
```

---

### Task 9: Deploy to Netlify

**Files:** None created/modified (deployment step only).

**Interfaces:** None.

- [ ] **Step 1: Deploy via Netlify CLI**

```bash
npx netlify-cli deploy --dir=. --prod
```

- [ ] **Step 2: Handle authentication if prompted**

If the command prints a login URL because the machine isn't yet authenticated with Netlify, stop and hand the URL to the user to complete login in their own browser (this is their Netlify account — do not attempt to log in on their behalf). Once they confirm login is complete, re-run the Step 1 command.

- [ ] **Step 3: Confirm the deployment**

The CLI prints a live production URL on success. Open it in a browser and re-run the functional checklist from Task 8 Step 3 against the deployed URL (not just the local file) to confirm WhatsApp links, the modal, the accordion, and the chat widget all work identically in production.

- [ ] **Step 4: Share the URL**

Report the final production URL back to the user.
