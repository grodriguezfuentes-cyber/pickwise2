// ==========================
// 🧠 BASE DE DATOS LOCAL (SIMULACIÓN REAL)
// ==========================
const productosDB = [
  { nombre: "Coca Cola", azucar: 10.6, grasa: 0, calorias: 42 },
  { nombre: "Coca Cola Zero", azucar: 0, grasa: 0, calorias: 1 },
  { nombre: "Nutella", azucar: 56, grasa: 31, calorias: 539 },
  { nombre: "Plátano", azucar: 12, grasa: 0.3, calorias: 89 },
  { nombre: "Manzana", azucar: 10, grasa: 0.2, calorias: 52 },
  { nombre: "Lechuga", azucar: 1, grasa: 0.1, calorias: 15 },
  { nombre: "Yogur natural", azucar: 4, grasa: 3, calorias: 60 },
  { nombre: "Chocolate negro", azucar: 24, grasa: 43, calorias: 600 },
];

// ==========================
// 🔍 BUSCAR SUGERENCIAS
// ==========================
function buscarSugerencias(texto, numero) {

  const contenedor = document.getElementById("sugerencias" + numero);

  if (texto.length < 1) {
    contenedor.innerHTML = "";
    return;
  }

  const resultados = productosDB.filter(p =>
    p.nombre.toLowerCase().includes(texto.toLowerCase())
  );

  contenedor.innerHTML = resultados.map((p, index) => `
    <div class="sugerencia" onclick="seleccionarProducto(${numero}, ${index})">
      ${p.nombre}
    </div>
  `).join("");

  contenedor.dataset.resultados = JSON.stringify(resultados);
}

// ==========================
// 📌 SELECCIONAR
// ==========================
let producto1 = null;
let producto2 = null;

function seleccionarProducto(numero, index) {

  const contenedor = document.getElementById("sugerencias" + numero);
  const lista = JSON.parse(contenedor.dataset.resultados);

  const producto = lista[index];

  if (numero === 1) {
    producto1 = producto;
    document.getElementById("barcode1").value = producto.nombre;
  } else {
    producto2 = producto;
    document.getElementById("barcode2").value = producto.nombre;
  }

  contenedor.innerHTML = "";
}

// ==========================
// 🧠 SCORE
// ==========================
function calcularScore(p) {

  let score = 10;

  if (p.azucar > 10) score -= 3;
  if (p.grasa > 15) score -= 2;
  if (p.calorias > 300) score -= 2;

  return Math.max(score, 1);
}

// ==========================
// ⚔️ COMPARAR
// ==========================
function compararProductos() {

  const resultado = document.getElementById("resultado");

  if (!producto1 || !producto2) {
    resultado.innerHTML = "⚠️ Selecciona productos de la lista";
    return;
  }

  const s1 = calcularScore(producto1);
  const s2 = calcularScore(producto2);

  let ganador = "";
  if (s1 > s2) ganador = "🟢 Mejor opción";
  else if (s2 > s1) ganador = "🟢 Mejor opción";
  else ganador = "🟡 Empate";

  resultado.innerHTML = `
    <div class="card">
      <h3>${producto1.nombre}</h3>
      <p>Score: ${s1}/10</p>
    </div>

    <div class="card">
      <h3>${producto2.nombre}</h3>
      <p>Score: ${s2}/10</p>
    </div>

    <h2>${ganador}</h2>
  `;
}