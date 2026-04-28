let producto1 = null;
let producto2 = null;
let scanner = null;

let cache = JSON.parse(localStorage.getItem("productos")) || {};

function escanearProducto(numero) {

  const reader = document.getElementById("reader");

  if (!reader) return;

  reader.innerHTML = "📷 Activando cámara...";

  if (scanner) {
    try {
      scanner.stop().catch(() => {});
      scanner.clear();
    } catch {}
    scanner = null;
  }

  setTimeout(() => {

    reader.innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      { fps: 5, qrbox: { width: 250, height: 200 } },
      (decodedText) => {

        scanner.stop().then(() => {
          scanner.clear();
          scanner = null;
          reader.innerHTML = "";
        });

        buscarProducto(decodedText, numero);
      }
    );

  }, 300);
}


function buscarProducto(barcode, numero) {

  if (cache[barcode]) {
    procesarProducto(cache[barcode], numero);
    return;
  }

  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?nocache=${Date.now()}`)
    .then(res => res.json())
    .then(data => {

      if (!data.product) {
        mostrarError("Producto no encontrado");
        return;
      }

      const p = data.product;

      let kcal = p.nutriments?.["energy-kcal_100g"];

      if (!kcal && p.nutriments?.energy_100g) {
        kcal = p.nutriments.energy_100g / 4.184;
      }

      const producto = {
        nombre: p.product_name || "Sin nombre",
        calorias: Math.round(kcal || 0),
        azucar: parseFloat(p.nutriments?.sugars_100g) || 0,
        grasa: parseFloat(p.nutriments?.fat_100g) || 0,
        proteina: parseFloat(p.nutriments?.proteins_100g) || 0,
        fibra: parseFloat(p.nutriments?.fiber_100g) || 0,
        sal: parseFloat(p.nutriments?.salt_100g) || 0
      };

      cache[barcode] = producto;
      localStorage.setItem("productos", JSON.stringify(cache));

      procesarProducto(producto, numero);
    })
    .catch(() => mostrarError("Error al buscar producto"));
}


function procesarProducto(producto, numero) {

  if (numero === 1) producto1 = producto;
  else producto2 = producto;

  if (producto1 && producto2) comparar();
}


function comparar() {

  let ganador = producto1;
  let perdedor = producto2;

  if (producto2.calorias < producto1.calorias) {
    ganador = producto2;
    perdedor = producto1;
  }

  document.getElementById("resultado").innerHTML = `
    <div>
      <h3>🏆 Mejor opción</h3>
      <p><strong>${ganador.nombre}</strong></p>
      <h2>🔥 ${ganador.calorias} kcal</h2>
    </div>

    <div>
      <h3>⚠️ Menos recomendable</h3>
      <p><strong>${perdedor.nombre}</strong></p>
      <h2>🔥 ${perdedor.calorias} kcal</h2>
    </div>
  `;
}


function reiniciar() {
  producto1 = null;
  producto2 = null;
  document.getElementById("resultado").innerHTML = "";
}


function mostrarError(msg) {
  document.getElementById("resultado").innerHTML = `<p>${msg}</p>`;
}