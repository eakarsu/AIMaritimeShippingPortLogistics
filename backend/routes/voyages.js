const createCrudRouter = require('./crud');
module.exports = createCrudRouter('voyages', [
  'id', 'voyage_number', 'vessel_name', 'departure_port', 'arrival_port',
  'departure_date', 'arrival_date', 'cargo_type', 'cargo_weight_tons',
  'revenue_usd', 'status', 'crew_count', 'stops', 'notes'
]);
