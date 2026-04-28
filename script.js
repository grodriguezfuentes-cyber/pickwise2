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


// 🔎 BUSCAR PRODUCTO
function buscarProducto(barcode, numero) {

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

      // 🔥 FIX CALORÍAS (kcal o kJ)
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
    });
}


// 🧠 PROCESAR
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

  // 💥 FRASE INTELIGENTE
  let mensaje = "";

  if (ganador.calorias < perdedor.calorias) {
    mensaje = "🔥 Tiene menos calorías";
  } else if (ganador.azucar < perdedor.azucar) {
    mensaje = "🍬 Tiene menos azúcar";
  } else {
    mensaje = "👍 Mejor perfil nutricional";
  }

  document.getElementById("resultado").innerHTML = `
    <div class="card winner">
      <h3>🏆 Mejor opción</h3>
      <p><strong>${ganador.nombre}</strong></p>
      <p class="calorias">🔥 ${ganador.calorias} kcal</p>
      <p class="mensaje">${mensaje}</p>

      <small>
        Azúcar: ${ganador.azucar}g · 
        Grasa: ${ganador.grasa}g · 
        Proteína: ${ganador.proteina}g
      </small>
    </div>

    <div class="card loser">
      <h3>⚠️ Menos recomendable</h3>
      <p><strong>${perdedor.nombre}</strong></p>
      <p class="calorias">🔥 ${perdedor.calorias} kcal</p>

      <small>
        Azúcar: ${perdedor.azucar}g · 
        Grasa: ${perdedor.grasa}g · 
        Proteína: ${perdedor.proteina}g
      </small>
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