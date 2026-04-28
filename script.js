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
        qrbox: { width: 300, height: 150 },
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      },
      (decodedText) => {

        scanner.stop().then(() => {
          scanner.clear();
          scanner = null;
          reader.innerHTML = "";
        });

        buscarProducto(decodedText, numero);
      }
    );

  }, 300);
}