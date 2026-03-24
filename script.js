// ==========================
// 📦 CARGAR BASE DE DATOS
// ==========================
let baseDatos = [];

async function cargarBaseDatos() {
  const res = await fetch("productos.json");
  baseDatos = await res.json();
}

// ==========================
// 🔍 BUSCAR PRODUCTO
// ==========================
function buscarProducto(nombre) {
  nombre = nombre.toLowerCase();

  return baseDatos.find(p =>
    nombre.includes(p.nombre)
  );
}

// ==========================
// 🧠 SCORE MEJORADO (REAL)
// ==========================
function calcularScore(p) {
  let score = 10;

  // penalizaciones más realistas
  score -= p.azucar * 0.25;
  score -= p.grasa * 0.2;

  // proteína suma pero poco
  score += p.proteina * 0.15;

  // penalización fuerte a ultraprocesado
  score -= p.procesado * 0.4;

  return Math.max(1, Math.min(10, Math.round(score)));
}

// ==========================
// 🧠 GENERADOR INTELIGENTE
// ==========================
function generarProducto(nombre) {
  nombre = nombre.toLowerCase();

  if (nombre.includes("fruta")) {
    return { azucar: 8, grasa: 0, proteina: 1, procesado: 1 };
  }

  if (nombre.includes("chocolate") || nombre.includes("galleta")) {
    return { azucar: 40, grasa: 25, proteina: 3, procesado: 9 };
  }

  if (nombre.includes("coca") || nombre.includes("refresco")) {
    return { azucar: 10, grasa: 0, proteina: 0, procesado: 9 };
  }

  return { azucar: 15, grasa: 10, proteina: 2, procesado: 6 };
}

// ==========================
// 💡 EXPLICACIÓN INTELIGENTE
// ==========================
function explicar(p1, p2) {

  let diferencias = [];

  if (Math.abs(p1.azucar - p2.azucar) > 3) {
    if (p1.azucar < p2.azucar) diferencias.push("menos azúcar");
    else diferencias.push("más azúcar");
  }

  if (Math.abs(p1.grasa - p2.grasa) > 5) {
    if (p1.grasa < p2.grasa) diferencias.push("menos grasa");
    else diferencias.push("más grasa");
  }

  if (Math.abs(p1.proteina - p2.proteina) > 3) {
    if (p1.proteina > p2.proteina) diferencias.push("más proteína");
  }

  if (Math.abs(p1.procesado - p2.procesado) > 2) {
    if (p1.procesado < p2.procesado) diferencias.push("menos procesado");
  }

  if (diferencias.length === 0) return "Son muy similares";

  return "Tiene " + diferencias.join(", ");
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

  let mejor = "";
  if (score1 === score2) mejor = "⚖️ Son similares";
  else if (score1 > score2) mejor = "🟢 Producto 1 mejor";
  else mejor = "🟢 Producto 2 mejor";

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