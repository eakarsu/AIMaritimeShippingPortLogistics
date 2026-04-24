const createCrudRouter = require('./crud');
module.exports = createCrudRouter('incidents', [
  'id', 'incident_id', 'incident_type', 'severity', 'location',
  'date_time', 'vessel_involved', 'description', 'injuries',
  'environmental_impact', 'root_cause', 'corrective_action', 'status',
  'reported_by'
]);
