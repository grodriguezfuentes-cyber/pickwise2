let producto1 = null;
let producto2 = null;
let scannerActivo = false;
let html5QrCode = null;

// 💰 BASE DE PRECIOS
const precios = {
  "coca cola": 1.50,
  "leche": 0.95,
  "pan": 1.20,
  "pipas": 1.80
};


// 🔍 BUSCAR PRECIO
function obtenerPrecio(nombre) {
  const texto = nombre.toLowerCase();

  for (let key in precios) {
    if (texto.includes(key)) {
      return precios[key];
    }
  }

  return null;
}


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

      mostrarEstado();

      if (producto1 && producto2) {
        compararProductos();
      }
    }
  ).catch(err => console.error(err));
}


// 🔍 API
async function buscarProducto(codigo) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
    const data = await res.json();

    if (data.status === 0) return null;

    const p = data.product;
    const nombre = p.product_name || "Producto";

    return {
      nombre: nombre,
      tipo: detectarTipo(nombre),

      azucar: p.nutriments?.sugars_100g ?? 0,
      grasa: p.nutriments?.fat_100g ?? 0,
      proteina: p.nutriments?.proteins_100g ?? 0,
      fibra: p.nutriments?.fiber_100g ?? 0,
      sal: p.nutriments?.salt_100g ?? 0,

      // 💰 PRECIO (AQUÍ BIEN HECHO)
      precio: obtenerPrecio(nombre)
    };

  } catch (e) {
    console.error(e);
    return null;
  }
}


// 🧠 DETECTAR TIPO
function detectarTipo(nombre) {
  nombre = nombre.toLowerCase();

  if (nombre.includes("cola") || nombre.includes("juice"))
    return "bebida";

  if (nombre.includes("pan"))
    return "pan";

  if (nombre.includes("chocolate") || nombre.includes("cookie"))
    return "snack";

  if (nombre.includes("leche") || nombre.includes("milk"))
    return "lacteo";

  return "general";
}


// 🧠 SCORE
function calcularScore(p) {
  let score = 100;

  if (p.tipo === "bebida") {
    score -= p.azucar * 2.5;
  } else if (p.tipo === "snack") {
    score -= p.azucar * 1.5;
    score -= p.grasa * 1.5;
  } else {
    score -= p.azucar * 1.2;
    score -= p.grasa * 1.5;
  }

  score -= p.sal * 2;
  score += p.proteina * 2;
  score += p.fibra * 1.5;

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

  if (razones.length === 0) return "Perfil más equilibrado";

  return "Mejor porque tiene " +
    razones.join(", ").replace(/, ([^,]*)$/, " y $1");
}


// ⚖️ COMPARAR
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

  r.innerHTML = `
    <div class="card">
      <h2>🏆 Mejor opción</h2>
      <strong>${mejor.nombre}</strong>
      <div class="score ${colorMejor}">${scoreMejor}/100</div>
      <p>${explicacion}</p>
      <p>💰 Precio: ${mejor.precio ? mejor.precio + "€" : "No disponible"}</p>
    </div>

    <div class="card">
      <h3>⚠️ Menos recomendable</h3>
      <strong>${peor.nombre}</strong>
      <div class="score ${colorPeor}">${scorePeor}/100</div>
      <p>💰 Precio: ${peor.precio ? peor.precio + "€" : "No disponible"}</p>
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
  document.getElementById("resultado").innerHTML = "<p>🔄 Listo</p>";

  scannerActivo = false;
}