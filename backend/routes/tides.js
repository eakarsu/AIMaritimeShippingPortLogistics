const createCrudRouter = require('./crud');
module.exports = createCrudRouter('tide_schedules', [
  'id', 'port_name', 'date', 'high_tide_1', 'high_tide_1_height_m',
  'low_tide_1', 'low_tide_1_height_m', 'high_tide_2', 'high_tide_2_height_m',
  'low_tide_2', 'low_tide_2_height_m', 'tidal_range_m', 'spring_neap',
  'notes'
]);
