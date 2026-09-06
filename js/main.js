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

function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });
}

function initFooterYear() {
  const el = document.getElementById("footer-year");
  if (el) el.textContent = new Date().getFullYear();
}

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

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
  initDiagnosticModal();
});
