// ==========================
// 📦 CARGAR BASE DE DATOS
// ==========================
let baseDatos = [];

async function cargarBaseDatos() {
  try {
    const res = await fetch("productos.json");
    baseDatos = await res.json();
  } catch (e) {
    console.error("Error cargando base de datos");
  }
}

// ==========================
// 🔍 BUSCAR PRODUCTO (inteligente)
// ==========================
function buscarProducto(nombre) {
  nombre = nombre.toLowerCase();

  return baseDatos.find(p =>
    nombre.includes(p.nombre)
  );
}

// ==========================
// 🧠 SCORE
// ==========================
function calcularScore(p) {
  let score = 10;

  score -= p.azucar * 0.2;
  score -= p.grasa * 0.15;
  score += p.proteina * 0.3;

  // penalizar ultraprocesado
  score -= p.procesado * 0.3;

  return Math.max(1, Math.min(10, Math.round(score)));
}

// ==========================
// 🧠 SI NO EXISTE → GENERAR
// ==========================
function generarProducto(nombre) {
  nombre = nombre.toLowerCase();

  if (nombre.includes("fruta")) {
    return { azucar: 8, grasa: 0, proteina: 1, procesado: 1 };
  }

  if (nombre.includes("chocolate") || nombre.includes("galleta")) {
    return { azucar: 30, grasa: 20, proteina: 3, procesado: 8 };
  }

  if (nombre.includes("refresco")) {
    return { azucar: 10, grasa: 0, proteina: 0, procesado: 9 };
  }

  return { azucar: 15, grasa: 10, proteina: 2, procesado: 6 };
}

// ==========================
// 💡 EXPLICACIÓN
// ==========================
function explicar(p1, p2) {
  if (p1.azucar < p2.azucar) return "Tiene menos azúcar";
  if (p1.grasa < p2.grasa) return "Tiene menos grasa";
  if (p1.proteina > p2.proteina) return "Tiene más proteína";
  return "Son similares nutricionalmente";
}

// ==========================
// ⚔️ COMPARAR
// ==========================
async function comparar() {

  const input1 = document.getElementById("producto1").value.trim();
  const input2 = document.getElementById("producto2").value.trim();
  const resultadoDiv = document.getElementById("resultado");
  const errorDiv = document.getElementById("error");

  resultadoDiv.innerHTML = "";
  errorDiv.textContent = "";

  if (!input1 || !input2) {
    errorDiv.textContent = "Introduce ambos productos";
    return;
  }

  let p1 = buscarProducto(input1) || generarProducto(input1);
  let p2 = buscarProducto(input2) || generarProducto(input2);

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  const mejor =
    score1 === score2
      ? "⚖️ Son similares"
      : score1 > score2
      ? "🟢 Producto 1 mejor"
      : "🟢 Producto 2 mejor";

  const explicacion = explicar(p1, p2);

  resultadoDiv.innerHTML = `
    <div>
      <h3>${input1}</h3>
      <p>Score: ${score1}/10</p>
    </div>

    <div>
      <h3>${input2}</h3>
      <p>Score: ${score2}/10</p>
    </div>

    <div style="margin-top:10px;font-weight:bold;">
      ${mejor}
    </div>

    <div style="margin-top:10px;color:#555;">
      💡 ${explicacion}
    </div>
  `;
}

// ==========================
// 🚀 INICIAR
// ==========================
cargarBaseDatos();