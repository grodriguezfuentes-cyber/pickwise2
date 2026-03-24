async function obtenerProducto(codigo) {
  const url = `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`;
  const res = await fetch(url);
  const data = await res.json();
  return data.product || null;
}

async function buscarPorNombre(nombre) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.products && data.products.length > 0) {
    return data.products[0];
  }

  return null;
}

function contarIngredientes(texto) {
  if (!texto) return 0;
  return texto.split(",").length;
}

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

function peorAspecto(analisis) {
  if (analisis.length === 0) return "✅ Bastante equilibrado";
  return analisis[0];
}

function obtenerColor(score) {
  if (score >= 7) return "green";
  if (score >= 4) return "orange";
  return "red";
}

function obtenerEtiqueta(score) {
  if (score >= 8) return "⭐ Recomendado";
  if (score >= 6) return "✅ Buena opción";
  if (score >= 4) return "⚠️ Mejor evitar";
  return "❌ No recomendado";
}

async function compararProductos() {
  const input1 = document.getElementById("barcode1").value;
  const input2 = document.getElementById("barcode2").value;

  if (!input1 || !input2) {
    document.getElementById("resultado").innerHTML = "Introduce ambos productos";
    return;
  }

  try {
    let p1, p2;

    if (isNaN(input1)) {
      p1 = await buscarPorNombre(input1);
    } else {
      p1 = await obtenerProducto(input1);
    }

    if (isNaN(input2)) {
      p2 = await buscarPorNombre(input2);
    } else {
      p2 = await obtenerProducto(input2);
    }

    if (!p1 || !p2) {
      document.getElementById("resultado").innerHTML = "Producto no encontrado";
      return;
    }

    const analisis1 = analizarProducto(p1);
    const analisis2 = analizarProducto(p2);

    const peor1 = peorAspecto(analisis1);
    const peor2 = peorAspecto(analisis2);

    const nombre1 = p1.product_name || "Sin nombre";
    const nombre2 = p2.product_name || "Sin nombre";

    const marca1 = p1.brands || "N/A";
    const marca2 = p2.brands || "N/A";

    const ing1 = contarIngredientes(p1.ingredients_text || "");
    const ing2 = contarIngredientes(p2.ingredients_text || "");

    const score1 = calcularScore(p1);
    const score2 = calcularScore(p2);

    const color1 = obtenerColor(score1);
    const color2 = obtenerColor(score2);

    const etiqueta1 = obtenerEtiqueta(score1);
    const etiqueta2 = obtenerEtiqueta(score2);

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
          <p><strong>${etiqueta1}</strong></p>
          <p style="color:red;"><strong>${peor1}</strong></p>
          <p><strong>Marca:</strong> ${marca1}</p>
          <p><strong>Ingredientes:</strong> ${ing1}</p>
          <p><strong>Score:</strong> 
            <span style="color:${color1}; font-weight:bold;">
              ${score1}/10
            </span>
          </p>
          <ul>
            ${analisis1.map(m => `<li>${m}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h2>${nombre2}</h2>
          <p><strong>${etiqueta2}</strong></p>
          <p style="color:red;"><strong>${peor2}</strong></p>
          <p><strong>Marca:</strong> ${marca2}</p>
          <p><strong>Ingredientes:</strong> ${ing2}</p>
          <p><strong>Score:</strong> 
            <span style="color:${color2}; font-weight:bold;">
              ${score2}/10
            </span>
          </p>
          <ul>
            ${analisis2.map(m => `<li>${m}</li>`).join("")}
          </ul>
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
let timeout = null;

function buscarSugerencias(texto, numero) {
  clearTimeout(timeout);

  if (texto.length < 3) {
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
      <div class="sugerencia" onclick="seleccionarProducto('${p.product_name}', '${numero}')">
        ${p.product_name || "Sin nombre"}
      </div>
    `).join("");
  }, 300);
}

function seleccionarProducto(nombre, numero) {
  document.getElementById("barcode" + numero).value = nombre;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}