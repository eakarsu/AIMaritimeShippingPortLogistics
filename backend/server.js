const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/containers', require('./routes/containers'));
app.use('/api/berths', require('./routes/berths'));
app.use('/api/vessels', require('./routes/vessels'));
app.use('/api/customs', require('./routes/customs'));
app.use('/api/fuel', require('./routes/fuel'));
app.use('/api/cargo', require('./routes/cargo'));
app.use('/api/port-traffic', require('./routes/portTraffic'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/crew', require('./routes/crew'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/warehouse', require('./routes/warehouse'));
app.use('/api/voyages', require('./routes/voyages'));
app.use('/api/shipping-lines', require('./routes/shippingLines'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/tariffs', require('./routes/tariffs'));
app.use('/api/tides', require('./routes/tides'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/ai', require('./routes/ai'));

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
