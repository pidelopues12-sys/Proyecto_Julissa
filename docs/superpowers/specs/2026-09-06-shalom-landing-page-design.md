# Shalom Financial & Accounting — Landing Page Design

## Purpose

A single-page website to capture leads for Shalom Financial & Accounting
(Julissa Fernández, contadora/fundadora, República Dominicana). The primary
conversion goal is getting visitors to either request a free accounting
diagnostic or start a WhatsApp conversation.

## Source material

- `../WhatsApp Image 2026-08-26 at 7.48.18 PM.jpeg` — service flyer with
  contact info, service categories, "why choose us" points.
- `../Logo de Shalom Financial.png` — high-res logo (navy blue background,
  gold Star-of-David + mountain/growth-arrow emblem, serif wordmark).
- `../WhatsApp Image 2026-09-06 at 4.38.42 PM.jpeg` — professional photo of
  Julissa Fernández for the hero and "About" sections.

## Business content (from flyer)

**Brand:** Shalom Financial & Accounting
**Tagline:** "Números que organizan, decisiones que hacen crecer tu negocio."
**Contact:** 829-468-2696 / 809-517-3032 / 809-384-1700 (WhatsApp Business),
financialshalom51@gmail.com, República Dominicana (presencial y virtual).
The flyer's numbers are being updated and are not final, so the page will
display only the confirmed, current contact info: WhatsApp
**+1 849-483-6468** (used for every `wa.me` link/button and shown as the
displayed contact number) plus the email and location. The other two flyer
numbers are omitted from the page since the stakeholder flagged them as
being replaced.

**Services (6 categories, each with sub-items):**
1. Contabilidad y Finanzas — Contabilidad por iguala, Contabilidad general,
   Organización y revisión contable, Estados financieros
2. Servicios Tributarios — Declaraciones de impuestos, ITBIS/ISR/ISF,
   Asesoría tributaria, Cumplimiento fiscal
3. Gestión Humana y Nómina — Nómina y pago de salarios, TSS y SFS, Reportes
   y formularios, Asesoría laboral
4. Asesoría y Consultoría — Asesoría financiera, Control interno, Análisis
   y planificación financiera, Consultoría administrativa
5. Organización Empresarial — Organización contable y documental,
   Implementación de procesos, Acompañamiento empresarial

**Why choose us:** Atención personalizada, Confidencialidad, Experiencia y
profesionalismo, Soluciones a la medida, Compromiso con tu crecimiento.

**Values:** Orden, Confianza, Compromiso, Crecimiento.

## New content (from stakeholder, not on the flyer)

- **Free diagnostic offer:** Julissa performs a free accounting diagnostic
  for businesses to identify possible improvements. This is the primary
  call-to-action across the page ("Quiero mi diagnóstico gratis").
- **About Julissa section:** short bio paragraph with her photo.
- **Testimonials:** none available yet — ship as clearly-labeled
  placeholder content, easy to swap later.
- **FAQ:** common questions about the accounting/tax services.
- **On-page FAQ chat widget:** a floating chat bubble that answers common
  questions via a guided button menu (not free-text/keyword matching, to
  avoid the bot giving a wrong or off-topic answer for a financial brand),
  ending in a "Continuar por WhatsApp" handoff button.

## Out of scope

- A real automated responder on the actual WhatsApp Business number (would
  require WhatsApp Business API, a paid provider like Twilio/Wati/360dialog,
  Meta business verification, and a backend — a separate project). The
  in-page chat widget replaces this for now.
- Any backend/server, database, or CMS. This is a static site.
- Real testimonials (not yet available).

## Page structure (single scrolling page)

1. **Header (sticky)** — logo, nav links (Servicios, Sobre Julissa,
   Testimonios, FAQ, Contacto), persistent "WhatsApp" button.
2. **Hero** — Julissa's photo, tagline headline, primary CTA ("Quiero mi
   diagnóstico gratis" → opens diagnostic form modal) and secondary CTA
   ("Escríbenos por WhatsApp" → wa.me link).
3. **Servicios** — 6 service category cards with icons and sub-item lists.
4. **Sobre Julissa** — photo + short bio.
5. **Diagnóstico gratis** — banner explaining the free-diagnostic offer,
   with the primary CTA repeated.
6. **Por qué elegirnos** — 5 checkmark points from the flyer.
7. **Testimonios** — 3 placeholder cards, visibly marked as example content
   (e.g. an HTML comment + a small on-page note) so they're easy to find
   and replace.
8. **FAQ** — accordion of common questions.
9. **Contacto / Footer** — phone numbers, email, location, social links.
10. **Floating chat widget** — bottom-right bubble, present on every
    scroll position.

## Lead-capture mechanics

**Diagnostic form modal:** Fields — Nombre, Empresa, Teléfono. On submit,
client-side JS builds a pre-filled message (e.g. "Hola, soy {nombre} de
{empresa}, quiero solicitar mi diagnóstico contable gratis") and navigates
to `https://wa.me/<number>?text=<url-encoded message>`. No server, no
stored data.

**Direct WhatsApp buttons:** Header button and hero secondary CTA link
straight to `wa.me` with a generic pre-filled greeting.

**Chat widget:** A small client-side state machine. Opening state shows a
list of FAQ buttons (e.g. "¿Qué servicios ofrecen?", "¿Atienden fuera de
Santo Domingo?", "¿Cómo pido el diagnóstico gratis?"). Clicking a button
appends the question + a canned answer to the chat transcript. Every answer
screen includes a "Continuar por WhatsApp" button that opens `wa.me` with
context carried into the message text.

## Visual style

- **Palette:** navy blue (sampled from logo background, ~#0A1A3C range) and
  gold (~#C9A24B range) as primary brand colors; white/off-white for
  content backgrounds and readability.
- **Typography:** a serif display font for headings (echoing the logo's
  wordmark) paired with a clean sans-serif for body text (Google Fonts,
  e.g. Playfair Display + Inter — final pick during implementation).
- **Layout:** mobile-first responsive; most traffic is expected to arrive
  from and convert on mobile via WhatsApp.

## File structure

```
claude-webkit/
  index.html
  css/style.css
  js/main.js        # chat widget state machine + form handling + nav interactions
  images/
    logo.png
    julissa.jpg
```

No build step, no dependencies. Deployed as static files.

## Deployment

Deploy to Netlify (or Vercel) as a static site immediately after the page
is built, so there's a public link to share right away.

## Testing approach

Manual verification in a browser (this is a static marketing page, not an
application with business logic worth unit testing):
- All nav links scroll to the right section.
- Diagnostic form validates required fields and produces a correct
  `wa.me` link with the expected message text.
- Header/hero/footer WhatsApp buttons open the correct number.
- Chat widget opens/closes, each FAQ button shows its answer, and the
  "Continuar por WhatsApp" handoff works.
- Responsive check at mobile, tablet, and desktop widths.
- Placeholder testimonials are visibly marked as example content.
