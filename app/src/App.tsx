import { DesktopShell, MobileShell } from './components/Shell';
import { AppProvider, useApp } from './state';
import { Contador } from './screens/Contador';
import { Glossario } from './screens/Glossario';
import { Grafico } from './screens/Grafico';
import { Inicio } from './screens/Inicio';
import { Tradutor } from './screens/Tradutor';

const SCREENS = { inicio: Inicio, contador: Contador, tradutor: Tradutor, grafico: Grafico, glossario: Glossario };

function Layout() {
  const { desktop, screen } = useApp();
  const Screen = SCREENS[screen];
  const Shell = desktop ? DesktopShell : MobileShell;
  return <Shell><Screen /></Shell>;
}

export default function App() {
  return <AppProvider><Layout /></AppProvider>;
}
