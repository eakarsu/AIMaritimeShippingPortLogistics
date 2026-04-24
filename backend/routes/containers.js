const createCrudRouter = require('./crud');
module.exports = createCrudRouter('containers', [
  'id', 'container_id', 'size', 'type', 'status', 'location_block',
  'location_row', 'location_tier', 'weight_tons', 'destination',
  'vessel_name', 'arrival_date', 'departure_date', 'priority'
]);
