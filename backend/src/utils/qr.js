import QRCode from "qrcode";

export function generateAccessCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const numbers = "23456789";
  const p1 = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join("");
  return `${p1}-${p2}`;
}

export async function toQrDataUrl(text) {
  return QRCode.toDataURL(text, { margin: 1, width: 280 });
}
