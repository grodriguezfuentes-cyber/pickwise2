function comparar() {
  const input1 = document.getElementById("producto1").value.trim();
  const input2 = document.getElementById("producto2").value.trim();
  const errorDiv = document.getElementById("error");
  const resultadoDiv = document.getElementById("resultado");

  // Limpiar mensajes
  errorDiv.textContent = "";
  resultadoDiv.innerHTML = "";

  if (!input1 || !input2) {
    errorDiv.textContent = "Introduce ambos productos";
    return;
  }

  // Generar puntuaciones aleatorias (MVP)
  const score1 = Math.floor(Math.random() * 10) + 1;
  const score2 = Math.floor(Math.random() * 10) + 1;

  resultadoDiv.innerHTML = `
    <div>
      <h3>${input1}</h3>
      <p>Score: ${score1}/10</p>
    </div>

    <div>
      <h3>${input2}</h3>
      <p>Score: ${score2}/10</p>
    </div>

    <div style="margin-top: 10px; font-weight: bold;">
      ${score1 > score2 ? "🟢 Producto 1 mejor" : "🟢 Producto 2 mejor"}
    </div>
  `;
}