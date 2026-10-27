import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CHART, PROJECT, SAMPLE_EN, SAMPLE_PT, type ScreenId, type SourceId } from './lib/data';
import { parseSequence, translateLine, translateText } from './lib/translate';

const STORAGE_KEY = 'pontoaponto:v1';

interface Saved {
  row: number;
  count: number;
  help: boolean;
}

function loadSaved(): Saved {
  const fallback = { row: 0, count: 0, help: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const s = JSON.parse(raw) as Partial<Saved>;
    const row = Number.isInteger(s.row) ? Math.min(Math.max(0, s.row!), PROJECT.rows.length - 1) : 0;
    const count = Number.isInteger(s.count) ? Math.max(0, s.count!) : 0;
    return { row, count, help: s.help !== false };
  } catch {
    return fallback;
  }
}

const DESKTOP_QUERY = '(min-width: 769px)';

export function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return desktop;
}

const RECIPE = PROJECT.rows.map(r => translateLine(r)!);

function useAppState() {
  const desktop = useIsDesktop();
  const [saved, setSaved] = useState(loadSaved);
  const { row, count, help } = saved;
  const [screen, setScreen] = useState<ScreenId>('inicio');
  /** Termo aberto na folha (celular) ou no cartão flutuante (computador). */
  const [sel, setSel] = useState<string | null>(null);
  const [glossSel, setGlossSel] = useState('pb');
  const [q, setQ] = useState('');
  const [input, setInput] = useState(SAMPLE_EN);
  const [draft, setDraft] = useState('');
  const [src, setSrc] = useState<SourceId>('texto');
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState('');
  const [chartRow, setChartRow] = useState(0);
  const [chartReading, setChartReading] = useState(false);
  const [chartNotice, setChartNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* armazenamento indisponível */ }
  }, [saved]);

  const rowTotal = RECIPE.length;
  const cur = RECIPE[row];
  const meta = cur.total ?? 0;
  const done = count >= meta;
  const seq = useMemo(() => parseSequence(PROJECT.rows[row]), [row]);

  const update = (patch: Partial<Saved> | ((s: Saved) => Partial<Saved>)) =>
    setSaved(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));

  const plus = useCallback(() => {
    try { navigator.vibrate?.(15); } catch { /* sem vibração */ }
    setSaved(s => ({ ...s, count: s.count + 1 }));
  }, []);
  const minus = () => update(s => ({ count: Math.max(0, s.count - 1) }));
  const reset = () => update({ count: 0 });
  const nextRow = useCallback(() => setSaved(s => ({ ...s, row: Math.min(rowTotal - 1, s.row + 1), count: 0 })), [rowTotal]);
  const prevRow = () => update(s => ({ row: Math.max(0, s.row - 1), count: 0 }));
  const pickRow = (i: number) => update({ row: i, count: 0 });

  // No computador, a barra de espaço conta como um toque no círculo.
  useEffect(() => {
    if (!desktop || screen !== 'contador') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName || '';
      if (/INPUT|TEXTAREA/.test(tag)) return;
      e.preventDefault();
      if (done) nextRow(); else plus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [desktop, screen, done, nextRow, plus]);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  // TODO: ler foto/PDF de verdade (OCR com um modelo de visão). Por enquanto carrega uma receita de exemplo.
  const readSrc = () => {
    if (reading) return;
    const pdf = src === 'pdf';
    setReading(true);
    later(() => {
      setReading(false);
      setSrc('texto');
      setInput(pdf ? SAMPLE_PT : SAMPLE_EN);
      setNotice(pdf ? 'Lemos o PDF. Confira se o texto está igual à receita.' : 'Lemos a foto. Confira se o texto está igual à receita.');
    }, 1200);
  };

  // TODO: reconhecer os símbolos de uma foto de gráfico. Por enquanto mostra o gráfico de exemplo.
  const chartPhoto = () => {
    if (chartReading) return;
    setChartReading(true);
    setChartNotice('');
    later(() => {
      setChartReading(false);
      setChartRow(0);
      setChartNotice('Encontramos 5 carreiras com corrente, ponto baixo e ponto alto.');
    }, 1400);
  };

  const pickSource = (id: SourceId) => { setSrc(id); setNotice(''); };
  const goTranslate = (source: SourceId, text?: string) => {
    if (text !== undefined) setInput(text);
    setSrc(source);
    setNotice('');
    setScreen('tradutor');
  };

  return {
    desktop, screen, setScreen,
    sel, openTerm: setSel, closeTerm: () => setSel(null),
    openInGlossary: () => { if (sel) setGlossSel(sel); setSel(null); setQ(''); setScreen('glossario'); },
    glossSel, setGlossSel, q, setQ,
    // Contador
    recipe: RECIPE, row, rowTotal, cur, meta, count, done, seq,
    pct: meta ? Math.min(100, Math.round((count / meta) * 100)) : 0,
    projPct: Math.round(((row + Math.min(1, meta ? count / meta : 0)) / rowTotal) * 100),
    plus, minus, reset, nextRow, prevRow, pickRow,
    help, setHelp: (h: boolean) => update({ help: h }),
    // Tradutor
    input, setInput, lines: useMemo(() => translateText(input), [input]),
    loadEN: () => setInput(SAMPLE_EN), loadPT: () => setInput(SAMPLE_PT), clear: () => setInput(''),
    src, pickSource, reading, readSrc, notice,
    draft, setDraft,
    translateDraft: () => { goTranslate('texto', draft.trim() ? draft : undefined); setDraft(''); },
    homeFoto: () => goTranslate('foto'), homePdf: () => goTranslate('pdf'),
    // Gráfico
    chartRow, setChartRow, chartReading, chartPhoto, chartNotice,
    chartPrev: () => setChartRow(r => Math.max(0, r - 1)),
    chartNext: () => setChartRow(r => Math.min(CHART.length - 1, r + 1)),
  };
}

export type AppState = ReturnType<typeof useAppState>;
const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  return <Ctx.Provider value={useAppState()}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp precisa de AppProvider');
  return v;
}
