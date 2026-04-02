let scannerActivo = false;

let producto1 = null;
let producto2 = null;

function escanearProducto(numero) {
  alert("Botón funciona " + numero);
  if (scannerActivo) return;

  scannerActivo = true;

  const reader = new Html5Qrcode("reader");

  reader.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (codigo) => {
      reader.stop();
      scannerActivo = false;

      const producto = await buscarProducto(codigo);

      if (!producto) return;

      if (numero === 1) {
        producto1 = producto;
      } else {
        producto2 = producto;
      }

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

async function buscarProducto(codigo) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "🔍 Buscando producto...";

  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${codigo}.json`);
    const data = await res.json();

    if (data.status === 0) {
      resultado.innerHTML = "❌ Producto no encontrado";
      return null;
    }

    const p = data.product;

    return {
      nombre: p.product_name || "Sin nombre",
      azucar: p.nutriments?.sugars_100g ?? 0,
      grasa: p.nutriments?.fat_100g ?? 0,
      proteina: p.nutriments?.proteins_100g ?? 0,
      fibra: p.nutriments?.fiber_100g ?? 0,
      sal: p.nutriments?.salt_100g ?? 0
    };

  } catch (err) {
    resultado.innerHTML = "⚠️ Error al buscar producto";
    console.error(err);
    return null;
  }
}

function mostrarEstado() {
  const resultado = document.getElementById("resultado");

  resultado.innerHTML = `
    <div class="card">
      <h3>Producto 1:</h3>
      <p>${producto1 ? producto1.nombre : "No escaneado"}</p>

      <h3>Producto 2:</h3>
      <p>${producto2 ? producto2.nombre : "No escaneado"}</p>
    </div>
  `;
}

function compararProductos() {
  const resultado = document.getElementById("resultado");

  const score = (p) => {
    return (
      p.azucar * 2 +
      p.grasa * 1.5 +
      p.sal * 2 -
      p.proteina * 1.2 -
      p.fibra * 1.5
    );
  };

  const score1 = score(producto1);
  const score2 = score(producto2);

  const mejor = score1 < score2 ? producto1 : producto2;
  const peor = score1 < score2 ? producto2 : producto1;

  resultado.innerHTML = `
    <div class="card">
      <h2>🏆 Mejor opción</h2>
      <p><strong>${mejor.nombre}</strong></p>

      <p>Azúcar: ${mejor.azucar}g</p>
      <p>Grasa: ${mejor.grasa}g</p>
      <p>Proteína: ${mejor.proteina}g</p>
      <p>Fibra: ${mejor.fibra}g</p>
      <p>Sal: ${mejor.sal}g</p>

      <hr>

      <h3>⚠️ Menos recomendable</h3>
      <p><strong>${peor.nombre}</strong></p>
    </div>
  `;
}