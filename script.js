// ==========================
// 🧠 ESTADO GLOBAL
// ==========================
let timeout = null;
let productoSeleccionado1 = null;
let productoSeleccionado2 = null;

// ==========================
// 🔍 BUSCADOR PROFESIONAL
// ==========================
function buscarSugerencias(texto, numero) {

  clearTimeout(timeout);

  const contenedor = document.getElementById("sugerencias" + numero);

  if (texto.length < 2) {
    contenedor.innerHTML = "";
    return;
  }

  timeout = setTimeout(async () => {

    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=10`);
      const data = await res.json();

      let productos = data.products
        .filter(p =>
          p.product_name &&
          p.product_name.length < 50 &&
          !p.product_name.toLowerCase().includes("undefined")
        );

      // priorizar español
      productos.sort((a, b) => {
        const esA = (a.lang || "").includes("es") ? 1 : 0;
        const esB = (b.lang || "").includes("es") ? 1 : 0;
        return esB - esA;
      });

      contenedor.innerHTML = productos.slice(0, 5).map(p => `
        <div class="sugerencia" onclick="seleccionarProducto(${numero}, '${p.product_name.replace(/'/g, "")}')">
          ${p.product_name}
        </div>
      `).join("");

    } catch (e) {
      console.error("Error buscando:", e);
    }

  }, 300);
}

// ==========================
// 📌 SELECCIÓN CONTROLADA
// ==========================
function seleccionarProducto(numero, nombre) {

  const input = document.getElementById("barcode" + numero);
  input.value = nombre;

  if (numero === 1) productoSeleccionado1 = nombre;
  if (numero === 2) productoSeleccionado2 = nombre;

  cerrarSugerencias();
}

// ==========================
// ❌ CERRAR SUGERENCIAS
// ==========================
function cerrarSugerencias() {
  document.getElementById("sugerencias1").innerHTML = "";
  document.getElementById("sugerencias2").innerHTML = "";
}

// click fuera
document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("input-busqueda")) {
    cerrarSugerencias();
  }
});

// escribir invalida selección previa
document.getElementById("barcode1").addEventListener("input", () => {
  productoSeleccionado1 = null;
});

document.getElementById("barcode2").addEventListener("input", () => {
  productoSeleccionado2 = null;
});

// ==========================
// 🔎 BUSCAR PRODUCTO ROBUSTO
// ==========================
async function buscarProducto(nombre) {

  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=5`);
  const data = await res.json();

  return data.products.find(p =>
    p.product_name &&
    p.nutriments
  );
}

// ==========================
// 🧠 SCORE SIMPLE (BASE)
// ==========================
function calcularScore(p) {

  const n = p.nutriments || {};
  let score = 10;

  if ((n.sugars_100g || 0) > 10) score -= 3;
  if ((n.fat_100g || 0) > 15) score -= 2;
  if ((n["energy-kcal_100g"] || 0) > 300) score -= 2;

  return Math.max(score, 1);
}

// ==========================
// ⚔️ COMPARACIÓN PRO
// ==========================
async function compararProductos() {

  cerrarSugerencias();

  const resultado = document.getElementById("resultado");

  // 🚨 VALIDACIÓN PRO
  if (!productoSeleccionado1 || !productoSeleccionado2) {
    resultado.innerHTML = "⚠️ Selecciona productos de la lista";
    return;
  }

  resultado.innerHTML = "Comparando...";

  try {

    const p1 = await buscarProducto(productoSeleccionado1);
    const p2 = await buscarProducto(productoSeleccionado2);

    if (!p1 || !p2) {
      resultado.innerHTML = "❌ No se encontraron datos fiables";
      return;
    }

    const s1 = calcularScore(p1);
    const s2 = calcularScore(p2);

    let ganador = "";
    if (s1 > s2) ganador = "🟢 Producto 1 mejor";
    else if (s2 > s1) ganador = "🟢 Producto 2 mejor";
    else ganador = "🟡 Empate";

    resultado.innerHTML = `
      <div class="card">
        <h3>${p1.product_name}</h3>
        <p>Score: ${s1}/10</p>
      </div>

      <div class="card">
        <h3>${p2.product_name}</h3>
        <p>Score: ${s2}/10</p>
      </div>

      <h2>${ganador}</h2>
    `;

  } catch (e) {
    console.error(e);
    resultado.innerHTML = "❌ Error real al comparar";
  }
}