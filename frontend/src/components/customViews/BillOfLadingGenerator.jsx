import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function BillOfLadingGenerator() {
  const [vessels, setVessels] = useState([]);
  const [selected, setSelected] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api.getAll('vessels').then(rows => {
      setVessels(rows);
      if (rows.length > 0) setSelected(rows[0].id);
    }).catch(e => setErr(e.message));
  }, []);

  const previewBL = async () => {
    if (!selected) return;
    setLoading(true);
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/custom-views/bill-of-lading/${selected}?format=json`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreview(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selected) return;
    setErr('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/custom-views/bill-of-lading/${selected}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BL-${selected}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div data-testid="bol-generator" style={{
      background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155'
    }}>
      <h3 style={{ color: '#f8fafc', marginBottom: 12 }}>Bill of Lading Generator</h3>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 16 }}>
        Generate ocean bill of lading PDF for any vessel in the fleet.
      </p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '8px 12px', background: '#0f172a',
            color: '#f8fafc', border: '1px solid #334155', borderRadius: 6
          }}
        >
          <option value="">Select vessel...</option>
          {vessels.map(v => (
            <option key={v.id} value={v.id}>
              {v.vessel_name} ({v.imo_number || 'no-IMO'}) - {v.origin_port} → {v.destination_port}
            </option>
          ))}
        </select>
        <button onClick={previewBL} disabled={!selected || loading} style={{
          padding: '8px 16px', background: '#0ea5e9', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer'
        }}>
          {loading ? 'Loading...' : 'Preview'}
        </button>
        <button onClick={downloadPDF} disabled={!selected} style={{
          padding: '8px 16px', background: '#10b981', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer'
        }}>
          Download PDF
        </button>
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 10 }}>Error: {err}</div>}

      {preview && (
        <div style={{
          background: '#0f172a', padding: 16, borderRadius: 8, border: '1px solid #334155',
          color: '#f8fafc', fontSize: 13
        }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold', fontSize: 15 }}>
            Bill of Lading: {preview.bl_number}
          </div>
          <div style={{ color: '#94a3b8' }}>
            <div>Issue Date: {preview.issue_date}</div>
            <div>Vessel: {preview.vessel.name} (IMO {preview.vessel.imo || 'N/A'})</div>
            <div>Flag: {preview.vessel.flag} | Type: {preview.vessel.type}</div>
            <div>Loading Port: {preview.loading_port}</div>
            <div>Discharge Port: {preview.discharge_port}</div>
            <div>Cargo: {preview.cargo}</div>
            <div style={{ marginTop: 8, color: '#10b981' }}>
              PDF Size: {preview.pdf_size_bytes} bytes — Ready to download
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
