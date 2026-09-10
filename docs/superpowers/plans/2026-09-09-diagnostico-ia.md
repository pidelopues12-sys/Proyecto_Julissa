# Diagnóstico contable con IA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un diagnóstico contable automatizado con IA a la landing de Shalom: el visitante completa un wizard, un backend serverless en Vercel llama al endpoint NVIDIA (gpt-oss-20b) y devuelve un diagnóstico personalizado que se muestra en pantalla, con entrega por WhatsApp y CTA de asesoría.

**Architecture:** Frontend vanilla JS (wizard dentro del modal existente) → `POST /api/diagnostico` (función serverless Node en Vercel) → SDK `openai` apuntado al endpoint OpenAI-compatible de NVIDIA. La lógica pura (validación + construcción del prompt + manejo del handler) vive en `lib/` para poder probarla con `node:test` sin red. La API key vive solo en variables de entorno del backend.

**Tech Stack:** Node.js (ESM), función serverless de Vercel, SDK `openai` (v4), `node:test` para pruebas, HTML/CSS/JS vanilla (sin bundler) en el frontend.

## Global Constraints

- Todos los textos de UI y del prompt en **español** (dominicano, cercano y profesional).
- La **API key** (`NVIDIA_API_KEY`) vive solo en el backend (env var); nunca en el frontend ni en git. `.env` ya está en `.gitignore`.
- Frontend: **vanilla JS**, scripts clásicos (sin frameworks ni bundler). `diagnostico.js` se carga después de `main.js` y reutiliza los globales `openWhatsApp` y `WHATSAPP_NUMBER`.
- Endpoint IA: NVIDIA OpenAI-compatible; modelo `openai/gpt-oss-20b`; configurable por env (`NVIDIA_BASE_URL`, `NVIDIA_MODEL`).
- Parámetros IA: `temperature: 0.5`, `max_tokens: 800`.
- Número WhatsApp destino: `18494836468`.
- El resultado SIEMPRE muestra el aviso: "Diagnóstico orientativo generado automáticamente. No sustituye la asesoría profesional de un contador."
- Si la IA falla, el usuario recibe un mensaje claro + salida por WhatsApp (el lead no se pierde).
- Commits frecuentes (uno por tarea como mínimo).

---

## File Structure

- Create: `package.json` — declara `type: module`, dependencia `openai`, script de test.
- Create: `lib/diagnostico-core.js` — lógica pura: `validateInput`, `buildMessages`.
- Create: `lib/diagnostico-core.test.js` — pruebas de la lógica pura.
- Create: `lib/diagnostico-handler.js` — `createHandler(client)` (factory testeable).
- Create: `lib/diagnostico-handler.test.js` — pruebas del handler con cliente falso.
- Create: `api/diagnostico.js` — endpoint serverless: construye el cliente real y exporta el handler.
- Create: `js/diagnostico.js` — wizard del frontend (pasos, validación, llamada al API, resultado, WhatsApp, CTA).
- Modify: `index.html` — modal convertido en contenedor del wizard + inclusión del script.
- Modify: `css/style.css` — estilos del wizard, carga, resultado, aviso y CTA.
- Modify: `js/main.js` — quita el manejador viejo del formulario de diagnóstico.
- Create: `README-deploy.md` — pasos de despliegue y variables de entorno en Vercel.

---

## Task 1: Backend — lógica pura (validación + prompt) con pruebas

**Files:**
- Create: `package.json`
- Create: `lib/diagnostico-core.js`
- Test: `lib/diagnostico-core.test.js`

