function escanearProducto(numero) {

  const reader = document.getElementById("reader");
  if (!reader) return;

  reader.innerHTML = "📷 Activando cámara...";

  if (scanner) {
    try {
      scanner.stop().catch(() => {});
      scanner.clear();
    } catch {}
    scanner = null;
  }

  setTimeout(() => {

    reader.innerHTML = "";

    scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250
      },
      (decodedText) => {

        scanner.stop().then(() => {
          scanner.clear();
          scanner = null;
          reader.innerHTML = "";
        });

        buscarProducto(decodedText, numero);
      },
      (errorMessage) => {
        // este error es normal mientras busca código → ignorar
      }
    ).catch(err => {
      console.error("Error cámara:", err);
      reader.innerHTML = "❌ No se pudo acceder a la cámara";
    });

  }, 300);
}