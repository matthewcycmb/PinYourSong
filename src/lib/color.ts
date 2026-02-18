import { Vibrant } from "node-vibrant/node";

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));

  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

export async function extractColors(imageUrl: string): Promise<{ color: string; bgTint: string }> {
  try {
    // Use 300x300 version if available
    const url = imageUrl.replace(/\/\d+x\d+\//, "/300x300/");
    const palette = await Vibrant.from(url).getPalette();
    const swatch = palette.Vibrant ?? palette.Muted ?? palette.DarkVibrant;

    if (swatch) {
      const color = swatch.hex;
      const bgTint = lightenHex(color, 0.3);
      return { color, bgTint };
    }
  } catch {
    // fall through to default
  }

  return { color: "#8a7a6a", bgTint: "#a09080" };
}
