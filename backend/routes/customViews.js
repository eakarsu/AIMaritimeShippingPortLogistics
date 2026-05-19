const express = require('express');
const router = express.Router();
const pool = require('../db');

// In-memory store for berth allocation rules (CRUD)
let berthRules = [
  { id: 1, name: 'Container Vessel Priority', vessel_type: 'Container', priority: 1, min_capacity_teu: 5000, max_draft_m: 14.5, preferred_berths: 'B1,B2,B3', active: true, notes: 'Large container vessels get priority on deep-water berths' },
  { id: 2, name: 'Tanker Safety Zone', vessel_type: 'Tanker', priority: 2, min_capacity_teu: 0, max_draft_m: 16.0, preferred_berths: 'B7,B8', active: true, notes: 'Hazardous cargo segregation required' },
  { id: 3, name: 'Bulk Carrier Allocation', vessel_type: 'Bulk Carrier', priority: 3, min_capacity_teu: 0, max_draft_m: 13.0, preferred_berths: 'B4,B5', active: true, notes: 'Near grain silos and conveyors' },
  { id: 4, name: 'RoRo Quick Turnaround', vessel_type: 'RoRo', priority: 2, min_capacity_teu: 0, max_draft_m: 9.0, preferred_berths: 'B9', active: true, notes: 'Drive-on/drive-off ramp required' },
  { id: 5, name: 'Reefer Power Hookup', vessel_type: 'Reefer', priority: 2, min_capacity_teu: 1500, max_draft_m: 11.0, preferred_berths: 'B6', active: true, notes: 'Requires reefer power connections' }
];
let ruleIdCounter = 6;

