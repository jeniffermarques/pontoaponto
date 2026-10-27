// Copia o motor do OCR (tesseract) e os idiomas para public/ocr, para o app não depender de CDN.
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'ocr');
const pkg = name => dirname(require.resolve(name + '/package.json'));

const files = [
  [join(pkg('tesseract.js'), 'dist', 'worker.min.js'), 'worker.min.js'],
  // Só as variantes LSTM: o app usa o modo LSTM, e cada navegador baixa apenas uma delas.
  ...['lstm', 'simd-lstm', 'relaxedsimd-lstm'].map(v => [join(pkg('tesseract.js-core'), `tesseract-core-${v}.wasm.js`), `core/tesseract-core-${v}.wasm.js`]),
  ...['por', 'eng'].map(l => [join(pkg(`@tesseract.js-data/${l}`), '4.0.0_best_int', `${l}.traineddata.gz`), `lang/${l}.traineddata.gz`]),
];

for (const [from, to] of files) {
  mkdirSync(dirname(join(out, to)), { recursive: true });
  copyFileSync(from, join(out, to));
}
console.log(`OCR: ${files.length} arquivos copiados para public/ocr`);
