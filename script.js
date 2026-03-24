
// ==========================
// 🔎 OBTENER PRODUCTO POR CÓDIGO
// ==========================
async function obtenerProducto(codigo) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.product || null;
}

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
// 🧮 CONTAR INGREDIENTES
// ==========================
function contarIngredientes(texto) {
  if (!texto) return 0;
  return texto.split(",").length;
}

// ==========================
// ⭐ SCORE NUTRICIONAL
// ==========================
function calcularScore(producto) {
  let score = 10;

  const ingredientes = (producto.ingredients_text || "").toLowerCase();
  const numIngredientes = contarIngredientes(ingredientes);
  const nutriments = producto.nutriments || {};

  const azucar = nutriments.sugars_100g || 0;
  const grasa = nutriments.fat_100g || 0;
  const calorias = nutriments["energy-kcal_100g"] || 0;

  if (numIngredientes > 15) score -= 3;
  else if (numIngredientes > 10) score -= 2;
  else if (numIngredientes > 5) score -= 1;

  if (azucar > 20) score -= 4;
  else if (azucar > 10) score -= 2;
  else if (azucar > 5) score -= 1;

  if (grasa > 20) score -= 3;
  else if (grasa > 10) score -= 2;

  if (calorias > 500) score -= 2;
  else if (calorias > 300) score -= 1;

  if (ingredientes.includes("syrup")) score -= 2;
  if (ingredientes.includes("hydrogenated")) score -= 2;
  if (ingredientes.includes("maltodextrin")) score -= 2;

  if (/e\d{3}/.test(ingredientes)) score -= 2;

  if (score < 1) score = 1;

  return score;
}

// ==========================
// 🧠 ANÁLISIS DEL PRODUCTO
// ==========================
function analizarProducto(producto) {
  const mensajes = [];

  const ingredientes = (producto.ingredients_text || "").toLowerCase();
  const nutriments = producto.nutriments || {};

  const azucar = nutriments.sugars_100g || 0;
  const grasa = nutriments.fat_100g || 0;
  const proteina = nutriments.proteins_100g || 0;
  const calorias = nutriments["energy-kcal_100g"] || 0;

  const numIngredientes = contarIngredientes(ingredientes);

  if (azucar > 15) mensajes.push("⚠️ Alto en azúcar");
  else if (azucar < 5) mensajes.push("✅ Bajo en azúcar");

  if (grasa > 20) mensajes.push("⚠️ Alto en grasa");

  if (calorias > 400) mensajes.push("⚠️ Muy calórico");
  else if (calorias < 150) mensajes.push("✅ Bajo en calorías");

  if (proteina > 10) mensajes.push("💪 Buena fuente de proteína");

  if (numIngredientes > 15) mensajes.push("⚠️ Muy procesado");
  else if (numIngredientes < 5) mensajes.push("✅ Pocos ingredientes");

  if (ingredientes.includes("syrup")) mensajes.push("⚠️ Contiene jarabes");
  if (ingredientes.includes("maltodextrin")) mensajes.push("⚠️ Contiene aditivos");
  if (/e\d{3}/.test(ingredientes)) mensajes.push("⚠️ Contiene aditivos");

  return mensajes;
}

// ==========================
// 🎨 COLOR DEL SCORE
// ==========================
function obtenerColor(score) {
  if (score >= 7) return "green";
  if (score >= 4) return "orange";
  return "red";
}

// ==========================
// 🔍 BUSCADOR INTELIGENTE
// ==========================
let timeout = null;

function buscarSugerencias(texto, numero) {
  clearTimeout(timeout);

  if (texto.length < 2) {
    document.getElementById("sugerencias" + numero).innerHTML = "";
    return;
  }

  timeout = setTimeout(async () => {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=5`;

    const res = await fetch(url);
    const data = await res.json();

    const sugerencias = data.products || [];

    const contenedor = document.getElementById("sugerencias" + numero);

    contenedor.innerHTML = sugerencias.map(p => `
      <div class="sugerencia" onclick="seleccionarProducto('${p.code}', ${numero})">
        ${p.product_name || "Sin nombre"}
      </div>
    `).join("");
  }, 300);
}

// ==========================
// 📌 SELECCIONAR PRODUCTO
// ==========================
function seleccionarProducto(codigo, numero) {
  document.getElementById("barcode" + numero).value = codigo;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}

// ==========================
// ⚔️ COMPARAR PRODUCTOS
// ==========================
async function compararProductos() {
  const input1 = document.getElementById("barcode1").value;
  const input2 = document.getElementById("barcode2").value;

  if (!input1 || !input2) {
    document.getElementById("resultado").innerHTML = "Introduce ambos productos";
    return;
  }

  try {
    // 👉 Detecta si es código o nombre
    const p1 = isNaN(input1) ? await buscarPorNombre(input1) : await obtenerProducto(input1);
    const p2 = isNaN(input2) ? await buscarPorNombre(input2) : await obtenerProducto(input2);

    if (!p1 || !p2) {
      document.getElementById("resultado").innerHTML = "Producto no encontrado";
      return;
    }

    const score1 = calcularScore(p1);
    const score2 = calcularScore(p2);

    const analisis1 = analizarProducto(p1);
    const analisis2 = analizarProducto(p2);

    const color1 = obtenerColor(score1);
    const color2 = obtenerColor(score2);

    const nombre1 = p1.product_name || "Sin nombre";
    const nombre2 = p2.product_name || "Sin nombre";

    const marca1 = p1.brands || "N/A";
    const marca2 = p2.brands || "N/A";

    const ing1 = contarIngredientes(p1.ingredients_text || "");
    const ing2 = contarIngredientes(p2.ingredients_text || "");

    let ganador = "";
    let explicacion = "";

    if (score1 > score2) {
      ganador = "🟢 Producto 1 es mejor";
      explicacion = "Tiene mejor puntuación nutricional.";
    } else if (score2 > score1) {
      ganador = "🟢 Producto 2 es mejor";
      explicacion = "Tiene mejor puntuación nutricional.";
    } else {
      ganador = "🟡 Son similares";
      explicacion = "Tienen la misma puntuación.";
    }

    document.getElementById("resultado").innerHTML = `
      <div class="contenedor">
        <div class="card">
          <h2>${nombre1}</h2>
          <p><strong>Marca:</strong> ${marca1}</p>
          <p><strong>Ingredientes:</strong> ${ing1}</p>
          <p><strong>Score:</strong> <span style="color:${color1}; font-weight:bold;">${score1}/10</span></p>
          <ul>${analisis1.map(a => `<li>${a}</li>`).join("")}</ul>
        </div>

        <div class="card">
          <h2>${nombre2}</h2>
          <p><strong>Marca:</strong> ${marca2}</p>
          <p><strong>Ingredientes:</strong> ${ing2}</p>
          <p><strong>Score:</strong> <span style="color:${color2}; font-weight:bold;">${score2}/10</span></p>
          <ul>${analisis2.map(a => `<li>${a}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="resultado-final">
        <h2>${ganador}</h2>
        <p>${explicacion}</p>
      </div>
    `;

  } catch (error) {
    console.error(error);
    document.getElementById("resultado").innerHTML = "Error al comparar";
  }
}