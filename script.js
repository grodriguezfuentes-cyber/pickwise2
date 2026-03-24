let timeout = null;

// ==========================
// 🔍 BUSCADOR
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

      let productos = data.products.filter(p => p.product_name);

      contenedor.innerHTML = productos.slice(0, 5).map(p => `
        <div class="sugerencia" onclick="seleccionarProducto(${numero}, '${p.product_name.replace(/'/g, "")}')">
          ${p.product_name}
        </div>
      `).join("");

    } catch (e) {
      console.error(e);
    }

  }, 300);
}

// ==========================
// 📌 SELECCIONAR
// ==========================
function seleccionarProducto(numero, nombre) {
  document.getElementById("barcode" + numero).value = nombre;
  cerrarSugerencias();
}

// ==========================
// ❌ CERRAR
// ==========================
function cerrarSugerencias() {
  document.getElementById("sugerencias1").innerHTML = "";
  document.getElementById("sugerencias2").innerHTML = "";
}

document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("input-busqueda")) {
    cerrarSugerencias();
  }
});

// ==========================
// 🔎 BUSCAR PRODUCTO (FIX)
// ==========================
async function buscarProducto(nombre) {

  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=5`);
  const data = await res.json();

  // 🔥 fallback inteligente
  return data.products.find(p => p.product_name) || data.products[0];
}

// ==========================
// 🧠 SCORE (SEGURO)
// ==========================
function calcularScore(p) {

  if (!p || !p.nutriments) return 5; // valor neutro

  const n = p.nutriments;

  let score = 10;

  if ((n.sugars_100g || 0) > 10) score -= 3;
  if ((n.fat_100g || 0) > 15) score -= 2;
  if ((n["energy-kcal_100g"] || 0) > 300) score -= 2;

  return Math.max(score, 1);
}

// ==========================
// ⚔️ COMPARAR (ROBUSTO)
// ==========================
async function compararProductos() {

  cerrarSugerencias();

  const n1 = document.getElementById("barcode1").value.trim();
  const n2 = document.getElementById("barcode2").value.trim();

  const resultado = document.getElementById("resultado");

  if (!n1 || !n2) {
    resultado.innerHTML = "⚠️ Escribe ambos productos";
    return;
  }

  resultado.innerHTML = "Comparando...";

  try {

    const p1 = await buscarProducto(n1);
    const p2 = await buscarProducto(n2);

    if (!p1 || !p2) {
      resultado.innerHTML = "❌ No se encontraron productos";
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
        <h3>${p1.product_name || "Producto 1"}</h3>
        <p>Score: ${s1}/10</p>
      </div>

      <div class="card">
        <h3>${p2.product_name || "Producto 2"}</h3>
        <p>Score: ${s2}/10</p>
      </div>

      <h2>${ganador}</h2>
    `;

  } catch (e) {
    console.error(e);
    resultado.innerHTML = "❌ Error al comparar";
  }
}