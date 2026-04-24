const createCrudRouter = require('./crud');
module.exports = createCrudRouter('shipping_lines', [
  'id', 'company_name', 'code', 'country', 'contact_person', 'email',
  'phone', 'website', 'fleet_size', 'service_routes', 'contract_status',
  'contract_expiry', 'payment_terms', 'notes'
]);
