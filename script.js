const listaEjemplo = [
  "Coca Cola",
  "Pepsi",
  "Nutella",
  "Chocolate negro",
  "Chocolate blanco",
  "Leche",
  "Pan",
  "Queso",
  "Yogur",
  "Cereales"
];

// AUTOCOMPLETE SIMPLE
function mostrarSugerencias(inputId) {
  const input = document.getElementById(inputId);
  let lista = document.getElementById(inputId + "-lista");

  if (!lista) {
    lista = document.createElement("div");
    lista.id = inputId + "-lista";
    lista.style.background = "white";
    lista.style.border = "1px solid #ccc";
    lista.style.borderRadius = "8px";
    lista.style.marginTop = "-8px";
    lista.style.marginBottom = "10px";
    input.parentNode.insertBefore(lista, input.nextSibling);
  }

  input.addEventListener("input", () => {
    const valor = input.value.toLowerCase();
    lista.innerHTML = "";

    if (!valor) return;

    const filtrados = listaEjemplo.filter(p =>
      p.toLowerCase().includes(valor)
    );

    filtrados.forEach(p => {
      const item = document.createElement("div");
      item.textContent = p;
      item.style.padding = "8px";
      item.style.cursor = "pointer";

      item.onclick = () => {
        input.value = p;
        lista.innerHTML = "";
      };

      lista.appendChild(item);
    });
  });
}

// ACTIVAR AUTOCOMPLETE
mostrarSugerencias("producto1");
mostrarSugerencias("producto2");


// COMPARAR (sin romper nada)
function comparar() {
  const input1 = document.getElementById("producto1").value.trim();
  const input2 = document.getElementById("producto2").value.trim();
  const errorDiv = document.getElementById("error");
  const resultadoDiv = document.getElementById("resultado");

  errorDiv.textContent = "";
  resultadoDiv.innerHTML = "";

  if (!input1 || !input2) {
    errorDiv.textContent = "Introduce ambos productos";
    return;
  }

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