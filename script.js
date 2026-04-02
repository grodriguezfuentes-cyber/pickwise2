let scanner;


// 📸 INICIAR ESCÁNER
function iniciarScanner() {
    document.getElementById("resultado").innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess
    );
}


// ✅ CUANDO DETECTA CÓDIGO
async function onScanSuccess(decodedText) {

    // parar cámara
    await scanner.stop();

    document.getElementById("reader").innerHTML = "";

    buscarProductoPorCodigo(decodedText);
}


// 🔍 BUSCAR PRODUCTO POR CÓDIGO
async function buscarProductoPorCodigo(barcode) {

    document.getElementById("resultado").innerHTML = "⏳ Buscando producto...";

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 1) {
            document.getElementById("resultado").innerHTML =
                "<p style='color:red;'>❌ Producto no encontrado</p>";
            return;
        }

        let p = data.product;
        let n = p.nutriments || {};

        document.getElementById("resultado").innerHTML = `
            <div class="card">
                <h3>${p.product_name || "Producto"}</h3>

                <p>Azúcar: ${n.sugars_100g || 0}g</p>
                <p>Grasa: ${n.fat_100g || 0}g</p>
                <p>Proteína: ${n.proteins_100g || 0}g</p>
                <p>Sal: ${n.salt_100g || 0}g</p>
                <p>Fibra: ${n.fiber_100g || 0}g</p>
            </div>
        `;

    } catch (error) {
        console.error(error);
        document.getElementById("resultado").innerHTML =
            "<p style='color:red;'>⚠️ Error al conectar</p>";
    }
}