**Interfaces:**
- Produces:
  - `validateInput(body) -> { ok: true } | { ok: false, error: string }`
  - `buildMessages(body) -> Array<{ role: "system"|"user", content: string }>`
  - Forma de `body`: `{ contacto: { nombre, empresa, whatsapp }, respuestas: { tipoNegocio, empleados, contabilidad, dgii, ncf, estados, preocupacion } }` (todos strings).

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "shalom-landing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=18" },
  "scripts": {
    "test": "node --test lib/diagnostico-core.test.js lib/diagnostico-handler.test.js"
  },
  "dependencies": {
    "openai": "^4.0.0"
  }
}
```

- [ ] **Step 2: Instalar dependencias**

Run: `npm install`
Expected: crea `node_modules/` y `package-lock.json` sin errores. (`node_modules/` ya está en `.gitignore`.)

- [ ] **Step 3: Escribir las pruebas (deben fallar)**

Create `lib/diagnostico-core.test.js`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInput, buildMessages } from "./diagnostico-core.js";

const validBody = {
  contacto: { nombre: "Ana", empresa: "Acme", whatsapp: "8090000000" },
  respuestas: {
    tipoNegocio: "SRL", empleados: "1–5", contabilidad: "No",
    dgii: "Con atrasos", ncf: "A veces", estados: "Solo anual",
    preocupacion: "Ordenar finanzas",
  },
};

test("validateInput acepta un cuerpo completo", () => {
  assert.deepEqual(validateInput(validBody), { ok: true });
});

test("validateInput rechaza contacto faltante", () => {
  const r = validateInput({ respuestas: validBody.respuestas });
  assert.equal(r.ok, false);
});

test("validateInput rechaza una respuesta faltante", () => {
  const respuestas = { ...validBody.respuestas };
  delete respuestas.dgii;
  const r = validateInput({ contacto: validBody.contacto, respuestas });
  assert.equal(r.ok, false);
});

test("validateInput rechaza valores demasiado largos", () => {
  const respuestas = { ...validBody.respuestas, tipoNegocio: "x".repeat(200) };
  const r = validateInput({ contacto: validBody.contacto, respuestas });
  assert.equal(r.ok, false);
});

test("buildMessages arma system + user con los datos", () => {
  const msgs = buildMessages(validBody);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].role, "system");
  assert.equal(msgs[1].role, "user");
  assert.match(msgs[1].content, /Acme/);
  assert.match(msgs[1].content, /Con atrasos/);
});
```

- [ ] **Step 4: Correr las pruebas (verificar que fallan)**

Run: `npm test`
Expected: FAIL — no existe `./diagnostico-core.js`.

- [ ] **Step 5: Implementar `lib/diagnostico-core.js`**

```javascript
// Lógica pura del diagnóstico: validación de entrada y construcción del prompt.
// Sin dependencias externas para poder testear con node:test.

const CAMPOS_RESPUESTA = [
  "tipoNegocio", "empleados", "contabilidad",
  "dgii", "ncf", "estados", "preocupacion",
];
const CAMPOS_CONTACTO = ["nombre", "empresa", "whatsapp"];
const MAX_LEN = 120;

export function validateInput(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Cuerpo de la solicitud inválido." };
  }
  const { contacto, respuestas } = body;
  if (!contacto || typeof contacto !== "object") {
    return { ok: false, error: "Faltan los datos de contacto." };
  }
  for (const campo of CAMPOS_CONTACTO) {
    const valor = contacto[campo];
    if (typeof valor !== "string" || valor.trim() === "") {
      return { ok: false, error: `Falta el campo de contacto: ${campo}.` };
    }
    if (valor.length > MAX_LEN) {
      return { ok: false, error: `El campo ${campo} es demasiado largo.` };
    }
  }
  if (!respuestas || typeof respuestas !== "object") {
    return { ok: false, error: "Faltan las respuestas del cuestionario." };
  }
  for (const campo of CAMPOS_RESPUESTA) {
    const valor = respuestas[campo];
    if (typeof valor !== "string" || valor.trim() === "") {
      return { ok: false, error: `Falta responder: ${campo}.` };
    }
    if (valor.length > MAX_LEN) {
      return { ok: false, error: `La respuesta ${campo} es demasiado larga.` };
    }
  }
  return { ok: true };
}

const SYSTEM_PROMPT = `Eres el asistente contable de Shalom Financial & Accounting, una firma dominicana de contabilidad, impuestos y finanzas. Generas un diagnóstico contable ORIENTATIVO para pymes y profesionales en República Dominicana, en español, con tono cercano y profesional.
Reglas:
- No inventes cifras, montos ni datos que no te dieron.
- No des asesoría legal o fiscal definitiva; recomienda validar con el equipo de Shalom.
- Sé concreto y accionable. Usa terminología local (DGII, ITBIS, ISR, NCF, TSS).
- Máximo unas 250 palabras.
Devuelve exactamente estas cuatro secciones con estos encabezados en negrita:
**Situación actual**
**Riesgos y oportunidades**
**Recomendaciones**
**Cómo te ayuda Shalom**`;

export function buildMessages(body) {
  const c = body.contacto;
  const r = body.respuestas;
  const userPrompt = `Genera el diagnóstico para este negocio:
