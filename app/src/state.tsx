import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CHART, SAMPLE_EN, SAMPLE_PT, type ScreenId, type SourceId } from './lib/data';
import { isPdf, OcrError, readImage, readPdf } from './lib/ocr';
import { EXAMPLE, buildParts, emptyProgress, isFirst, isLast, newId, projectPct, step, type Progress, type Project } from './lib/project';
import { bodySequence, stitchSequence } from './lib/sequence';
import { SQUARE } from './lib/square';
import { translateLine, translateText } from './lib/translate';

export type ChartKind = 'square' | 'reto';

export interface Notice {
  text: string;
  error?: boolean;
}

const STORAGE_KEY = 'pontoaponto:v2';
/** Versão antiga: só a volta e a contagem do ursinho de exemplo. */
const OLD_KEY = 'pontoaponto:v1';

interface Saved {
  projects: Project[];
  current: string | null;
  progress: Record<string, Progress>;
  help: boolean;
}

/** Garante que o progresso salvo cabe no projeto (partes, peças e carreiras existentes). */
function fixProgress(p: Project, prog: Progress | undefined): Progress {
  const base = emptyProgress(p);
  if (!prog || !Array.isArray(prog.spots)) return base;
  const int = (v: unknown, max: number) => (Number.isInteger(v) ? Math.min(Math.max(0, v as number), max) : 0);
  return {
    finished: prog.finished === true,
    part: int(prog.part, p.parts.length - 1),
    spots: p.parts.map((part, i) => {
      const s = prog.spots[i];
      if (!s) return base.spots[i];
      return { copy: int(s.copy, part.copies - 1), row: int(s.row, part.rows.length - 1), count: int(s.count, 9999) };
    }),
  };
}

function loadSaved(): Saved {
  const fresh: Saved = { projects: [EXAMPLE], current: EXAMPLE.id, progress: { [EXAMPLE.id]: emptyProgress(EXAMPLE) }, help: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Saved;
      const projects = (Array.isArray(s.projects) ? s.projects : []).filter(p => p && p.id && Array.isArray(p.parts) && p.parts.length);
      const progress = Object.fromEntries(projects.map(p => [p.id, fixProgress(p, s.progress?.[p.id])]));
      const current = projects.some(p => p.id === s.current) ? s.current : projects[0]?.id ?? null;
      return { projects, current, progress, help: s.help !== false };
    }
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const o = JSON.parse(old) as { row?: number; count?: number; help?: boolean };
      const prog = fixProgress(EXAMPLE, { part: 0, spots: [{ copy: 0, row: o.row ?? 0, count: o.count ?? 0 }] });
      return { ...fresh, progress: { [EXAMPLE.id]: prog }, help: o.help !== false };
    }
  } catch { /* armazenamento indisponível ou corrompido: começa do zero */ }
  return fresh;
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

