const createCrudRouter = require('./crud');
module.exports = createCrudRouter('fuel_consumption', [
  'id', 'vessel_name', 'voyage_id', 'fuel_type', 'consumption_rate_tons_day',
  'distance_nm', 'speed_knots', 'weather_condition', 'sea_state',
  'engine_load_pct', 'total_fuel_tons', 'co2_emissions_tons',
  'cost_usd', 'optimization_notes'
]);
