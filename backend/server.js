const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authenticateToken = require('./middleware/auth');
const { validateRuntime } = require('./governance/runtime');
const governanceRouter = require('./governance/router');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin:(origin,callback)=>!origin||allowedOrigins.includes(origin)?callback(null,true):callback(new Error('Origin not allowed by CORS')),credentials:true }));
app.use(express.json());
app.use(createProviderGate(['/api/ai','/api/agentic-customs-clearing','/api/port-optimization-stream','/api/incident-investigation','/api/supply-chain-coordination','/api/demurrage-prediction']));

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
app.use('/api/reefer-plug-allocation', authenticateToken, require('./routes/reeferPlugAllocation'));
app.use('/api/governed-port-calls', governanceRouter);

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

// Generated gap routes are quarantined: no mounts until durable provider contracts and acceptance tests exist.
