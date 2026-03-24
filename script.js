
// CONTROL DE PETICIONES
let timeout = null;
let ultimaBusqueda = "";

// ==========================
// 🔍 BUSCADOR INTELIGENTE (MEJORADO)
// ==========================
function buscarSugerencias(texto, numero) {

  ultimaBusqueda = texto;

  clearTimeout(timeout);

  if (texto.length < 2) {
    document.getElementById("sugerencias" + numero).innerHTML = "";
    return;
  }

  timeout = setTimeout(async () => {

    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=5`);
      const data = await res.json();

      // ❌ Evita resultados viejos
      if (texto !== ultimaBusqueda) return;

      const contenedor = document.getElementById("sugerencias" + numero);

      contenedor.innerHTML = data.products
        .filter(p => p.product_name)
        .map(p => `
          <div class="sugerencia" onclick="seleccionarProducto('${p.product_name.replace(/'/g, "")}', ${numero})">
            ${p.product_name}
          </div>
        `).join("");

    } catch (error) {
      console.error("Error búsqueda", error);
    }

  }, 400); // ⏱️ espera antes de buscar
}

// ==========================
// 📌 SELECCIONAR PRODUCTO
// ==========================
function seleccionarProducto(nombre, numero) {
  document.getElementById("barcode" + numero).value = nombre;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}

// ==========================
// 🔎 BUSCAR PRODUCTO
// ==========================
async function buscarProducto(nombre) {
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=1`);
  const data = await res.json();
  return data.products[0];
}

// ==========================
// ⚔️ COMPARAR
// ==========================
async function compararProductos() {

  const n1 = document.getElementById("barcode1").value.trim();
  const n2 = document.getElementById("barcode2").value.trim();

  if (!n1 || !n2) {
    document.getElementById("resultado").innerHTML = "Introduce ambos productos";
    return;
  }

  document.getElementById("resultado").innerHTML = "Buscando...";

  try {

    const p1 = await buscarProducto(n1);
    const p2 = await buscarProducto(n2);

    if (!p1 || !p2) {
      document.getElementById("resultado").innerHTML = "No se encontraron productos";
      return;
    }

    document.getElementById("resultado").innerHTML = `
      <h2>Resultado</h2>
      <p>${p1.product_name}</p>
      <p>${p2.product_name}</p>
    `;

  } catch (error) {
    document.getElementById("resultado").innerHTML = "Error al comparar";
  }
}