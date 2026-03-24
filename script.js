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

  timeout = setTimeout(() => {

    fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=5`)
      .then(res => res.json())
      .then(data => {

        const productos = data.products.filter(p => p.product_name);

        contenedor.innerHTML = productos.map(p => `
          <div class="sugerencia" onclick="seleccionarProducto('${p.product_name.replace(/'/g, "")}', ${numero})">
            ${p.product_name}
          </div>
        `).join("");

      });

  }, 300);
}

// ==========================
// 📌 SELECCIONAR
// ==========================
function seleccionarProducto(nombre, numero) {
  document.getElementById("barcode" + numero).value = nombre;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}

// ==========================
// ❌ CERRAR SUGERENCIAS (CLAVE)
// ==========================
function cerrarSugerencias() {
  document.getElementById("sugerencias1").innerHTML = "";
  document.getElementById("sugerencias2").innerHTML = "";
}

// 👉 CLICK FUERA = cerrar
document.addEventListener("click", function(e) {
  if (!e.target.classList.contains("input-busqueda")) {
    cerrarSugerencias();
  }
});

// 👉 escribir en un input cierra el otro
document.getElementById("barcode1").addEventListener("input", () => {
  document.getElementById("sugerencias2").innerHTML = "";
});

document.getElementById("barcode2").addEventListener("input", () => {
  document.getElementById("sugerencias1").innerHTML = "";
});

// ==========================
// 🔎 BUSCAR PRODUCTO
// ==========================
async function buscarProducto(nombre) {
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=5`);
  const data = await res.json();

  const productoValido = data.products.find(p =>
    p.product_name &&
    p.nutriments &&
    p.ingredients_text
  );

  return productoValido || data.products[0];
}

// ==========================
// ⚔️ COMPARAR
// ==========================
async function compararProductos() {

  cerrarSugerencias(); // 🔥 clave UX

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
      <div class="card">
        <h3>${p1.product_name}</h3>
        <p>Marca: ${p1.brands || "N/A"}</p>
      </div>

      <div class="card">
        <h3>${p2.product_name}</h3>
        <p>Marca: ${p2.brands || "N/A"}</p>
      </div>
    `;

  } catch (error) {
    console.error(error);
    document.getElementById("resultado").innerHTML = "Error al comparar";
  }
}