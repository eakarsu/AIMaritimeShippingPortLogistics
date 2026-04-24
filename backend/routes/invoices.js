const createCrudRouter = require('./crud');
module.exports = createCrudRouter('invoices', [
  'id', 'invoice_number', 'client_name', 'vessel_name', 'service_type',
  'amount', 'currency', 'issue_date', 'due_date', 'payment_status',
  'payment_date', 'port_charges', 'handling_charges', 'notes'
]);
