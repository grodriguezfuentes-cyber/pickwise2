let timeout = null;

// ==========================
// 🔍 BUSCADOR MEJORADO
// ==========================
function buscarSugerencias(texto, numero) {

  clearTimeout(timeout);

  if (texto.length < 3) {
    document.getElementById("sugerencias" + numero).innerHTML = "";
    return;
  }

  timeout = setTimeout(async () => {

    try {
      const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=10`);
      const data = await res.json();

      const contenedor = document.getElementById("sugerencias" + numero);

      const textoLower = texto.toLowerCase();

      // 🔥 FILTRO INTELIGENTE
      const productosFiltrados = data.products
        .filter(p => p.product_name)
        .filter(p => p.product_name.toLowerCase().includes(textoLower))
        .slice(0, 5);

      contenedor.innerHTML = productosFiltrados.map(p => `
        <div class="sugerencia" onclick="seleccionarProducto('${p.product_name.replace(/'/g, "")}', ${numero})">
          ${p.product_name}
        </div>
      `).join("");

    } catch (error) {
      console.error(error);
    }

  }, 400);
}

// ==========================
// 📌 SELECCIONAR
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
      document.getElementById("resultado").innerHTML = "Producto no encontrado";
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