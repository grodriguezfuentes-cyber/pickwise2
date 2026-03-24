// ==========================
// 🧠 ESTADO GLOBAL
// ==========================
let producto1 = null;
let producto2 = null;
let timeout = null;

// ==========================
// 🔍 BUSCAR SUGERENCIAS
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
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(texto)}&search_simple=1&action=process&json=1&page_size=20`;

      const res = await fetch(url);

      if (!res.ok) {
        contenedor.innerHTML = "";
        return;
      }

      const data = await res.json();

      if (!data.products) {
        contenedor.innerHTML = "";
        return;
      }

      let productos = data.products
        .filter(p =>
          p.product_name &&
          p.product_name.length < 40 &&
          !p.product_name.includes("{") &&
          !p.product_name.includes("ingredients")
        )
        .slice(0, 5);

      if (productos.length === 0) {
        contenedor.innerHTML = "";
        return;
      }

      contenedor.innerHTML = productos.map(p => `
        <div class="sugerencia" onclick='seleccionarProducto(${numero}, ${JSON.stringify(p)})'>
          ${p.product_name}
        </div>
      `).join("");

    } catch (e) {
      console.warn("La API falló pero seguimos");
      contenedor.innerHTML = "";
    }

  }, 200);
}

// ==========================
// 📌 SELECCIONAR PRODUCTO
// ==========================
function seleccionarProducto(numero, producto) {

  if (numero === 1) {
    producto1 = producto;
    document.getElementById("barcode1").value = producto.product_name;
  } else {
    producto2 = producto;
    document.getElementById("barcode2").value = producto.product_name;
  }

  cerrarSugerencias();
}

// ==========================
// ❌ CERRAR SUGERENCIAS
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
// 🔄 RESET SI EDITA INPUT
// ==========================
function resetProducto(numero) {
  if (numero === 1) producto1 = null;
  if (numero === 2) producto2 = null;
}

// ==========================
// 🧠 CALCULAR SCORE
// ==========================
function calcularScore(p) {

  if (!p || !p.nutriments) return 5;

  const n = p.nutriments;

  let score = 10;

  if ((n.sugars_100g || 0) > 10) score -= 3;
  if ((n.fat_100g || 0) > 15) score -= 2;
  if ((n["energy-kcal_100g"] || 0) > 300) score -= 2;

  return Math.max(score, 1);
}

// ==========================
// 🔎 BUSCAR PRODUCTO DIRECTO
// ==========================
async function buscarProductoPorTexto(nombre) {

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(nombre)}&search_simple=1&action=process&json=1&page_size=5`;

    const res = await fetch(url);

    if (!res.ok) return null;

    const data = await res.json();

    return data.products.find(p => p.product_name);

  } catch {
    return null;
  }
}

// ==========================
// ⚔️ COMPARAR PRODUCTOS
// ==========================
async function compararProductos() {

  cerrarSugerencias();

  const input1 = document.getElementById("barcode1").value.trim();
  const input2 = document.getElementById("barcode2").value.trim();
  const resultado = document.getElementById("resultado");

  if (!input1 || !input2) {
    resultado.innerHTML = "⚠️ Escribe ambos productos";
    return;
  }

  resultado.innerHTML = "Comparando...";

  try {

    // 🔥 Permite comparar aunque no selecciones sugerencia
    if (!producto1) producto1 = await buscarProductoPorTexto(input1);
    if (!producto2) producto2 = await buscarProductoPorTexto(input2);

    if (!producto1 || !producto2) {
      resultado.innerHTML = "❌ No se encontraron productos";
      return;
    }

    const s1 = calcularScore(producto1);
    const s2 = calcularScore(producto2);

    let ganador = "";
    if (s1 > s2) ganador = "🟢 Producto 1 mejor";
    else if (s2 > s1) ganador = "🟢 Producto 2 mejor";
    else ganador = "🟡 Empate";

    resultado.innerHTML = `
      <div class="card">
        <h3>${producto1.product_name}</h3>
        <p>Score: ${s1}/10</p>
      </div>

      <div class="card">
        <h3>${producto2.product_name}</h3>
        <p>Score: ${s2}/10</p>
      </div>

      <h2>${ganador}</h2>
    `;

  } catch (e) {
    console.error(e);
    resultado.innerHTML = "❌ Error al comparar";
  }
}