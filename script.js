let producto1 = null;
let producto2 = null;
let scannerActivo = false;
let html5QrCode = null;

// 📦 historial persistente
let historial = JSON.parse(localStorage.getItem("historial")) || [];

// 📷 ESCANEAR
function escanearProducto(numero) {
  if (scannerActivo) return;

  scannerActivo = true;

  document.getElementById("resultado").innerHTML =
    "<div class='status'>📷 Escaneando...</div>";

  html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },

    async (codigo) => {
      await html5QrCode.stop();
      scannerActivo = false;

      const producto = await buscarProducto(codigo);
      if (!producto) {
        document.getElementById("resultado").innerHTML =
          "<div class='status'>❌ Producto no encontrado</div>";
        return;
      }

      if (numero === 1) {
        producto1 = producto;
        mostrarEstado("Producto 1 añadido ✔️");
      } else {
        producto2 = producto;
        mostrarEstado("Producto 2 añadido ✔️");
      }

      if (producto1 && producto2) {
        compararProductos();
      }
    }
  ).catch(err => console.error("Error cámara:", err));
}

// 🔍 API + DATOS
async function buscarProducto(codigo) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
    const data = await res.json();

    if (data.status === 0) return null;

    const p = data.product;
    const nombre = p.product_name || "Producto";

    // 🔥 CALORÍAS
    let kcal = p.nutriments?.["energy-kcal_100g"];
    if (!kcal && p.nutriments?.energy_100g) {
      kcal = p.nutriments.energy_100g / 4.184;
    }

    return {
      nombre,
      tipo: detectarTipo(nombre),

      calorias: Math.round(kcal || 0),

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

// 🧠 DETECTAR TIPO
function detectarTipo(nombre) {
  nombre = nombre.toLowerCase();

  if (nombre.includes("cola") || nombre.includes("juice") || nombre.includes("drink"))
    return "bebida";

  if (nombre.includes("chocolate") || nombre.includes("cookie") || nombre.includes("snack"))
    return "snack";

  if (nombre.includes("leche") || nombre.includes("milk") || nombre.includes("yogur"))
    return "lacteo";

  return "general";
}

// 🧠 SCORE MÁS CONTUNDENTE
function calcularScore(p) {
  let score = 100;

  if (p.tipo === "bebida") {
    score -= p.azucar * 5;
  } 
  else if (p.tipo === "snack") {
    score -= p.azucar * 3;
    score -= p.grasa * 3;
  } 
  else if (p.tipo === "lacteo") {
    score += p.proteina * 2.5;
    score -= p.grasa * 2;
  } 
  else {
    score -= p.azucar * 2;
    score -= p.grasa * 2;
  }

  score -= p.sal * 2;
  score += p.fibra * 1.5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// 🎨 COLOR
function obtenerColor(score) {
  if (score >= 70) return "verde";
  if (score >= 40) return "amarillo";
  return "rojo";
}

// 🔥 EXPLICACIÓN IMPACTANTE
function generarExplicacion(mejor, peor) {

  let mensajes = [];

  if (peor.azucar > 0 && mejor.azucar === 0) {
    mensajes.push("🚫 Contiene azúcar añadida");
  }

  if (mejor.azucar < peor.azucar && peor.azucar > 0) {
    const ratio = (peor.azucar / (mejor.azucar || 1)).toFixed(1);
    mensajes.push(`🔥 ${ratio}x menos azúcar`);
  }

  if (mejor.calorias < peor.calorias && peor.calorias > 0) {
    const ratio = (peor.calorias / (mejor.calorias || 1)).toFixed(1);
    mensajes.push(`⚡ ${ratio}x menos calorías`);
  }

  if (mensajes.length === 0) {
    return "✔ Mejor opción para consumo diario";
  }

  return mensajes.join("<br>");
}

// 🧾 ESTADO
function mostrarEstado(msg) {
  document.getElementById("resultado").innerHTML = `
    <div class="card">
      <strong>Producto 1:</strong> ${producto1 ? producto1.nombre : "—"}<br>
      <strong>Producto 2:</strong> ${producto2 ? producto2.nombre : "—"}<br>
      <div class="status">${msg}</div>
    </div>
  `;
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

  historial.unshift(`${mejor.nombre} > ${peor.nombre}`);
  localStorage.setItem("historial", JSON.stringify(historial));

  r.innerHTML = `
    <div class="card winner">
      <h2>🏆 Mejor opción</h2>
      <strong>${mejor.nombre}</strong>

      <div style="font-size:32px;font-weight:bold;margin-top:10px;">
        🔥 ${mejor.calorias} kcal
      </div>

      <div class="score ${colorMejor}">${scoreMejor}/100</div>

      <div class="badge">
        ${scoreMejor >= 70 ? "🟢 Muy saludable" :
          scoreMejor >= 40 ? "🟡 Aceptable" :
          "🔴 Evitar"}
      </div>

      <div class="explain">${explicacion}</div>
    </div>

    <div class="card loser">
      <h3>⚠️ Menos recomendable</h3>
      <strong>${peor.nombre}</strong>

      <div style="font-size:26px;margin-top:8px;">
        🔥 ${peor.calorias} kcal
      </div>

      <div class="score ${colorPeor}">${scorePeor}/100</div>
    </div>

    <div class="card">
      <h3>📊 Historial</h3>
      ${historial.map(h => `<div class="historial-item">${h}</div>`).join("")}
    </div>
  `;
}

// 🔄 REINICIAR
function reiniciar() {
  producto1 = null;
  producto2 = null;

  if (html5QrCode) {
    try { html5QrCode.stop(); } catch {}
  }

  document.getElementById("reader").innerHTML = "";
  document.getElementById("resultado").innerHTML =
    "<div class='status'>🔄 Listo para empezar</div>";

  scannerActivo = false;
}