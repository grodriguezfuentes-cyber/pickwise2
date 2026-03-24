let productos = [];

// Cargar productos
fetch('productos.json')
  .then(res => res.json())
  .then(data => {
    productos = data;
  });

// AUTOCOMPLETADO
function mostrarSugerencias(input, idSugerencias) {
  const valor = input.value.toLowerCase();
  const contenedor = document.getElementById(idSugerencias);
  contenedor.innerHTML = "";

  if (valor.length === 0) return;

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(valor)
  );

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

// CALCULAR SCORE
function calcularScore(p) {
  return (
    p.proteina
    - p.azucar
    - p.grasa
    - p.procesado
  );
}

// COMPARAR PRODUCTOS
function comparar() {
  const nombre1 = document.getElementById("producto1").value.toLowerCase();
  const nombre2 = document.getElementById("producto2").value.toLowerCase();

  const p1 = productos.find(p => p.nombre === nombre1);
  const p2 = productos.find(p => p.nombre === nombre2);

  if (!p1 || !p2) {
    document.getElementById("resultado").innerHTML = "❌ Productos no encontrados";
    return;
  }

  const score1 = calcularScore(p1);
  const score2 = calcularScore(p2);

  let ganador = "";
  if (score1 > score2) ganador = p1.nombre;
  else if (score2 > score1) ganador = p2.nombre;
  else ganador = "Empate";

  document.getElementById("resultado").innerHTML = `
    <div class="card">
      <h3>${p1.nombre}</h3>
      Azúcar: ${p1.azucar}g<br>
      Grasa: ${p1.grasa}g<br>
      Proteína: ${p1.proteina}g<br>
      Procesado: ${p1.procesado}/10<br>
      <b>Score: ${score1}</b>
    </div>

    <div class="card">
      <h3>${p2.nombre}</h3>
      Azúcar: ${p2.azucar}g<br>
      Grasa: ${p2.grasa}g<br>
      Proteína: ${p2.proteina}g<br>
      Procesado: ${p2.procesado}/10<br>
      <b>Score: ${score2}</b>
    </div>

    <h2>🏆 Mejor opción: ${ganador}</h2>
  `;
}