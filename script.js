let producto1 = null;
let producto2 = null;
let scannerActivo = false;

function escanearProducto(numero) {
  if (scannerActivo) return;

  scannerActivo = true;

  const reader = new Html5Qrcode("reader");

  reader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    async (codigo) => {
      await reader.stop();
      scannerActivo = false;

      const producto = await buscarProducto(codigo);

      if (!producto) return;

      if (numero === 1) producto1 = producto;
      else producto2 = producto;

      mostrarEstado();

      if (producto1 && producto2) {
        compararProductos();
      }
    }
  ).catch(err => {
    console.error(err);
    alert("Error con la cámara");
  });
}

async function buscarProducto(codigo) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
    const data = await res.json();

    if (data.status === 0) return null;

    const p = data.product;

    return {
      nombre: p.product_name || "Producto",
      azucar: p.nutriments?.sugars_100g ?? 0,
      grasa: p.nutriments?.fat_100g ?? 0,
      proteina: p.nutriments?.proteins_100g ?? 0,
      fibra: p.nutriments?.fiber_100g ?? 0,
      sal: p.nutriments?.salt_100g ?? 0
    };

  } catch (e) {
    console.error(e);
    return null;
  }
}

// 🧠 SCORE → 0 a 100
function calcularScore(p) {
  let penalizacion =
    p.azucar * 2 +
    p.grasa * 1.5 +
    p.sal * 2 -
    p.proteina * 1.2 -
    p.fibra * 1.5;

  let score = 100 - penalizacion;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return Math.round(score);
}

// 🎨 SEMÁFORO
function obtenerColor(score) {
  if (score >= 70) return "verde";
  if (score >= 40) return "amarillo";
  return "rojo";
}

function mostrarEstado() {
  const r = document.getElementById("resultado");

  r.innerHTML = `
    <div class="card">
      <div class="titulo">Producto 1:</div>
      ${producto1 ? producto1.nombre : "No escaneado"}

      <div class="titulo" style="margin-top:10px;">Producto 2:</div>
      ${producto2 ? producto2.nombre : "No escaneado"}
    </div>
  `;
}

function compararProductos() {
  const r = document.getElementById("resultado");

  const score1 = calcularScore(producto1);
  const score2 = calcularScore(producto2);

  const mejor = score1 > score2 ? producto1 : producto2;
  const peor = score1 > score2 ? producto2 : producto1;

  const scoreMejor = Math.max(score1, score2);
  const scorePeor = Math.min(score1, score2);

  const colorMejor = obtenerColor(scoreMejor);
  const colorPeor = obtenerColor(scorePeor);

  r.innerHTML = `
    <div class="card">
      <h2>🏆 Mejor opción</h2>
      <strong>${mejor.nombre}</strong>

      <div class="score ${colorMejor}">
        ${scoreMejor}/100
      </div>

      <p>✔ Mejor perfil nutricional</p>
    </div>

    <div class="card">
      <h3>⚠️ Menos recomendable</h3>
      <strong>${peor.nombre}</strong>

      <div class="score ${colorPeor}">
        ${scorePeor}/100
      </div>
    </div>
  `;
}

function reiniciar() {
  producto1 = null;
  producto2 = null;

  document.getElementById("reader").innerHTML = "";
  document.getElementById("resultado").innerHTML = "<p>🔄 Listo para nueva comparación</p>";
}