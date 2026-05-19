import React, { useState, useEffect } from 'react';

const emptyRule = {
  name: '', vessel_type: 'Container', priority: 3,
  min_capacity_teu: 0, max_draft_m: 12.0, preferred_berths: '', active: true, notes: ''
};

export default function BerthAllocationRulesEditor() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyRule);

  const token = () => localStorage.getItem('token');

  const load = () => {
    setLoading(true);
    fetch('/api/custom-views/berth-rules', {
      headers: { Authorization: `Bearer ${token()}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing
        ? `/api/custom-views/berth-rules/${editing}`
        : '/api/custom-views/berth-rules';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify(form)
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setForm(emptyRule);
      setEditing(null);
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  const startEdit = (rule) => {
    setEditing(rule.id);
    setForm({ ...rule });
  };

  const del = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await fetch(`/api/custom-views/berth-rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      });
      load();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) return <div style={{ padding: 20, color: '#94a3b8' }}>Loading berth rules...</div>;
  if (err) return <div style={{ padding: 20, color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return null;

  const inputStyle = {
    padding: '6px 10px', background: '#0f172a', color: '#f8fafc',
    border: '1px solid #334155', borderRadius: 4, fontSize: 13
  };

  return (
    <div data-testid="berth-rules-editor" style={{
      background: '#1e293b', borderRadius: 12, padding: 20, border: '1px solid #334155'
    }}>
      <h3 style={{ color: '#f8fafc', marginBottom: 12 }}>Berth Allocation Rules ({data.count})</h3>

      <form onSubmit={submit} style={{
        background: '#0f172a', padding: 14, borderRadius: 8, marginBottom: 16,
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8
      }}>
        <input style={inputStyle} placeholder="Rule name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <select style={inputStyle} value={form.vessel_type}
          onChange={e => setForm({ ...form, vessel_type: e.target.value })}>
          {data.vessel_types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input style={inputStyle} type="number" placeholder="Priority (1-5)" value={form.priority}
          onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })} />
        <input style={inputStyle} type="number" placeholder="Min TEU" value={form.min_capacity_teu}
          onChange={e => setForm({ ...form, min_capacity_teu: parseInt(e.target.value) })} />
        <input style={inputStyle} type="number" step="0.1" placeholder="Max draft (m)" value={form.max_draft_m}
          onChange={e => setForm({ ...form, max_draft_m: parseFloat(e.target.value) })} />
        <input style={inputStyle} placeholder="Preferred berths (B1,B2)" value={form.preferred_berths}
          onChange={e => setForm({ ...form, preferred_berths: e.target.value })} />
        <input style={inputStyle} placeholder="Notes" value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{
            flex: 1, padding: '6px 12px', background: '#0ea5e9', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer'
          }}>
            {editing ? 'Update' : 'Add Rule'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyRule); }} style={{
              padding: '6px 12px', background: '#64748b', color: '#fff',
              border: 'none', borderRadius: 4, cursor: 'pointer'
            }}>Cancel</button>
          )}
        </div>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', color: '#f8fafc', fontSize: 13, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: 8, textAlign: 'left' }}>Name</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Vessel Type</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Priority</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Min TEU</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Max Draft (m)</th>
              <th style={{ padding: 8, textAlign: 'left' }}>Berths</th>
              <th style={{ padding: 8, textAlign: 'center' }}>Active</th>
              <th style={{ padding: 8, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: 8 }}>{r.name}</td>
                <td style={{ padding: 8 }}>{r.vessel_type}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{r.priority}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{r.min_capacity_teu}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{r.max_draft_m}</td>
                <td style={{ padding: 8 }}>{r.preferred_berths}</td>
                <td style={{ padding: 8, textAlign: 'center' }}>
                  <span style={{ color: r.active ? '#10b981' : '#ef4444' }}>
                    {r.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={{ padding: 8, textAlign: 'right' }}>
                  <button onClick={() => startEdit(r)} style={{
                    padding: '4px 10px', background: '#0ea5e9', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 4
                  }}>Edit</button>
                  <button onClick={() => del(r.id)} style={{
                    padding: '4px 10px', background: '#ef4444', color: '#fff',
                    border: 'none', borderRadius: 4, cursor: 'pointer'
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
