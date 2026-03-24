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
        .filter(p => p.product_name && p.product_name.length < 50)
        .slice(0, 5);

      if (productos.length === 0) {
        contenedor.innerHTML = `<div class="sugerencia">No hay resultados</div>`;
        return;
      }

      contenedor.innerHTML = productos.map(p => `
        <div class="sugerencia" onclick='seleccionarProducto(${numero}, ${JSON.stringify(p)})'>
          ${p.product_name}
        </div>
      `).join("");

    } catch (e) {
      console.error(e);
      contenedor.innerHTML = `<div class="sugerencia">Error al buscar</div>`;
    }

  }, 100); // ⚡ MÁS RÁPIDO
}