const createCrudRouter = require('./crud');
module.exports = createCrudRouter('port_equipment', [
  'id', 'equipment_id', 'equipment_type', 'manufacturer', 'model',
  'location', 'status', 'last_maintenance', 'next_maintenance',
  'operating_hours', 'capacity_tons', 'fuel_type', 'operator_assigned',
  'notes'
]);