- Nombre de contacto: ${c.nombre}
- Empresa: ${c.empresa}
- Tipo de negocio: ${r.tipoNegocio}
- Personas en nómina: ${r.empleados}
- Lleva contabilidad formal: ${r.contabilidad}
- Estado con la DGII (ITBIS/ISR): ${r.dgii}
- Emite comprobantes fiscales (NCF): ${r.ncf}
- Estados financieros: ${r.estados}
- Mayor preocupación: ${r.preocupacion}`;
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}
```

- [ ] **Step 6: Correr las pruebas (verificar que pasan)**

Run: `npm test`
Expected: PASS (5 pruebas de core).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json lib/diagnostico-core.js lib/diagnostico-core.test.js
git commit -m "feat(diagnostico): lógica pura de validación y prompt con pruebas"
```

---

## Task 2: Backend — handler serverless + endpoint

**Files:**
- Create: `lib/diagnostico-handler.js`
- Create: `api/diagnostico.js`
- Test: `lib/diagnostico-handler.test.js`

**Interfaces:**
- Consumes: `validateInput`, `buildMessages` de `lib/diagnostico-core.js`.
- Produces:
  - `createHandler(client, options?) -> async (req, res) => void`
  - `client` debe tener `client.chat.completions.create({ model, messages, temperature, max_tokens }) -> { choices: [{ message: { content } }] }`.
  - Respuestas HTTP: `405` (no POST), `400` (validación), `200 { diagnostico }`, `502 { error }`.

- [ ] **Step 1: Escribir las pruebas del handler (deben fallar)**

Create `lib/diagnostico-handler.test.js`:

```javascript
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "./diagnostico-handler.js";

function fakeRes() {
  return {
    statusCode: 0,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; },
  };
}

const validBody = {
  contacto: { nombre: "Ana", empresa: "Acme", whatsapp: "8090000000" },
  respuestas: {
    tipoNegocio: "SRL", empleados: "1–5", contabilidad: "No",
    dgii: "Con atrasos", ncf: "A veces", estados: "Solo anual",
    preocupacion: "Ordenar finanzas",
  },
};

test("responde 405 si no es POST", async () => {
  const res = fakeRes();
  await createHandler({})({ method: "GET", body: {} }, res);
  assert.equal(res.statusCode, 405);
});

test("responde 400 si el cuerpo es inválido", async () => {
  const res = fakeRes();
  await createHandler({})({ method: "POST", body: {} }, res);
  assert.equal(res.statusCode, 400);
});