// ============================================================
// VIZ 1: Vessel Position Map (SVG-based, lat/lng of fleet)
// ============================================================
router.get('/vessel-map', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, vessel_name, vessel_type, current_lat, current_lng, speed_knots, status, origin_port, destination_port, eta
      FROM vessels
      WHERE current_lat IS NOT NULL AND current_lng IS NOT NULL
      ORDER BY vessel_name
    `);

    const vessels = result.rows.map(v => ({
      id: v.id,
      name: v.vessel_name,
      type: v.vessel_type,
      lat: parseFloat(v.current_lat),
      lng: parseFloat(v.current_lng),
      speed_knots: parseFloat(v.speed_knots || 0),
      status: v.status,
      origin: v.origin_port,
      destination: v.destination_port,
      eta: v.eta
    }));

    // Bounding box
    const lats = vessels.map(v => v.lat);
    const lngs = vessels.map(v => v.lng);
    const bbox = {
      min_lat: lats.length ? Math.min(...lats) : -90,
      max_lat: lats.length ? Math.max(...lats) : 90,
      min_lng: lngs.length ? Math.min(...lngs) : -180,
      max_lng: lngs.length ? Math.max(...lngs) : 180
    };

    res.json({
      vessels,
      count: vessels.length,
      bbox,
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// VIZ 2: Port Congestion Heatmap (port x hour-of-day)
// ============================================================
router.get('/congestion-heatmap', async (req, res) => {
  try {
    // Get distinct port names from port_traffic + berths + vessels
    const portsResult = await pool.query(`
      SELECT DISTINCT port_name FROM port_traffic
      WHERE port_name IS NOT NULL
      LIMIT 8
    `).catch(() => ({ rows: [] }));

    let ports = portsResult.rows.map(r => r.port_name);
    if (ports.length === 0) {
      ports = ['Shanghai', 'Rotterdam', 'Singapore', 'Los Angeles', 'Hamburg', 'Dubai', 'Felixstowe', 'Antwerp'];
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Deterministic synthetic congestion by (port, hour) with shift patterns
    const cells = [];
    ports.forEach((port, pi) => {
      hours.forEach(hour => {
        // Hash-like deterministic value
        const seed = (port.charCodeAt(0) + port.charCodeAt(port.length - 1)) % 100;
        // Morning + evening peaks
        const peak1 = Math.exp(-Math.pow(hour - 9, 2) / 8);
        const peak2 = Math.exp(-Math.pow(hour - 16, 2) / 10);
        const base = 0.25 + ((seed + pi * 7) % 25) / 100;
        const congestion = Math.min(1, base + 0.55 * peak1 + 0.45 * peak2 + ((hour * (pi + 1)) % 13) / 100);
        cells.push({
          port,
          hour,
          congestion: Number(congestion.toFixed(3)),
          vessels_in_queue: Math.round(congestion * 20),
          avg_wait_hours: Number((congestion * 6).toFixed(1))
        });
      });
    });

    res.json({
      ports,
      hours,
      cells,
      max_congestion: Math.max(...cells.map(c => c.congestion)),
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// NON-VIZ 1: Bill of Lading PDF Generation
// ============================================================
router.get('/bill-of-lading/:vesselId', async (req, res) => {
  try {
    const { vesselId } = req.params;
    const vesselResult = await pool.query('SELECT * FROM vessels WHERE id = $1', [vesselId]);
    if (vesselResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vessel not found' });
    }
    const vessel = vesselResult.rows[0];

    const blNumber = `BL-${Date.now().toString().slice(-8)}-${vesselId}`;
    const issueDate = new Date().toISOString().slice(0, 10);

    // Minimal valid PDF (one page) with key BL fields rendered as text
    const lines = [
      'BILL OF LADING',
      `B/L Number: ${blNumber}`,
      `Issue Date: ${issueDate}`,
      '',
      `Vessel: ${vessel.vessel_name}`,
      `IMO: ${vessel.imo_number || 'N/A'}`,
      `Flag: ${vessel.flag_state || 'N/A'}`,
      `Type: ${vessel.vessel_type || 'N/A'}`,
      '',
      `Port of Loading: ${vessel.origin_port || 'N/A'}`,
      `Port of Discharge: ${vessel.destination_port || 'N/A'}`,
      `Cargo Description: ${vessel.cargo_type || 'General'}`,
      `Status: ${vessel.status || 'N/A'}`,
      '',
      'Shipper: Maritime Logistics Corp',
      'Consignee: To Order',
      'Notify Party: As per shipping instructions',
      '',
      'Freight Terms: Prepaid',
      'Number of Originals: 3',
      '',
      'Signed by: Master of the Vessel',
      `Generated: ${new Date().toISOString()}`
    ];

    // Build PDF content stream
    let textStream = 'BT\n/F1 12 Tf\n50 780 Td\n14 TL\n';
    lines.forEach((ln, idx) => {
      const safe = ln.replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\\/g, '\\\\');
      textStream += idx === 0 ? `(${safe}) Tj\n` : `T*\n(${safe}) Tj\n`;
    });
    textStream += 'ET';

    const objects = [];
    objects.push('<< /Type /Catalog /Pages 2 0 R >>');
    objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    objects.push(`<< /Length ${textStream.length} >>\nstream\n${textStream}\nendstream`);
    objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((obj, i) => {
      offsets.push(pdf.length);
      pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.forEach(off => {
      pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    if (req.query.format === 'json') {
      return res.json({
        bl_number: blNumber,
        issue_date: issueDate,
        vessel: {
          name: vessel.vessel_name,
          imo: vessel.imo_number,
          flag: vessel.flag_state,
          type: vessel.vessel_type
        },
        loading_port: vessel.origin_port,
        discharge_port: vessel.destination_port,
        cargo: vessel.cargo_type,
        download_url: `/api/custom-views/bill-of-lading/${vesselId}`,
        pdf_size_bytes: Buffer.byteLength(pdf)
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${blNumber}.pdf"`);
    res.send(Buffer.from(pdf, 'binary'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// NON-VIZ 2: Berth Allocation Rules Editor (CRUD)
// ============================================================
router.get('/berth-rules', (req, res) => {
  try {
    res.json({
      rules: berthRules,
      count: berthRules.length,
      vessel_types: ['Container', 'Tanker', 'Bulk Carrier', 'RoRo', 'Reefer', 'General Cargo'],
      generated_at: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/berth-rules', (req, res) => {
  try {
    const { name, vessel_type, priority, min_capacity_teu, max_draft_m, preferred_berths, active, notes } = req.body || {};
    if (!name || !vessel_type) {
      return res.status(400).json({ error: 'name and vessel_type required' });
    }
    const rule = {
      id: ruleIdCounter++,
      name,
      vessel_type,
      priority: priority || 5,
      min_capacity_teu: min_capacity_teu || 0,
      max_draft_m: max_draft_m || 12.0,
      preferred_berths: preferred_berths || '',
      active: active !== false,
      notes: notes || ''
    };
    berthRules.push(rule);
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/berth-rules/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const idx = berthRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
    berthRules[idx] = { ...berthRules[idx], ...req.body, id };
    res.json(berthRules[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/berth-rules/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const before = berthRules.length;
    berthRules = berthRules.filter(r => r.id !== id);
    if (berthRules.length === before) return res.status(404).json({ error: 'Rule not found' });
    res.json({ deleted: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
