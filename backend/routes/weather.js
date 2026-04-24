const createCrudRouter = require('./crud');
module.exports = createCrudRouter('weather_impact', [
  'id', 'port_name', 'date', 'wind_speed_knots', 'wind_direction',
  'wave_height_m', 'visibility_nm', 'temperature_c', 'condition',
  'operational_impact', 'vessels_affected', 'delay_hours',
  'advisory_level', 'notes'
]);
