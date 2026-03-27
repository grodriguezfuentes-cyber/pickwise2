let productos = [];

// Cargar productos locales
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
  });


// 🔗 FUNCIÓN API (Open Food Facts)
async function buscarProductoAPI(nombre) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1`);
    const data = await res.json();

    if (!data.products || data.products.length === 0) return null;

    const prod = data.products[0];

    return {
      nombre: nombre,
      categoria: "otro",

      azucar: prod.nutriments?.sugars_100g || 0,
      grasa: prod.nutriments?.fat_100g || 0,
      proteina: prod.nutriments?.proteins_100g || 0,
      procesado: prod.nova_group || 5
    };

  } catch (error) {
    console.error("Error API:", error);
    return null;
  }
}


// 🔎 AUTOCOMPLETADO
function mostrarSugerencias(input, idSugerencias) {
  const valor = input.value.toLowerCase();
  const contenedor = document.getElementById(idSugerencias);
  contenedor.innerHTML = "";

  if (valor.length === 0) return;

  let filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(valor)
  );

  // Filtrar por categoría en producto2
  if (idSugerencias === "sug2") {
    const nombre1 = document.getElementById("producto1").value.toLowerCase();
    const p1 = productos.find(p => p.nombre === nombre1);

    if (p1) {
      filtrados = filtrados.filter(p => p.categoria === p1.categoria);
    }
  }

  filtrados.slice(0, 5).forEach(p => {
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
    div.innerText = p.nombre;

    div.onclick = () => {
      input.value = p.nombre;
      contenedor.innerHTML = "";
    };

    contenedor.appendChild(div);
  });
}


// 🧠 SCORE
function calcularScore(p) {
  return p.proteina - p.azucar - p.grasa - p.procesado;
}


// ⭐ NOTA
function getNota(score) {
  if (score > -5) return "A";
  if (score > -10) return "B";
  if (score > -15) return "C";
  if (score > -20) return "D";
  return "E";
}


// 🎨 COLOR
function getColorNota(nota) {
  switch (nota) {
    case "A": return "green";
    case "B": return "#66bb6a";
    case "C": return "orange";
    case "D": return "#ff7043";
    case "E": return "red";
  }
}


// 📊 DIFERENCIAS INTELIGENTES
function generarDiferencias(p1, p2) {
  let frases = [];

  function calcularPorcentaje(a, b) {
    if (b === 0) return 0;
    return Math.round(((b - a) / b) * 100);
  }

  if (p1.azucar < p2.azucar) {
    frases.push(`${calcularPorcentaje(p1.azucar, p2.azucar)}% menos azúcar`);
  }

  if (p1.grasa < p2.grasa) {
    frases.push(`${calcularPorcentaje(p1.grasa, p2.grasa)}% menos grasa`);
  }

  if (p1.procesado < p2.procesado) {
    frases.push(`${calcularPorcentaje(p1.procesado, p2.procesado)}% menos procesado`);
  }

  if (p1.proteina > p2.proteina && p2.proteina !== 0) {
    frases.push(`${Math.round((p1.proteina / p2.proteina) * 100)}% más proteína`);
  }

  if (frases.length === 0) return "Son bastante similares";

  return "Destaca porque tiene " + frases.join(", ");
}


// 🧠 CONSEJO
function generarConsejo(p) {
  if (p.procesado >= 8) {
    return "⚠️ Es un producto ultraprocesado. Mejor consumir ocasionalmente.";
  }

  if (p.azucar > 20) {
    return "⚠️ Alto en azúcar. No recomendable para consumo frecuente.";
  }

  if (p.proteina > 15 && p.procesado < 5) {
    return "✅ Buena opción para una dieta equilibrada.";
  }

  if (p.procesado <= 2) {
    return "✅ Producto natural. Muy buena elección.";
  }

  return "👉 Consumo moderado recomendado.";
}


// 🔍 COMPARAR (AHORA ASYNC)
async function comparar() {
  const nombre1 = document.getElementById("producto1").value.toLowerCase();
  const nombre2 = document.getElementById("producto2").value.toLowerCase();

  let p1 = productos.find(p => p.nombre === nombre1);
  let p2 = productos.find(p => p.nombre === nombre2);

  // 🔗 Buscar en API si no existe
  if (!p1) {
    p1 = await buscarProductoAPI(nombre1);
  }

  if (!p2) {
    p2 = await buscarProductoAPI(nombre2);
  }

  if (!p1 || !p2) {
    document.getElementById("resultado").innerHTML = "❌ Productos no encontrados";
    return;
  }

  // 🚫 Validación categoría
  if (p1.categoria !== p2.categoria && p1.categoria !== "otro" && p2.categoria !== "otro") {
    document.getElementById("resultado").innerHTML = `
      <div class="card">
        ⚠️ No puedes comparar estos productos<br><br>
        <b>${p1.nombre}</b> es categoría <b>${p1.categoria}</b><br>
        <b>${p2.nombre}</b> es categoría <b>${p2.categoria}</b><br><br>
        👉 Intenta comparar productos similares
      </div>
    `;
    return;
  }

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  const nota1 = getNota(score1);
  const nota2 = getNota(score2);

  let ganador, explicacion;

  if (score1 > score2) {
    ganador = p1;
    explicacion = generarDiferencias(p1, p2);
  } else if (score2 > score1) {
    ganador = p2;
    explicacion = generarDiferencias(p2, p1);
  } else {
    ganador = null;
    explicacion = "Empate: ambos productos son similares";
  }

  const consejo = ganador ? generarConsejo(ganador) : "";

  document.getElementById("resultado").innerHTML = `
    <div class="card" style="border-left: 10px solid ${getColorNota(nota1)}">
      <h3>${p1.nombre}</h3>
      <h2 style="color:${getColorNota(nota1)}">${nota1}</h2>
      Azúcar: ${p1.azucar}g<br>
      Grasa: ${p1.grasa}g<br>
      Proteína: ${p1.proteina}g<br>
      Procesado: ${p1.procesado}/10
    </div>

    <div class="card" style="border-left: 10px solid ${getColorNota(nota2)}">
      <h3>${p2.nombre}</h3>
      <h2 style="color:${getColorNota(nota2)}">${nota2}</h2>
      Azúcar: ${p2.azucar}g<br>
      Grasa: ${p2.grasa}g<br>
      Proteína: ${p2.proteina}g<br>
      Procesado: ${p2.procesado}/10
    </div>

    <h2>🏆 Mejor opción: ${ganador ? ganador.nombre : "Empate"}</h2>
    <p>${explicacion}</p>
    <p><b>${consejo}</b></p>
  `;
}