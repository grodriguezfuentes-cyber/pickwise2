let productos = [];

// Cargar productos locales
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
  });


// 🔗 API INTELIGENTE
async function buscarProductoAPI(nombre) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1`);
    const data = await res.json();

    if (!data.products || data.products.length === 0) return null;

    const nombreLower = nombre.toLowerCase();

    // 🔥 FILTRAR RESULTADOS MÁS LIMPIOS
    let candidatos = data.products.filter(p => {
      const n = (p.product_name || "").toLowerCase();

      return (
        n.includes(nombreLower) && // que coincida el nombre
        !n.includes("zumo") &&
        !n.includes("juice") &&
        !n.includes("bebida") &&
        !n.includes("drink")
      );
    });

    // si no hay buenos candidatos, usar todos
    if (candidatos.length === 0) {
      candidatos = data.products;
    }

    // 🔥 priorizar menos procesados + más datos
    const ordenados = candidatos
      .map(p => ({
        producto: p,
        score:
          (p.nutriments?.sugars_100g ? 1 : 0) +
          (p.nutriments?.fat_100g ? 1 : 0) +
          (p.nutriments?.proteins_100g ? 1 : 0) -
          (p.nova_group || 5)
      }))
      .sort((a, b) => b.score - a.score);

    const prod = ordenados[0].producto;

    return {
      nombre: prod.product_name || nombre,
      categoria: detectarCategoria(prod.product_name || nombre),
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
function detectarCategoria(nombre) {
  const n = nombre.toLowerCase();

  if (
    n.includes("manzana") ||
    n.includes("pera") ||
    n.includes("platano") ||
    n.includes("banana") ||
    n.includes("fresa") ||
    n.includes("frambuesa") ||
    n.includes("naranja") ||
    n.includes("melon") ||
    n.includes("sandia")
  ) {
    return "fruta";
  }

  if (
    n.includes("leche") ||
    n.includes("yogur") ||
    n.includes("bebida") ||
    n.includes("zumo") ||
    n.includes("juice")
  ) {
    return "bebida";
  }

  if (
    n.includes("chocolate") ||
    n.includes("galleta") ||
    n.includes("snack") ||
    n.includes("barrita")
  ) {
    return "snack";
  }

  return "otro";
}


// 🔎 AUTOCOMPLETADO (igual)
function mostrarSugerencias(input, idSugerencias) {
  const valor = input.value.toLowerCase();
  const contenedor = document.getElementById(idSugerencias);
  contenedor.innerHTML = "";

  if (valor.length === 0) return;

  let filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(valor)
  );

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


// 🔥 DETECTAR DATOS
function tieneDatos(p) {
  return p.azucar > 0 || p.grasa > 0 || p.proteina > 0;
}


// 🔥 ALTERNATIVA COHERENTE
function sugerirAlternativa(p1, p2) {
  const categoria = p1.categoria || p2.categoria;

  let opciones = productos.filter(p =>
    p.categoria === categoria && p.procesado <= 4
  );

  if (opciones.length === 0) {
    opciones = productos.filter(p => p.procesado <= 4);
  }

  if (opciones.length === 0) return null;

  return opciones[Math.floor(Math.random() * opciones.length)];
}


// 🔍 COMPARAR
async function comparar() {
  const nombre1 = document.getElementById("producto1").value.toLowerCase();
  const nombre2 = document.getElementById("producto2").value.toLowerCase();

  let p1 = productos.find(p => p.nombre === nombre1);
  let p2 = productos.find(p => p.nombre === nombre2);

  if (!p1) p1 = await buscarProductoAPI(nombre1);
  if (!p2) p2 = await buscarProductoAPI(nombre2);

  if (!p1) {
    p1 = { nombre: nombre1, categoria: "otro", azucar: 0, grasa: 0, proteina: 0, procesado: 5 };
  }

  if (!p2) {
    p2 = { nombre: nombre2, categoria: "otro", azucar: 0, grasa: 0, proteina: 0, procesado: 5 };
  }
  if (!tieneDatos(p1) || !tieneDatos(p2)) {
  document.getElementById("resultado").innerHTML = `
    <h2>⚠️ Comparación no fiable</h2>
    <p>No hay suficientes datos nutricionales para comparar estos productos.</p>
  `;
  return;
}

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  const nota1 = getNota(score1);
  const nota2 = getNota(score2);

  let ganador = score1 > score2 ? p1 : score2 > score1 ? p2 : null;

  let aviso = "";
  let alternativaHTML = "";

  if (!tieneDatos(p1) || !tieneDatos(p2)) {
    aviso = "⚠️ Datos nutricionales incompletos.";

    const alt = sugerirAlternativa(p1, p2);
    if (alt) {
      alternativaHTML = `👉 Alternativa recomendada: <b>${alt.nombre}</b>`;
    }
  }

  document.getElementById("resultado").innerHTML = `
    <div class="card"><h3>${p1.nombre}</h3><h2>${nota1}</h2></div>
    <div class="card"><h3>${p2.nombre}</h3><h2>${nota2}</h2></div>

    <h2>🏆 ${ganador ? ganador.nombre : "Empate"}</h2>
    <p style="color:orange">${aviso}</p>
    <p>${alternativaHTML}</p>
  `;
}