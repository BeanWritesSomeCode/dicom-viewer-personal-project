import { useEffect, useState } from 'react';
import ImportDicomButton from './components/ImportDicomButton';
import TopBar from './components/TopBar';
import ViewportGrid from './components/ViewportGrid';
import ValueButton from './components/ValueButton';
import useCornerstoneStore from './stores/cornerstoneStore';
import viewportLayouts from './enums/viewportLayouts';
import './App.css'

function App() {
  const cornerstoneState = useCornerstoneStore((state) => state);
  const [viewportLayout, setViewportLayout] = useState<'single' | 'double' | 'triple' | 'quad'>('double');

  useEffect(() => {
    cornerstoneState.initialize();
  })

  return (
    <>
      <TopBar>
        <ImportDicomButton />
        <ValueButton
          value="single"
          action={setViewportLayout}
        />
        <ValueButton
          value="double"
          action={setViewportLayout}
        />
        <ValueButton
          value="triple"
          action={setViewportLayout}
        />
        <ValueButton
          value="quad"
          action={setViewportLayout}
        />
      </TopBar>
      <ViewportGrid layout={viewportLayouts.volumeThreeAxis} />
    </>
  )
}

export default App