test("responde 200 con el diagnóstico cuando la IA responde", async () => {
  const client = { chat: { completions: {
    create: async () => ({ choices: [{ message: { content: "Diagnóstico de prueba" } }] }),
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.diagnostico, "Diagnóstico de prueba");
});

test("responde 502 si la IA devuelve vacío", async () => {
  const client = { chat: { completions: {
    create: async () => ({ choices: [{ message: { content: "" } }] }),
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 502);
});

test("responde 502 si la IA lanza error", async () => {
  const client = { chat: { completions: {
    create: async () => { throw new Error("boom"); },
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 502);
});
```

- [ ] **Step 2: Correr las pruebas (verificar que fallan)**

Run: `npm test`
Expected: FAIL — no existe `./diagnostico-handler.js`.

- [ ] **Step 3: Implementar `lib/diagnostico-handler.js`**

```javascript
import { validateInput, buildMessages } from "./diagnostico-core.js";

export function createHandler(client, options = {}) {
  const model = options.model || process.env.NVIDIA_MODEL || "openai/gpt-oss-20b";
  return async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido." });
    }
    const body = req.body ?? {};
    const check = validateInput(body);
    if (!check.ok) {
      return res.status(400).json({ error: check.error });
    }
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: buildMessages(body),
        temperature: 0.5,
        max_tokens: 800,
      });
      const diagnostico = completion?.choices?.[0]?.message?.content?.trim();
      if (!diagnostico) {
        return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
      }
      return res.status(200).json({ diagnostico });
    } catch (err) {
      return res.status(502).json({ error: "No se pudo generar el diagnóstico. Intenta más tarde." });
    }
  };
}
```

- [ ] **Step 4: Correr las pruebas (verificar que pasan)**

Run: `npm test`
Expected: PASS (5 core + 5 handler = 10).

- [ ] **Step 5: Crear el endpoint `api/diagnostico.js`**

```javascript
import OpenAI from "openai";
import { createHandler } from "../lib/diagnostico-handler.js";

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
});

export default createHandler(client);
```

- [ ] **Step 6: Commit**

```bash
git add lib/diagnostico-handler.js lib/diagnostico-handler.test.js api/diagnostico.js
git commit -m "feat(diagnostico): handler serverless + endpoint /api/diagnostico"
```

---

## Task 3: Frontend — wizard, resultado, WhatsApp y CTA

**Files:**
- Create: `js/diagnostico.js`
- Modify: `index.html` (modal → contenedor del wizard; incluir el script)
- Modify: `css/style.css` (estilos del wizard/resultado/CTA)
- Modify: `js/main.js` (quitar el manejador viejo del formulario)

**Interfaces:**
- Consumes: globales `openWhatsApp(message)` y `WHATSAPP_NUMBER` definidos en `js/main.js`; endpoint `POST /api/diagnostico` de Task 2.
- Produces: `initDiagnostico()` (auto-invocada en `DOMContentLoaded`); rellena `#diag-wizard` dentro de `#diagnostic-modal`.

- [ ] **Step 1: Reemplazar el contenido del modal en `index.html`**

Buscar el bloque actual del modal (`<div class="modal-overlay" id="diagnostic-modal"> ... </div>`) y reemplazarlo por:

```html
  <div class="modal-overlay" id="diagnostic-modal">
    <div class="modal-box modal-box--wizard">
      <button class="modal-close" id="diagnostic-modal-close" type="button" aria-label="Cerrar">&times;</button>
      <div id="diag-wizard"></div>
    </div>
  </div>
```

- [ ] **Step 2: Incluir el nuevo script en `index.html`**

Reemplazar `<script src="js/main.js"></script>` por:

```html
<script src="js/main.js"></script>
<script src="js/diagnostico.js"></script>
```

- [ ] **Step 3: Quitar el manejador viejo en `js/main.js`**

Eliminar la función `initDiagnosticModal` completa (líneas de `function openDiagnosticModal()` hasta el cierre de `initDiagnosticModal`) y la llamada `initDiagnosticModal();` dentro de `DOMContentLoaded`. Mantener `openWhatsApp`, `WHATSAPP_NUMBER` y el resto. El bloque final debe quedar así:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
  initChatWidget();
  initHeroCarousel();
});
```

- [ ] **Step 4: Crear `js/diagnostico.js`**

```javascript
// Wizard del diagnóstico contable con IA. Se apoya en los globales
// openWhatsApp() y WHATSAPP_NUMBER definidos en main.js (cargado antes).

