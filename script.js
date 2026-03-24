let baseDatos = [];

// ==========================
// 📦 CARGAR BASE
// ==========================
async function cargarBaseDatos() {
  const res = await fetch("productos.json");
  baseDatos = await res.json();
}

// ==========================
// 🔍 AUTOCOMPLETADO
// ==========================
function mostrarSugerencias(input, idLista) {
  const valor = input.value.toLowerCase();
  const contenedor = document.getElementById(idLista);

  contenedor.innerHTML = "";

  if (valor.length < 2) return;

  const resultados = baseDatos
    .filter(p => p.nombre.includes(valor))
    .slice(0, 5);

  resultados.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.textContent = p.nombre;

    div.onclick = () => {
      input.value = p.nombre;
      contenedor.innerHTML = "";
    };

    contenedor.appendChild(div);
  });
}

// ==========================
// 🔍 BUSCAR
// ==========================
function buscarProducto(nombre) {
  nombre = nombre.toLowerCase();
  return baseDatos.find(p => nombre.includes(p.nombre));
}

// ==========================
// 🧠 SCORE
// ==========================
function calcularScore(p) {
  let score = 100;

  score -= p.azucar * 2;
  score -= p.grasa * 1.5;
  score -= p.procesado * 5;
  score += p.proteina * 1;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ==========================
// 🟢🔴 CLASIFICAR
// ==========================
function clasificar(score) {
  if (score >= 70) return { texto: "🟢 Bueno", color: "green" };
  if (score >= 40) return { texto: "🟡 Regular", color: "orange" };
  return { texto: "🔴 Malo", color: "red" };
}

// ==========================
// 🧠 GENERADOR
// ==========================
function generarProducto(nombre) {
  nombre = nombre.toLowerCase();

  if (nombre.includes("fruta")) {
    return { azucar: 8, grasa: 0, proteina: 1, procesado: 1 };
  }

  if (nombre.includes("chocolate")) {
    return { azucar: 40, grasa: 25, proteina: 3, procesado: 9 };
  }

  if (nombre.includes("coca") || nombre.includes("refresco")) {
    return { azucar: 10, grasa: 0, proteina: 0, procesado: 9 };
  }

  return { azucar: 15, grasa: 10, proteina: 2, procesado: 6 };
}

// ==========================
// 💡 EXPLICAR
// ==========================
function explicar(p1, p2) {

  let diferencias = [];

  if (Math.abs(p1.azucar - p2.azucar) > 3) {
    if (p1.azucar < p2.azucar) diferencias.push("menos azúcar");
    else diferencias.push("más azúcar");
  }

  if (Math.abs(p1.procesado - p2.procesado) > 2) {
    if (p1.procesado < p2.procesado) diferencias.push("menos procesado");
  }

  if (diferencias.length === 0) return "Son similares";

  return "Tiene " + diferencias.join(", ");
}

// ==========================
// ⚔️ COMPARAR
// ==========================
function comparar() {

  const input1 = document.getElementById("producto1").value.trim();
  const input2 = document.getElementById("producto2").value.trim();
  const resultadoDiv = document.getElementById("resultado");

  let p1 = buscarProducto(input1) || generarProducto(input1);
  let p2 = buscarProducto(input2) || generarProducto(input2);

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  const c1 = clasificar(score1);
  const c2 = clasificar(score2);

  let mejor = "";
  if (score1 === score2) mejor = "⚖️ Son similares";
  else if (score1 > score2) mejor = "🟢 Producto 1 mejor";
  else mejor = "🟢 Producto 2 mejor";

  const explicacion = explicar(p1, p2);

  resultadoDiv.innerHTML = `
    <div>
      <h3>${input1}</h3>
      <p style="color:${c1.color}; font-weight:bold;">
        ${c1.texto} (${score1}/100)
      </p>
    </div>

    <div>
      <h3>${input2}</h3>
      <p style="color:${c2.color}; font-weight:bold;">
        ${c2.texto} (${score2}/100)
      </p>
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
cargarBaseDatos();