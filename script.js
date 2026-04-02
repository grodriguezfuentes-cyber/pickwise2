let productos = [];

// Cargar productos locales
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
  });


// 🔥 DETECTAR CATEGORÍA
function detectarCategoria(nombre) {
  const n = nombre.toLowerCase();

  // 🍎 FRUTA
  if (
    n.includes("yogurt") ||
    n.includes("manzana") ||
    n.includes("pera") ||
    n.includes("platano") ||
    n.includes("banana") ||
    n.includes("fresa") ||
    n.includes("fresas") ||
    n.includes("frambuesa") ||
    n.includes("naranja") ||
    n.includes("melon") ||
    n.includes("sandia") ||
    n.includes("ciruela") ||
    n.includes("damasco") ||
    n.includes("albaricoque") ||
    n.includes("arandano") ||
    n.includes("arándano") ||
    n.includes("blueberry")
  ) return "fruta";

  // 🥤 BEBIDA
  if (
    n.includes("leche") ||
    n.includes("yogur") ||
    n.includes("bebida") ||
    n.includes("zumo") ||
    n.includes("juice")
  ) return "bebida";

  // 🍫 SNACK
  if (
    n.includes("chocolate") ||
    n.includes("galleta") ||
    n.includes("snack") ||
    n.includes("barrita") ||
    n.includes("snickers") ||
    n.includes("kitkat")
  ) return "snack";

  // 🍝 CARBOHIDRATOS
  if (
    n.includes("arroz") ||
    n.includes("pasta") ||
    n.includes("tallarines") ||
    n.includes("fideos") ||
    n.includes("espagueti") ||
    n.includes("espaguetis")
  ) return "carbohidrato";

  return "otro";
}


// 🔗 BUSCAR EN API
async function buscarProductoAPI(nombre) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1`);
    const data = await res.json();

    if (!data.products || data.products.length === 0) return null;

    const nombreLower = nombre.toLowerCase();

    let candidatos = data.products.filter(p => {
      const n = (p.product_name || "").toLowerCase();

      return (
        n.includes(nombreLower) &&
        !n.includes("zumo") &&
        !n.includes("juice") &&
        !n.includes("bebida") &&
        !n.includes("confitura") &&
        !n.includes("mermelada") &&
        !n.includes("jam") &&
        !n.includes("salsa") &&
        !n.includes("yogur") &&
        !n.includes("postre")
      );
    });

    if (candidatos.length === 0) candidatos = data.products;

    const prod = candidatos[0];

    // 🔥 limpiar nombre raro
    let nombreFinal = prod.product_name || nombre;
    if (nombreFinal.length > 30) {
      nombreFinal = nombre;
    }

    return {
      nombre: nombreFinal,
      categoria: detectarCategoria(nombreFinal),
      azucar: prod.nutriments?.sugars_100g || 0,
      grasa: prod.nutriments?.fat_100g || 0,
      proteina: prod.nutriments?.proteins_100g || 0,
      procesado: prod.nova_group || 5
    };

  } catch (error) {
    return null;
  }
}


// 🧠 IA SIMULADA
function generarExplicacionIA(p1, p2, ganador) {
  if (!ganador) return "Ambos productos son bastante similares en sus valores nutricionales.";

  let razones = [];

  if (ganador.azucar < (ganador === p1 ? p2.azucar : p1.azucar)) {
    razones.push("menos azúcar");
  }

  if (ganador.grasa < (ganador === p1 ? p2.grasa : p1.grasa)) {
    razones.push("menos grasa");
  }

  if (ganador.procesado < (ganador === p1 ? p2.procesado : p1.procesado)) {
    razones.push("menor nivel de procesamiento");
  }

  if (ganador.proteina > (ganador === p1 ? p2.proteina : p1.proteina)) {
    razones.push("más proteína");
  }

  if (razones.length === 0) {
    return "Es una opción ligeramente mejor en términos generales.";
  }

  return `Es mejor opción porque tiene ${razones.join(", ")}, lo que lo hace más recomendable para un consumo habitual.`;
}


// 🔥 DATOS VÁLIDOS
function tieneDatos(p) {
  return p.azucar > 0 || p.grasa > 0 || p.proteina > 0;
}


// 🔥 ALTERNATIVA COHERENTE
function sugerirAlternativa(p1, p2) {

  let categoria;

  if (p1.categoria === p2.categoria) {
    categoria = p1.categoria;
  } else {
    categoria = p1.categoria;
  }

  let opciones = productos.filter(p =>
    p.categoria === categoria &&
    p.procesado <= 4
  );

  opciones = opciones.filter(p =>
    p.nombre !== p1.nombre &&
    p.nombre !== p2.nombre
  );

  if (opciones.length === 0) return null;

  return opciones[Math.floor(Math.random() * opciones.length)];
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


// 🔍 COMPARAR
async function comparar() {
  const nombre1 = document.getElementById("producto1").value.toLowerCase();
  const nombre2 = document.getElementById("producto2").value.toLowerCase();

  let p1 = productos.find(p => 
  p.nombre.includes(nombre1) || nombre1.includes(p.nombre)
 );

  let p2 = productos.find(p => 
  p.nombre.includes(nombre2) || nombre2.includes(p.nombre)
 );

  if (!p1) p1 = await buscarProductoAPI(nombre1);
  if (!p2) p2 = await buscarProductoAPI(nombre2);

  if (!p1) p1 = { nombre: nombre1, categoria: detectarCategoria(nombre1), azucar: 0, grasa: 0, proteina: 0, procesado: 5 };
  if (!p2) p2 = { nombre: nombre2, categoria: detectarCategoria(nombre2), azucar: 0, grasa: 0, proteina: 0, procesado: 5 };

  let aviso = "";
  let alternativaHTML = "";

  if (!tieneDatos(p1) || !tieneDatos(p2)) {
    aviso = "⚠️ Datos nutricionales incompletos.";

    const alt = sugerirAlternativa(p1, p2);
    if (alt) {
      alternativaHTML = `👉 Alternativa recomendada: <b>${alt.nombre}</b>`;
    }
  }

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  const nota1 = getNota(score1);
  const nota2 = getNota(score2);

  let ganador = score1 > score2 ? p1 : score2 > score1 ? p2 : null;

  const explicacionIA = generarExplicacionIA(p1, p2, ganador);

  document.getElementById("resultado").innerHTML = `
    <div class="card">
      <h3>${p1.nombre}</h3>
      <h2>${nota1}</h2>
    </div>

    <div class="card">
      <h3>${p2.nombre}</h3>
      <h2>${nota2}</h2>
    </div>

    <h2>🏆 ${ganador ? ganador.nombre : "Empate"}</h2>

    <p><b>${explicacionIA}</b></p>

    <p style="color:orange">${aviso}</p>
    <p>${alternativaHTML}</p>
  `;
}