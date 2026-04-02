// 🔍 BUSCAR PRODUCTO (ROBUSTO)
async function buscarProductoAPI(nombre) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(nombre)}&search_simple=1&action=process&json=1&page_size=20`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return null;
        }

        // 🔥 FILTRO INTELIGENTE (clave)
        let mejor = null;

        for (let p of data.products) {

            if (!p.product_name) continue;

            let nutriments = p.nutriments || {};

            // ignorar basura sin datos reales
            let sugar = nutriments.sugars_100g || 0;
            let fat = nutriments.fat_100g || 0;
            let protein = nutriments.proteins_100g || 0;

            if (sugar === 0 && fat === 0 && protein === 0) continue;

            mejor = {
                name: limpiarNombre(p.product_name),
                sugar: sugar,
                fat: fat,
                protein: protein,
                salt: nutriments.salt_100g || 0,
                fiber: nutriments.fiber_100g || 0
            };

            break;
        }

        return mejor;

    } catch (error) {
        console.error("Error API:", error);
        return null;
    }
}


// 🧼 LIMPIAR NOMBRE (MUY IMPORTANTE)
function limpiarNombre(nombre) {
    return nombre
        .toLowerCase()
        .replace(/[^a-zA-Z0-9áéíóúñ\s]/g, "")
        .trim()
        .slice(0, 50);
}


// 🧠 SCORE REALISTA (MEJORADO)
function calcularScore(p) {
    let score = 0;

    // penalizaciones
    score += p.sugar * 2;
    score += p.fat * 1.5;
    score += p.salt * 2;

    // beneficios
    score -= p.protein * 1.5;
    score -= p.fiber * 2;

    return score;
}


// 🧠 EXPLICACIÓN INTELIGENTE
function generarExplicacion(mejor, peor) {
    let texto = "";

    if (mejor.sugar < peor.sugar) texto += "✔ Menos azúcar<br>";
    if (mejor.fat < peor.fat) texto += "✔ Menos grasa<br>";
    if (mejor.protein > peor.protein) texto += "✔ Más proteína<br>";
    if (mejor.fiber > peor.fiber) texto += "✔ Más fibra<br>";
    if (mejor.salt < peor.salt) texto += "✔ Menos sal<br>";

    return texto || "✔ Mejor equilibrio nutricional";
}


// ⚖️ COMPARAR PRODUCTOS (FINAL)
async function comparar() {
    let input1 = document.getElementById("producto1").value.trim();
    let input2 = document.getElementById("producto2").value.trim();

    if (!input1 || !input2) {
        document.getElementById("resultado").innerHTML =
            "<p style='color:red;'>⚠️ Introduce ambos productos</p>";
        return;
    }

    document.getElementById("resultado").innerHTML = "⏳ Buscando productos...";

    let prod1 = await buscarProductoAPI(input1);
    let prod2 = await buscarProductoAPI(input2);

    if (!prod1 || !prod2) {
        document.getElementById("resultado").innerHTML =
            "<p style='color:red;'>❌ No se encontraron productos válidos</p>";
        return;
    }

    let score1 = calcularScore(prod1);
    let score2 = calcularScore(prod2);

    let mejor = score1 < score2 ? prod1 : prod2;
    let peor = score1 < score2 ? prod2 : prod1;

    let explicacion = generarExplicacion(mejor, peor);

    document.getElementById("resultado").innerHTML = `
        <div class="card">
            <h3>🏆 Mejor opción</h3>
            <strong>${mejor.name}</strong>
            <p>
                Azúcar: ${mejor.sugar}g<br>
                Grasa: ${mejor.fat}g<br>
                Proteína: ${mejor.protein}g<br>
                Fibra: ${mejor.fiber}g<br>
                Sal: ${mejor.salt}g
            </p>
            <p>${explicacion}</p>
        </div>

        <div class="card">
            <h4>⚠️ Menos recomendable</h4>
            <strong>${peor.name}</strong>
        </div>
    `;
}