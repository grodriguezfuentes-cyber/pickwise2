let producto1 = null;
let producto2 = null;
let scanner = null;

// 📦 CACHE LOCAL
let cache = JSON.parse(localStorage.getItem("productos")) || {};

// 📷 ESCANEAR
function escanearProducto(numero) {

  const reader = document.getElementById("reader");

  reader.innerHTML = "<p class='status'>📷 Activando cámara...</p>";

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
      {
        fps: 5,
        qrbox: { width: 280, height: 180 }
      },
      (decodedText) => {

        scanner.stop().then(() => {
          scanner.clear();
          scanner = null;
          reader.innerHTML = "";
        });

        document.getElementById("resultado").innerHTML =
          "<p class='status'>⚡ Procesando código...</p>";

        buscarProducto(decodedText, numero);
      },
      () => {}
    );

  }, 300);
}


// 🔎 BUSCAR PRODUCTO (OPTIMIZADO)
function buscarProducto(barcode, numero) {

  // 🧠 PRIMERO BUSCA EN CACHE
  if (cache[barcode]) {
    procesarProducto(cache[barcode], numero);
    return;
  }

  document.getElementById("resultado").innerHTML =
    "<p class='status'>🔍 Analizando producto...</p>";

  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(res => res.json())
    .then(data => {

      if (!data.product) {
        mostrarError("Producto no encontrado");
        return;
      }

      const p = data.product;

      const producto = {
        nombre: p.product_name || "Sin nombre",
        azucar: parseFloat(p.nutriments?.sugars_100g) || 0,
        grasa: parseFloat(p.nutriments?.fat_100g) || 0,
        proteina: parseFloat(p.nutriments?.proteins_100g) || 0,
        fibra: parseFloat(p.nutriments?.fiber_100g) || 0,
        sal: parseFloat(p.nutriments?.salt_100g) || 0
      };

      // 💾 GUARDAR EN CACHE
      cache[barcode] = producto;
      localStorage.setItem("productos", JSON.stringify(cache));

      procesarProducto(producto, numero);
    });
}


// 🧠 PROCESAR PRODUCTO
function procesarProducto(producto, numero) {

  if (numero === 1) {
    producto1 = producto;
  } else {
    producto2 = producto;
  }

  if (producto1 && producto2) {
    comparar();
  } else {
    document.getElementById("resultado").innerHTML =
      `<p class="status">✔ Producto ${numero} escaneado. Falta el otro.</p>`;
  }
}


// 🧠 SCORE
function score(p) {
  return (
    (p.proteina * 2) +
    (p.fibra * 2) -
    (p.azucar * 1.5) -
    (p.grasa * 1.2) -
    (p.sal * 1.5)
  );
}


// ⚖️ COMPARAR
function comparar() {

  const s1 = score(producto1);
  const s2 = score(producto2);

  let ganador, perdedor;

  if (s1 > s2) {
    ganador = producto1;
    perdedor = producto2;
  } else {
    ganador = producto2;
    perdedor = producto1;
  }

  document.getElementById("resultado").innerHTML = `
    <div class="card winner">
      <h3>🏆 Mejor opción</h3>
      <p><strong>${ganador.nombre}</strong></p>
      <p>Azúcar: ${ganador.azucar}g</p>
      <p>Grasa: ${ganador.grasa}g</p>
      <p>Proteína: ${ganador.proteina}g</p>
      <p>Fibra: ${ganador.fibra}g</p>
      <p>Sal: ${ganador.sal}g</p>
      <p class="score verde">${Math.round(score(ganador))}</p>
    </div>

    <div class="card loser">
      <h3>⚠️ Menos recomendable</h3>
      <p><strong>${perdedor.nombre}</strong></p>
      <p>Azúcar: ${perdedor.azucar}g</p>
      <p>Grasa: ${perdedor.grasa}g</p>
      <p>Proteína: ${perdedor.proteina}g</p>
      <p>Fibra: ${perdedor.fibra}g</p>
      <p>Sal: ${perdedor.sal}g</p>
      <p class="score rojo">${Math.round(score(perdedor))}</p>
    </div>
  `;
}


// 🔄 REINICIAR
function reiniciar() {
  producto1 = null;
  producto2 = null;

  if (scanner) {
    try {
      scanner.stop().catch(() => {});
      scanner.clear();
    } catch {}
    scanner = null;
  }

  document.getElementById("reader").innerHTML = "";
  document.getElementById("resultado").innerHTML = "";
}


// ❌ ERROR
function mostrarError(msg) {
  document.getElementById("resultado").innerHTML =
    `<p style="color:red">${msg}</p>`;
}