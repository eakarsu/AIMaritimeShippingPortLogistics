const createCrudRouter = require('./crud');
module.exports = createCrudRouter('warehouse', [
  'id', 'warehouse_id', 'zone', 'rack_number', 'cargo_type', 'quantity',
  'unit', 'weight_tons', 'owner', 'arrival_date', 'expiry_date',
  'temperature_required', 'occupancy_pct', 'status'
]);
