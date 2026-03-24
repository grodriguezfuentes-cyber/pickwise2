
// BUSCAR SUGERENCIAS
function buscarSugerencias(texto, numero) {

  if (texto.length < 2) {
    document.getElementById("sugerencias" + numero).innerHTML = "";
    return;
  }

  fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${texto}&search_simple=1&action=process&json=1&page_size=5`)
    .then(res => res.json())
    .then(data => {

      const contenedor = document.getElementById("sugerencias" + numero);

      contenedor.innerHTML = data.products.map(p => `
        <div class="sugerencia" onclick="seleccionarProducto('${p.product_name}', ${numero})">
          ${p.product_name}
        </div>
      `).join("");

    })
    .catch(err => console.error(err));
}

// SELECCIONAR
function seleccionarProducto(nombre, numero) {
  document.getElementById("barcode" + numero).value = nombre;
  document.getElementById("sugerencias" + numero).innerHTML = "";
}

// BUSCAR PRODUCTO
async function buscarProducto(nombre) {
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=1`);
  const data = await res.json();
  return data.products[0];
}

// COMPARAR
async function compararProductos() {

  const n1 = document.getElementById("barcode1").value;
  const n2 = document.getElementById("barcode2").value;

  if (!n1 || !n2) {
    document.getElementById("resultado").innerHTML = "Introduce ambos productos";
    return;
  }

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