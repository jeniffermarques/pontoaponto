// Leitura de receitas em foto ou PDF, feita no próprio navegador.
// Fotos passam pelo tesseract (OCR). PDFs com texto são lidos direto pelo pdf.js;
// PDFs escaneados (só imagem) têm cada página desenhada e passada pelo OCR.
import type { Worker } from 'tesseract.js';

export type Progress = (label: string) => void;

export class OcrError extends Error {}

const MAX_SIDE = 2400;
const MAX_PDF_PAGES = 10;
/** Menos letras que isso num PDF quer dizer que ele é escaneado. */
const MIN_PDF_TEXT = 20;

const asset = (p: string) => new URL(import.meta.env.BASE_URL + 'ocr/' + p, location.href).href;

let workerPromise: Promise<Worker> | null = null;
let onLog: ((m: { status: string; progress: number }) => void) | null = null;

function getWorker() {
  workerPromise ??= import('tesseract.js').then(({ createWorker, OEM }) =>
    createWorker(['por', 'eng'], OEM.LSTM_ONLY, {
      workerPath: asset('worker.min.js'),
      corePath: asset('core'),
      langPath: asset('lang'),
      logger: m => onLog?.(m),
    })).catch(e => { workerPromise = null; throw e; });
  return workerPromise;
}

async function recognize(image: HTMLCanvasElement, progress: Progress, prefix = '') {
  onLog = m => progress(m.status === 'recognizing text'
    ? `${prefix}Lendo a receita… ${Math.round(m.progress * 100)}%`
    : 'Preparando o leitor…');
  progress('Preparando o leitor…');
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(image);
    return data.text;
  } finally {
    onLog = null;
  }
}

/** Desenha a imagem num canvas, já virada do jeito certo e reduzida se for muito grande. */
async function imageToCanvas(file: Blob) {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new OcrError('Não conseguimos abrir esta imagem. Use uma foto em JPG ou PNG.');
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return canvas;
}

export async function readImage(file: Blob, progress: Progress) {
  const canvas = await imageToCanvas(file);
  return cleanText(await recognize(canvas, progress));
}

interface PdfItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
  eol: boolean;
}

/** Junta os pedaços de texto de uma página do PDF em linhas. */
export function itemsToLines(items: PdfItem[]) {
  const lines: string[] = [];
  let line = '';
  let prev: PdfItem | null = null;
  let breakNext = false;
  for (const it of items) {
    if (!it.str) { breakNext ||= it.eol; continue; }
    if (prev) {
      const newLine = breakNext || prev.eol || Math.abs(it.y - prev.y) > Math.max(prev.h, it.h, 1) * 0.5;
      if (newLine) { lines.push(line); line = ''; }
      else if (it.x - (prev.x + prev.w) > Math.max(prev.h, it.h) * 0.15 && !/\s$/.test(line) && !/^\s/.test(it.str)) line += ' ';
    }
    line += it.str;
    prev = it;
    breakNext = false;
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

export async function readPdf(file: Blob, progress: Progress) {
  progress('Abrindo o PDF…');
  const pdfjs = await import('pdfjs-dist');
  const { default: workerSrc } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let doc;
  try {
    doc = await task.promise;
  } catch (e) {
    void task.destroy();
    if ((e as Error)?.name === 'PasswordException') throw new OcrError('Este PDF tem senha. Abra-o, copie o texto e cole aqui.');
    throw new OcrError('Não conseguimos abrir este PDF. Confira se o arquivo não está corrompido.');
  }
  try {
    const pages = Math.min(doc.numPages, MAX_PDF_PAGES);
    const texts: string[] = [];
    for (let n = 1; n <= pages; n++) {
      const page = await doc.getPage(n);
      const content = await page.getTextContent();
      texts.push(itemsToLines(content.items.flatMap(i => 'str' in i
        ? [{ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: i.height, eol: i.hasEOL }]
        : [])));
    }
    const text = cleanText(texts.join('\n'));
    if (text.replace(/\s/g, '').length >= MIN_PDF_TEXT) return text;

    // PDF escaneado: desenha cada página e passa pelo OCR.
    const ocr: string[] = [];
    for (let n = 1; n <= pages; n++) {
      const page = await doc.getPage(n);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(3, MAX_SIDE / Math.max(base.width, base.height)) });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;
      ocr.push(await recognize(canvas, progress, pages > 1 ? `Página ${n} de ${pages} · ` : ''));
    }
    return cleanText(ocr.join('\n'));
  } finally {
    void task.destroy();
  }
}

export const isPdf = (file: File) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

/** Arruma o texto lido: espaços, aspas tortas e o "×" de repetição. */
export function cleanText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]/g, ' ')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .replace(/×\s*(\d)/g, 'x$1')
    .split('\n').map(l => l.replace(/ {2,}/g, ' ').trim()).filter(Boolean)
    .join('\n');
}
