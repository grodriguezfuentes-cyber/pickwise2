let productos = [];

// Cargar productos
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
  });

// AUTOCOMPLETADO INTELIGENTE
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

// SCORE
function calcularScore(p) {
  return (
    p.proteina
    - p.azucar
    - p.grasa
    - p.procesado
  );
}

// NOTA A–E
function getNota(score) {
  if (score > -5) return "A";
  if (score > -10) return "B";
  if (score > -15) return "C";
  if (score > -20) return "D";
  return "E";
}

// COLOR POR NOTA
function getColorNota(nota) {
  switch (nota) {
    case "A": return "green";
    case "B": return "#66bb6a";
    case "C": return "orange";
    case "D": return "#ff7043";
    case "E": return "red";
  }
}

// EXPLICACIÓN
function generarExplicacion(p1, p2) {
  let razones = [];

  if (p1.azucar < p2.azucar) razones.push("menos azúcar");
  if (p1.grasa < p2.grasa) razones.push("menos grasa");
  if (p1.procesado < p2.procesado) razones.push("menos procesado");
  if (p1.proteina > p2.proteina) razones.push("más proteína");

  if (razones.length === 0) return "Son bastante similares";

  return "Mejor opción porque tiene " + razones.join(", ");
}

// COMPARAR
function comparar() {
  const nombre1 = document.getElementById("producto1").value.toLowerCase();
  const nombre2 = document.getElementById("producto2").value.toLowerCase();

  const p1 = productos.find(p => p.nombre === nombre1);
  const p2 = productos.find(p => p.nombre === nombre2);

  if (!p1 || !p2) {
    document.getElementById("resultado").innerHTML = "❌ Productos no encontrados";
    return;
  }

  if (p1.categoria !== p2.categoria) {
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
    explicacion = generarExplicacion(p1, p2);
  } else if (score2 > score1) {
    ganador = p2;
    explicacion = generarExplicacion(p2, p1);
  } else {
    ganador = null;
    explicacion = "Empate: ambos productos son similares";
  }

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
  `;
}