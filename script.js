
// ==========================
// 🔎 BUSCAR PRODUCTO POR NOMBRE
// ==========================
async function buscarPorNombre(nombre) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=1`;

  const res = await fetch(url);
  const data = await res.json();

  return data.products[0] || null;
}

// ==========================
// 🔎 BUSCADOR INTELIGENTE
// ==========================
let timeout = null;

function buscarSugerencias(texto, numero) {
  clearTimeout(timeout);

  if (texto.length < 2) {
    document.getElementById("sugerencias" + numero).innerHTML = "";
    return;
  }

  timeout = setTimeout(async () => {
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=5`;

      const res = await fetch(url);
      const data = await res.json();

      const sugerencias = data.products || [];

      const contenedor = document.getElementById("sugerencias" + numero);

      contenedor.innerHTML = sugerencias.map(p => `
        <div class="sugerencia" onclick="seleccionarProducto('${p.product_name.replace(/'/g, "")}', ${numero})">
          ${p.product_name || "Sin nombre"}
        </div>
      `).join("");

    } catch (error) {
      console.error("Error en sugerencias", error);
    }
  }, 300);
}

// ==========================
// 📌 SELECCIONAR PRODUCTO
// ==========================
function seleccionarProducto(nombre, numero) {
  document.getElementById("barcode" + numero).value = nombre;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}

// ==========================
// 🧮 CONTAR INGREDIENTES
// ==========================
function contarIngredientes(texto) {
  if (!texto) return 0;
  return texto.split(",").length;
}

// ==========================
// ⭐ SCORE
// ==========================
function calcularScore(producto) {
  let score = 10;

  const ingredientes = (producto.ingredients_text || "").toLowerCase();
  const numIngredientes = contarIngredientes(ingredientes);
  const nutriments = producto.nutriments || {};

  const azucar = nutriments.sugars_100g || 0;
  const grasa = nutriments.fat_100g || 0;

  if (numIngredientes > 15) score -= 3;
  if (azucar > 10) score -= 3;
  if (grasa > 15) score -= 2;

  if (score < 1) score = 1;

  return score;
}

// ==========================
// ⚔️ COMPARAR
// ==========================
async function compararProductos() {
  const nombre1 = document.getElementById("barcode1").value;
  const nombre2 = document.getElementById("barcode2").value;

  if (!nombre1 || !nombre2) {
    document.getElementById("resultado").innerHTML = "Introduce ambos productos";
    return;
  }

  try {
    const p1 = await buscarPorNombre(nombre1);
    const p2 = await buscarPorNombre(nombre2);

    if (!p1 || !p2) {
      document.getElementById("resultado").innerHTML = "Producto no encontrado";
      return;
    }

    const score1 = calcularScore(p1);
    const score2 = calcularScore(p2);

    const ganador = score1 > score2 
      ? "🟢 Producto 1 mejor"
      : score2 > score1
      ? "🟢 Producto 2 mejor"
      : "🟡 Son similares";

    document.getElementById("resultado").innerHTML = `
      <h2>${ganador}</h2>
      <p>${p1.product_name} (${score1}/10)</p>
      <p>${p2.product_name} (${score2}/10)</p>
    `;

  } catch (error) {
    console.error(error);
    document.getElementById("resultado").innerHTML = "Error al comparar";
  }
}