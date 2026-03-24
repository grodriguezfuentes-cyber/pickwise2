const listaEjemplo = [
  "Coca Cola",
  "Pepsi",
  "Nutella",
  "Chocolate negro",
  "Chocolate blanco",
  "Galletas",
  "Doritos",
  "Leche",
  "Pan",
  "Queso",
  "Melocoton"
];

const datosProductos = {
  "coca cola": { azucar: 10, grasa: 0, proteina: 0 },
  "pepsi": { azucar: 11, grasa: 0, proteina: 0 },
  "nutella": { azucar: 56, grasa: 30, proteina: 6 },
  "chocolate negro": { azucar: 20, grasa: 35, proteina: 7 },
  "chocolate blanco": { azucar: 55, grasa: 32, proteina: 5 },
  "galletas": { azucar: 25, grasa: 20, proteina: 4 },
  "doritos": { azucar: 3, grasa: 30, proteina: 6 },
  "leche": { azucar: 5, grasa: 3, proteina: 3 },
  "pan": { azucar: 4, grasa: 1, proteina: 8 },
  "queso": { azucar: 1, grasa: 33, proteina: 25 },
  "melocoton": { azucar: 8, grasa: 0, proteina: 1 }
};

// AUTOCOMPLETE
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

mostrarSugerencias("producto1");
mostrarSugerencias("producto2");

// SCORE
function calcularScore(p) {
  let score = 10;
  score -= p.azucar * 0.1;
  score -= p.grasa * 0.1;
  score += p.proteina * 0.2;
  return Math.max(1, Math.min(10, Math.round(score)));
}

// GENERAR SCORE SI NO EXISTE
function generarScoreGenerico(nombre) {
  nombre = nombre.toLowerCase();

  // heurística básica
  if (nombre.includes("chocolate") || nombre.includes("galleta")) {
    return 3;
  }
  if (nombre.includes("fruta") || nombre.includes("melon") || nombre.includes("manzana")) {
    return 8;
  }

  return 5; // neutro
}

// COMPARAR
function comparar() {
  const input1 = document.getElementById("producto1").value.trim().toLowerCase();
  const input2 = document.getElementById("producto2").value.trim().toLowerCase();
  const errorDiv = document.getElementById("error");
  const resultadoDiv = document.getElementById("resultado");

  errorDiv.textContent = "";
  resultadoDiv.innerHTML = "";

  if (!input1 || !input2) {
    errorDiv.textContent = "Introduce ambos productos";
    return;
  }

  const p1 = datosProductos[input1];
  const p2 = datosProductos[input2];

  const score1 = p1 ? calcularScore(p1) : generarScoreGenerico(input1);
  const score2 = p2 ? calcularScore(p2) : generarScoreGenerico(input2);

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
      ${
        score1 === score2
          ? "⚖️ Son similares"
          : score1 > score2
          ? "🟢 Producto 1 mejor"
          : "🟢 Producto 2 mejor"
      }
    </div>
  `;
}