const DIAG_QUESTIONS = [
  { id: "tipoNegocio", label: "¿Qué tipo de negocio tienes?", options: ["Persona física", "EIRL", "SRL", "SA", "Aún no formalizado"] },
  { id: "empleados", label: "¿Cuántas personas tienes en nómina?", options: ["0", "1–5", "6–20", "+20"] },
  { id: "contabilidad", label: "¿Llevas contabilidad formal hoy?", options: ["Sí, con contador", "Sí, yo mismo/Excel", "No"] },
  { id: "dgii", label: "¿Estás al día con la DGII (ITBIS/ISR)?", options: ["Al día", "Con atrasos", "No sé", "No declaro"] },
  { id: "ncf", label: "¿Emites comprobantes fiscales (NCF) correctamente?", options: ["Sí", "A veces", "No", "No sé qué es"] },
  { id: "estados", label: "¿Tienes estados financieros actualizados?", options: ["Sí, mensual", "Solo anual", "No"] },
  { id: "preocupacion", label: "¿Cuál es tu mayor preocupación ahora?", options: ["Multas/DGII", "Ordenar finanzas", "Nómina y TSS", "Crecer/planificar", "Otra"] },
];
const AVISO = "Diagnóstico orientativo generado automáticamente. No sustituye la asesoría profesional de un contador.";

const state = { step: 0, answers: {}, contacto: { nombre: "", empresa: "", whatsapp: "" } };

function el() { return document.getElementById("diag-wizard"); }

function openModal() {
  state.step = 0; state.answers = {}; state.contacto = { nombre: "", empresa: "", whatsapp: "" };
  document.getElementById("diagnostic-modal").classList.add("is-open");
  document.body.classList.add("modal-open");
  renderStep();
}
function closeModal() {
  document.getElementById("diagnostic-modal").classList.remove("is-open");
  document.body.classList.remove("modal-open");
}

function renderStep() {
  const total = DIAG_QUESTIONS.length;
  if (state.step < total) {
    const q = DIAG_QUESTIONS[state.step];
    const opts = q.options.map((o) =>
      `<button type="button" class="diag-option${state.answers[q.id] === o ? " is-selected" : ""}" data-value="${o}">${o}</button>`
    ).join("");
    el().innerHTML = `
      <div class="diag-progress">Pregunta ${state.step + 1} de ${total}</div>
      <h3 class="diag-title">${q.label}</h3>
      <div class="diag-options">${opts}</div>
      <div class="diag-nav">
        ${state.step > 0 ? '<button type="button" class="diag-back" id="diag-back">← Atrás</button>' : "<span></span>"}
      </div>`;
    el().querySelectorAll(".diag-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.answers[q.id] = btn.dataset.value;
        state.step += 1;
        renderStep();
      });
    });
    const back = document.getElementById("diag-back");
    if (back) back.addEventListener("click", () => { state.step -= 1; renderStep(); });
    return;
  }
  renderContact();
}

function renderContact() {
  el().innerHTML = `
    <div class="diag-progress">Último paso</div>
    <h3 class="diag-title">¿A dónde te enviamos el seguimiento?</h3>
    <form id="diag-contact-form" class="diag-contact">
      <label for="diag-nombre">Nombre completo</label>
      <input type="text" id="diag-nombre" required maxlength="120" value="${state.contacto.nombre}">
      <label for="diag-empresa">Empresa</label>
      <input type="text" id="diag-empresa" required maxlength="120" value="${state.contacto.empresa}">
      <label for="diag-whatsapp">WhatsApp</label>
      <input type="tel" id="diag-whatsapp" required maxlength="120" value="${state.contacto.whatsapp}">
      <p class="diag-error" id="diag-error" hidden></p>
      <div class="diag-nav">
        <button type="button" class="diag-back" id="diag-back">← Atrás</button>
        <button type="submit" class="btn btn-primary" id="diag-generar">Generar diagnóstico</button>
      </div>
    </form>`;
  document.getElementById("diag-back").addEventListener("click", () => { state.step -= 1; renderStep(); });
  document.getElementById("diag-contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    state.contacto = {
      nombre: document.getElementById("diag-nombre").value.trim(),
      empresa: document.getElementById("diag-empresa").value.trim(),
      whatsapp: document.getElementById("diag-whatsapp").value.trim(),
    };
    if (!state.contacto.nombre || !state.contacto.empresa || !state.contacto.whatsapp) {
      const err = document.getElementById("diag-error");
      err.textContent = "Por favor completa nombre, empresa y WhatsApp.";
      err.hidden = false;
      return;
    }
    generate();
  });
}

