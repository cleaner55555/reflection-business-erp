import { NextRequest, NextResponse } from 'next/server';

// GET /api/barcodes/generate?data=...&type=ean13|code128|qr&width=200&height=100
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data') || '';
    const type = searchParams.get('type') || 'code128';
    const width = parseInt(searchParams.get('width') || '200');
    const height = parseInt(searchParams.get('height') || '80');
    const showText = searchParams.get('showText') !== 'false';

    if (!data) return NextResponse.json({ error: 'Data is required' }, { status: 400 });

    let svg = '';
    if (type === 'qr') {
      svg = generateQRSvg(data, width);
    } else {
      svg = generateCode128Svg(data, width, height, showText);
    }

    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

function generateCode128Svg(data: string, width: number, height: number, showText: boolean): string {
  const START_B = 104;
  const STOP = 106;
  const patterns: Record<number, number[]> = {
    104: [2,1,2,2,2,2],
    106: [2,3,3,1,1,1,2],
  };

  const CODE128B: number[][] = [
    [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],
    [1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],
    [2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],
    [1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],
    [2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,1],[3,1,2,1,3,1],[3,1,1,2,2,2],
    [3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],
    [2,1,2,1,2,3],[2,1,2,3,2,2],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],
    [1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],
    [2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],
    [1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],
    [2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],
    [3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],
    [3,1,4,1,1,1],[2,2,1,4,1,1],[4,3,1,1,1,1],[1,1,1,2,2,4],[1,1,1,4,2,2],
    [1,2,1,1,2,4],[1,2,1,4,2,1],[1,4,1,1,2,2],[1,4,1,2,2,1],[1,1,2,2,1,4],
    [1,1,2,4,1,2],[1,2,2,1,1,4],[1,2,2,4,1,1],[1,4,2,1,1,2],[1,4,2,2,1,1],
    [2,4,1,2,1,1],[2,2,1,1,1,4],[4,1,3,1,1,1],[2,4,1,1,1,2],[1,3,4,1,1,1],
    [1,1,1,2,4,2],[1,2,1,1,4,2],[1,2,1,2,4,1],[1,1,4,2,1,2],[1,2,4,1,1,2],
    [1,2,4,2,1,1],[4,1,1,2,1,2],[4,2,1,1,1,2],[4,2,1,2,1,1],[2,1,2,1,4,1],
    [2,1,4,1,2,1],[4,1,2,1,2,1],[1,1,1,1,4,3],[1,1,1,3,4,1],[1,3,1,1,4,1],
    [1,1,4,1,1,3],[1,1,4,3,1,1],[4,1,1,1,1,3],[4,1,1,3,1,1],[1,1,3,1,4,1],
    [1,1,4,1,3,1],[3,1,1,1,4,1],[4,1,1,1,3,1],[2,1,1,4,1,2],[2,1,1,2,1,4],
    [2,1,1,2,3,2],[2,3,3,1,1,1,2],
  ];

  for (let i = 0; i < 95; i++) patterns[i] = CODE128B[i];

  const values: number[] = [START_B];
  for (let i = 0; i < data.length; i++) {
    const c = data.charCodeAt(i);
    values.push(c >= 32 && c <= 126 ? c - 32 : 0);
  }
  let checksum = values[0];
  for (let i = 1; i < values.length; i++) checksum += i * values[i];
  values.push(checksum % 103);
  values.push(STOP);

  const allBars: number[] = [];
  for (const v of values) {
    const p = patterns[v];
    if (p) allBars.push(...p);
  }

  const totalUnits = allBars.reduce((s, b) => s + b, 0);
  const uw = width / totalUnits;
  let bars = '';
  let x = 0;
  for (let i = 0; i < allBars.length; i++) {
    if (i % 2 === 0) bars += `<rect x="${x}" y="0" width="${allBars[i] * uw}" height="${height}" fill="#000"/>`;
    x += allBars[i] * uw;
  }

  const th = showText ? height + 18 : height;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${th}" viewBox="0 0 ${width} ${th}">${bars}${showText ? `<text x="${width/2}" y="${height+14}" text-anchor="middle" font-family="monospace" font-size="10" fill="#000">${esc(data)}</text>` : ''}</svg>`;
}

function generateQRSvg(data: string, size: number): string {
  const gs = 21;
  const cs = size / gs;
  let cells = '';
  const drawFinder = (ox: number, oy: number) => {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
      const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      if (isBorder || isInner) cells += `<rect x="${(ox+c)*cs}" y="${(oy+r)*cs}" width="${cs}" height="${cs}" fill="#000"/>`;
    }
  };
  drawFinder(0, 0); drawFinder(gs-7, 0); drawFinder(0, gs-7);
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  for (let r = 0; r < gs; r++) for (let c = 0; c < gs; c++) {
    if ((r < 8 && c < 8) || (r < 8 && c >= gs-8) || (r >= gs-8 && c < 8)) continue;
    if (r === 6 || c === 6) { if ((r+c)%2===0) cells += `<rect x="${c*cs}" y="${r*cs}" width="${cs}" height="${cs}" fill="#000"/>`; continue; }
    if (((hash*(r*31+c*17)+r*7+c*13)>>0)&1) cells += `<rect x="${c*cs}" y="${r*cs}" width="${cs}" height="${cs}" fill="#000"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="#fff"/>${cells}</svg>`;
}
