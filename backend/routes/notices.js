const createCrudRouter = require('./crud');
module.exports = createCrudRouter('port_notices', [
  'id', 'notice_number', 'title', 'category', 'priority', 'issued_by',
  'issue_date', 'effective_date', 'expiry_date', 'affected_areas',
  'description', 'status', 'acknowledgements'
]);
