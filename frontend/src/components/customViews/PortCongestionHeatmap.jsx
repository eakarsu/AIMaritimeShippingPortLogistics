import React, { useState, useEffect } from 'react';

export default function PortCongestionHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/congestion-heatmap', {
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

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading congestion heatmap...</div>;
  if (err) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return null;

  // Color scale: green -> yellow -> red
  const colorFor = c => {
    const t = Math.min(1, Math.max(0, c));
    if (t < 0.5) {
      const r = Math.round(16 + (245 - 16) * (t / 0.5));
      const g = Math.round(185 + (158 - 185) * (t / 0.5));
      const b = Math.round(129 + (11 - 129) * (t / 0.5));
      return `rgb(${r},${g},${b})`;
    } else {
      const r = Math.round(245 + (239 - 245) * ((t - 0.5) / 0.5));
      const g = Math.round(158 + (68 - 158) * ((t - 0.5) / 0.5));
      const b = Math.round(11 + (68 - 11) * ((t - 0.5) / 0.5));
      return `rgb(${r},${g},${b})`;
    }
  };

  const cellLookup = {};
  data.cells.forEach(c => { cellLookup[`${c.port}|${c.hour}`] = c; });

  return (
    <div data-testid="congestion-heatmap" style={{
      background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155'
    }}>
      <h3 style={{ color: '#f8fafc', marginBottom: 12 }}>Port Congestion Heatmap (24h)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', color: '#f8fafc', fontSize: 11 }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Port</th>
              {data.hours.map(h => (
                <th key={h} style={{ padding: '4px 2px', minWidth: 22, color: '#94a3b8', fontWeight: 'normal' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.ports.map(port => (
              <tr key={port}>
                <td style={{ padding: '4px 10px', textAlign: 'right', color: '#94a3b8' }}>{port}</td>
                {data.hours.map(h => {
                  const cell = cellLookup[`${port}|${h}`];
                  return (
                    <td
                      key={h}
                      onMouseEnter={() => setHover(cell)}
                      onMouseLeave={() => setHover(null)}
                      style={{
                        width: 22, height: 22,
                        background: colorFor(cell?.congestion || 0),
                        border: '1px solid #0f172a',
                        cursor: 'pointer'
                      }}
                      title={`${port} @ ${h}:00 - ${(cell.congestion * 100).toFixed(0)}% (${cell.vessels_in_queue} vessels, ${cell.avg_wait_hours}h wait)`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 12 }}>
        <span>Low</span>
        <div style={{ width: 200, height: 12, background: 'linear-gradient(90deg, rgb(16,185,129), rgb(245,158,11), rgb(239,68,68))', borderRadius: 4 }} />
        <span>High</span>
        {hover && (
          <span style={{ marginLeft: 'auto', color: '#f8fafc' }}>
            {hover.port} @ {hover.hour}:00 — {(hover.congestion * 100).toFixed(0)}% congestion, {hover.vessels_in_queue} in queue, {hover.avg_wait_hours}h avg wait
          </span>
        )}
      </div>
    </div>
  );
}
