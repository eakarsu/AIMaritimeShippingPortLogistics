import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Markdown from 'react-markdown';

const featureConfig = {
  containers: {
    title: 'Container Yard Optimization',
    icon: '📦',
    resource: 'containers',
    aiEndpoint: 'container-optimization',
    aiLabel: 'AI Yard Optimization',
    columns: ['container_id', 'size', 'type', 'status', 'location_block', 'weight_tons', 'destination', 'vessel_name', 'priority'],
    fields: [
      { key: 'container_id', label: 'Container ID', type: 'text', required: true },
      { key: 'size', label: 'Size', type: 'select', options: ['20ft', '40ft'], required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Dry', 'Reefer', 'Open Top', 'Flat Rack', 'Tank'], required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['Loaded', 'Empty', 'In Transit', 'Awaiting Pickup', 'Customs Hold'], required: true },
      { key: 'location_block', label: 'Block', type: 'text' },
      { key: 'location_row', label: 'Row', type: 'number' },
      { key: 'location_tier', label: 'Tier', type: 'number' },
      { key: 'weight_tons', label: 'Weight (tons)', type: 'number' },
      { key: 'destination', label: 'Destination', type: 'text' },
      { key: 'vessel_name', label: 'Vessel', type: 'text' },
      { key: 'arrival_date', label: 'Arrival Date', type: 'date' },
      { key: 'departure_date', label: 'Departure Date', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'] },
    ],
    statusField: 'status',
    statusMap: { 'Loaded': 'green', 'In Transit': 'blue', 'Empty': 'gray', 'Awaiting Pickup': 'yellow', 'Customs Hold': 'red' },
  },
  berths: {
    title: 'Berth Scheduling',
    icon: '🏗️',
    resource: 'berths',
    aiEndpoint: 'berth-scheduling',
    aiLabel: 'AI Schedule Optimization',
    columns: ['berth_number', 'vessel_name', 'vessel_type', 'arrival_time', 'departure_time', 'status', 'cargo_type', 'priority_level'],
    fields: [
      { key: 'berth_number', label: 'Berth Number', type: 'text', required: true },
      { key: 'vessel_name', label: 'Vessel Name', type: 'text' },
      { key: 'vessel_type', label: 'Vessel Type', type: 'select', options: ['Container', 'Bulk Carrier', 'Tanker', 'RoRo', 'Reefer', 'General Cargo'] },
      { key: 'vessel_length_m', label: 'Length (m)', type: 'number' },
      { key: 'arrival_time', label: 'Arrival Time', type: 'datetime-local' },
      { key: 'departure_time', label: 'Departure Time', type: 'datetime-local' },
      { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Occupied', 'Reserved', 'Under Maintenance'], required: true },
      { key: 'cargo_type', label: 'Cargo Type', type: 'text' },
      { key: 'draft_depth_m', label: 'Draft Depth (m)', type: 'number' },
      { key: 'tide_dependency', label: 'Tide Dependent', type: 'select', options: ['true', 'false'] },
      { key: 'priority_level', label: 'Priority', type: 'select', options: ['low', 'normal', 'high', 'urgent'] },
      { key: 'agent_company', label: 'Agent Company', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Available': 'green', 'Occupied': 'blue', 'Reserved': 'yellow', 'Under Maintenance': 'red' },
  },
  vessels: {
    title: 'Vessel Route Optimization',
    icon: '🚢',
    resource: 'vessels',
    aiEndpoint: 'route-optimization',
    aiLabel: 'AI Route Optimization',
    columns: ['vessel_name', 'imo_number', 'vessel_type', 'origin_port', 'destination_port', 'speed_knots', 'status', 'cargo_type'],
    fields: [
      { key: 'vessel_name', label: 'Vessel Name', type: 'text', required: true },
      { key: 'imo_number', label: 'IMO Number', type: 'text' },
      { key: 'vessel_type', label: 'Type', type: 'select', options: ['Container', 'Bulk Carrier', 'Tanker', 'RoRo', 'Reefer', 'General Cargo'] },
      { key: 'flag_state', label: 'Flag State', type: 'text' },
      { key: 'origin_port', label: 'Origin Port', type: 'text' },
      { key: 'destination_port', label: 'Destination Port', type: 'text' },
      { key: 'current_lat', label: 'Latitude', type: 'number' },
      { key: 'current_lng', label: 'Longitude', type: 'number' },
      { key: 'speed_knots', label: 'Speed (knots)', type: 'number' },
      { key: 'eta', label: 'ETA', type: 'datetime-local' },
      { key: 'route_waypoints', label: 'Route Waypoints', type: 'text' },
      { key: 'cargo_type', label: 'Cargo Type', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['En Route', 'Loading', 'Departing', 'Arriving', 'At Berth', 'Anchored'], required: true },
    ],
    statusField: 'status',
    statusMap: { 'En Route': 'blue', 'Loading': 'yellow', 'Departing': 'purple', 'Arriving': 'green', 'At Berth': 'green', 'Anchored': 'gray' },
  },
  customs: {
    title: 'Customs Pre-clearance',
    icon: '📋',
    resource: 'customs',
    aiEndpoint: 'customs-analysis',
    aiLabel: 'AI Risk Assessment',
    columns: ['declaration_number', 'vessel_name', 'importer', 'cargo_description', 'declared_value', 'status', 'risk_level'],
    fields: [
      { key: 'declaration_number', label: 'Declaration No.', type: 'text', required: true },
      { key: 'vessel_name', label: 'Vessel', type: 'text' },
      { key: 'importer', label: 'Importer', type: 'text' },
      { key: 'exporter', label: 'Exporter', type: 'text' },
      { key: 'cargo_description', label: 'Description', type: 'textarea' },
      { key: 'hs_code', label: 'HS Code', type: 'text' },
      { key: 'declared_value', label: 'Declared Value', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'AUD', 'NOK'] },
      { key: 'origin_country', label: 'Origin Country', type: 'text' },
      { key: 'destination_country', label: 'Destination Country', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Review', 'Cleared', 'Flagged', 'Rejected'], required: true },
      { key: 'risk_level', label: 'Risk Level', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'inspection_required', label: 'Inspection Required', type: 'select', options: ['true', 'false'] },
      { key: 'documents_complete', label: 'Documents Complete', type: 'select', options: ['true', 'false'] },
    ],
    statusField: 'status',
    statusMap: { 'Cleared': 'green', 'Pending': 'yellow', 'In Review': 'blue', 'Flagged': 'red', 'Rejected': 'red' },
  },
  fuel: {
    title: 'Fuel Consumption Modeling',
    icon: '⛽',
    resource: 'fuel',
    aiEndpoint: 'fuel-modeling',
    aiLabel: 'AI Fuel Analysis',
    columns: ['vessel_name', 'voyage_id', 'fuel_type', 'distance_nm', 'speed_knots', 'total_fuel_tons', 'co2_emissions_tons', 'cost_usd'],
    fields: [
      { key: 'vessel_name', label: 'Vessel', type: 'text', required: true },
      { key: 'voyage_id', label: 'Voyage ID', type: 'text' },
      { key: 'fuel_type', label: 'Fuel Type', type: 'select', options: ['VLSFO', 'HFO', 'MGO', 'LNG'] },
      { key: 'consumption_rate_tons_day', label: 'Rate (tons/day)', type: 'number' },
      { key: 'distance_nm', label: 'Distance (NM)', type: 'number' },
      { key: 'speed_knots', label: 'Speed (knots)', type: 'number' },
      { key: 'weather_condition', label: 'Weather', type: 'select', options: ['Good', 'Fair', 'Poor'] },
      { key: 'sea_state', label: 'Sea State', type: 'select', options: ['Calm', 'Slight', 'Moderate', 'Rough'] },
      { key: 'engine_load_pct', label: 'Engine Load (%)', type: 'number' },
      { key: 'total_fuel_tons', label: 'Total Fuel (tons)', type: 'number' },
      { key: 'co2_emissions_tons', label: 'CO2 (tons)', type: 'number' },
      { key: 'cost_usd', label: 'Cost (USD)', type: 'number' },
      { key: 'optimization_notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'weather_condition',
    statusMap: { 'Good': 'green', 'Fair': 'yellow', 'Poor': 'red' },
  },
  cargo: {
    title: 'Cargo Tracking',
    icon: '📍',
    resource: 'cargo',
    aiEndpoint: 'cargo-intelligence',
    aiLabel: 'AI Cargo Intelligence',
    columns: ['tracking_number', 'container_id', 'shipper', 'consignee', 'origin', 'destination', 'current_location', 'status'],
    fields: [
      { key: 'tracking_number', label: 'Tracking No.', type: 'text', required: true },
      { key: 'container_id', label: 'Container ID', type: 'text' },
      { key: 'shipper', label: 'Shipper', type: 'text' },
      { key: 'consignee', label: 'Consignee', type: 'text' },
      { key: 'origin', label: 'Origin', type: 'text' },
      { key: 'destination', label: 'Destination', type: 'text' },
      { key: 'current_location', label: 'Current Location', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['In Transit', 'Delivered', 'Held', 'Awaiting Load', 'Empty Return'], required: true },
      { key: 'weight_kg', label: 'Weight (kg)', type: 'number' },
      { key: 'cargo_type', label: 'Cargo Type', type: 'text' },
      { key: 'temperature_controlled', label: 'Temp Controlled', type: 'select', options: ['true', 'false'] },
      { key: 'estimated_delivery', label: 'Est. Delivery', type: 'date' },
      { key: 'actual_delivery', label: 'Actual Delivery', type: 'date' },
    ],
    statusField: 'status',
    statusMap: { 'In Transit': 'blue', 'Delivered': 'green', 'Held': 'red', 'Awaiting Load': 'yellow', 'Empty Return': 'gray' },
  },
  'port-traffic': {
    title: 'Port Traffic Management',
    icon: '🚦',
    resource: 'port-traffic',
    aiEndpoint: 'traffic-analysis',
    aiLabel: 'AI Traffic Analysis',
    columns: ['vessel_name', 'direction', 'channel', 'scheduled_time', 'vessel_type', 'status', 'delay_minutes'],
    fields: [
      { key: 'vessel_name', label: 'Vessel', type: 'text', required: true },
      { key: 'direction', label: 'Direction', type: 'select', options: ['Inbound', 'Outbound'], required: true },
      { key: 'channel', label: 'Channel', type: 'select', options: ['Main Channel', 'North Channel', 'South Channel'] },
      { key: 'pilot_required', label: 'Pilot Required', type: 'select', options: ['true', 'false'] },
      { key: 'tug_required', label: 'Tug Required', type: 'select', options: ['true', 'false'] },
      { key: 'scheduled_time', label: 'Scheduled Time', type: 'datetime-local' },
      { key: 'actual_time', label: 'Actual Time', type: 'datetime-local' },
      { key: 'vessel_type', label: 'Vessel Type', type: 'text' },
      { key: 'vessel_length_m', label: 'Length (m)', type: 'number' },
      { key: 'draft_m', label: 'Draft (m)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'], required: true },
      { key: 'delay_minutes', label: 'Delay (min)', type: 'number' },
      { key: 'reason', label: 'Reason', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Completed': 'green', 'In Progress': 'blue', 'Scheduled': 'yellow', 'Cancelled': 'red' },
  },
  weather: {
    title: 'Weather Impact Analysis',
    icon: '🌊',
    resource: 'weather',
    aiEndpoint: 'weather-analysis',
    aiLabel: 'AI Weather Analysis',
    columns: ['port_name', 'date', 'condition', 'wind_speed_knots', 'wave_height_m', 'operational_impact', 'advisory_level'],
    fields: [
      { key: 'port_name', label: 'Port Name', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'wind_speed_knots', label: 'Wind Speed (kn)', type: 'number' },
      { key: 'wind_direction', label: 'Wind Direction', type: 'text' },
      { key: 'wave_height_m', label: 'Wave Height (m)', type: 'number' },
      { key: 'visibility_nm', label: 'Visibility (NM)', type: 'number' },
      { key: 'temperature_c', label: 'Temperature (C)', type: 'number' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Clear', 'Sunny', 'Partly Cloudy', 'Cloudy', 'Overcast', 'Rain', 'Storm', 'Fog', 'Thunderstorm', 'Windy', 'Hazy', 'Sandstorm'] },
      { key: 'operational_impact', label: 'Impact', type: 'select', options: ['None', 'Minimal', 'Moderate', 'Severe'] },
      { key: 'vessels_affected', label: 'Vessels Affected', type: 'number' },
      { key: 'delay_hours', label: 'Delay (hours)', type: 'number' },
      { key: 'advisory_level', label: 'Advisory', type: 'select', options: ['Green', 'Yellow', 'Red'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'advisory_level',
    statusMap: { 'Green': 'green', 'Yellow': 'yellow', 'Red': 'red' },
  },
  crew: {
    title: 'Crew Management',
    icon: '👥',
    resource: 'crew',
    aiEndpoint: 'crew-analysis',
    aiLabel: 'AI Crew Analysis',
    columns: ['crew_name', 'rank', 'nationality', 'vessel_assigned', 'certification', 'certification_expiry', 'status', 'daily_rate_usd'],
    fields: [
      { key: 'crew_name', label: 'Name', type: 'text', required: true },
      { key: 'rank', label: 'Rank', type: 'select', options: ['Captain', 'Chief Officer', 'Second Officer', 'Third Officer', 'Chief Engineer', 'Second Engineer', 'Bosun', 'AB Seaman', 'Oiler', 'Cook', 'Cadet'], required: true },
      { key: 'nationality', label: 'Nationality', type: 'text' },
      { key: 'vessel_assigned', label: 'Vessel Assigned', type: 'text' },
      { key: 'certification', label: 'Certification', type: 'text' },
      { key: 'certification_expiry', label: 'Cert. Expiry', type: 'date' },
      { key: 'contract_start', label: 'Contract Start', type: 'date' },
      { key: 'contract_end', label: 'Contract End', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['On Board', 'On Leave', 'Available', 'Training', 'Medical Leave'], required: true },
      { key: 'daily_rate_usd', label: 'Daily Rate (USD)', type: 'number' },
      { key: 'emergency_contact', label: 'Emergency Contact', type: 'text' },
      { key: 'medical_status', label: 'Medical Status', type: 'select', options: ['Fit', 'Restricted', 'Pending Exam'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'On Board': 'green', 'On Leave': 'yellow', 'Available': 'blue', 'Training': 'purple', 'Medical Leave': 'red' },
  },
  equipment: {
    title: 'Port Equipment Management',
    icon: '🏭',
    resource: 'equipment',
    aiEndpoint: 'equipment-analysis',
    aiLabel: 'AI Equipment Analysis',
    columns: ['equipment_id', 'equipment_type', 'manufacturer', 'location', 'status', 'operating_hours', 'capacity_tons', 'next_maintenance'],
    fields: [
      { key: 'equipment_id', label: 'Equipment ID', type: 'text', required: true },
      { key: 'equipment_type', label: 'Type', type: 'select', options: ['STS Crane', 'RTG Crane', 'Reach Stacker', 'Forklift', 'Straddle Carrier', 'Terminal Tractor', 'Mobile Crane', 'Conveyor'], required: true },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Operational', 'Under Maintenance', 'Out of Service', 'Standby'], required: true },
      { key: 'last_maintenance', label: 'Last Maintenance', type: 'date' },
      { key: 'next_maintenance', label: 'Next Maintenance', type: 'date' },
      { key: 'operating_hours', label: 'Operating Hours', type: 'number' },
      { key: 'capacity_tons', label: 'Capacity (tons)', type: 'number' },
      { key: 'fuel_type', label: 'Fuel Type', type: 'select', options: ['Diesel', 'Electric', 'Hybrid', 'LPG'] },
      { key: 'operator_assigned', label: 'Operator', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Operational': 'green', 'Under Maintenance': 'yellow', 'Out of Service': 'red', 'Standby': 'gray' },
  },
  invoices: {
    title: 'Invoices & Billing',
    icon: '💰',
    resource: 'invoices',
    aiEndpoint: 'invoice-analysis',
    aiLabel: 'AI Financial Analysis',
    columns: ['invoice_number', 'client_name', 'vessel_name', 'service_type', 'amount', 'issue_date', 'due_date', 'payment_status'],
    fields: [
      { key: 'invoice_number', label: 'Invoice No.', type: 'text', required: true },
      { key: 'client_name', label: 'Client', type: 'text', required: true },
      { key: 'vessel_name', label: 'Vessel', type: 'text' },
      { key: 'service_type', label: 'Service Type', type: 'select', options: ['Berth Rental', 'Cargo Handling', 'Pilotage', 'Towage', 'Storage', 'Customs Clearance', 'Inspection', 'Fuel Supply'] },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP'] },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'payment_status', label: 'Payment Status', type: 'select', options: ['Paid', 'Pending', 'Overdue', 'Partial', 'Cancelled'], required: true },
      { key: 'payment_date', label: 'Payment Date', type: 'date' },
      { key: 'port_charges', label: 'Port Charges', type: 'number' },
      { key: 'handling_charges', label: 'Handling Charges', type: 'number' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'payment_status',
    statusMap: { 'Paid': 'green', 'Pending': 'yellow', 'Overdue': 'red', 'Partial': 'blue', 'Cancelled': 'gray' },
  },
  incidents: {
    title: 'Incident Reports',
    icon: '⚠️',
    resource: 'incidents',
    aiEndpoint: 'incident-analysis',
    aiLabel: 'AI Safety Analysis',
    columns: ['incident_id', 'incident_type', 'severity', 'location', 'date_time', 'vessel_involved', 'status'],
    fields: [
      { key: 'incident_id', label: 'Incident ID', type: 'text', required: true },
      { key: 'incident_type', label: 'Type', type: 'select', options: ['Collision', 'Grounding', 'Cargo Damage', 'Personal Injury', 'Environmental Spill', 'Equipment Failure', 'Fire', 'Near Miss', 'Security Breach'], required: true },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Moderate', 'Major', 'Critical'], required: true },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'date_time', label: 'Date/Time', type: 'datetime-local' },
      { key: 'vessel_involved', label: 'Vessel Involved', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'injuries', label: 'Injuries', type: 'number' },
      { key: 'environmental_impact', label: 'Environmental Impact', type: 'select', options: ['None', 'Minor', 'Moderate', 'Severe'] },
      { key: 'root_cause', label: 'Root Cause', type: 'text' },
      { key: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Under Investigation', 'Resolved', 'Closed'], required: true },
      { key: 'reported_by', label: 'Reported By', type: 'text' },
    ],
    statusField: 'severity',
    statusMap: { 'Minor': 'green', 'Moderate': 'yellow', 'Major': 'red', 'Critical': 'red' },
  },
  inspections: {
    title: 'Dock Inspections',
    icon: '🔍',
    resource: 'inspections',
    aiEndpoint: 'inspection-analysis',
    aiLabel: 'AI Compliance Analysis',
    columns: ['inspection_id', 'vessel_name', 'inspector_name', 'inspection_type', 'date', 'overall_rating', 'deficiencies_found', 'status'],
    fields: [
      { key: 'inspection_id', label: 'Inspection ID', type: 'text', required: true },
      { key: 'vessel_name', label: 'Vessel', type: 'text', required: true },
      { key: 'inspector_name', label: 'Inspector', type: 'text' },
      { key: 'inspection_type', label: 'Type', type: 'select', options: ['Port State Control', 'Flag State', 'Classification Society', 'Internal Audit', 'Safety Drill', 'Pre-departure'], required: true },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'hull_condition', label: 'Hull Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
      { key: 'safety_equipment', label: 'Safety Equipment', type: 'select', options: ['Pass', 'Minor Issues', 'Fail'] },
      { key: 'fire_systems', label: 'Fire Systems', type: 'select', options: ['Pass', 'Minor Issues', 'Fail'] },
      { key: 'navigation_systems', label: 'Navigation Systems', type: 'select', options: ['Pass', 'Minor Issues', 'Fail'] },
      { key: 'overall_rating', label: 'Overall Rating', type: 'select', options: ['A - Excellent', 'B - Good', 'C - Satisfactory', 'D - Substandard', 'F - Detention'] },
      { key: 'deficiencies_found', label: 'Deficiencies', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Passed', 'Conditional Pass', 'Failed', 'Detained', 'Pending Review'], required: true },
      { key: 'next_inspection_due', label: 'Next Inspection', type: 'date' },
    ],
    statusField: 'status',
    statusMap: { 'Passed': 'green', 'Conditional Pass': 'yellow', 'Failed': 'red', 'Detained': 'red', 'Pending Review': 'blue' },
  },
  warehouse: {
    title: 'Warehouse Management',
    icon: '🏪',
    resource: 'warehouse',
    aiEndpoint: 'warehouse-analysis',
    aiLabel: 'AI Warehouse Analysis',
    columns: ['warehouse_id', 'zone', 'rack_number', 'cargo_type', 'quantity', 'weight_tons', 'owner', 'occupancy_pct', 'status'],
    fields: [
      { key: 'warehouse_id', label: 'Warehouse ID', type: 'text', required: true },
      { key: 'zone', label: 'Zone', type: 'select', options: ['A - General', 'B - Refrigerated', 'C - Hazardous', 'D - Bulk', 'E - High Value'], required: true },
      { key: 'rack_number', label: 'Rack Number', type: 'text' },
      { key: 'cargo_type', label: 'Cargo Type', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit', label: 'Unit', type: 'select', options: ['Pallets', 'Boxes', 'Drums', 'Bags', 'Rolls', 'Units'] },
      { key: 'weight_tons', label: 'Weight (tons)', type: 'number' },
      { key: 'owner', label: 'Owner', type: 'text' },
      { key: 'arrival_date', label: 'Arrival Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
      { key: 'temperature_required', label: 'Temp Required', type: 'select', options: ['true', 'false'] },
      { key: 'occupancy_pct', label: 'Occupancy (%)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Stored', 'Awaiting Pickup', 'In Processing', 'Released', 'Expired'], required: true },
    ],
    statusField: 'status',
    statusMap: { 'Stored': 'green', 'Awaiting Pickup': 'yellow', 'In Processing': 'blue', 'Released': 'gray', 'Expired': 'red' },
  },
  voyages: {
    title: 'Voyage Planning',
    icon: '🗺️',
    resource: 'voyages',
    aiEndpoint: 'voyage-analysis',
    aiLabel: 'AI Voyage Analysis',
    columns: ['voyage_number', 'vessel_name', 'departure_port', 'arrival_port', 'departure_date', 'arrival_date', 'status', 'revenue_usd'],
    fields: [
      { key: 'voyage_number', label: 'Voyage No.', type: 'text', required: true },
      { key: 'vessel_name', label: 'Vessel', type: 'text', required: true },
      { key: 'departure_port', label: 'Departure Port', type: 'text' },
      { key: 'arrival_port', label: 'Arrival Port', type: 'text' },
      { key: 'departure_date', label: 'Departure Date', type: 'datetime-local' },
      { key: 'arrival_date', label: 'Arrival Date', type: 'datetime-local' },
      { key: 'cargo_type', label: 'Cargo Type', type: 'text' },
      { key: 'cargo_weight_tons', label: 'Cargo Weight (tons)', type: 'number' },
      { key: 'revenue_usd', label: 'Revenue (USD)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Planning', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'], required: true },
      { key: 'crew_count', label: 'Crew Count', type: 'number' },
      { key: 'stops', label: 'Stops', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Planning': 'yellow', 'Confirmed': 'blue', 'In Progress': 'green', 'Completed': 'gray', 'Cancelled': 'red' },
  },
  'shipping-lines': {
    title: 'Shipping Lines Directory',
    icon: '🏢',
    resource: 'shipping-lines',
    aiEndpoint: null,
    aiLabel: null,
    columns: ['company_name', 'code', 'country', 'contact_person', 'email', 'fleet_size', 'contract_status', 'contract_expiry'],
    fields: [
      { key: 'company_name', label: 'Company Name', type: 'text', required: true },
      { key: 'code', label: 'Line Code', type: 'text', required: true },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'contact_person', label: 'Contact Person', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'website', label: 'Website', type: 'text' },
      { key: 'fleet_size', label: 'Fleet Size', type: 'number' },
      { key: 'service_routes', label: 'Service Routes', type: 'textarea' },
      { key: 'contract_status', label: 'Contract Status', type: 'select', options: ['Active', 'Under Review', 'Expired', 'Suspended'], required: true },
      { key: 'contract_expiry', label: 'Contract Expiry', type: 'date' },
      { key: 'payment_terms', label: 'Payment Terms', type: 'select', options: ['Net 30', 'Net 45', 'Net 60', 'Net 90'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'contract_status',
    statusMap: { 'Active': 'green', 'Under Review': 'yellow', 'Expired': 'red', 'Suspended': 'gray' },
  },
  'documents': {
    title: 'Shipping Documents',
    icon: '📄',
    resource: 'documents',
    aiEndpoint: null,
    aiLabel: null,
    columns: ['document_number', 'document_type', 'vessel_name', 'voyage_number', 'shipper', 'consignee', 'status', 'issue_date'],
    fields: [
      { key: 'document_number', label: 'Document No.', type: 'text', required: true },
      { key: 'document_type', label: 'Document Type', type: 'select', options: ['Bill of Lading', 'Sea Waybill', 'Cargo Manifest', 'Certificate of Origin', 'Phytosanitary Certificate', 'Insurance Certificate', 'Dangerous Goods Declaration', 'Customs Declaration', 'Packing List', 'Commercial Invoice'], required: true },
      { key: 'vessel_name', label: 'Vessel', type: 'text' },
      { key: 'voyage_number', label: 'Voyage No.', type: 'text' },
      { key: 'shipper', label: 'Shipper', type: 'text' },
      { key: 'consignee', label: 'Consignee', type: 'text' },
      { key: 'origin_port', label: 'Origin Port', type: 'text' },
      { key: 'destination_port', label: 'Destination Port', type: 'text' },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Active', 'Pending', 'Expired', 'Cancelled'], required: true },
      { key: 'issuing_authority', label: 'Issuing Authority', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Draft': 'yellow', 'Active': 'green', 'Pending': 'blue', 'Expired': 'red', 'Cancelled': 'gray' },
  },
  'tariffs': {
    title: 'Port Tariffs',
    icon: '💲',
    resource: 'tariffs',
    aiEndpoint: null,
    aiLabel: null,
    columns: ['tariff_code', 'service_category', 'description', 'unit', 'rate_usd', 'vessel_type_applicable', 'status'],
    fields: [
      { key: 'tariff_code', label: 'Tariff Code', type: 'text', required: true },
      { key: 'service_category', label: 'Service Category', type: 'select', options: ['Berthage', 'Pilotage', 'Towage', 'Container Handling', 'Container Storage', 'Bulk Cargo Handling', 'Tanker Services', 'Fresh Water Supply', 'Waste Disposal', 'Reefer Connection', 'RoRo Ramp Usage', 'Hazmat Surcharge', 'Anchorage', 'Mooring'], required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'unit', label: 'Unit', type: 'text' },
      { key: 'rate_usd', label: 'Rate (USD)', type: 'number', required: true },
      { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP'] },
      { key: 'vessel_type_applicable', label: 'Vessel Type', type: 'select', options: ['All', 'Container', 'Bulk Carrier', 'Tanker', 'RoRo', 'Reefer', 'General Cargo'] },
      { key: 'min_charge', label: 'Min Charge', type: 'number' },
      { key: 'max_charge', label: 'Max Charge', type: 'number' },
      { key: 'effective_date', label: 'Effective Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'Expired', 'Suspended'], required: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'status',
    statusMap: { 'Active': 'green', 'Pending': 'yellow', 'Expired': 'red', 'Suspended': 'gray' },
  },
  'tides': {
    title: 'Tide Schedules',
    icon: '🌊',
    resource: 'tides',
    aiEndpoint: null,
    aiLabel: null,
    columns: ['port_name', 'date', 'high_tide_1', 'high_tide_1_height_m', 'low_tide_1', 'low_tide_1_height_m', 'tidal_range_m', 'spring_neap'],
    fields: [
      { key: 'port_name', label: 'Port Name', type: 'text', required: true },
      { key: 'date', label: 'Date', type: 'date', required: true },
      { key: 'high_tide_1', label: 'High Tide 1', type: 'time' },
      { key: 'high_tide_1_height_m', label: 'HT1 Height (m)', type: 'number' },
      { key: 'low_tide_1', label: 'Low Tide 1', type: 'time' },
      { key: 'low_tide_1_height_m', label: 'LT1 Height (m)', type: 'number' },
      { key: 'high_tide_2', label: 'High Tide 2', type: 'time' },
      { key: 'high_tide_2_height_m', label: 'HT2 Height (m)', type: 'number' },
      { key: 'low_tide_2', label: 'Low Tide 2', type: 'time' },
      { key: 'low_tide_2_height_m', label: 'LT2 Height (m)', type: 'number' },
      { key: 'tidal_range_m', label: 'Tidal Range (m)', type: 'number' },
      { key: 'spring_neap', label: 'Spring/Neap', type: 'select', options: ['Spring', 'Neap', 'Transition'] },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    statusField: 'spring_neap',
    statusMap: { 'Spring': 'blue', 'Neap': 'green', 'Transition': 'yellow' },
  },
  'notices': {
    title: 'Port Notices',
    icon: '📢',
    resource: 'notices',
    aiEndpoint: null,
    aiLabel: null,
    columns: ['notice_number', 'title', 'category', 'priority', 'issued_by', 'effective_date', 'status', 'acknowledgements'],
    fields: [
      { key: 'notice_number', label: 'Notice No.', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Navigation', 'Operations', 'Weather', 'Safety', 'Security', 'Regulatory', 'Commercial', 'Environmental'], required: true },
      { key: 'priority', label: 'Priority', type: 'select', options: ['normal', 'high', 'urgent'], required: true },
      { key: 'issued_by', label: 'Issued By', type: 'text' },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'effective_date', label: 'Effective Date', type: 'date' },
      { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
      { key: 'affected_areas', label: 'Affected Areas', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Upcoming', 'Expired', 'Cancelled'], required: true },
      { key: 'acknowledgements', label: 'Acknowledgements', type: 'number' },
    ],
    statusField: 'status',
    statusMap: { 'Active': 'green', 'Upcoming': 'blue', 'Expired': 'gray', 'Cancelled': 'red' },
  },
};

function formatValue(val) {
  if (val === null || val === undefined) return '—';
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  if (typeof val === 'number') return val.toLocaleString();
  if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}T/)) {
    return new Date(val).toLocaleString();
  }
  return String(val);
}

function formatHeader(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function FeaturePage({ feature }) {
  const config = featureConfig[feature];
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    setSelected(null);
    setEditing(false);
    setCreating(false);
    setAiResult(null);
    setSearch('');
  }, [feature]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.getAll(config.resource);
      setData(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(s))
    );
  }, [data, search]);

  const handleRowClick = (row) => {
    setSelected(row);
    setEditing(false);
  };

  const handleEdit = () => {
    setFormData({ ...selected });
    setEditing(true);
  };

  const handleCreate = () => {
    setFormData({});
    setCreating(true);
    setSelected(null);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(config.resource, selected.id);
      setSelected(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      // Convert boolean strings
      config.fields.forEach(f => {
        if (f.options && (f.options.includes('true') || f.options.includes('false'))) {
          if (payload[f.key] === 'true') payload[f.key] = true;
          if (payload[f.key] === 'false') payload[f.key] = false;
        }
      });
      delete payload.id;

      if (creating) {
        await api.create(config.resource, payload);
        setCreating(false);
      } else {
        await api.update(config.resource, selected.id, payload);
        setEditing(false);
        setSelected(null);
      }
      loadData();
    } catch (err) {
      alert(err.message);
    }
    setSaving(false);
  };

  const handleAiAnalysis = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const result = await api.aiAnalyze(config.aiEndpoint);
      setAiResult(result);
    } catch (err) {
      setAiResult({ error: err.message });
    }
    setAiLoading(false);
  };

  const getBadgeClass = (value) => {
    const map = config.statusMap || {};
    return `badge badge-${map[value] || 'gray'}`;
  };

  return (
    <div>
      <div className="back-btn" onClick={() => navigate('/')}>
        ← Back to Dashboard
      </div>

      <div className="page-header">
        <div>
          <h1>{config.icon} {config.title}</h1>
          <p>{data.length} records loaded</p>
        </div>
        <div className="table-actions">
          <button className="btn btn-primary" onClick={handleCreate}>+ New Item</button>
          {config.aiEndpoint && (
            <button className="btn btn-success" onClick={handleAiAnalysis} disabled={aiLoading}>
              {aiLoading ? 'Analyzing...' : `🤖 ${config.aiLabel}`}
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>Records</h2>
          <input
            className="search-input"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {config.columns.map(col => (
                    <th key={col}>{formatHeader(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id} onClick={() => handleRowClick(row)}>
                    <td>{i + 1}</td>
                    {config.columns.map(col => (
                      <td key={col}>
                        {col === config.statusField || col === 'risk_level' || col === 'priority' || col === 'priority_level' || col === 'advisory_level' ? (
                          <span className={getBadgeClass(row[col])}>{formatValue(row[col])}</span>
                        ) : col === 'declared_value' || col === 'cost_usd' ? (
                          row[col] ? `$${Number(row[col]).toLocaleString()}` : '—'
                        ) : (
                          formatValue(row[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No records found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Analysis Panel */}
      {(aiLoading || aiResult) && (
        <div className="ai-panel">
          <div className="ai-panel-header">
            <h3>🤖 {config.aiLabel}</h3>
            {aiResult && <button className="btn btn-sm btn-ghost" onClick={() => setAiResult(null)}>Dismiss</button>}
          </div>
          {aiLoading ? (
            <div className="ai-loading">
              <div className="spinner" />
              <p>AI is analyzing your data...</p>
            </div>
          ) : aiResult?.error ? (
            <div className="ai-content">
              <div className="error-msg">{aiResult.error}</div>
            </div>
          ) : (
            <>
              <div className="ai-content">
                <Markdown>{aiResult.analysis}</Markdown>
              </div>
              <div className="ai-meta">
                <span>Model: {aiResult.model}</span>
                {aiResult.usage && <span>Tokens: {aiResult.usage.total_tokens?.toLocaleString()}</span>}
                <span>Generated: {new Date(aiResult.timestamp).toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selected && !editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Record Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                {config.fields.map(f => (
                  <div className="detail-item" key={f.key}>
                    <label>{f.label}</label>
                    <span>{formatValue(selected[f.key])}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              <button className="btn btn-primary" onClick={handleEdit}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Modal */}
      {(editing || creating) && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && (setEditing(false), setCreating(false))}>
          <div className="modal">
            <div className="modal-header">
              <h2>{creating ? 'Create New Record' : 'Edit Record'}</h2>
              <button className="modal-close" onClick={() => { setEditing(false); setCreating(false); }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="detail-grid">
                  {config.fields.map(f => (
                    <div className="form-group" key={f.key}>
                      <label>{f.label}{f.required ? ' *' : ''}</label>
                      {f.type === 'select' ? (
                        <select
                          value={formData[f.key] ?? ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                          required={f.required}
                        >
                          <option value="">Select...</option>
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : f.type === 'textarea' ? (
                        <textarea
                          value={formData[f.key] ?? ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                          required={f.required}
                        />
                      ) : (
                        <input
                          type={f.type}
                          value={formData[f.key] ?? ''}
                          onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                          required={f.required}
                          step={f.type === 'number' ? 'any' : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setCreating(false); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : (creating ? 'Create' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
