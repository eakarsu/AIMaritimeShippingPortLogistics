const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Public auth routes (no token required)
app.use('/api/auth', require('./routes/auth'));

// All other API routes require authentication
app.use('/api/containers', authenticateToken, require('./routes/containers'));
app.use('/api/berths', authenticateToken, require('./routes/berths'));
app.use('/api/vessels', authenticateToken, require('./routes/vessels'));
app.use('/api/customs', authenticateToken, require('./routes/customs'));
app.use('/api/fuel', authenticateToken, require('./routes/fuel'));
app.use('/api/cargo', authenticateToken, require('./routes/cargo'));
app.use('/api/port-traffic', authenticateToken, require('./routes/portTraffic'));
app.use('/api/weather', authenticateToken, require('./routes/weather'));
app.use('/api/crew', authenticateToken, require('./routes/crew'));
app.use('/api/equipment', authenticateToken, require('./routes/equipment'));
app.use('/api/invoices', authenticateToken, require('./routes/invoices'));
app.use('/api/incidents', authenticateToken, require('./routes/incidents'));
app.use('/api/inspections', authenticateToken, require('./routes/inspections'));
app.use('/api/warehouse', authenticateToken, require('./routes/warehouse'));
app.use('/api/voyages', authenticateToken, require('./routes/voyages'));
app.use('/api/shipping-lines', authenticateToken, require('./routes/shippingLines'));
app.use('/api/documents', authenticateToken, require('./routes/documents'));
app.use('/api/tariffs', authenticateToken, require('./routes/tariffs'));
app.use('/api/tides', authenticateToken, require('./routes/tides'));
app.use('/api/notices', authenticateToken, require('./routes/notices'));
app.use('/api/ai', authenticateToken, require('./routes/ai'));

// Custom Views (Port Views) - mounted BEFORE 404/catch-all
app.use('/api/custom-views', require('./routes/customViews'));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'maritime-logistics', timestamp: new Date().toISOString() });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🚢 Maritime Logistics API running on port ${PORT}`);
});

// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/agentic-customs-clearing', require('./routes/agentic-customs-clearing'));
app.use('/api/port-optimization-stream', require('./routes/port-optimization-stream'));
app.use('/api/incident-investigation', require('./routes/incident-investigation'));
app.use('/api/supply-chain-coordination', require('./routes/supply-chain-coordination'));
app.use('/api/demurrage-prediction', require('./routes/demurrage-prediction'));

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_liability_risk_assessment = require('./routes/gap-liability-risk-assessment'); app.use('/api/gap-liability-risk-assessment', _gap_liability_risk_assessment); } catch(e) { console.error('gap mount fail liability-risk-assessment:', e.message); }
try { const _gap_piracy_threat_detector = require('./routes/gap-piracy-threat-detector'); app.use('/api/gap-piracy-threat-detector', _gap_piracy_threat_detector); } catch(e) { console.error('gap mount fail piracy-threat-detector:', e.message); }
try { const _gap_environmental_compliance_checker = require('./routes/gap-environmental-compliance-checker'); app.use('/api/gap-environmental-compliance-checker', _gap_environmental_compliance_checker); } catch(e) { console.error('gap mount fail environmental-compliance-checker:', e.message); }
try { const _gap_labor_demand_forecaster = require('./routes/gap-labor-demand-forecaster'); app.use('/api/gap-labor-demand-forecaster', _gap_labor_demand_forecaster); } catch(e) { console.error('gap mount fail labor-demand-forecaster:', e.message); }
try { const _gap_real_time = require('./routes/gap-real-time'); app.use('/api/gap-real-time', _gap_real_time); } catch(e) { console.error('gap mount fail real-time:', e.message); }
try { const _gap_electronic = require('./routes/gap-electronic'); app.use('/api/gap-electronic', _gap_electronic); } catch(e) { console.error('gap mount fail electronic:', e.message); }
try { const _gap_shipper = require('./routes/gap-shipper'); app.use('/api/gap-shipper', _gap_shipper); } catch(e) { console.error('gap mount fail shipper:', e.message); }
try { const _gap_insurance = require('./routes/gap-insurance'); app.use('/api/gap-insurance', _gap_insurance); } catch(e) { console.error('gap mount fail insurance:', e.message); }
try { const _gap_labor = require('./routes/gap-labor'); app.use('/api/gap-labor', _gap_labor); } catch(e) { console.error('gap mount fail labor:', e.message); }
try { const _gap_environmental = require('./routes/gap-environmental'); app.use('/api/gap-environmental', _gap_environmental); } catch(e) { console.error('gap mount fail environmental:', e.message); }
try { const _gap_limited = require('./routes/gap-limited'); app.use('/api/gap-limited', _gap_limited); } catch(e) { console.error('gap mount fail limited:', e.message); }
try { const _gap_webhooks = require('./routes/gap-webhooks'); app.use('/api/gap-webhooks', _gap_webhooks); } catch(e) { console.error('gap mount fail webhooks:', e.message); }
// === End Batch 05 Mounts ===
