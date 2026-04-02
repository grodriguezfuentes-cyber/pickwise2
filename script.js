let productos = [];

// 🔥 CARGAR CSV
async function cargarCSV() {
    try {
        const response = await fetch("productos.csv");
        const data = await response.text();

        const filas = data.split("\n").slice(1);

        productos = filas.map(fila => {
            const cols = fila.split(",");

            return {
                name: cols[1]?.toLowerCase().trim(),
                fat: parseFloat(cols[3]) || 0,
                carbs: parseFloat(cols[5]) || 0,
                sugar: parseFloat(cols[6]) || 0,
                protein: parseFloat(cols[7]) || 0
            };
        });

        console.log("✅ Productos cargados:", productos.length);

    } catch (error) {
        console.error("❌ Error cargando CSV:", error);
    }
}

// 🔍 BUSCAR PRODUCTO (MEJORADO)
function buscarProducto(nombre) {
    nombre = nombre.toLowerCase().trim();

    let mejorMatch = null;

    for (let p of productos) {
        if (!p.name) continue;

        if (p.name.includes(nombre)) {
            mejorMatch = p;
            break;
        }
    }

    return mejorMatch;
}

// 🧠 COMPARAR
function comparar() {
    const p1Input = document.getElementById("producto1").value;
    const p2Input = document.getElementById("producto2").value;

    const p1 = buscarProducto(p1Input);
    const p2 = buscarProducto(p2Input);

    if (!p1 || !p2) {
        mostrarResultado("❌ No se encontraron productos. Prueba con otro nombre.");
        return;
    }

    const score1 = score(p1);
    const score2 = score(p2);

    let mejor, peor;

    if (score1 > score2) {
        mejor = p1;
        peor = p2;
    } else {
        mejor = p2;
        peor = p1;
    }

    let resultado = `<strong>🏆 Mejor opción:</strong> ${mejor.name}<br><br>`;

    if (mejor.sugar < peor.sugar) {
        resultado += "✔ Menos azúcar<br>";
    }

    if (mejor.fat < peor.fat) {
        resultado += "✔ Menos grasa<br>";
    }

    if (mejor.protein > peor.protein) {
        resultado += "✔ Más proteína<br>";
    }

    resultado += `<br><strong>💡 Alternativa menos saludable:</strong> ${peor.name}`;

    mostrarResultado(resultado);
}

// 📊 SCORING INTELIGENTE
function score(p) {
    return (100 - p.sugar) + (100 - p.fat) + (p.protein * 2);
}

// 📺 MOSTRAR RESULTADO
function mostrarResultado(texto) {
    document.getElementById("resultado").innerHTML = texto;
}

// 🚀 INICIAR
cargarCSV();