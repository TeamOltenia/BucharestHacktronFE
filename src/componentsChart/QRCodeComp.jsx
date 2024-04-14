import React from "react";
import { QRCodeSVG } from "qrcode.react"; // Import QRCodeSVG or QRCodeCanvas

function QR({ merchant }) {
  const url = `https://c47j3y3wo6rzudgb6p7wqyaqie0ejclq.lambda-url.eu-north-1.on.aws/?merchant=${encodeURIComponent(
    merchant
  )}`;

  return (
    <div className="App">
      <header className="App-header">
        <h1>Scan this QR Code</h1>
        <QRCodeSVG value={url} /> {/* Use QRCodeSVG or QRCodeCanvas */}
      </header>
    </div>
  );
}

export default QR;
