import NativeAIControls from "../components/NativeAIControls.jsx";
import AIReport from '../components/AIReport.jsx';
import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const TOOLS = [
  {
    key: 'liability-risk-assessment',
    label: 'Liability Risk Assessment',
    icon: '⚖️',
    endpoint: '/ai/liability-risk-assessment',
    description: 'Combines vessels, cargo, and recent weather to produce a liability score and premium outlook.',
    fields: [
      { key: 'vesselId', label: 'Vessel ID (optional)', type: 'record-select' },
      { key: 'cargoSummary', label: 'Cargo Summary', type: 'textarea' },
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'e.g. IMO / MARPOL' },
      { key: 'context', label: 'Additional Context', type: 'textarea' },
    ],
    presets: [
      {
        name: 'Reefer transit',
        values: {
          cargoSummary: '48 refrigerated containers carrying temperature-controlled produce; declared cargo value USD 3.2 million.',
          jurisdiction: 'IMO SOLAS and Hague-Visby Rules',
          context: 'Illustrative North Atlantic transit in winter. Review weather exposure, refrigeration failure, cargo claims, and coverage assumptions before binding.',
        },
      },
      {
        name: 'Hazardous cargo',
        values: {
          cargoSummary: '12 tank containers of IMO Class 3 flammable liquid with complete dangerous-goods declarations and segregation records.',
          jurisdiction: 'IMO IMDG Code and local port regulations',
          context: 'Illustrative port call with a 16-hour berth window. Assess handling, pollution, crew, and third-party liability; identify evidence still required.',
        },
      },
      {
        name: 'Project shipment',
        values: {
          cargoSummary: 'Oversized wind-turbine components loaded as breakbulk cargo; estimated replacement value USD 8.5 million.',
          jurisdiction: 'Hague-Visby Rules and charter-party terms',
          context: 'Illustrative heavy-lift voyage with two transshipment points. Compare cargo damage, delay, stowage, and contractual allocation risks.',
        },
      },
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
    presets: [
      {
        name: 'ECA arrival',
        values: {
          jurisdiction: 'IMO MARPOL Annex VI — North Sea ECA',
          fuelType: 'Very low sulfur fuel oil (VLSFO)',
          sulfurContentPct: '0.10',
          ballastWaterTreated: 'true',
          description: 'Illustrative inbound container vessel switching to compliant fuel before the ECA boundary; ballast-water treatment and bunker records are available for review.',
        },
      },
      {
        name: 'Bunker review',
        values: {
          jurisdiction: 'IMO MARPOL Annex VI — global sulfur cap',
          fuelType: 'Heavy fuel oil used with an approved exhaust-gas cleaning system',
          sulfurContentPct: '2.50',
          ballastWaterTreated: 'true',
          description: 'Illustrative scrubber-equipped vessel. Verify wash-water restrictions, fuel samples, bunker delivery notes, and equipment alarms before concluding compliance.',
        },
      },
      {
        name: 'Ballast audit',
        values: {
          jurisdiction: 'IMO Ballast Water Management Convention and MARPOL',
          fuelType: 'Marine gas oil',
          sulfurContentPct: '0.08',
          ballastWaterTreated: 'false',
          description: 'Illustrative ballast-system outage reported before discharge. Identify reporting duties, containment measures, evidence gaps, and authorized remediation steps.',
        },
      },
    ],
  },
];

export default function AIToolsPage() {
  const [active, setActive] = useState(TOOLS[0].key);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [vessels, setVessels] = useState([]);

  useEffect(() => {
    let activeRequest = true;
    api.getAll('vessels?limit=50')
      .then((response) => {
        if (activeRequest) setVessels(Array.isArray(response) ? response : response.data || []);
      })
      .catch(() => {
        if (activeRequest) setVessels([]);
      });
    return () => { activeRequest = false; };
  }, []);

  const tool = TOOLS.find(t => t.key === active);
  const presets = useMemo(() => tool.presets.map((preset, index) => ({
    name: preset.name,
    fill: () => {
      const next = { ...preset.values };
      if (tool.key === 'liability-risk-assessment' && vessels.length) {
        next.vesselId = String(vessels[index % vessels.length].id);
      }
      setInputs(next);
      setResult(null);
      setError(null);
      return { filled: Object.keys(next).length, manual: [] };
    },
  })), [tool, vessels]);

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
    <NativeAIControls busy={loading} context="MaritimeShippingPortLogistics" presets={presets}><div>
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
                <textarea data-ai-field={field.key}
                  rows={4}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder || ''}
                  style={{ width: '100%' }}
                />
              ) : field.type === 'record-select' ? (
                <select data-ai-field={field.key}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  disabled={!vessels.length}
                  style={{ width: '100%' }}
                >
                  <option value="">{vessels.length ? 'Select an existing vessel…' : 'No vessel records available'}</option>
                  {vessels.map(vessel => <option key={vessel.id} value={vessel.id}>{vessel.vessel_name || vessel.name || `Vessel ${vessel.id}`} · ID {vessel.id}</option>)}
                </select>
              ) : field.type === 'select' ? (
                <select data-ai-field={field.key}
                  value={inputs[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select...</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input data-ai-field={field.key}
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

        <AIReport
          response={result}
          loading={loading}
          error={error}
          title={tool.label}
        />
      </div>
    </div></NativeAIControls>
  );
}