function renderLoading() {
  el().innerHTML = `
    <div class="diag-loading">
      <div class="diag-spinner" aria-hidden="true"></div>
      <p>Analizando tus respuestas y preparando tu diagnóstico…</p>
    </div>`;
}

async function generate() {
  renderLoading();
  const payload = { contacto: state.contacto, respuestas: state.answers };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const resp = await fetch("/api/diagnostico", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data.diagnostico) {
      throw new Error(data.error || "No se pudo generar el diagnóstico.");
    }
    renderResult(data.diagnostico);
  } catch (err) {
    renderError();
  } finally {
    clearTimeout(timeout);
  }
}

function formatDiagnostico(texto) {
  // Convierte **negritas** y saltos de línea a HTML seguro.
  const escaped = texto
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
}

function buildWhatsappSummary() {
  const c = state.contacto;
  const a = state.answers;
  return [
    `Hola, soy ${c.nombre} de ${c.empresa}.`,
    `Generé mi diagnóstico contable en la web y quiero avanzar.`,
    ``,
    `Mis respuestas:`,
    `• Tipo de negocio: ${a.tipoNegocio}`,
    `• Nómina: ${a.empleados}`,
    `• Contabilidad: ${a.contabilidad}`,
    `• DGII: ${a.dgii}`,
    `• NCF: ${a.ncf}`,
    `• Estados financieros: ${a.estados}`,
    `• Preocupación: ${a.preocupacion}`,
  ].join("\n");
}

function renderResult(diagnostico) {
  el().innerHTML = `
    <h3 class="diag-title">Tu diagnóstico contable</h3>
    <div class="diag-result">${formatDiagnostico(diagnostico)}</div>
    <p class="diag-aviso">${AVISO}</p>
    <button type="button" class="btn btn-whatsapp diag-send" id="diag-send">Enviar mi diagnóstico a Shalom por WhatsApp</button>
    <div class="diag-cta">
      <h4>Agenda tu asesoría con Julissa y su equipo</h4>
      <p>Da el siguiente paso: te ayudamos a ordenar y hacer crecer tu negocio.</p>
      <button type="button" class="btn btn-primary" id="diag-asesoria">Quiero mi asesoría</button>
    </div>`;
  document.getElementById("diag-send").addEventListener("click", () => openWhatsApp(buildWhatsappSummary()));
  document.getElementById("diag-asesoria").addEventListener("click", () =>
    openWhatsApp(`Hola, soy ${state.contacto.nombre} de ${state.contacto.empresa}. Quiero agendar una asesoría con Julissa y su equipo.`)
  );
}

function renderError() {
  el().innerHTML = `
    <h3 class="diag-title">No pudimos generar tu diagnóstico ahora</h3>
    <p>Ocurrió un problema al procesar tu solicitud. Escríbenos por WhatsApp y lo hacemos contigo al momento.</p>
    <button type="button" class="btn btn-whatsapp diag-send" id="diag-send">Continuar por WhatsApp</button>
    <button type="button" class="diag-back" id="diag-retry">← Intentar de nuevo</button>`;
  document.getElementById("diag-send").addEventListener("click", () => openWhatsApp(buildWhatsappSummary()));
  document.getElementById("diag-retry").addEventListener("click", () => { state.step = DIAG_QUESTIONS.length; renderStep(); });
}

function initDiagnostico() {
  document.querySelectorAll("#hero-diagnostic-btn, #banner-diagnostic-btn").forEach((btn) => {
    btn.addEventListener("click", openModal);
  });
  const closeBtn = document.getElementById("diagnostic-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  const overlay = document.getElementById("diagnostic-modal");
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target.id === "diagnostic-modal") closeModal(); });
}

