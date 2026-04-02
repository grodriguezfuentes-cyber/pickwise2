let productos = [];

// 🔁 Traducciones básicas
const traducciones = {
    "manzana": "apple",
    "pera": "pear",
    "leche": "milk",
    "chocolate": "chocolate",
    "arroz": "rice",
    "tallarines": "pasta",
    "coca cola": "cola"
};

// 📥 Cargar CSV
Papa.parse("productos.csv", {
    download: true,
    header: true,
    complete: function(results) {

        productos = results.data
            .filter(row => row.product_name && row.product_name.length < 100)
            .map(row => ({
                name: limpiarNombre(row.product_name),

                carbs: parseFloat(row.carbohydrates_100g) || 0,
                sugar: parseFloat(row.sugars_100g) || 0,
                fat: parseFloat(row.fat_100g) || 0,
                protein: parseFloat(row.proteins_100g) || 0
            }))
            .filter(p => p.name.length > 2);

        console.log("Productos cargados:", productos.length);

        activarAutocompletado("producto1");
        activarAutocompletado("producto2");
    }
});


// 🧼 LIMPIAR NOMBRE (CLAVE)
function limpiarNombre(nombre) {
    return (nombre || "")
        .split(",")[0]
        .toLowerCase()
        .replace(/[^a-zA-Z0-9áéíóúñ\s]/g, "") // quitar símbolos raros
        .trim();
}


// 🔍 AUTOCOMPLETADO
function activarAutocompletado(idInput) {
    const input = document.getElementById(idInput);

    const lista = document.createElement("div");
    lista.style.background = "white";
    lista.style.border = "1px solid #ccc";
    lista.style.borderRadius = "8px";
    lista.style.position = "absolute";
    lista.style.width = "100%";
    lista.style.maxHeight = "150px";
    lista.style.overflowY = "auto";
    lista.style.zIndex = "1000";

    input.parentNode.style.position = "relative";
    input.parentNode.appendChild(lista);

    input.addEventListener("input", function() {
        const valor = input.value.toLowerCase().trim();
        lista.innerHTML = "";

        if (!valor) return;

        let resultados = productos
            .filter(p => p.name.startsWith(valor))
            .slice(0, 5);

        resultados.forEach(p => {
            const item = document.createElement("div");
            item.textContent = p.name;
            item.style.padding = "8px";
            item.style.cursor = "pointer";

            item.addEventListener("mouseover", () => item.style.background = "#eee");
            item.addEventListener("mouseout", () => item.style.background = "white");

            item.addEventListener("click", function() {
                input.value = p.name;
                lista.innerHTML = "";
            });

            lista.appendChild(item);
        });
    });

    document.addEventListener("click", function(e) {
        if (e.target !== input) {
            lista.innerHTML = "";
        }
    });
}


// 🔍 BUSCADOR INTELIGENTE (VERSIÓN BUENA)
function buscarProducto(nombre) {
    nombre = nombre.toLowerCase().trim();

    if (traducciones[nombre]) {
        nombre = traducciones[nombre];
    }

    let mejorMatch = null;
    let maxScore = -Infinity;

    for (let p of productos) {
        if (!p.name) continue;

        let score = 0;

        // 🔥 exact match
        if (p.name === nombre) return p;

        // 🔥 empieza por
        if (p.name.startsWith(nombre)) score += 5;

        // 🔥 contiene
        if (p.name.includes(nombre)) score += 3;

        // 🔥 palabras sueltas
        let palabras = nombre.split("");
        for (let palabra of palabras) {
            if (p.name.includes(palabra)) score += 0.5;
        }

        // ❌ penalizar nombres largos (ruido)
        score -= p.name.length * 0.02;

        if (score > maxScore) {
            maxScore = score;
            mejorMatch = p;
        }
    }

    return mejorMatch;
}


// ⚖️ COMPARACIÓN INTELIGENTE
function calcularScore(p) {
    return (p.sugar * 2) + (p.fat * 1.5) - (p.protein * 1.2);
}


// 🎯 COMPARAR
function comparar() {
    let p1 = document.getElementById("producto1").value;
    let p2 = document.getElementById("producto2").value;

    let prod1 = buscarProducto(p1);
    let prod2 = buscarProducto(p2);

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