function useAppState() {
  const desktop = useIsDesktop();
  const [saved, setSaved] = useState(loadSaved);
  const { projects, help } = saved;
  const [projectsOpen, setProjectsOpen] = useState(false);
  /** Aviso ao passar de parte ou de peça: "Você terminou a Árvore. Agora: Vaso." */
  const [flash, setFlash] = useState('');
  const [screen, setScreen] = useState<ScreenId>('inicio');
  /** Termo aberto na folha (celular) ou no cartão flutuante (computador). */
  const [sel, setSel] = useState<string | null>(null);
  const [glossSel, setGlossSel] = useState('pb');
  const [q, setQ] = useState('');
  const [input, setInput] = useState(SAMPLE_EN);
  const [draft, setDraft] = useState('');
  const [src, setSrc] = useState<SourceId>('texto');
  /** Texto de progresso enquanto lê uma foto ou PDF; null quando parado. */
  const [readStatus, setReadStatus] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  /** Qual exemplo de gráfico está aberto: o square (em voltas) ou o pano reto (em carreiras). */
  const [chartKind, setChartKind] = useState<ChartKind>('square');
  const [chartRow, setChartRow] = useState(0);
  const [squareRound, setSquareRound] = useState(0);
  const [chartNotice, setChartNotice] = useState('');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* armazenamento indisponível */ }
  }, [saved]);

  // ---------- Contador: projeto, parte e carreira atuais ----------
  const project = projects.find(p => p.id === saved.current) ?? null;
  const prog = project ? fixProgress(project, saved.progress[project.id]) : null;
  const part = project && prog ? project.parts[prog.part] : null;
  const spot = prog ? prog.spots[prog.part] : { copy: 0, row: 0, count: 0 };
  const rowData = part ? part.rows[spot.row] : null;
  const count = spot.count;
  const cur = useMemo(() => rowData ? translateLine(rowData.raw)! : null, [rowData]);
  const seq = useMemo(() => !rowData ? null : rowData.body ? bodySequence(rowData.body) : stitchSequence(rowData.raw), [rowData]);
  const meta = seq ? seq.st.length : cur?.total ?? null;
  const done = meta !== null && count >= meta;
  const partRows = useMemo(() => part ? part.rows.map(r => ({ ...r, line: translateLine(r.raw)! })) : [], [part]);

  const setProg = useCallback((fn: (p: Progress, project: Project) => Progress) => setSaved(s => {
    const pr = s.projects.find(p => p.id === s.current);
    if (!pr) return s;
    return { ...s, progress: { ...s.progress, [pr.id]: fn(fixProgress(pr, s.progress[pr.id]), pr) } };
  }), []);
  const setSpot = useCallback((fn: (s: Progress['spots'][number]) => Partial<Progress['spots'][number]>) =>
    setProg(p => ({ ...p, spots: p.spots.map((s, i) => i === p.part ? { ...s, ...fn(s) } : s) })), [setProg]);

  const plus = useCallback(() => {
    try { navigator.vibrate?.(15); } catch { /* sem vibração */ }
    setFlash('');
    setSpot(s => ({ count: s.count + 1 }));
  }, [setSpot]);
  const minus = () => { setFlash(''); setSpot(s => ({ count: Math.max(0, s.count - 1) })); };
  const reset = () => setSpot(() => ({ count: 0 }));
  const nextRow = () => {
    if (!project || !prog || !part) return;
    const n = step(project, prog, 1);
    setProg(() => n);
    if (n.finished) setFlash('');
    else if (n.part !== prog.part) setFlash(`Você terminou: ${part.name}. Agora: ${project.parts[n.part].name}.`);
    else if (n.spots[n.part].copy !== spot.copy) setFlash(`Peça ${spot.copy + 1} de ${part.copies} pronta. Agora a peça ${spot.copy + 2}.`);
    else setFlash('');
  };
  const prevRow = () => { setFlash(''); setProg((p, pr) => step(pr, p, -1)); };
  const pickRow = (i: number) => { setFlash(''); setProg(p => ({ ...p, finished: false, spots: p.spots.map((s, k) => k === p.part ? { ...s, row: i, count: 0 } : s) })); };
  const pickPart = (i: number) => { setFlash(''); setProg(p => ({ ...p, part: i, finished: false })); };
  const restart = () => { setFlash(''); setProg((_, pr) => emptyProgress(pr)); };
  const pickProject = (id: string) => { setFlash(''); setSaved(s => ({ ...s, current: id })); setProjectsOpen(false); setScreen('contador'); };
  /** Cria um projeto a partir do texto da receita. Devolve false se não achou nenhuma carreira. */
  const createProject = (name: string, text: string) => {
    const title = name.trim() || 'Minha receita';
    const parts = buildParts(text, title);
    if (!parts.length) return false;
    const p: Project = { id: newId(), name: title, parts };
    setSaved(s => ({ ...s, projects: [p, ...s.projects], current: p.id, progress: { ...s.progress, [p.id]: emptyProgress(p) } }));
    setScreen('contador');
    return true;
  };
  const deleteProject = (id: string) => setSaved(s => {
    const projects = s.projects.filter(p => p.id !== id);
    const progress = { ...s.progress };
    delete progress[id];
    return { ...s, projects, progress, current: s.current === id ? projects[0]?.id ?? null : s.current };
  });
  const addExample = () => setSaved(s => s.projects.some(p => p.id === EXAMPLE.id) ? { ...s, current: EXAMPLE.id }
    : { ...s, projects: [...s.projects, EXAMPLE], current: EXAMPLE.id, progress: { ...s.progress, [EXAMPLE.id]: emptyProgress(EXAMPLE) } });

  // No computador, a barra de espaço conta como um toque no círculo.
  useEffect(() => {
    if (!desktop || screen !== 'contador' || !project || prog?.finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName || '';
      if (/INPUT|TEXTAREA/.test(tag)) return;
      e.preventDefault();
      if (done) nextRow(); else plus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });


  const readFile = async (file: File) => {
    if (readStatus) return;
    const pdf = isPdf(file);
    const what = pdf ? 'o PDF' : 'a foto';
    setNotice(null);
    setReadStatus(pdf ? 'Abrindo o PDF…' : 'Preparando o leitor…');
    try {
      const text = await (pdf ? readPdf : readImage)(file, setReadStatus);
      if (!text) {
        setNotice({ error: true, text: pdf
          ? 'Não encontramos texto no PDF. Tente outro arquivo ou cole o texto.'
          : 'Não encontramos texto na foto. Tente uma foto mais nítida e com boa luz, ou cole o texto.' });
        return;
      }
      setInput(text);
      setSrc('texto');
      setNotice({ text: `Lemos ${what}. Confira se o texto está igual à receita.` });
    } catch (e) {
      console.error(e);
      setNotice({ error: true, text: e instanceof OcrError ? e.message : `Não conseguimos ler ${what}. Tente de novo ou cole o texto da receita.` });
    } finally {
      setReadStatus(null);
    }
  };

  // TODO: ler a foto com IA (opção 2), que devolveria os mesmos dados de src/lib/square.ts.
  const chartPhoto = () => setChartNotice('Ler gráficos por foto ainda está em construção. Enquanto isso, veja abaixo como ler um gráfico, volta por volta.');
  const chartLast = chartKind === 'square' ? SQUARE.rounds.length - 1 : CHART.length - 1;
  const setChartStep = chartKind === 'square' ? setSquareRound : setChartRow;

  const pickSource = (id: SourceId) => { setSrc(id); setNotice(null); };
  const goTranslate = (source: SourceId, text?: string) => {
    if (text !== undefined) setInput(text);
    setSrc(source);
    setNotice(null);
    setScreen('tradutor');
  };

  return {
    desktop, screen, setScreen,
    sel, openTerm: setSel, closeTerm: () => setSel(null),
    openInGlossary: () => { if (sel) setGlossSel(sel); setSel(null); setQ(''); setScreen('glossario'); },
    glossSel, setGlossSel, q, setQ,
    // Contador
    projects, project, part, partIndex: prog?.part ?? 0, spot, rowData, partRows, cur, meta, count, done, seq,
    progressOf: (p: Project) => fixProgress(p, saved.progress[p.id]),
    pctOf: (p: Project) => projectPct(p, fixProgress(p, saved.progress[p.id]), p.id === project?.id ? meta : null),
    pct: meta ? Math.min(100, Math.round((count / meta) * 100)) : 0,
    projPct: project && prog ? projectPct(project, prog, meta) : 0,
    atStart: prog ? isFirst(prog) : true, atEnd: project && prog ? isLast(project, prog) : true,
    finished: !!prog?.finished, flash,
    plus, minus, reset, nextRow, prevRow, pickRow, pickPart, restart, pickProject, createProject, deleteProject, addExample,
    projectsOpen, setProjectsOpen,
    help, setHelp: (h: boolean) => setSaved(s => ({ ...s, help: h })),
    // Tradutor
    input, setInput, lines: useMemo(() => translateText(input), [input]),
    loadEN: () => setInput(SAMPLE_EN), loadPT: () => setInput(SAMPLE_PT), clear: () => setInput(''),
    src, pickSource, readStatus, readFile, notice,
    draft, setDraft,
    translateDraft: () => { goTranslate('texto', draft.trim() ? draft : undefined); setDraft(''); },
    homeFoto: () => goTranslate('foto'), homePdf: () => goTranslate('pdf'),
    // Gráfico
    chartKind, setChartKind, chartRow, setChartRow, squareRound, setSquareRound, chartPhoto, chartNotice,
    chartStep: chartKind === 'square' ? squareRound : chartRow, chartLast,
    chartPrev: () => setChartStep(r => Math.max(0, r - 1)),
    chartNext: () => setChartStep(r => Math.min(chartLast, r + 1)),
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
