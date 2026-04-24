const createCrudRouter = require('./crud');
module.exports = createCrudRouter('vessels', [
  'id', 'vessel_name', 'imo_number', 'vessel_type', 'flag_state',
  'origin_port', 'destination_port', 'current_lat', 'current_lng',
  'speed_knots', 'eta', 'route_waypoints', 'cargo_type', 'status'
]);
