const createCrudRouter = require('./crud');
module.exports = createCrudRouter('port_traffic', [
  'id', 'vessel_name', 'direction', 'channel', 'pilot_required',
  'tug_required', 'scheduled_time', 'actual_time', 'vessel_type',
  'vessel_length_m', 'draft_m', 'status', 'delay_minutes', 'reason'
]);
