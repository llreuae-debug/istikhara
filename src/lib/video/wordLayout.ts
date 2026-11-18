import { UNIVERSAL_SAFE_BOX } from "@/config/platforms916";

export interface WordBox {
  index: number;
  text: string;
  meaningUr: string;
  line: number;
  page: number;
  /** Left edge of the word bounding box */
  x: number;
  /** Top edge of the word bounding box */
  y: number;
  width: number;
  height: number;
  centerX: number;
  baselineY: number;
  meaningBaselineY?: number;
  pointerAnchorY: number;
}

export interface WordLayoutResult {
  boxes: WordBox[];
  totalPages: number;
}

/**
 * Lays out Arabic words RTL inside the universal safe zone, measuring each word
 * and paginating lines cleanly so nothing overflows or overlaps.
 */
export function layoutArabicWordsRTL(
  ctx: CanvasRenderingContext2D | null,
  tokens: string[],
  meaningsUr: string[],
  options: {
    fontFamily: string;
    fontSize: number;
    wordByWordMeaning: boolean;
    compactHeaderOnly?: boolean;
  }
): WordLayoutResult {
  if (tokens.length === 0) return { boxes: [], totalPages: 1 };

  const s = UNIVERSAL_SAFE_BOX;
  const sidePad = 36;
  const maxLineWidth = s.width - sidePad * 2;
  const rightEdge = s.x + s.width - sidePad;
  const startY = s.y + (options.compactHeaderOnly ? 320 : 215);
  const wordGap = Math.max(14, Math.round(options.fontSize * 0.34));
  const lineH = options.wordByWordMeaning
    ? Math.round(options.fontSize * 3.45)
    : Math.round(options.fontSize * 2.55);
  const maxLinesPerPage = options.wordByWordMeaning ? 2 : 3;

  if (ctx) {
    ctx.save();
    ctx.font = `400 ${options.fontSize}px ${options.fontFamily}`;
  }

  const measured = tokens.map((text, idx) => {
    const arW = ctx
      ? ctx.measureText(text).width
      : Math.max(36, text.length * options.fontSize * 0.48);
    let urW = 0;
    if (options.wordByWordMeaning && meaningsUr[idx] && ctx) {
      ctx.save();
      ctx.font = `400 21px 'Noto Nastaliq Urdu', serif`;
      urW = ctx.measureText(meaningsUr[idx]).width + 10;
      ctx.restore();
    }
    return {
      index: idx,
      text,
      meaningUr: meaningsUr[idx] || "",
      width: Math.max(arW, urW, 28),
    };
  });

  if (ctx) ctx.restore();

  // Wrap RTL into lines
  const lines: Array<typeof measured> = [];
  let currentLine: typeof measured = [];
  let currentW = 0;

  for (const item of measured) {
    const needed = currentLine.length === 0 ? item.width : item.width + wordGap;
    if (currentLine.length > 0 && currentW + needed > maxLineWidth) {
      lines.push(currentLine);
      currentLine = [item];
      currentW = item.width;
    } else {
      currentLine.push(item);
      currentW += needed;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine);

  const boxes: WordBox[] = [];
  const totalPages = Math.max(1, Math.ceil(lines.length / maxLinesPerPage));

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const page = Math.floor(lineIdx / maxLinesPerPage);
    const lineInPage = lineIdx % maxLinesPerPage;
    const lineItems = lines[lineIdx];

    // Center each RTL line horizontally within safe zone
    const totalLineW =
      lineItems.reduce((acc, w) => acc + w.width, 0) +
      Math.max(0, lineItems.length - 1) * wordGap;
    let cursorRight =
      rightEdge - Math.max(0, (maxLineWidth - totalLineW) / 2);

    const baselineY = startY + lineInPage * lineH;
    const height = Math.round(options.fontSize * 1.15);
    const meaningBaselineY = options.wordByWordMeaning
      ? baselineY + Math.round(options.fontSize * 0.85) + 18
      : undefined;
    const pointerAnchorY =
      (meaningBaselineY ?? baselineY) +
      (options.wordByWordMeaning ? 26 : 22);

    for (const item of lineItems) {
      const x = cursorRight - item.width;
      const y = baselineY - Math.round(options.fontSize * 0.82);
      boxes.push({
        index: item.index,
        text: item.text,
        meaningUr: item.meaningUr,
        line: lineIdx,
        page,
        x,
        y,
        width: item.width,
        height,
        centerX: x + item.width / 2,
        baselineY,
        meaningBaselineY,
        pointerAnchorY,
      });
      cursorRight = x - wordGap;
    }
  }

  return { boxes, totalPages };
}
