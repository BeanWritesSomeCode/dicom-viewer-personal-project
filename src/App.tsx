import { useEffect, useState } from 'react';
import ImportDicomButton from './components/ImportDicomButton';
import TopBar from './components/TopBar';
import TopbarGroup from './components/TopbarGroup';
import ViewportGrid from './components/ViewportGrid';
import ValueButton from './components/ValueButton';
import useCornerstoneStore from './stores/cornerstoneStore';
import { viewportLayouts } from './lib/constants';
import './components/styles.css';

function App() {
  const cornerstoneState = useCornerstoneStore((state) => state);
  const [viewportLayout, setViewportLayout] = useState<'single' | 'mpr' | 'one-by-three'>('single');

  const layout = viewportLayouts[viewportLayout];

  useEffect(() => {
    cornerstoneState.initialize();
  })

  return (
    <>
      <TopBar>
        <ImportDicomButton />
        <TopbarGroup
          spacing="0.5rem"
        >
          <ValueButton
            value="single"
            action={setViewportLayout}
          />
          <ValueButton
            value="mpr"
            action={setViewportLayout}
          />
          <ValueButton
            value="one-by-three"
            action={setViewportLayout}
          />
        </TopbarGroup>
      </TopBar>
      <ViewportGrid layout={layout} />
    </>
  )
}

export default App
