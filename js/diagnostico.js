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
      <input type="text" id="diag-nombre" required maxlength="120" value="${escapeAttr(state.contacto.nombre)}">
      <label for="diag-empresa">Empresa</label>
      <input type="text" id="diag-empresa" required maxlength="120" value="${escapeAttr(state.contacto.empresa)}">
      <label for="diag-whatsapp">WhatsApp</label>
      <input type="tel" id="diag-whatsapp" required maxlength="120" value="${escapeAttr(state.contacto.whatsapp)}">
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

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildWhatsappSummary() {
  const c = state.contacto;
  const a = state.answers;
  return [
    `Hola, soy ${c.nombre} de ${c.empresa}.`,
    `Mi WhatsApp: ${c.whatsapp}`,
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
  state.diagnostico = diagnostico;
  el().innerHTML = `
    <h3 class="diag-title">Tu diagnóstico contable</h3>
    <div class="diag-result">${formatDiagnostico(diagnostico)}</div>
    <p class="diag-confirm">📱 Te contactaremos por WhatsApp al <strong>${escapeAttr(state.contacto.whatsapp)}</strong>.</p>
    <p class="diag-aviso">${AVISO}</p>
    <div class="diag-actions">
      <button type="button" class="btn btn-whatsapp diag-send" id="diag-send">Enviar mi diagnóstico por WhatsApp</button>
      <button type="button" class="btn btn-whatsapp-outline diag-pdf" id="diag-pdf">Descargar diagnóstico en PDF</button>
    </div>
    <div class="diag-cta">
      <h4>Agenda tu asesoría con nuestro equipo de Shalom Financial &amp; Accounting</h4>
      <p>Da el siguiente paso: te ayudamos a ordenar y hacer crecer tu negocio.</p>
      <button type="button" class="btn btn-primary" id="diag-asesoria">Quiero mi asesoría</button>
    </div>`;
  document.getElementById("diag-send").addEventListener("click", () => openWhatsApp(buildWhatsappSummary()));
  document.getElementById("diag-pdf").addEventListener("click", generarPDF);
  document.getElementById("diag-asesoria").addEventListener("click", () =>
    openWhatsApp(`Hola, soy ${state.contacto.nombre} de ${state.contacto.empresa}. Quiero agendar una asesoría con el equipo de Shalom Financial & Accounting.`)
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generarPDF() {
  const btn = document.getElementById("diag-pdf");
  if (!window.jspdf || !window.jspdf.jsPDF) {
    if (btn) btn.textContent = "PDF no disponible, intenta de nuevo";
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = "Generando PDF…"; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensure = (needed) => {
    if (y + needed > pageH - margin) { doc.addPage(); y = margin; }
  };

  try {
    const img = await loadImage("images/logo.png");
    const w = 64, h = 64;
    doc.addImage(img, "PNG", (pageW - w) / 2, y, w, h);
    y += h + 14;
  } catch (e) { /* sin logo si falla la carga */ }

  doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(10, 26, 60);
  doc.text("Shalom Financial & Accounting", pageW / 2, y, { align: "center" }); y += 22;
  doc.setFontSize(13); doc.setTextColor(201, 162, 75);
  doc.text("Diagnóstico contable", pageW / 2, y, { align: "center" }); y += 24;

  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(60, 60, 60);
  doc.text(`${state.contacto.nombre} — ${state.contacto.empresa}`, margin, y); y += 14;
  doc.text(`WhatsApp: ${state.contacto.whatsapp}`, margin, y); y += 10;
  doc.setDrawColor(201, 162, 75); doc.line(margin, y, pageW - margin, y); y += 18;

  const lines = String(state.diagnostico || "").split("\n");
  doc.setFontSize(11);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { y += 6; continue; }
    const bold = line.match(/^\*\*(.+?)\*\*:?$/);
    const text = bold ? bold[1] : line.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^[•\-]\s*/, "• ");
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setTextColor(bold ? 10 : 40, bold ? 26 : 40, bold ? 60 : 40);
    const wrapped = doc.splitTextToSize(text, maxW);
    ensure(wrapped.length * 15 + (bold ? 6 : 0));
    if (bold) y += 6;
    doc.text(wrapped, margin, y);
    y += wrapped.length * 15;
  }

  y += 14; ensure(40);
  doc.setFont("helvetica", "italic"); doc.setFontSize(8); doc.setTextColor(120, 120, 120);
  doc.text(doc.splitTextToSize(AVISO, maxW), margin, y);

  const empresa = (state.contacto.empresa || "diagnostico").replace(/[^\w\-]+/g, "_").slice(0, 40);
  doc.save(`Diagnostico-Shalom-${empresa}.pdf`);
  if (btn) { btn.disabled = false; btn.textContent = "Descargar diagnóstico en PDF"; }
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
