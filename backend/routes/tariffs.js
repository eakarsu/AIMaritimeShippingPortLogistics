const createCrudRouter = require('./crud');
module.exports = createCrudRouter('port_tariffs', [
  'id', 'tariff_code', 'service_category', 'description', 'unit',
  'rate_usd', 'currency', 'vessel_type_applicable', 'min_charge',
  'max_charge', 'effective_date', 'expiry_date', 'status', 'notes'
]);
