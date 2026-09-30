import { useEffect, useState } from 'react';
import ImportDicomButton from './components/ImportDicomButton';
import TopBar from './components/TopBar';
import TopbarGroup from './components/TopbarGroup';
import ViewportGrid from './components/ViewportGrid';
import ValueButton from './components/ValueButton';
import cornerstoneService from './services/cornerstoneService';
import viewportLayouts from './enums/viewportLayouts';
import './components/styles.css';

function App() {
  const [viewportLayout, setViewportLayout] = useState<'singleVolume' | 'volumeBy3d' | 'volumeThreeAxis'>('singleVolume');

  const layout = viewportLayouts[viewportLayout];

  useEffect(() => {
    cornerstoneService.initialize();
  })

  if (false) return (
    <>
      <TopBar>
        <ImportDicomButton />
        <TopbarGroup
          spacing="0.5rem"
        >
          <ValueButton
            value="singleVolume"
            action={setViewportLayout}
          />
          <ValueButton
            value="volumeBy3d"
            action={setViewportLayout}
          />
          <ValueButton
            value="volumeThreeAxis"
            action={setViewportLayout}
          />
        </TopbarGroup>
      </TopBar>
      <ViewportGrid layout={layout} />
    </>
  )

  return (
    <>
      <div className="topbar w-full h-10 flex flex-row space-x-10 bg-amber-400">
        <TopbarGroup>
          <ImportDicomButton />
        </TopbarGroup>
        <TopbarGroup>
          <ValueButton 
            value="singleVolume"
            action={setViewportLayout}
          />
          <ValueButton 
            value="volumeBy3d"
            action={setViewportLayout}
          />
          <ValueButton 
            value="volumeThreeAxis"
            action={setViewportLayout}
          />
        </TopbarGroup>
      </div>
      <div className="main w-full h-full flex flex-row">
        <div className="left-drawer h-full w-50 bg-green-300">

        </div>
      <div className="content w-full h-full flex flex-col">
        <div className="content-toolbar-1 w-full h-10 flex flex-row bg-yellow-300">

        </div>
        <div className="content-topbar-2 w-full h-10 flex flex-row bg-orange-300">

        </div>
        <div className="viewer-container w-full h-full flex flex-row-reverse">
          <div className="viewer-drawer-right h-full w-[25%] flex flex-col bg-violet-300">

          </div>
          <ViewportGrid layout={layout}/>
        </div>
      </div>
      </div>
    </>
  )
}

export default App
