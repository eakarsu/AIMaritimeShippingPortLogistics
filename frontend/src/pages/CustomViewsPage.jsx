import React, { useState } from 'react';
import VesselPositionMap from '../components/customViews/VesselPositionMap';
import PortCongestionHeatmap from '../components/customViews/PortCongestionHeatmap';
import BillOfLadingGenerator from '../components/customViews/BillOfLadingGenerator';
import BerthAllocationRulesEditor from '../components/customViews/BerthAllocationRulesEditor';

const tabs = [
  { key: 'map', label: 'Vessel Map', icon: '🗺️' },
  { key: 'heatmap', label: 'Congestion Heatmap', icon: '🔥' },
  { key: 'bol', label: 'Bill of Lading', icon: '📄' },
  { key: 'rules', label: 'Berth Rules', icon: '⚙️' }
];

export default function CustomViewsPage() {
  const [active, setActive] = useState('map');

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#f8fafc', marginBottom: 6 }}>Port Views</h1>
        <p style={{ color: '#94a3b8' }}>Custom maritime operations dashboards & tools.</p>
      </div>

      <div data-testid="custom-views-tabs" style={{
        display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #334155'
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            data-testid={`tab-${t.key}`}
            style={{
              padding: '10px 16px',
              background: active === t.key ? '#1e293b' : 'transparent',
              color: active === t.key ? '#0ea5e9' : '#94a3b8',
              border: 'none',
              borderBottom: active === t.key ? '2px solid #0ea5e9' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: active === t.key ? 600 : 400
            }}
          >
            <span style={{ marginRight: 6 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {active === 'map' && <VesselPositionMap />}
        {active === 'heatmap' && <PortCongestionHeatmap />}
        {active === 'bol' && <BillOfLadingGenerator />}
        {active === 'rules' && <BerthAllocationRulesEditor />}
      </div>
    </div>
  );
}
