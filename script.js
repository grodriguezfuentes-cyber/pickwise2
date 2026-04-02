let scannerActivo = false;

function iniciarEscaner() {
  if (scannerActivo) return;

  scannerActivo = true;

  const reader = new Html5Qrcode("reader");

  reader.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: 250
    },
    async (codigo) => {
      reader.stop();
      scannerActivo = false;

      buscarProducto(codigo);
    },
    (error) => {
      // ignoramos errores de escaneo continuo
    }
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
      return;
    }

    const p = data.product;

    const nombre = p.product_name || "Sin nombre";
    const azucar = p.nutriments?.sugars_100g ?? "?";
    const grasa = p.nutriments?.fat_100g ?? "?";
    const proteina = p.nutriments?.proteins_100g ?? "?";
    const fibra = p.nutriments?.fiber_100g ?? "?";
    const sal = p.nutriments?.salt_100g ?? "?";

    resultado.innerHTML = `
      <div class="card">
        <h2>📦 ${nombre}</h2>
        <p>Azúcar: ${azucar}g</p>
        <p>Grasa: ${grasa}g</p>
        <p>Proteína: ${proteina}g</p>
        <p>Fibra: ${fibra}g</p>
        <p>Sal: ${sal}g</p>
      </div>
    `;

  } catch (err) {
    resultado.innerHTML = "⚠️ Error al buscar producto";
    console.error(err);
  }
}