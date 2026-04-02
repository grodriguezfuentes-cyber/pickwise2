// 🔍 Buscar producto en OpenFoodFacts API
async function buscarProductoAPI(nombre) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return null;
        }

        // elegir el primer producto con datos útiles
        for (let p of data.products) {
            if (p.product_name && p.nutriments) {
                return {
                    name: p.product_name.toLowerCase(),

                    sugar: p.nutriments.sugars_100g || 0,
                    fat: p.nutriments.fat_100g || 0,
                    protein: p.nutriments.proteins_100g || 0,
                    salt: p.nutriments.salt_100g || 0,
                    fiber: p.nutriments.fiber_100g || 0
                };
            }
        }

        return null;

    } catch (error) {
        console.error("Error API:", error);
        return null;
    }
}


// 🧠 SCORE INTELIGENTE (MEJORADO)
function calcularScore(p) {
    let azucar = p.sugar || 0;
    let grasa = p.fat || 0;
    let proteina = p.protein || 0;
    let sal = p.salt || 0;
    let fibra = p.fiber || 0;

    let score = 0;

    // penalizaciones
    score += azucar * 2;
    score += grasa * 1.5;
    score += sal * 2;

    // beneficios
    score -= proteina * 1.5;
    score -= fibra * 2;

    return score;
}


// ⚖️ COMPARAR PRODUCTOS
async function comparar() {
    let p1 = document.getElementById("producto1").value;
    let p2 = document.getElementById("producto2").value;

    document.getElementById("resultado").innerHTML = "⏳ Buscando productos...";

    let prod1 = await buscarProductoAPI(p1);
    let prod2 = await buscarProductoAPI(p2);

    if (!prod1 || !prod2) {
        document.getElementById("resultado").innerHTML =
            "<p style='color:red;'>❌ No se encontraron productos</p>";
        return;
    }

    let score1 = calcularScore(prod1);
    let score2 = calcularScore(prod2);

    let mejor = score1 < score2 ? prod1 : prod2;
    let peor = score1 < score2 ? prod2 : prod1;

    // 🧠 explicación inteligente
    let explicacion = "";

    if (mejor.sugar < peor.sugar) {
        explicacion += "✔ Tiene menos azúcar<br>";
    }

    if (mejor.fat < peor.fat) {
        explicacion += "✔ Tiene menos grasa<br>";
    }

    if (mejor.protein > peor.protein) {
        explicacion += "✔ Tiene más proteína<br>";
    }

    if (mejor.fiber > peor.fiber) {
        explicacion += "✔ Tiene más fibra<br>";
    }

    if (mejor.salt < peor.salt) {
        explicacion += "✔ Tiene menos sal<br>";
    }

    // 📊 resultado final
    document.getElementById("resultado").innerHTML = `
        <h3>🏆 Mejor opción: ${mejor.name}</h3>
        <p>
            Azúcar: ${mejor.sugar}g | 
            Grasa: ${mejor.fat}g | 
            Proteína: ${mejor.protein}g | 
            Fibra: ${mejor.fiber}g | 
            Sal: ${mejor.salt}g
        </p>

        <div style="margin-top:10px;">${explicacion}</div>

        <hr>

        <h4>⚠️ Alternativa menos saludable: ${peor.name}</h4>
        <p>
            Azúcar: ${peor.sugar}g | 
            Grasa: ${peor.fat}g | 
            Proteína: ${peor.protein}g | 
            Fibra: ${peor.fiber}g | 
            Sal: ${peor.salt}g
        </p>
    `;
}