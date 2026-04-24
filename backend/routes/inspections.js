const createCrudRouter = require('./crud');
module.exports = createCrudRouter('dock_inspections', [
  'id', 'inspection_id', 'vessel_name', 'inspector_name',
  'inspection_type', 'date', 'hull_condition', 'safety_equipment',
  'fire_systems', 'navigation_systems', 'overall_rating',
  'deficiencies_found', 'status', 'next_inspection_due'
]);
