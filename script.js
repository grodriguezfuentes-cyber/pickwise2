let productos = [];

const traducciones = {
    "manzana": "apple",
    "pera": "pear",
    "leche": "milk",
    "chocolate": "chocolate"
};

Papa.parse("productos.csv", {
    download: true,
    header: true,
    complete: function(results) {

        productos = results.data
            .filter(row => row.product_name && row.product_name.length < 100)
            .map(row => ({
                name: (row.product_name || "")
                        .split(",")[0]
                        .toLowerCase()
                        .trim(),

                carbs: parseFloat(row.carbohydrates_100g) || 0,
                sugar: parseFloat(row.sugars_100g) || 0,
                fat: parseFloat(row.fat_100g) || 0,
                protein: parseFloat(row.proteins_100g) || 0
            }));

        console.log("Productos cargados:", productos.length);
    }
});

function buscarProducto(nombre) {
    nombre = nombre.toLowerCase().trim();

    if (traducciones[nombre]) {
        nombre = traducciones[nombre];
    }

    let mejorMatch = null;
    let maxScore = 0;

    for (let p of productos) {
        if (!p.name) continue;

        let score = 0;

        if (p.name.includes(nombre)) score += 2;

        let palabras = nombre.split(" ");
        for (let palabra of palabras) {
            if (p.name.includes(palabra)) {
                score += 1;
            }
        }

        if (score > maxScore) {
            maxScore = score;
            mejorMatch = p;
        }
    }

    return mejorMatch;
}

function comparar() {
    let p1 = document.getElementById("producto1").value;
    let p2 = document.getElementById("producto2").value;

    let prod1 = buscarProducto(p1);
    let prod2 = buscarProducto(p2);

    if (!prod1 || !prod2) {
        document.getElementById("resultado").innerHTML =
            "<p class='error'>❌ No se encontraron productos. Prueba con otro nombre.</p>";
        return;
    }

    let score1 = prod1.sugar + prod1.fat;
    let score2 = prod2.sugar + prod2.fat;

    let mejor = score1 < score2 ? prod1 : prod2;
    let peor = score1 < score2 ? prod2 : prod1;

    document.getElementById("resultado").innerHTML = `
        <h3>🏆 Mejor opción: ${mejor.name}</h3>
        <p>Azúcar: ${mejor.sugar}g | Grasa: ${mejor.fat}g</p>

        <hr>

        <h4>⚠️ Alternativa menos saludable: ${peor.name}</h4>
        <p>Azúcar: ${peor.sugar}g | Grasa: ${peor.fat}g</p>
    `;
}