let producto1 = null;
let producto2 = null;
let scannerActivo = false;
let html5QrCode = null;

let historial = [];


// 📷 ESCANEAR
function escanearProducto(numero) {
  if (scannerActivo) return;

  scannerActivo = true;

  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    async (codigo) => {
      await html5QrCode.stop();
      scannerActivo = false;

      const producto = await buscarProducto(codigo);

      if (!producto) return;

      if (numero === 1) producto1 = producto;
      else producto2 = producto;

      // 🔥 ESTO ES CLAVE (NO LO TOCAMOS)
      mostrarEstado();

      if (producto1 && producto2) {
        compararProductos();
      }
    },

    () => {}
  ).catch(err => {
    console.error("Error cámara:", err);
  });
}


// 🔍 API
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


// 🧠 SCORE
function calcularScore(p) {
  let penalizacion =
    p.azucar * 1.2 +
    p.grasa * 1.5 +
    p.sal * 2.5 -
    p.proteina * 2 -
    p.fibra * 1.5;

  let score = 100 - penalizacion;

  return Math.max(0, Math.min(100, Math.round(score)));
}


// 🎨 COLOR
function obtenerColor(score) {
  if (score >= 70) return "verde";
  if (score >= 40) return "amarillo";
  return "rojo";
}


// 🧠 EXPLICACIÓN
function generarExplicacion(mejor, peor) {
  let razones = [];

  if (mejor.azucar < peor.azucar) razones.push("menos azúcar");
  if (mejor.proteina > peor.proteina) razones.push("más proteína");
  if (mejor.sal < peor.sal) razones.push("menos sal");
  if (mejor.fibra > peor.fibra) razones.push("más fibra");

  if (razones.length === 0) {
    return "Este producto tiene un perfil nutricional más equilibrado.";
  }

  let texto = "Este producto es mejor porque tiene ";

  if (razones.length === 1) {
    texto += razones[0];
  } else {
    texto += razones.slice(0, -1).join(", ") + " y " + razones[razones.length - 1];
  }

  return texto + ".";
}


// 🧾 ESTADO (NO TOCAR)
function mostrarEstado() {
  const r = document.getElementById("resultado");

  r.innerHTML = `
    <div class="card">
      <div><strong>Producto 1:</strong> ${producto1 ? producto1.nombre : "No escaneado"}</div>
      <div><strong>Producto 2:</strong> ${producto2 ? producto2.nombre : "No escaneado"}</div>
    </div>
  `;
}


// ⚖️ COMPARAR + HISTORIAL (AQUÍ SOLO AÑADIMOS)
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

  const explicacion = generarExplicacion(mejor, peor);

  // ✅ SOLO AÑADIMOS ESTO (no rompe nada)
  historial.unshift(`${mejor.nombre} > ${peor.nombre}`);

  r.innerHTML = `
    <div class="card">
      <h2>🏆 Mejor opción</h2>
      <strong>${mejor.nombre}</strong>
      <div class="score ${colorMejor}">${scoreMejor}/100</div>
      <p><strong>${explicacion}</strong></p>
    </div>

    <div class="card">
      <h3>⚠️ Menos recomendable</h3>
      <strong>${peor.nombre}</strong>
      <div class="score ${colorPeor}">${scorePeor}/100</div>
    </div>

    <div class="card">
      <h3>📊 Historial</h3>
      ${historial.map(h => `<p>${h}</p>`).join("")}
    </div>
  `;
}


// 🔄 REINICIAR
function reiniciar() {
  producto1 = null;
  producto2 = null;

  if (html5QrCode) {
    try { html5QrCode.stop(); } catch (e) {}
  }

  document.getElementById("reader").innerHTML = "";
  document.getElementById("resultado").innerHTML = "<p>🔄 Listo para nueva comparación</p>";

  scannerActivo = false;
}