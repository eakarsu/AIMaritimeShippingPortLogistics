const createCrudRouter = require('./crud');
module.exports = createCrudRouter('cargo_tracking', [
  'id', 'tracking_number', 'container_id', 'shipper', 'consignee',
  'origin', 'destination', 'current_location', 'status',
  'weight_kg', 'cargo_type', 'temperature_controlled',
  'estimated_delivery', 'actual_delivery'
]);
