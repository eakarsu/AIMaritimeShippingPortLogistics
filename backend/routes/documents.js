const createCrudRouter = require('./crud');
module.exports = createCrudRouter('shipping_documents', [
  'id', 'document_number', 'document_type', 'vessel_name', 'voyage_number',
  'shipper', 'consignee', 'origin_port', 'destination_port', 'issue_date',
  'expiry_date', 'status', 'issuing_authority', 'notes'
]);
