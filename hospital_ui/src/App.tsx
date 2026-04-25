import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import StatsBar from './components/StatsBar';
import WorkerList from './components/WorkerList';
import MapView from './components/MapView';
import ProtocolPanel from './components/ProtocolPanel';
import Ticker from './components/Ticker';

export default function App() {
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);

  return (
    <>
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <StatsBar />
        <div className="body-cols">
          <WorkerList selectedIdx={selectedWorker} onSelect={setSelectedWorker} />
          <MapView selectedIdx={selectedWorker} />
          <ProtocolPanel />
        </div>
        <Ticker />
      </div>
    </>
  );
}
