
// FP wave 38C: authenticated tasks, main-list search/filter + export, domain AI over own records.
const express = require('express');
const MAIN_TABLE = "containers";
const SEARCH_COLS = ["container_id", "status", "destination", "vessel_name"];
const FILTER_COLS = ["status", "destination"];
const AI_FEATURES = ["demurrage-risk", "berth-efficiency", "cargo-priorities"];

function filterRows(rows, q, filters) {
  const needle = String(q || '').toLowerCase();
  return (rows || []).filter((r) => {
    if (needle && !SEARCH_COLS.some((c) => String(r[c] ?? '').toLowerCase().includes(needle))) return false;
    return FILTER_COLS.every((c) => { const v = filters && filters[c]; return v === undefined || v === '' || String(r[c] ?? '') === String(v); });
  });
}
function esc(v) { const s = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function toCsv(rows) {
  const cols = rows && rows.length ? Object.keys(rows[0]) : ['id'];
  return [cols.join(','), ...(rows || []).map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n') + '\n';
}
function summarize(feature, rows, tasks) {
  rows = rows || []; tasks = tasks || [];
  const counts = { records: rows.length, tasks: tasks.length, openTasks: tasks.filter((t) => t.status !== 'done').length };
  const missing = rows.filter((r) => SEARCH_COLS.some((c) => r[c] === null || r[c] === undefined || r[c] === '')).length;
  const risks = [];
  if (rows.length === 0) risks.push('No records available for analysis.');
  if (missing > 0) risks.push(missing + ' record(s) have empty searchable fields.');
  return { feature, sections: {
    headline: { label: 'Summary', value: rows.length + ' record(s) analysed for ' + feature },
    counts: { label: 'Counts', records: counts.records, tasks: counts.tasks, openTasks: counts.openTasks, incompleteRecords: missing },
    items: { label: 'Records', value: rows.slice(0, 10) },
    risks: { label: 'Risks', value: risks },
    emptyState: { label: 'Empty state preserved', value: rows.length === 0 ? '' : 'non-empty', zero: 0, flag: false },
  }};
}
async function buildAiResponse(feature, rows, tasks) {
  const base = summarize(feature, rows, tasks);
  const key = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!key) return { ...base, aiGenerated: false, provider: null, label: 'Deterministic fallback (no AI provider key configured)' };
  try {
    const isOpenRouter = Boolean(process.env.OPENROUTER_API_KEY);
    const resp = await fetch(isOpenRouter ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini', messages: [{ role: 'user', content: 'Analyse ' + feature + ': ' + JSON.stringify(base.sections).slice(0, 2000) }] }),
    });
    if (!resp.ok) throw new Error('provider ' + resp.status);
    const data = await resp.json();
    const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!text) throw new Error('empty provider response');
    return { ...base, aiGenerated: true, provider: isOpenRouter ? 'openrouter' : 'openai', label: 'AI-generated', sections: { ...base.sections, aiText: { label: 'AI analysis', value: text } } };
  } catch (e) {
    return { ...base, aiGenerated: false, provider: null, label: 'Deterministic fallback (provider unavailable: ' + e.message + ')' };
  }
}
function createRouter({ pool, auth }) {
  const router = express.Router();
  router.use(auth);
  let ready = null;
  const ensure = () => { if (!ready) ready = pool.query(`CREATE TABLE IF NOT EXISTS fp_wave38c_tasks (id SERIAL PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open', priority TEXT NOT NULL DEFAULT 'normal', notes TEXT NOT NULL DEFAULT '', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`).catch((e) => { ready = null; throw e; }); return ready; };
  const uid = (req) => String((req.user && (req.user.id ?? req.user.email ?? req.user.sub)) ?? 'unknown');
  router.get('/tasks', async (req, res) => { try { await ensure(); const r = await pool.query('SELECT * FROM fp_wave38c_tasks WHERE user_id=$1 ORDER BY id DESC', [uid(req)]); res.json(filterRows(r.rows.map((t) => ({ ...t, title: t.title, notes: t.notes })), req.query.q || req.query.search, { status: req.query.status, priority: req.query.priority })); } catch (e) { res.status(500).json({ error: e.message }); } });
  router.post('/tasks', async (req, res) => { try { if (!req.body || !req.body.title) return res.status(400).json({ error: 'title is required' }); await ensure(); const r = await pool.query('INSERT INTO fp_wave38c_tasks (user_id,title,status,priority,notes) VALUES ($1,$2,$3,$4,$5) RETURNING *', [uid(req), req.body.title, req.body.status || 'open', req.body.priority || 'normal', req.body.notes || '']); res.status(201).json(r.rows[0]); } catch (e) { res.status(500).json({ error: e.message }); } });
  router.put('/tasks/:id', async (req, res) => { try { await ensure(); const cur = await pool.query('SELECT * FROM fp_wave38c_tasks WHERE id=$1 AND user_id=$2', [req.params.id, uid(req)]); if (!cur.rows.length) return res.status(404).json({ error: 'task not found' }); const t = cur.rows[0]; const r = await pool.query('UPDATE fp_wave38c_tasks SET title=$1,status=$2,priority=$3,notes=$4,updated_at=NOW() WHERE id=$5 AND user_id=$6 RETURNING *', [req.body.title ?? t.title, req.body.status ?? t.status, req.body.priority ?? t.priority, req.body.notes ?? t.notes, req.params.id, uid(req)]); res.json(r.rows[0]); } catch (e) { res.status(500).json({ error: e.message }); } });
  async function mainRows(req) { const r = await pool.query(`SELECT * FROM ${MAIN_TABLE} ORDER BY id DESC LIMIT 500`); return filterRows(r.rows, req.query.q || req.query.search, Object.fromEntries(FILTER_COLS.map((c) => [c, req.query[c]]))); }
  router.get('/main', async (req, res) => { try { res.json(await mainRows(req)); } catch (e) { res.status(500).json({ error: e.message }); } });
  router.get('/main/export', async (req, res) => { try { const rows = await mainRows(req); const fmt = String(req.query.format || 'json').toLowerCase(); if (fmt === 'csv') { res.setHeader('Content-Type', 'text/csv'); res.setHeader('Content-Disposition', 'attachment; filename="main-export.csv"'); return res.send(toCsv(rows)); } if (fmt !== 'json') return res.status(400).json({ error: 'format must be csv or json' }); res.setHeader('Content-Disposition', 'attachment; filename="main-export.json"'); res.json(rows); } catch (e) { res.status(500).json({ error: e.message }); } });
  router.post('/ai/:feature', async (req, res) => { try { if (!AI_FEATURES.includes(req.params.feature)) return res.status(404).json({ error: 'unknown AI feature', features: AI_FEATURES }); let rows = req.body && Array.isArray(req.body.records) ? req.body.records : null; if (!rows) { try { rows = await mainRows(req); } catch (_) { rows = []; } } let tasks = []; try { await ensure(); tasks = (await pool.query('SELECT * FROM fp_wave38c_tasks WHERE user_id=$1 ORDER BY id DESC LIMIT 100', [uid(req)])).rows; } catch (_) { tasks = []; } res.json(await buildAiResponse(req.params.feature, rows, tasks)); } catch (e) { res.status(500).json({ error: e.message }); } });
  return router;
}
const pool=require('../db'); const auth=require('../middleware/auth');;
module.exports = createRouter({ pool, auth: typeof auth !== 'undefined' ? auth : authenticateToken });
module.exports.createRouter = createRouter; module.exports.filterRows = filterRows; module.exports.toCsv = toCsv; module.exports.summarize = summarize; module.exports.buildAiResponse = buildAiResponse; module.exports.AI_FEATURES = AI_FEATURES;

