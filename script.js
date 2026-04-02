async function buscarProductoAPI(nombre) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${nombre}&search_simple=1&action=process&json=1&page_size=5`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.products || data.products.length === 0) {
            return null;
        }

        // coger el mejor producto con datos útiles
        for (let p of data.products) {
            if (p.product_name && p.nutriments) {
                return {
                    name: p.product_name.toLowerCase(),
                    sugar: p.nutriments.sugars_100g || 0,
                    fat: p.nutriments.fat_100g || 0,
                    protein: p.nutriments.proteins_100g || 0
                };
            }
        }

        return null;

    } catch (error) {
        console.error("Error API:", error);
        return null;
    }
}


// 🧠 fórmula mejorada
function calcularScore(p) {
    return (p.sugar * 2) + (p.fat * 1.5) - (p.protein * 1.2);
}


// ⚖️ comparar usando API
async function comparar() {
    let p1 = document.getElementById("producto1").value;
    let p2 = document.getElementById("producto2").value;

    document.getElementById("resultado").innerHTML = "⏳ Buscando...";

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

    document.getElementById("resultado").innerHTML = `
        <h3>🏆 Mejor opción: ${mejor.name}</h3>
        <p>Azúcar: ${mejor.sugar}g | Grasa: ${mejor.fat}g | Proteína: ${mejor.protein}g</p>

        <hr>

        <h4>⚠️ Alternativa menos saludable: ${peor.name}</h4>
        <p>Azúcar: ${peor.sugar}g | Grasa: ${peor.fat}g | Proteína: ${peor.protein}g</p>
    `;
}