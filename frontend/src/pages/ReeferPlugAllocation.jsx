import React, { useEffect, useState } from 'react';

const emptyForm = { yardBlock: '', vessel: '', plugsRequired: 0, plugsAvailable: 0, cutOff: '', cargoClass: '', status: 'pending' };

export default function ReeferPlugAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [summary, setSummary] = useState({ total: 0, short: 0, netAvailable: 0 });
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await fetch('/api/reefer-plug-allocation', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setAllocations(data.allocations || []);
    setSummary(data.summary || { total: 0, short: 0, netAvailable: 0 });
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    await fetch('/api/reefer-plug-allocation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(form)
    });
    setForm(emptyForm);
    load();
  };

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1>Reefer Plug Allocation</h1>
        <p>Yard block plug capacity matched against temperature-controlled cargo cutoffs.</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><h3>Allocations</h3><div className="stat-value">{summary.total}</div></div>
        <div className="stat-card"><h3>Short Blocks</h3><div className="stat-value">{summary.short}</div></div>
        <div className="stat-card"><h3>Net Plugs</h3><div className="stat-value">{summary.netAvailable}</div></div>
      </div>
      <form className="form-card" onSubmit={submit}>
        {['yardBlock', 'vessel', 'cutOff', 'cargoClass'].map(field => (
          <input key={field} placeholder={field} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })} />
        ))}
        <input type="number" value={form.plugsRequired} onChange={e => setForm({ ...form, plugsRequired: e.target.value })} />
        <input type="number" value={form.plugsAvailable} onChange={e => setForm({ ...form, plugsAvailable: e.target.value })} />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option>pending</option><option>covered</option><option>short</option><option>reassigned</option>
        </select>
        <button type="submit">Add Allocation</button>
      </form>
      <div className="table-card">
        <table>
          <thead><tr>{['Block', 'Vessel', 'Required', 'Available', 'Cutoff', 'Cargo', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {allocations.map(row => <tr key={row.id}><td>{row.yardBlock}</td><td>{row.vessel}</td><td>{row.plugsRequired}</td><td>{row.plugsAvailable}</td><td>{row.cutOff}</td><td>{row.cargoClass}</td><td>{row.status}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