document.addEventListener("DOMContentLoaded", initDiagnostico);
```

- [ ] **Step 5: Añadir estilos en `css/style.css`**

Agregar al final del archivo:

```css
/* Wizard de diagnóstico */
.modal-box--wizard { max-width: 520px; }
.diag-progress { font-size: 0.8rem; font-weight: 600; color: var(--color-gold); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
.diag-title { font-size: 1.25rem; margin-bottom: 18px; }
.diag-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
.diag-option { text-align: left; background: #fff; border: 1px solid var(--color-gold); color: var(--color-navy); border-radius: 8px; padding: 12px 14px; font-size: 0.95rem; cursor: pointer; font-family: var(--font-body); transition: background-color 0.18s var(--ease-smooth), transform 0.18s var(--ease-smooth); }
.diag-option:hover { background: var(--color-gold-light); transform: translateX(3px); }
.diag-option.is-selected { background: var(--color-navy); color: #fff; }
.diag-nav { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 8px; }
.diag-back { background: none; border: none; color: var(--color-navy); text-decoration: underline; cursor: pointer; font-size: 0.9rem; font-family: var(--font-body); }
.diag-contact label { display: block; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem; color: var(--color-navy); }
.diag-contact input { width: 100%; padding: 10px 12px; margin-bottom: 14px; border: 1px solid #ccc; border-radius: 6px; font-family: var(--font-body); font-size: 1rem; }
.diag-error { color: #c0392b; font-size: 0.88rem; margin-bottom: 12px; }
.diag-loading { text-align: center; padding: 32px 0; }
.diag-spinner { width: 44px; height: 44px; margin: 0 auto 18px; border: 4px solid var(--color-gold-light); border-top-color: var(--color-gold); border-radius: 50%; animation: diag-spin 0.9s linear infinite; }
@keyframes diag-spin { to { transform: rotate(360deg); } }
.diag-result { background: var(--color-offwhite); border-radius: 10px; padding: 18px; font-size: 0.95rem; color: #333; line-height: 1.6; max-height: 320px; overflow-y: auto; }
.diag-result strong { color: var(--color-navy); }
.diag-aviso { font-size: 0.78rem; color: #777; margin: 12px 0 18px; }
.diag-send { width: 100%; margin-bottom: 18px; }
.diag-cta { background: var(--color-navy); color: #fff; border-radius: 10px; padding: 20px; text-align: center; }
.diag-cta h4 { color: var(--color-gold); font-family: var(--font-body); margin-bottom: 8px; }
.diag-cta p { font-size: 0.9rem; opacity: 0.9; margin-bottom: 14px; }
```

- [ ] **Step 6: Prueba local del frontend con backend (vercel dev)**

Run: `npx vercel dev` (requiere el proyecto vinculado a Vercel; ver Task 5). Con las variables de entorno disponibles en el shell:
```bash
NVIDIA_API_KEY=xxx NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1 NVIDIA_MODEL=openai/gpt-oss-20b npx vercel dev
```
Expected: abrir `http://localhost:3000`, clic en "Quiero mi diagnóstico gratis", recorrer las 7 preguntas + contacto, "Generar diagnóstico" → aparece el diagnóstico + aviso + botón WhatsApp + CTA. Si el backend/env no está, debe verse el estado de error con salida por WhatsApp (valida la ruta de error).

- [ ] **Step 7: Commit**

```bash
git add index.html css/style.css js/main.js js/diagnostico.js
git commit -m "feat(diagnostico): wizard frontend, resultado, WhatsApp y CTA de asesoría"
```

---

## Task 4: Despliegue en Vercel, variables de entorno y verificación E2E

**Files:**
- Create: `README-deploy.md`

**Interfaces:**
- Consumes: `api/diagnostico.js`, `package.json`, y las variables `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, `NVIDIA_MODEL`.

- [ ] **Step 1: Documentar el despliegue en `README-deploy.md`**

```markdown
# Despliegue en Vercel — Diagnóstico con IA

Este sitio ahora incluye una función serverless (`api/diagnostico.js`). Debe
desplegarse como **proyecto Vercel estándar** (no como salida pre-construida),
para que Vercel detecte la carpeta `api/` y ejecute la función.

## Variables de entorno (Vercel → Project → Settings → Environment Variables)
- `NVIDIA_API_KEY` = (tu clave de NVIDIA; **rotarla** si se expuso)
- `NVIDIA_BASE_URL` = `https://integrate.api.nvidia.com/v1`
- `NVIDIA_MODEL` = `openai/gpt-oss-20b`

Definirlas para Production y Preview. NO subir `.env` a git (ya está ignorado).

## Configuración del proyecto
- Framework Preset: **Other**
- Build Command: (vacío)
- Output Directory: (raíz)
- Vercel instala dependencias desde `package.json` y detecta `api/` como funciones.

## Verificación
1. Deploy (push a `master` si el repo está conectado a Vercel, o `npx vercel --prod`).
2. Abrir el sitio, generar un diagnóstico y confirmar que aparece el texto.
3. Probar `POST /api/diagnostico` con un cuerpo válido y uno inválido (400).
```

- [ ] **Step 2: Registrar las variables de entorno en Vercel** (acción manual del usuario)

En el panel de Vercel del proyecto, añadir `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, `NVIDIA_MODEL` (Production + Preview). Confirmar que el proyecto NO está fijado a "prebuilt output" (Framework Preset = Other).

- [ ] **Step 3: Confirmar que las pruebas pasan antes de desplegar**

Run: `npm test`
Expected: PASS (10 pruebas).

- [ ] **Step 4: Desplegar un preview y verificar E2E**

Run: `npx vercel` (deploy de preview)
Expected: la URL de preview genera un diagnóstico real de extremo a extremo (wizard → IA → resultado → WhatsApp). Verificar también que el resto del sitio sigue igual.

- [ ] **Step 5: Commit y (con aprobación del usuario) push a producción**

```bash
git add README-deploy.md
git commit -m "docs(diagnostico): pasos de despliegue y variables de entorno en Vercel"
```
El push a `master` (que dispara el deploy de producción) se hace solo con la confirmación explícita del usuario.

---

## Self-Review

**Spec coverage:**
- Cuestionario (7 preguntas + contacto) → Task 3 (`DIAG_QUESTIONS`, `renderContact`). ✓
- Generación con IA (NVIDIA, prompt, estructura, params) → Task 1 (`buildMessages`) + Task 2 (handler). ✓
- Aviso legal obligatorio → Task 3 (`AVISO`, `renderResult`). ✓
- Entrega por WhatsApp con resumen (no texto completo) → Task 3 (`buildWhatsappSummary`). ✓
- CTA de asesoría → Task 3 (`renderResult` → `.diag-cta`). ✓
- Backend serverless en Vercel + SDK openai + env key → Task 2 + Task 4. ✓
- Cambio de despliegue (prebuilt → estándar) → Task 4 (`README-deploy.md`). ✓
- Manejo de errores (400/502/timeout + fallback WhatsApp) → Task 2 (handler) + Task 3 (`generate`/`renderError`). ✓
- Seguridad (key solo en env, validación, max_tokens) → Task 1 (validación) + Task 2 (params) + Global Constraints. ✓
- Pruebas → Task 1 y Task 2 (node:test); E2E manual → Task 3/4. ✓

**Placeholder scan:** sin TBD/TODO; todo el código está presente. ✓

**Type consistency:** `validateInput`/`buildMessages` consumidos por `createHandler` con la misma forma de `body`; `createHandler(client)` usa `client.chat.completions.create`; el frontend consume `{ diagnostico }` / `{ error }` tal como los produce el handler; usa los globales `openWhatsApp`/`WHATSAPP_NUMBER` de `main.js`. ✓
