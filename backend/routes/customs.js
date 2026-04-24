const createCrudRouter = require('./crud');
module.exports = createCrudRouter('customs', [
  'id', 'declaration_number', 'vessel_name', 'importer', 'exporter',
  'cargo_description', 'hs_code', 'declared_value', 'currency',
  'origin_country', 'destination_country', 'status', 'risk_level',
  'inspection_required', 'documents_complete'
]);
