import React, { useState } from 'react';
import { api } from '../services/api';

const TOOLS = [
  {
    key: 'liability-risk-assessment',
    label: 'Liability Risk Assessment',
    icon: '⚖️',
    endpoint: '/ai/liability-risk-assessment',
    description: 'Combines vessels, cargo, and recent weather to produce a liability score and premium outlook.',
    fields: [
      { key: 'vesselId', label: 'Vessel ID (optional)', type: 'text' },
      { key: 'cargoSummary', label: 'Cargo Summary', type: 'textarea' },
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'e.g. IMO / MARPOL' },
      { key: 'context', label: 'Additional Context', type: 'textarea' },
    ],
  },
  {
    key: 'environmental-compliance-checker',
    label: 'Environmental Compliance Checker',
    icon: '🌱',
    endpoint: '/ai/environmental-compliance-checker',
    description: 'Validates against IMO MARPOL (configurable jurisdiction); returns violations and remediation list.',
    fields: [
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'IMO MARPOL' },
      { key: 'fuelType', label: 'Fuel Type', type: 'text' },
      { key: 'sulfurContentPct', label: 'Sulfur Content (%)', type: 'number' },
      { key: 'ballastWaterTreated', label: 'Ballast Water Treated', type: 'select', options: ['true', 'false'] },
      { key: 'description', label: 'Operational Description', type: 'textarea' },
    ],
  },
];

export default function AIToolsPage() {
  const [active, setActive] = useState(TOOLS[0].key);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const tool = TOOLS.find(t => t.key === active);

  const handleChange = (key, value) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const payload = {};
      tool.fields.forEach(f => {
        const v = inputs[f.key];
        if (v === undefined || v === '') return;
        if (f.type === 'number') payload[f.key] = Number(v);
        else if (f.options && (f.options.includes('true') || f.options.includes('false'))) {
          if (v === 'true') payload[f.key] = true;
          else if (v === 'false') payload[f.key] = false;
        } else {
          payload[f.key] = v;
        }
      });
      const token = localStorage.getItem('token');
      const res = await fetch('/api' + tool.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Request failed');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🧠 AI Maritime Tools</h1>
          <p>Run targeted AI analyses across liability and environmental compliance.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 24 }}>
        {TOOLS.map(t => (
          <div
            key={t.key}
            onClick={() => { setActive(t.key); setInputs({}); setResult(null); setError(null); }}
            style={{
              padding: 16,
              background: active === t.key ? '#0ea5e9' : 'var(--card-bg, #fff)',
              color: active === t.key ? '#fff' : 'inherit',
              border: '1px solid var(--border, #e2e8f0)',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 24 }}>{t.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{t.label}</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>{t.description}</div>
          </div>
        ))}
      </div>

      <div className="table-container" style={{ maxWidth: 760, padding: 20 }}>
        <h2 style={{ marginBottom: 8 }}>{tool.icon} {tool.label}</h2>
        <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: 16 }}>{tool.description}</p>

        <form onSubmit={submit}>
          {tool.fields.map(field => (
            <div className="form-group" key={field.key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 13 }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{ width: '100%' }}
                />
              ) : field.type === 'select' ? (
                <select
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select...</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{ width: '100%' }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: 12, padding: 12, fontSize: 15 }}
          >
            {loading ? 'Running…' : `Run ${tool.label}`}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 6 }}>
            {String(error)}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}>
            <h3 style={{ marginBottom: 8 }}>Result</h3>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontSize: 12 }}>
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
