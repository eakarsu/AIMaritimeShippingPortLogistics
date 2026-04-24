const createCrudRouter = require('./crud');
module.exports = createCrudRouter('crew_management', [
  'id', 'crew_name', 'rank', 'nationality', 'vessel_assigned',
  'certification', 'certification_expiry', 'contract_start',
  'contract_end', 'status', 'daily_rate_usd', 'emergency_contact',
  'medical_status', 'notes'
]);
