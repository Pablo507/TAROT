document.addEventListener("DOMContentLoaded", () => {
  console.log("Tarot AI inicializado correctamente.");

  // Referencias a elementos principales
  const btnLeer = document.getElementById("btn-leer");
  const resultadoLectura = document.getElementById("resultado-lectura");
  const leadForm = document.getElementById("whatsapp-lead-form");
  const leadMessage = document.getElementById("lead-message");

  // Simulación o lógica de la lectura de Tarot
  if (btnLeer) {
    btnLeer.addEventListener("click", () => {
      // Mostrar resultado de ejemplo o procesar lectura
      if (resultadoLectura) {
        resultadoLectura.innerHTML = `
          <div class="card-result-box">
            <h3>Tu Tirada del Día</h3>
            <p>La sacerdotisa: Intuición, sabiduría oculta y momentos de introspección profunda. Confía en tu voz interior.</p>
          </div>
        `;
      }

      // Al finalizar la lectura, activamos y mostramos el módulo de captura de WhatsApp
      window.activarLeadCapture();
    });
  }

  // Manejo del formulario de WhatsApp Lead Capture
  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("lead-name").value;
      const phone = document.getElementById("lead-phone").value;

      if (!name || !phone) {
        if (leadMessage) leadMessage.textContent = "Por favor, completa todos los campos.";
        return;
      }

      // Aquí puedes integrar tu lógica de backend, API de pagos o pasarela de Sandbox
      if (leadMessage) {
        leadMessage.style.color = "green";
        leadMessage.textContent = `¡Gracias ${name}! Te hemos enviado la confirmación a ${phone}.`;
      }

      // Limpiar formulario opcionalmente
      leadForm.reset();
    });
  }
});

// ─── WHATSAPP LEAD CAPTURE EXPOSED FUNCTION ───────────────────
window.activarLeadCapture = function () {
  const panel = document.getElementById('lead-panel');
  if (!panel) return;
  
  // Habilita la visualización del panel si estaba oculto
  panel.style.display = 'block';
  panel.dataset.shown = '1';
  
  // Realiza scroll suave hacia el panel para guiar al usuario
  setTimeout(() => {
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 400);
};