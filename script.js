let productos = [];

fetch("productos.json")
  .then(res => res.json())
  .then(data => {
    productos = data;
  });

async function comparar() {
  const nombre1 = document.getElementById("producto1").value;
  const nombre2 = document.getElementById("producto2").value;

  let p1 = buscarProductoInteligente(nombre1);
  let p2 = buscarProductoInteligente(nombre2);

  if (!p1) p1 = await buscarProductoAPI(nombre1);
  if (!p2) p2 = await buscarProductoAPI(nombre2);

  if (!p1 || !p2) {
    document.getElementById("resultado").innerHTML =
      "❌ Productos no encontrados";
    return;
  }

  p1.categoria = detectarCategoria(p1.nombre);
  p2.categoria = detectarCategoria(p2.nombre);

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  let mejor = "";
  let razon = "";

  if (score1 > score2) {
    mejor = p1.nombre;
    razon = generarExplicacion(p1, p2);
  } else if (score2 > score1) {
    mejor = p2.nombre;
    razon = generarExplicacion(p2, p1);
  } else {
    mejor = "Empate";
    razon = "Ambos productos son bastante similares en sus valores nutricionales.";
  }

  let alternativa = sugerirAlternativa(p1, p2);

  document.getElementById("resultado").innerHTML = `
    <div>
      <h3>${p1.nombre}</h3>
      <p>${score1}</p>

      <h3>${p2.nombre}</h3>
      <p>${score2}</p>

      <h2>🏆 ${mejor}</h2>
      <p>${razon}</p>

      ${
        alternativa
          ? `<p>👉 Alternativa recomendada: <b>${alternativa.nombre}</b></p>`
          : ""
      }
    </div>
  `;
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarProductoInteligente(nombre) {
  let nombreNormalizado = normalizarTexto(nombre);

  // 1. EXACTO
  let exacto = productos.find(p => 
    normalizarTexto(p.nombre) === nombreNormalizado
  );
  if (exacto) return exacto;

  // 2. EMPIEZA POR
  let empieza = productos.find(p => 
    normalizarTexto(p.nombre).startsWith(nombreNormalizado)
  );
  if (empieza) return empieza;

  // 3. CONTIENE
  let contiene = productos.find(p => 
    normalizarTexto(p.nombre).includes(nombreNormalizado)
  );
  if (contiene) return contiene;

  return null;
}

async function buscarProductoAPI(nombre) {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&json=1`
    );
    const data = await res.json();

    if (!data.products || data.products.length === 0) return null;

    const prod = data.products[0];

    let nombreFinal = prod.product_name || nombre;

    if (nombreFinal.length > 30) {
      nombreFinal = nombre;
    }

    return {
      nombre: nombreFinal.toLowerCase(),
      azucar: prod.nutriments?.sugars_100g || 0,
      grasa: prod.nutriments?.fat_100g || 0,
      proteina: prod.nutriments?.proteins_100g || 0,
      procesado: Math.floor(Math.random() * 10)
    };
  } catch {
    return null;
  }
}

function detectarCategoria(nombre) {
  const n = normalizarTexto(nombre);

  if (n.includes("manzana") || n.includes("banana") || n.includes("pera") || n.includes("fruta") || n.includes("fresa") || n.includes("frambuesa") || n.includes("arandano"))
    return "fruta";

  if (n.includes("leche") || n.includes("yogur") || n.includes("yogurt"))
    return "lacteo";

  if (n.includes("pollo") || n.includes("carne") || n.includes("huevo"))
    return "proteina";

  if (
    n.includes("arroz") ||
    n.includes("pasta") ||
    n.includes("tallarines") ||
    n.includes("fideos")
  )
    return "carbohidrato";

  return "otro";
}

function calcularScore(p) {
  let score = 100;

  score -= p.azucar * 2;
  score -= p.grasa * 1.5;
  score += p.proteina * 2;
  score -= p.procesado * 2;

  if (score > 80) return "A";
  if (score > 60) return "B";
  if (score > 40) return "C";
  return "D";
}

function generarExplicacion(mejor, peor) {
  return `Es mejor opción porque tiene mejores valores nutricionales que ${peor.nombre}.`;
}

function sugerirAlternativa(p1, p2) {
  let categoria = p1.categoria === p2.categoria ? p1.categoria : p1.categoria;

  let opciones = productos.filter(p =>
    detectarCategoria(p.nombre) === categoria &&
    p.procesado <= 4
  );

  opciones = opciones.filter(p =>
    p.nombre !== p1.nombre &&
    p.nombre !== p2.nombre
  );

  if (opciones.length === 0) return null;

  return opciones[Math.floor(Math.random() * opciones.length)];
}