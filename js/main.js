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
  document.querySelectorAll("#hero-whatsapp-btn").forEach((btn) => {
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

function initGallery() {
  const viewport = document.getElementById("gallery-viewport");
  if (!viewport) return;
  const slides = viewport.querySelectorAll(".gallery-slide");
  const dots = document.querySelectorAll(".gallery-dot");
  let current = 0;
  let autoplayTimer = null;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, 5000);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  document.getElementById("gallery-next").addEventListener("click", () => { next(); startAutoplay(); });
  document.getElementById("gallery-prev").addEventListener("click", () => { prev(); startAutoplay(); });
  dots.forEach((dot) => {
    dot.addEventListener("click", () => { goTo(Number(dot.dataset.index)); startAutoplay(); });
  });
  viewport.addEventListener("mouseenter", stopAutoplay);
  viewport.addEventListener("mouseleave", startAutoplay);

  startAutoplay();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  initWhatsAppButtons();
  initFaqAccordion();
  initFooterYear();
  initDiagnosticModal();
  initChatWidget();
  initGallery();
});
