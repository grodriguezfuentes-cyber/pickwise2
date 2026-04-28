function escanearProducto(numero) {

  const reader = document.getElementById("reader");

  // limpiar UI
  reader.innerHTML = "";

  // destruir scanner anterior
  if (scanner) {
    try {
      scanner.stop().catch(() => {});
      scanner.clear();
    } catch {}
    scanner = null;
  }

  // pequeño delay (CLAVE en iPhone)
  setTimeout(() => {

    scanner = new Html5Qrcode("reader");

    scanner.start(
      { facingMode: "environment" },
      {
        fps: 8, // más estable en iPhone
        qrbox: { width: 220, height: 220 }
      },
      (decodedText) => {

        scanner.stop().then(() => {
          scanner.clear();
          scanner = null;
          reader.innerHTML = "";
        });

        buscarProducto(decodedText, numero);
      },
      () => {}
    );

  }, 300); // 👈 esto es lo que arregla iPhone
}