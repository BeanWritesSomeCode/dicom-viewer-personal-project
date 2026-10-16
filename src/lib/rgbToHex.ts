export function rgbaToHex(r: number, g: number, b: number, a?: number) {
    let aHex;
    if (a) {
        aHex = a.toString(16).padStart(2, '0');
    }

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}${aHex ?? ''}`
}

export function hexToRgba(hex: string) {
    if (!hex.match('/#\d{2}\d{2}\d{2}(\d{2})?')) {
        return null;
    }

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(3, 5), 16) / 255;
    const a = parseInt(hex.slice(5, 7), 16) / 255;

    return [r, g, b, a];
}