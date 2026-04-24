const createCrudRouter = require('./crud');
module.exports = createCrudRouter('berths', [
  'id', 'berth_number', 'vessel_name', 'vessel_type', 'vessel_length_m',
  'arrival_time', 'departure_time', 'status', 'cargo_type',
  'draft_depth_m', 'tide_dependency', 'priority_level', 'agent_company', 'notes'
]);
