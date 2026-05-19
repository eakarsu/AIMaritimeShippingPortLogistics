import React, { useState, useEffect } from 'react';

export default function VesselPositionMap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/vessel-map', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading vessel positions...</div>;
  if (err) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return null;

  const W = 800, H = 380, PAD = 20;
  // Mercator-ish linear projection: lng [-180,180] -> x, lat [-90,90] -> y inverted
  const toX = lng => PAD + ((lng + 180) / 360) * (W - 2 * PAD);
  const toY = lat => PAD + ((90 - lat) / 180) * (H - 2 * PAD);

  const typeColors = {
    Container: '#0ea5e9',
    Tanker: '#f59e0b',
    'Bulk Carrier': '#10b981',
    RoRo: '#8b5cf6',
    Reefer: '#06b6d4'
  };

  return (
    <div data-testid="vessel-map" style={{
      background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ color: '#f8fafc' }}>Vessel Position Map ({data.count} vessels)</h3>
        <div style={{ color: '#94a3b8', fontSize: 12 }}>
          {Object.entries(typeColors).map(([t, c]) => (
            <span key={t} style={{ marginRight: 10 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, background: c, borderRadius: '50%', marginRight: 4 }} />
              {t}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', background: '#0f172a', borderRadius: 8 }}>
        {/* World grid */}
        {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map(lng => (
          <line key={`v${lng}`} x1={toX(lng)} y1={PAD} x2={toX(lng)} y2={H - PAD} stroke="#1e293b" strokeWidth="1" />
        ))}
        {[-60, -30, 0, 30, 60].map(lat => (
          <line key={`h${lat}`} x1={PAD} y1={toY(lat)} x2={W - PAD} y2={toY(lat)} stroke="#1e293b" strokeWidth="1" />
        ))}
        {/* Equator and prime meridian highlighted */}
        <line x1={PAD} y1={toY(0)} x2={W - PAD} y2={toY(0)} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
        <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={H - PAD} stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />

        {data.vessels.map(v => (
          <g key={v.id} onClick={() => setSelected(v)} style={{ cursor: 'pointer' }}>
            <circle
              cx={toX(v.lng)}
              cy={toY(v.lat)}
              r={selected?.id === v.id ? 8 : 5}
              fill={typeColors[v.type] || '#94a3b8'}
              stroke="#f8fafc"
              strokeWidth="1"
              opacity="0.9"
            >
              <title>{`${v.name} (${v.type}) - ${v.speed_knots}kt`}</title>
            </circle>
          </g>
        ))}
      </svg>
      {selected && (
        <div style={{
          marginTop: 12, padding: 12, background: '#0f172a', borderRadius: 8, border: '1px solid #334155', color: '#f8fafc'
        }}>
          <strong>{selected.name}</strong> ({selected.type})<br />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            Position: {selected.lat.toFixed(2)}, {selected.lng.toFixed(2)} | Speed: {selected.speed_knots} kt | Status: {selected.status}<br />
            {selected.origin} → {selected.destination}
          </span>
        </div>
      )}
    </div>
  );
}
