import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { workers } from '../data/demo';

function createIcon(initials: string, color: string, offline: boolean) {
  return L.divIcon({
    className: '',
    html: `<div class="wmk${offline ? ' offline' : ''}" style="background:${color}">${initials}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

interface ControllerProps {
  selectedIdx: number | null;
  markerRefs: React.MutableRefObject<(L.Marker | null)[]>;
}

function MapController({ selectedIdx, markerRefs }: ControllerProps) {
  const map = useMap();
  useEffect(() => {
    if (selectedIdx === null) return;
    const w = workers[selectedIdx];
    map.flyTo([w.lat, w.lng], 9, { duration: 1.1, easeLinearity: 0.4 });
    const timer = setTimeout(() => {
      markerRefs.current[selectedIdx]?.openPopup();
    }, 1100);
    return () => clearTimeout(timer);
  }, [selectedIdx, map, markerRefs]);
  return null;
}

interface Props {
  selectedIdx: number | null;
}

export default function MapView({ selectedIdx }: Props) {
  const markerRefs = useRef<(L.Marker | null)[]>(new Array(workers.length).fill(null));

  return (
    <div className="center-col">
      <div className="map-wrap">
        <MapContainer
          center={[14.2, 46.2]}
          zoom={6}
          zoomControl
          attributionControl
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {workers.map((w, i) => (
            <Marker
              key={i}
              position={[w.lat, w.lng]}
              icon={createIcon(w.initials, w.color, !!w.offline)}
              ref={r => { markerRefs.current[i] = r; }}
            >
              <Popup closeButton={false}>
                <div className="mpop">
                  <div className="mpop-name">{w.name}</div>
                  <div className="mpop-ar">{w.nameAr}</div>
                  <div className="mpop-row">
                    <span className="mpop-st" style={{ color: w.syncColor }}>{w.status}</span>
                    <span className="mpop-cs">{w.cases} cases</span>
                  </div>
                  <div className="mpop-cite">{w.cite}</div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController selectedIdx={selectedIdx} markerRefs={markerRefs} />
        </MapContainer>

        <div className="map-leg">
          <div className="ml-hdr">Worker Status</div>
          <div className="ml-row"><div className="ml-dot" style={{ background: 'var(--navy)' }} />Active</div>
          <div className="ml-row"><div className="ml-dot" style={{ background: 'var(--warn)' }} />Overdue</div>
          <div className="ml-row"><div className="ml-dot" style={{ background: 'var(--err)' }} />Offline</div>
        </div>
      </div>

      <div className="map-below">
        <div className="mb-col">
          <div className="mb-lbl">Sync Health</div>
          <div className="sync-row">
            {workers.map((w, i) => (
              <div key={i} className="sd">
                <div className="sd-dot" style={{ background: w.syncColor }} />
                <div>
                  <div className="sd-name">{w.initials}</div>
                  <div className="sd-time">{w.syncText}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-col">
          <div className="mb-lbl">Coverage Gaps</div>
          <div className="gap-row"><div className="box-ind" style={{ background: 'var(--err)' }} />Ibb — worker offline 3d</div>
          <div className="gap-row"><div className="box-ind" style={{ background: 'var(--warn)' }} />Taiz — sync overdue</div>
          <div className="gap-row"><div className="box-ind" style={{ background: 'var(--ink-mute)' }} />Hadramaut — no worker</div>
        </div>

        <div className="mb-col">
          <div className="mb-lbl">Peak This Week</div>
          <div className="pk-n">143</div>
          <div className="pk-sub">cases Sat · ↑12% vs Week 11</div>
          <div className="pk-cite">WHO-CHOLERA-2023 §4.2</div>
        </div>
      </div>
    </div>
  );
}
