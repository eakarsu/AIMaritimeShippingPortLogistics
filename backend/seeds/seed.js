const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'maritime_logistics',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function seed() {
  console.log('🌊 Starting Maritime Logistics Database Seed...\n');

  // Create tables
  await pool.query(`
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS shipping_lines CASCADE;
    DROP TABLE IF EXISTS shipping_documents CASCADE;
    DROP TABLE IF EXISTS port_tariffs CASCADE;
    DROP TABLE IF EXISTS tide_schedules CASCADE;
    DROP TABLE IF EXISTS port_notices CASCADE;
    DROP TABLE IF EXISTS containers CASCADE;
    DROP TABLE IF EXISTS berths CASCADE;
    DROP TABLE IF EXISTS vessels CASCADE;
    DROP TABLE IF EXISTS customs CASCADE;
    DROP TABLE IF EXISTS fuel_consumption CASCADE;
    DROP TABLE IF EXISTS cargo_tracking CASCADE;
    DROP TABLE IF EXISTS port_traffic CASCADE;
    DROP TABLE IF EXISTS weather_impact CASCADE;
    DROP TABLE IF EXISTS crew_management CASCADE;
    DROP TABLE IF EXISTS port_equipment CASCADE;
    DROP TABLE IF EXISTS invoices CASCADE;
    DROP TABLE IF EXISTS incidents CASCADE;
    DROP TABLE IF EXISTS dock_inspections CASCADE;
    DROP TABLE IF EXISTS warehouse CASCADE;
    DROP TABLE IF EXISTS voyages CASCADE;

    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE containers (
      id SERIAL PRIMARY KEY,
      container_id VARCHAR(20) NOT NULL,
      size VARCHAR(10) NOT NULL,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(30) NOT NULL,
      location_block VARCHAR(5),
      location_row INT,
      location_tier INT,
      weight_tons DECIMAL(10,2),
      destination VARCHAR(100),
      vessel_name VARCHAR(100),
      arrival_date DATE,
      departure_date DATE,
      priority VARCHAR(20) DEFAULT 'normal'
    );

    CREATE TABLE berths (
      id SERIAL PRIMARY KEY,
      berth_number VARCHAR(10) NOT NULL,
      vessel_name VARCHAR(100),
      vessel_type VARCHAR(50),
      vessel_length_m DECIMAL(8,2),
      arrival_time TIMESTAMP,
      departure_time TIMESTAMP,
      status VARCHAR(30) NOT NULL,
      cargo_type VARCHAR(50),
      draft_depth_m DECIMAL(5,2),
      tide_dependency BOOLEAN DEFAULT false,
      priority_level VARCHAR(20) DEFAULT 'normal',
      agent_company VARCHAR(100),
      notes TEXT
    );

    CREATE TABLE vessels (
      id SERIAL PRIMARY KEY,
      vessel_name VARCHAR(100) NOT NULL,
      imo_number VARCHAR(20),
      vessel_type VARCHAR(50),
      flag_state VARCHAR(50),
      origin_port VARCHAR(100),
      destination_port VARCHAR(100),
      current_lat DECIMAL(10,6),
      current_lng DECIMAL(10,6),
      speed_knots DECIMAL(5,2),
      eta TIMESTAMP,
      route_waypoints TEXT,
      cargo_type VARCHAR(50),
      status VARCHAR(30)
    );

    CREATE TABLE customs (
      id SERIAL PRIMARY KEY,
      declaration_number VARCHAR(30) NOT NULL,
      vessel_name VARCHAR(100),
      importer VARCHAR(150),
      exporter VARCHAR(150),
      cargo_description TEXT,
      hs_code VARCHAR(20),
      declared_value DECIMAL(15,2),
      currency VARCHAR(10) DEFAULT 'USD',
      origin_country VARCHAR(50),
      destination_country VARCHAR(50),
      status VARCHAR(30),
      risk_level VARCHAR(20),
      inspection_required BOOLEAN DEFAULT false,
      documents_complete BOOLEAN DEFAULT true
    );

    CREATE TABLE fuel_consumption (
      id SERIAL PRIMARY KEY,
      vessel_name VARCHAR(100) NOT NULL,
      voyage_id VARCHAR(30),
      fuel_type VARCHAR(30),
      consumption_rate_tons_day DECIMAL(8,2),
      distance_nm DECIMAL(10,2),
      speed_knots DECIMAL(5,2),
      weather_condition VARCHAR(30),
      sea_state VARCHAR(20),
      engine_load_pct DECIMAL(5,2),
      total_fuel_tons DECIMAL(10,2),
      co2_emissions_tons DECIMAL(10,2),
      cost_usd DECIMAL(12,2),
      optimization_notes TEXT
    );

    CREATE TABLE cargo_tracking (
      id SERIAL PRIMARY KEY,
      tracking_number VARCHAR(30) NOT NULL,
      container_id VARCHAR(20),
      shipper VARCHAR(150),
      consignee VARCHAR(150),
      origin VARCHAR(100),
      destination VARCHAR(100),
      current_location VARCHAR(100),
      status VARCHAR(30),
      weight_kg DECIMAL(10,2),
      cargo_type VARCHAR(50),
      temperature_controlled BOOLEAN DEFAULT false,
      estimated_delivery DATE,
      actual_delivery DATE
    );

    CREATE TABLE port_traffic (
      id SERIAL PRIMARY KEY,
      vessel_name VARCHAR(100) NOT NULL,
      direction VARCHAR(20),
      channel VARCHAR(50),
      pilot_required BOOLEAN DEFAULT true,
      tug_required BOOLEAN DEFAULT false,
      scheduled_time TIMESTAMP,
      actual_time TIMESTAMP,
      vessel_type VARCHAR(50),
      vessel_length_m DECIMAL(8,2),
      draft_m DECIMAL(5,2),
      status VARCHAR(30),
      delay_minutes INT DEFAULT 0,
      reason TEXT
    );

    CREATE TABLE weather_impact (
      id SERIAL PRIMARY KEY,
      port_name VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      wind_speed_knots DECIMAL(5,2),
      wind_direction VARCHAR(10),
      wave_height_m DECIMAL(5,2),
      visibility_nm DECIMAL(5,2),
      temperature_c DECIMAL(5,2),
      condition VARCHAR(50),
      operational_impact VARCHAR(50),
      vessels_affected INT DEFAULT 0,
      delay_hours DECIMAL(5,2) DEFAULT 0,
      advisory_level VARCHAR(20),
      notes TEXT
    );

    CREATE TABLE crew_management (
      id SERIAL PRIMARY KEY,
      crew_name VARCHAR(100) NOT NULL,
      rank VARCHAR(50),
      nationality VARCHAR(50),
      vessel_assigned VARCHAR(100),
      certification VARCHAR(100),
      certification_expiry DATE,
      contract_start DATE,
      contract_end DATE,
      status VARCHAR(30),
      daily_rate_usd DECIMAL(8,2),
      emergency_contact VARCHAR(150),
      medical_status VARCHAR(30),
      notes TEXT
    );

    CREATE TABLE port_equipment (
      id SERIAL PRIMARY KEY,
      equipment_id VARCHAR(20) NOT NULL,
      equipment_type VARCHAR(50),
      manufacturer VARCHAR(100),
      model VARCHAR(100),
      location VARCHAR(100),
      status VARCHAR(30),
      last_maintenance DATE,
      next_maintenance DATE,
      operating_hours INT,
      capacity_tons DECIMAL(8,2),
      fuel_type VARCHAR(30),
      operator_assigned VARCHAR(100),
      notes TEXT
    );

    CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(30) NOT NULL,
      client_name VARCHAR(150),
      vessel_name VARCHAR(100),
      service_type VARCHAR(50),
      amount DECIMAL(12,2),
      currency VARCHAR(10) DEFAULT 'USD',
      issue_date DATE,
      due_date DATE,
      payment_status VARCHAR(30),
      payment_date DATE,
      port_charges DECIMAL(10,2),
      handling_charges DECIMAL(10,2),
      notes TEXT
    );

    CREATE TABLE incidents (
      id SERIAL PRIMARY KEY,
      incident_id VARCHAR(20) NOT NULL,
      incident_type VARCHAR(50),
      severity VARCHAR(20),
      location VARCHAR(100),
      date_time TIMESTAMP,
      vessel_involved VARCHAR(100),
      description TEXT,
      injuries INT DEFAULT 0,
      environmental_impact VARCHAR(30),
      root_cause TEXT,
      corrective_action TEXT,
      status VARCHAR(30),
      reported_by VARCHAR(100)
    );

    CREATE TABLE dock_inspections (
      id SERIAL PRIMARY KEY,
      inspection_id VARCHAR(20) NOT NULL,
      vessel_name VARCHAR(100),
      inspector_name VARCHAR(100),
      inspection_type VARCHAR(50),
      date DATE,
      hull_condition VARCHAR(30),
      safety_equipment VARCHAR(30),
      fire_systems VARCHAR(30),
      navigation_systems VARCHAR(30),
      overall_rating VARCHAR(30),
      deficiencies_found INT DEFAULT 0,
      status VARCHAR(30),
      next_inspection_due DATE
    );

    CREATE TABLE warehouse (
      id SERIAL PRIMARY KEY,
      warehouse_id VARCHAR(20) NOT NULL,
      zone VARCHAR(30),
      rack_number VARCHAR(20),
      cargo_type VARCHAR(50),
      quantity INT,
      unit VARCHAR(20),
      weight_tons DECIMAL(10,2),
      owner VARCHAR(150),
      arrival_date DATE,
      expiry_date DATE,
      temperature_required BOOLEAN DEFAULT false,
      occupancy_pct DECIMAL(5,2),
      status VARCHAR(30)
    );

    CREATE TABLE voyages (
      id SERIAL PRIMARY KEY,
      voyage_number VARCHAR(30) NOT NULL,
      vessel_name VARCHAR(100),
      departure_port VARCHAR(100),
      arrival_port VARCHAR(100),
      departure_date TIMESTAMP,
      arrival_date TIMESTAMP,
      cargo_type VARCHAR(50),
      cargo_weight_tons DECIMAL(10,2),
      revenue_usd DECIMAL(12,2),
      status VARCHAR(30),
      crew_count INT,
      stops TEXT,
      notes TEXT
    );

    CREATE TABLE shipping_lines (
      id SERIAL PRIMARY KEY,
      company_name VARCHAR(150) NOT NULL,
      code VARCHAR(20),
      country VARCHAR(50),
      contact_person VARCHAR(100),
      email VARCHAR(150),
      phone VARCHAR(50),
      website VARCHAR(200),
      fleet_size INT,
      service_routes TEXT,
      contract_status VARCHAR(30),
      contract_expiry DATE,
      payment_terms VARCHAR(50),
      notes TEXT
    );

    CREATE TABLE shipping_documents (
      id SERIAL PRIMARY KEY,
      document_number VARCHAR(30) NOT NULL,
      document_type VARCHAR(50),
      vessel_name VARCHAR(100),
      voyage_number VARCHAR(30),
      shipper VARCHAR(150),
      consignee VARCHAR(150),
      origin_port VARCHAR(100),
      destination_port VARCHAR(100),
      issue_date DATE,
      expiry_date DATE,
      status VARCHAR(30),
      issuing_authority VARCHAR(100),
      notes TEXT
    );

    CREATE TABLE port_tariffs (
      id SERIAL PRIMARY KEY,
      tariff_code VARCHAR(20) NOT NULL,
      service_category VARCHAR(50),
      description TEXT,
      unit VARCHAR(30),
      rate_usd DECIMAL(10,2),
      currency VARCHAR(10) DEFAULT 'USD',
      vessel_type_applicable VARCHAR(50),
      min_charge DECIMAL(10,2),
      max_charge DECIMAL(10,2),
      effective_date DATE,
      expiry_date DATE,
      status VARCHAR(30),
      notes TEXT
    );

    CREATE TABLE tide_schedules (
      id SERIAL PRIMARY KEY,
      port_name VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      high_tide_1 TIME,
      high_tide_1_height_m DECIMAL(5,2),
      low_tide_1 TIME,
      low_tide_1_height_m DECIMAL(5,2),
      high_tide_2 TIME,
      high_tide_2_height_m DECIMAL(5,2),
      low_tide_2 TIME,
      low_tide_2_height_m DECIMAL(5,2),
      tidal_range_m DECIMAL(5,2),
      spring_neap VARCHAR(20),
      notes TEXT
    );

    CREATE TABLE port_notices (
      id SERIAL PRIMARY KEY,
      notice_number VARCHAR(20) NOT NULL,
      title VARCHAR(200),
      category VARCHAR(50),
      priority VARCHAR(20),
      issued_by VARCHAR(100),
      issue_date DATE,
      effective_date DATE,
      expiry_date DATE,
      affected_areas TEXT,
      description TEXT,
      status VARCHAR(30),
      acknowledgements INT DEFAULT 0
    );
  `);
  console.log('✅ Tables created\n');

  // Seed Users
  const hashedPass = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'admin123', 10);
  await pool.query(`INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    ['Port Administrator', process.env.DEFAULT_EMAIL || 'admin@maritime.com', hashedPass, 'admin']);
  console.log('✅ Users seeded\n');

  // Seed Containers (15 items)
  const containers = [
    ['MSCU1234567', '40ft', 'Dry', 'Loaded', 'A', 3, 2, 28.5, 'Rotterdam', 'MV Pacific Star', '2026-03-15', '2026-03-22', 'high'],
    ['CMAU2345678', '20ft', 'Reefer', 'In Transit', 'B', 1, 1, 18.2, 'Hamburg', 'MV Atlantic Wave', '2026-03-14', '2026-03-20', 'urgent'],
    ['HLCU3456789', '40ft', 'Open Top', 'Awaiting Pickup', 'A', 5, 3, 32.1, 'Singapore', 'MV Ocean Glory', '2026-03-12', '2026-03-19', 'normal'],
    ['MAEU4567890', '20ft', 'Flat Rack', 'Loaded', 'C', 2, 1, 22.8, 'Shanghai', 'MV Dragon Pearl', '2026-03-16', '2026-03-25', 'high'],
    ['OOLU5678901', '40ft', 'Dry', 'Empty', 'D', 4, 2, 3.8, 'Busan', 'MV Korea Express', '2026-03-10', '2026-03-18', 'low'],
    ['EISU6789012', '40ft', 'Reefer', 'In Transit', 'B', 3, 3, 26.4, 'Antwerp', 'MV Euro Star', '2026-03-17', '2026-03-24', 'urgent'],
    ['TRIU7890123', '20ft', 'Tank', 'Loaded', 'E', 1, 1, 24.0, 'Houston', 'MV Gulf Trader', '2026-03-13', '2026-03-21', 'high'],
    ['YMLU8901234', '40ft', 'Dry', 'Customs Hold', 'A', 6, 2, 29.3, 'Tokyo', 'MV Nippon Maru', '2026-03-11', '2026-03-20', 'normal'],
    ['CSNU9012345', '20ft', 'Dry', 'Loaded', 'C', 2, 3, 15.7, 'Dubai', 'MV Arabian Sea', '2026-03-18', '2026-03-26', 'normal'],
    ['APLU0123456', '40ft', 'Open Top', 'Awaiting Pickup', 'D', 5, 1, 35.2, 'Los Angeles', 'MV Pacific Star', '2026-03-09', '2026-03-17', 'low'],
    ['TCKU1122334', '20ft', 'Reefer', 'In Transit', 'B', 4, 2, 19.8, 'Melbourne', 'MV Southern Cross', '2026-03-16', '2026-03-28', 'high'],
    ['GESU2233445', '40ft', 'Dry', 'Loaded', 'A', 1, 3, 27.6, 'Felixstowe', 'MV British Pride', '2026-03-15', '2026-03-23', 'normal'],
    ['BMOU3344556', '40ft', 'Flat Rack', 'Empty', 'E', 3, 1, 4.2, 'Mumbai', 'MV Indian Ocean', '2026-03-14', '2026-03-22', 'low'],
    ['SEGU4455667', '20ft', 'Dry', 'Customs Hold', 'C', 6, 2, 16.5, 'Santos', 'MV Brasil Star', '2026-03-17', '2026-03-27', 'urgent'],
    ['TGHU5566778', '40ft', 'Tank', 'Loaded', 'D', 2, 3, 31.0, 'Jeddah', 'MV Red Sea', '2026-03-13', '2026-03-21', 'high']
  ];
  for (const c of containers) {
    await pool.query(`INSERT INTO containers (container_id, size, type, status, location_block, location_row, location_tier, weight_tons, destination, vessel_name, arrival_date, departure_date, priority) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, c);
  }
  console.log('✅ 15 Containers seeded');

  // Seed Berths (15 items)
  const berths = [
    ['B-01', 'MV Pacific Star', 'Container', 294, '2026-03-19 06:00', '2026-03-20 18:00', 'Occupied', 'General', 12.5, false, 'high', 'Maersk Agency', 'Loading 2500 TEU'],
    ['B-02', 'MV Atlantic Wave', 'Bulk Carrier', 225, '2026-03-19 08:00', '2026-03-21 10:00', 'Occupied', 'Grain', 11.2, true, 'normal', 'MSC Shipping', 'Awaiting grain loading'],
    ['B-03', null, null, null, null, null, 'Available', null, 14.0, false, 'normal', null, 'Deep water berth'],
    ['B-04', 'MV Dragon Pearl', 'Container', 335, '2026-03-19 14:00', '2026-03-21 06:00', 'Occupied', 'Mixed', 13.8, false, 'urgent', 'COSCO Agency', 'Priority vessel - perishables'],
    ['B-05', 'MV Gulf Trader', 'Tanker', 183, '2026-03-18 22:00', '2026-03-20 14:00', 'Occupied', 'Chemicals', 10.5, true, 'high', 'Gulf Maritime', 'Hazmat protocols active'],
    ['B-06', null, null, null, null, null, 'Under Maintenance', null, 12.0, false, 'low', null, 'Crane repair until 03/22'],
    ['B-07', 'MV Euro Star', 'RoRo', 200, '2026-03-19 10:00', '2026-03-20 22:00', 'Occupied', 'Vehicles', 8.5, false, 'normal', 'Grimaldi Lines', '450 vehicles to offload'],
    ['B-08', 'MV Nippon Maru', 'Container', 310, '2026-03-20 06:00', '2026-03-22 12:00', 'Reserved', 'Electronics', 12.8, false, 'high', 'NYK Agency', 'Arriving from Tokyo'],
    ['B-09', null, null, null, null, null, 'Available', null, 15.5, false, 'normal', null, 'Largest berth - Panamax capable'],
    ['B-10', 'MV Southern Cross', 'Reefer', 165, '2026-03-19 16:00', '2026-03-21 08:00', 'Occupied', 'Frozen Goods', 9.2, false, 'urgent', 'ANL Shipping', 'Cold chain - maintain power'],
    ['B-11', 'MV Arabian Sea', 'Bulk Carrier', 245, '2026-03-20 12:00', '2026-03-22 18:00', 'Reserved', 'Iron Ore', 14.2, true, 'normal', 'Emirates Shipping', 'Heavy cargo - check berth stress'],
    ['B-12', 'MV British Pride', 'Container', 280, '2026-03-19 04:00', '2026-03-20 16:00', 'Occupied', 'Consumer Goods', 11.8, false, 'normal', 'P&O Maritime', 'Final loading phase'],
    ['B-13', null, null, null, null, null, 'Available', null, 10.0, false, 'low', null, 'Shallow berth - coasters only'],
    ['B-14', 'MV Red Sea', 'Tanker', 275, '2026-03-20 20:00', '2026-03-23 06:00', 'Reserved', 'Crude Oil', 16.5, true, 'high', 'Saudi Maritime', 'VLCC - special handling required'],
    ['B-15', 'MV Ocean Glory', 'Container', 260, '2026-03-21 08:00', '2026-03-23 14:00', 'Reserved', 'Machinery', 12.0, false, 'normal', 'Evergreen Marine', 'Heavy lift equipment needed']
  ];
  for (const b of berths) {
    await pool.query(`INSERT INTO berths (berth_number, vessel_name, vessel_type, vessel_length_m, arrival_time, departure_time, status, cargo_type, draft_depth_m, tide_dependency, priority_level, agent_company, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, b);
  }
  console.log('✅ 15 Berths seeded');

  // Seed Vessels (15 items)
  const vessels = [
    ['MV Pacific Star', 'IMO9234567', 'Container', 'Panama', 'Shanghai', 'Rotterdam', 31.2345, 121.4567, 18.5, '2026-03-22 14:00', 'Shanghai-Suez-Rotterdam', 'General Cargo', 'En Route'],
    ['MV Atlantic Wave', 'IMO9345678', 'Bulk Carrier', 'Liberia', 'New Orleans', 'Hamburg', 48.8566, -2.3522, 14.2, '2026-03-21 08:00', 'NOLA-Atlantic-Hamburg', 'Grain', 'En Route'],
    ['MV Dragon Pearl', 'IMO9456789', 'Container', 'Hong Kong', 'Shenzhen', 'Los Angeles', 22.3193, 114.1694, 20.1, '2026-03-25 16:00', 'Shenzhen-Pacific-LA', 'Mixed', 'Loading'],
    ['MV Ocean Glory', 'IMO9567890', 'Container', 'Singapore', 'Singapore', 'Felixstowe', 1.3521, 103.8198, 16.8, '2026-03-23 10:00', 'SG-Suez-Felixstowe', 'Machinery', 'En Route'],
    ['MV Gulf Trader', 'IMO9678901', 'Tanker', 'Marshall Islands', 'Houston', 'Jeddah', 26.2285, 50.5860, 12.5, '2026-03-28 06:00', 'Houston-Atlantic-Suez-Jeddah', 'Chemicals', 'En Route'],
    ['MV Euro Star', 'IMO9789012', 'RoRo', 'Italy', 'Genoa', 'Southampton', 43.2965, 5.3698, 17.0, '2026-03-20 22:00', 'Genoa-Gibraltar-Southampton', 'Vehicles', 'Arriving'],
    ['MV Korea Express', 'IMO9890123', 'Container', 'South Korea', 'Busan', 'Long Beach', 35.1796, 129.0756, 19.5, '2026-03-26 12:00', 'Busan-Pacific-LongBeach', 'Electronics', 'En Route'],
    ['MV Nippon Maru', 'IMO9901234', 'Container', 'Japan', 'Tokyo', 'Rotterdam', 35.6762, 139.6503, 17.8, '2026-03-24 08:00', 'Tokyo-Suez-Rotterdam', 'Electronics', 'En Route'],
    ['MV Southern Cross', 'IMO9012345', 'Reefer', 'Australia', 'Melbourne', 'Dubai', -37.8136, 144.9631, 15.2, '2026-03-27 14:00', 'Melbourne-IndianOcean-Dubai', 'Frozen Goods', 'En Route'],
    ['MV Arabian Sea', 'IMO9123456', 'Bulk Carrier', 'UAE', 'Abu Dhabi', 'Mumbai', 24.4539, 54.3773, 13.0, '2026-03-22 18:00', 'AbuDhabi-ArabianSea-Mumbai', 'Iron Ore', 'Departing'],
    ['MV British Pride', 'IMO9234568', 'Container', 'UK', 'Felixstowe', 'New York', 51.9536, 1.3511, 16.5, '2026-03-23 06:00', 'Felixstowe-Atlantic-NYC', 'Consumer Goods', 'Loading'],
    ['MV Indian Ocean', 'IMO9345679', 'Bulk Carrier', 'India', 'Chennai', 'Durban', 13.0827, 80.2707, 14.0, '2026-03-25 20:00', 'Chennai-IndianOcean-Durban', 'Textiles', 'En Route'],
    ['MV Brasil Star', 'IMO9456790', 'Container', 'Brazil', 'Santos', 'Antwerp', -23.9608, -46.3336, 18.0, '2026-03-24 14:00', 'Santos-Atlantic-Antwerp', 'Coffee', 'En Route'],
    ['MV Red Sea', 'IMO9567891', 'Tanker', 'Saudi Arabia', 'Ras Tanura', 'Rotterdam', 26.6500, 50.1500, 11.5, '2026-03-29 08:00', 'RasTanura-Suez-Rotterdam', 'Crude Oil', 'Loading'],
    ['MV Nordic Star', 'IMO9678902', 'Container', 'Norway', 'Oslo', 'Halifax', 59.9139, 10.7522, 19.0, '2026-03-22 10:00', 'Oslo-NorthSea-Atlantic-Halifax', 'Fish Products', 'En Route']
  ];
  for (const v of vessels) {
    await pool.query(`INSERT INTO vessels (vessel_name, imo_number, vessel_type, flag_state, origin_port, destination_port, current_lat, current_lng, speed_knots, eta, route_waypoints, cargo_type, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, v);
  }
  console.log('✅ 15 Vessels seeded');

  // Seed Customs (15 items)
  const customsData = [
    ['CDN-2026-00142', 'MV Pacific Star', 'TechWorld GmbH', 'Shanghai Electronics Co', 'Electronic components - circuit boards', '8542.31', 2450000, 'USD', 'China', 'Germany', 'Cleared', 'low', false, true],
    ['CDN-2026-00143', 'MV Atlantic Wave', 'Euro Grain SA', 'US Grain Export Corp', 'Wheat - Grade A bulk', '1001.99', 890000, 'USD', 'USA', 'Germany', 'In Review', 'low', false, true],
    ['CDN-2026-00144', 'MV Dragon Pearl', 'Fresh Foods Inc', 'Asian Farms Ltd', 'Frozen seafood - shrimp and fish', '0306.17', 1200000, 'USD', 'China', 'USA', 'Pending', 'medium', true, false],
    ['CDN-2026-00145', 'MV Gulf Trader', 'ChemCorp International', 'Gulf Petrochemicals', 'Industrial chemicals - ethylene glycol', '2905.31', 3800000, 'USD', 'USA', 'Saudi Arabia', 'Cleared', 'high', true, true],
    ['CDN-2026-00146', 'MV Euro Star', 'AutoParts Europe', 'Fiat Chrysler Export', 'Automobile parts - engines and transmissions', '8708.99', 5600000, 'EUR', 'Italy', 'UK', 'Cleared', 'low', false, true],
    ['CDN-2026-00147', 'MV Nippon Maru', 'Digital World LLC', 'Sony Export Division', 'Consumer electronics - gaming consoles', '9504.50', 8900000, 'USD', 'Japan', 'Netherlands', 'Pending', 'medium', false, true],
    ['CDN-2026-00148', 'MV Southern Cross', 'MeatCo Premium', 'Australian Beef Export', 'Frozen beef - Wagyu grade', '0202.30', 4200000, 'AUD', 'Australia', 'UAE', 'In Review', 'low', true, true],
    ['CDN-2026-00149', 'MV Arabian Sea', 'Steel India Corp', 'Emirates Steel', 'Iron ore pellets - 65% Fe grade', '2601.12', 1800000, 'USD', 'UAE', 'India', 'Flagged', 'high', true, false],
    ['CDN-2026-00150', 'MV British Pride', 'RetailMax USA', 'UK Consumer Goods Ltd', 'Household goods - furniture and textiles', '9403.60', 3200000, 'GBP', 'UK', 'USA', 'Cleared', 'low', false, true],
    ['CDN-2026-00151', 'MV Indian Ocean', 'Textile House SA', 'Chennai Textiles', 'Cotton fabric rolls - dyed', '5209.42', 920000, 'USD', 'India', 'South Africa', 'Pending', 'low', false, true],
    ['CDN-2026-00152', 'MV Brasil Star', 'Coffee Masters BV', 'Brasil Coffee Export', 'Arabica coffee beans - premium grade', '0901.21', 2100000, 'USD', 'Brazil', 'Belgium', 'In Review', 'low', false, true],
    ['CDN-2026-00153', 'MV Red Sea', 'PetroChem Europe', 'Saudi Aramco Export', 'Crude petroleum oil', '2709.00', 45000000, 'USD', 'Saudi Arabia', 'Netherlands', 'Pending', 'high', true, false],
    ['CDN-2026-00154', 'MV Nordic Star', 'Nordic Seafood AS', 'Oslo Fisheries', 'Fresh salmon - Atlantic farmed', '0302.14', 1500000, 'NOK', 'Norway', 'Canada', 'Cleared', 'low', true, true],
    ['CDN-2026-00155', 'MV Korea Express', 'SmartTech Inc', 'Samsung Logistics', 'Semiconductor chips and displays', '8541.49', 12500000, 'USD', 'South Korea', 'USA', 'Flagged', 'high', true, false],
    ['CDN-2026-00156', 'MV Ocean Glory', 'Heavy Machinery PLC', 'Caterpillar SG Export', 'Construction equipment - excavators', '8429.52', 7800000, 'USD', 'Singapore', 'UK', 'In Review', 'medium', true, true]
  ];
  for (const c of customsData) {
    await pool.query(`INSERT INTO customs (declaration_number, vessel_name, importer, exporter, cargo_description, hs_code, declared_value, currency, origin_country, destination_country, status, risk_level, inspection_required, documents_complete) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, c);
  }
  console.log('✅ 15 Customs declarations seeded');

  // Seed Fuel Consumption (15 items)
  const fuelData = [
    ['MV Pacific Star', 'VOY-PS-2026-12', 'VLSFO', 65.5, 8200, 18.5, 'Fair', 'Moderate', 78, 2890, 9073, 1850000, 'Optimal speed 16kn for fuel savings'],
    ['MV Atlantic Wave', 'VOY-AW-2026-08', 'HFO', 48.2, 4800, 14.2, 'Good', 'Calm', 65, 1620, 5062, 972000, 'Clean hull - good efficiency'],
    ['MV Dragon Pearl', 'VOY-DP-2026-15', 'VLSFO', 72.0, 6500, 20.1, 'Poor', 'Rough', 85, 2340, 7345, 1498000, 'High consumption due to weather'],
    ['MV Ocean Glory', 'VOY-OG-2026-09', 'VLSFO', 58.3, 7800, 16.8, 'Good', 'Moderate', 72, 2710, 8510, 1735000, 'Steady consumption profile'],
    ['MV Gulf Trader', 'VOY-GT-2026-11', 'MGO', 42.8, 9200, 12.5, 'Fair', 'Calm', 60, 3150, 9891, 2520000, 'Slow steaming protocol'],
    ['MV Euro Star', 'VOY-ES-2026-06', 'VLSFO', 55.0, 2800, 17.0, 'Good', 'Slight', 70, 910, 2857, 583000, 'Short route - efficient'],
    ['MV Korea Express', 'VOY-KE-2026-14', 'VLSFO', 68.5, 5400, 19.5, 'Fair', 'Moderate', 80, 1900, 5964, 1216000, 'Trans-Pacific standard route'],
    ['MV Nippon Maru', 'VOY-NM-2026-10', 'VLSFO', 62.0, 9600, 17.8, 'Good', 'Calm', 74, 3340, 10487, 2138000, 'Suez route - good conditions'],
    ['MV Southern Cross', 'VOY-SC-2026-07', 'MGO', 38.5, 5600, 15.2, 'Good', 'Moderate', 62, 1420, 4459, 1136000, 'Reefer power adds 15% consumption'],
    ['MV Arabian Sea', 'VOY-AS-2026-05', 'HFO', 52.0, 1800, 13.0, 'Good', 'Calm', 68, 720, 2250, 432000, 'Short coastal voyage'],
    ['MV British Pride', 'VOY-BP-2026-13', 'VLSFO', 60.0, 3400, 16.5, 'Fair', 'Slight', 73, 1240, 3893, 794000, 'Atlantic crossing - standard'],
    ['MV Indian Ocean', 'VOY-IO-2026-04', 'HFO', 45.0, 3200, 14.0, 'Good', 'Moderate', 63, 1030, 3234, 618000, 'Indian Ocean route'],
    ['MV Brasil Star', 'VOY-BS-2026-16', 'VLSFO', 63.5, 5200, 18.0, 'Poor', 'Rough', 82, 1840, 5778, 1178000, 'South Atlantic weather delays'],
    ['MV Red Sea', 'VOY-RS-2026-03', 'HFO', 85.0, 6800, 11.5, 'Fair', 'Moderate', 55, 5030, 15794, 3018000, 'VLCC - high base consumption'],
    ['MV Nordic Star', 'VOY-NS-2026-17', 'MGO', 40.0, 2600, 19.0, 'Good', 'Slight', 75, 550, 1727, 440000, 'ECA compliant - MGO required']
  ];
  for (const f of fuelData) {
    await pool.query(`INSERT INTO fuel_consumption (vessel_name, voyage_id, fuel_type, consumption_rate_tons_day, distance_nm, speed_knots, weather_condition, sea_state, engine_load_pct, total_fuel_tons, co2_emissions_tons, cost_usd, optimization_notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, f);
  }
  console.log('✅ 15 Fuel consumption records seeded');

  // Seed Cargo Tracking (15 items)
  const cargoData = [
    ['TRK-2026-A1001', 'MSCU1234567', 'Shanghai Electronics Co', 'TechWorld GmbH', 'Shanghai', 'Rotterdam', 'Suez Canal', 'In Transit', 24500, 'Electronics', false, '2026-03-22', null],
    ['TRK-2026-A1002', 'CMAU2345678', 'US Grain Export Corp', 'Euro Grain SA', 'New Orleans', 'Hamburg', 'Mid-Atlantic', 'In Transit', 18200, 'Grain', false, '2026-03-21', null],
    ['TRK-2026-A1003', 'HLCU3456789', 'Caterpillar SG Export', 'Heavy Machinery PLC', 'Singapore', 'Felixstowe', 'Indian Ocean', 'In Transit', 32100, 'Machinery', false, '2026-03-23', null],
    ['TRK-2026-A1004', 'MAEU4567890', 'Asian Farms Ltd', 'Fresh Foods Inc', 'Shenzhen', 'Los Angeles', 'Pacific Ocean', 'In Transit', 22800, 'Frozen Food', true, '2026-03-25', null],
    ['TRK-2026-A1005', 'OOLU5678901', null, null, 'Busan', 'Long Beach', 'Busan Port', 'Empty Return', 3800, 'Empty', false, '2026-03-28', null],
    ['TRK-2026-A1006', 'EISU6789012', 'Oslo Fisheries', 'Nordic Seafood AS', 'Oslo', 'Halifax', 'North Sea', 'In Transit', 26400, 'Seafood', true, '2026-03-24', null],
    ['TRK-2026-A1007', 'TRIU7890123', 'Gulf Petrochemicals', 'ChemCorp International', 'Houston', 'Jeddah', 'Mediterranean', 'In Transit', 24000, 'Chemicals', false, '2026-03-28', null],
    ['TRK-2026-A1008', 'YMLU8901234', 'Sony Export Division', 'Digital World LLC', 'Tokyo', 'Rotterdam', 'Customs Hold', 'Held', 29300, 'Electronics', false, '2026-03-24', null],
    ['TRK-2026-A1009', 'CSNU9012345', 'Emirates Steel', 'Steel India Corp', 'Abu Dhabi', 'Mumbai', 'Arabian Sea', 'In Transit', 15700, 'Steel', false, '2026-03-22', null],
    ['TRK-2026-A1010', 'APLU0123456', 'Samsung Logistics', 'SmartTech Inc', 'Busan', 'Los Angeles', 'LA Port', 'Delivered', 35200, 'Semiconductors', false, '2026-03-17', '2026-03-16'],
    ['TRK-2026-A1011', 'TCKU1122334', 'Australian Beef Export', 'MeatCo Premium', 'Melbourne', 'Dubai', 'Indian Ocean', 'In Transit', 19800, 'Frozen Meat', true, '2026-03-27', null],
    ['TRK-2026-A1012', 'GESU2233445', 'UK Consumer Goods Ltd', 'RetailMax USA', 'Felixstowe', 'New York', 'Atlantic', 'In Transit', 27600, 'Consumer Goods', false, '2026-03-23', null],
    ['TRK-2026-A1013', 'BMOU3344556', null, null, 'Mumbai', 'Durban', 'Mumbai Port', 'Awaiting Load', 4200, 'Empty', false, '2026-03-30', null],
    ['TRK-2026-A1014', 'SEGU4455667', 'Brasil Coffee Export', 'Coffee Masters BV', 'Santos', 'Antwerp', 'Customs Hold', 'Held', 16500, 'Coffee', false, '2026-03-27', null],
    ['TRK-2026-A1015', 'TGHU5566778', 'Saudi Aramco Export', 'PetroChem Europe', 'Ras Tanura', 'Rotterdam', 'Red Sea', 'In Transit', 31000, 'Petroleum', false, '2026-03-29', null]
  ];
  for (const c of cargoData) {
    await pool.query(`INSERT INTO cargo_tracking (tracking_number, container_id, shipper, consignee, origin, destination, current_location, status, weight_kg, cargo_type, temperature_controlled, estimated_delivery, actual_delivery) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, c);
  }
  console.log('✅ 15 Cargo tracking records seeded');

  // Seed Port Traffic (15 items)
  const trafficData = [
    ['MV Pacific Star', 'Inbound', 'Main Channel', true, true, '2026-03-19 06:00', '2026-03-19 06:15', 'Container', 294, 12.5, 'Completed', 15, 'Slight tug delay'],
    ['MV Atlantic Wave', 'Inbound', 'Main Channel', true, false, '2026-03-19 08:00', '2026-03-19 08:00', 'Bulk Carrier', 225, 11.2, 'Completed', 0, null],
    ['MV Euro Star', 'Inbound', 'South Channel', true, false, '2026-03-19 10:00', '2026-03-19 10:30', 'RoRo', 200, 8.5, 'Completed', 30, 'Waiting for channel clearance'],
    ['MV Dragon Pearl', 'Inbound', 'Main Channel', true, true, '2026-03-19 14:00', null, 'Container', 335, 13.8, 'In Progress', 0, null],
    ['MV Southern Cross', 'Inbound', 'South Channel', true, false, '2026-03-19 16:00', null, 'Reefer', 165, 9.2, 'Scheduled', 0, null],
    ['MV British Pride', 'Outbound', 'Main Channel', true, false, '2026-03-20 04:00', null, 'Container', 280, 11.8, 'Scheduled', 0, null],
    ['MV Gulf Trader', 'Outbound', 'North Channel', true, true, '2026-03-20 08:00', null, 'Tanker', 183, 10.5, 'Scheduled', 0, 'Hazmat escort required'],
    ['MV Nippon Maru', 'Inbound', 'Main Channel', true, true, '2026-03-20 06:00', null, 'Container', 310, 12.8, 'Scheduled', 0, null],
    ['MV Pacific Star', 'Outbound', 'Main Channel', true, true, '2026-03-20 18:00', null, 'Container', 294, 12.5, 'Scheduled', 0, null],
    ['MV Arabian Sea', 'Inbound', 'South Channel', true, false, '2026-03-20 12:00', null, 'Bulk Carrier', 245, 14.2, 'Scheduled', 0, null],
    ['MV Atlantic Wave', 'Outbound', 'Main Channel', true, false, '2026-03-21 10:00', null, 'Bulk Carrier', 225, 11.2, 'Scheduled', 0, null],
    ['MV Red Sea', 'Inbound', 'North Channel', true, true, '2026-03-20 20:00', null, 'Tanker', 275, 16.5, 'Scheduled', 0, 'Deep draft - tide window required'],
    ['MV Ocean Glory', 'Inbound', 'Main Channel', true, true, '2026-03-21 08:00', null, 'Container', 260, 12.0, 'Scheduled', 0, null],
    ['MV Euro Star', 'Outbound', 'South Channel', true, false, '2026-03-20 22:00', null, 'RoRo', 200, 8.5, 'Scheduled', 0, null],
    ['MV Southern Cross', 'Outbound', 'South Channel', true, false, '2026-03-21 08:00', null, 'Reefer', 165, 9.2, 'Scheduled', 0, null]
  ];
  for (const t of trafficData) {
    await pool.query(`INSERT INTO port_traffic (vessel_name, direction, channel, pilot_required, tug_required, scheduled_time, actual_time, vessel_type, vessel_length_m, draft_m, status, delay_minutes, reason) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, t);
  }
  console.log('✅ 15 Port traffic records seeded');

  // Seed Weather Impact (15 items)
  const weatherData = [
    ['Port Rotterdam', '2026-03-19', 18, 'NW', 1.2, 8.0, 12, 'Partly Cloudy', 'Minimal', 0, 0, 'Green', 'Normal operations'],
    ['Port Rotterdam', '2026-03-20', 25, 'W', 2.1, 5.5, 10, 'Overcast', 'Moderate', 3, 2.5, 'Yellow', 'Monitor wind speeds for crane ops'],
    ['Port Rotterdam', '2026-03-21', 35, 'SW', 3.5, 3.0, 8, 'Storm', 'Severe', 8, 6.0, 'Red', 'Suspend crane operations above 30kn'],
    ['Port Rotterdam', '2026-03-22', 15, 'N', 0.8, 10.0, 14, 'Clear', 'None', 0, 0, 'Green', 'Excellent conditions post-storm'],
    ['Port Singapore', '2026-03-19', 12, 'SE', 0.5, 12.0, 30, 'Sunny', 'None', 0, 0, 'Green', 'Tropical fair weather'],
    ['Port Singapore', '2026-03-20', 22, 'S', 1.8, 6.0, 28, 'Thunderstorm', 'Moderate', 4, 3.0, 'Yellow', 'Afternoon squalls expected'],
    ['Port Shanghai', '2026-03-19', 20, 'E', 1.5, 7.0, 15, 'Cloudy', 'Minimal', 1, 0.5, 'Green', 'Light drizzle - no impact'],
    ['Port Shanghai', '2026-03-20', 30, 'NE', 2.8, 4.0, 13, 'Rain', 'Moderate', 5, 4.0, 'Yellow', 'Reduced visibility - pilot delay'],
    ['Port Hamburg', '2026-03-19', 28, 'W', 2.2, 5.0, 8, 'Windy', 'Moderate', 2, 1.5, 'Yellow', 'Close to crane suspension limit'],
    ['Port Hamburg', '2026-03-20', 10, 'SW', 0.6, 15.0, 9, 'Clear', 'None', 0, 0, 'Green', 'Calm conditions'],
    ['Port Los Angeles', '2026-03-19', 8, 'W', 0.4, 20.0, 22, 'Sunny', 'None', 0, 0, 'Green', 'Perfect operating conditions'],
    ['Port Los Angeles', '2026-03-20', 15, 'NW', 1.0, 12.0, 20, 'Fog', 'Moderate', 2, 2.0, 'Yellow', 'Morning fog - reduced visibility'],
    ['Port Dubai', '2026-03-19', 16, 'N', 0.8, 10.0, 35, 'Hazy', 'Minimal', 0, 0, 'Green', 'Sand haze - minor visibility reduction'],
    ['Port Dubai', '2026-03-20', 40, 'NW', 2.5, 2.0, 38, 'Sandstorm', 'Severe', 6, 8.0, 'Red', 'Sandstorm - suspend all outdoor ops'],
    ['Port Tokyo', '2026-03-19', 14, 'S', 1.0, 9.0, 16, 'Partly Cloudy', 'None', 0, 0, 'Green', 'Seasonal normal conditions']
  ];
  for (const w of weatherData) {
    await pool.query(`INSERT INTO weather_impact (port_name, date, wind_speed_knots, wind_direction, wave_height_m, visibility_nm, temperature_c, condition, operational_impact, vessels_affected, delay_hours, advisory_level, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, w);
  }
  console.log('✅ 15 Weather impact records seeded');

  // Seed Crew Management (15 items)
  const crewData = [
    ['Capt. James Morrison', 'Captain', 'British', 'MV Pacific Star', 'Master Mariner CoC', '2027-06-15', '2026-01-10', '2026-07-10', 'On Board', 450, '+44-7700-900123', 'Fit', 'Experienced master, 20yr service'],
    ['Viktor Petrov', 'Chief Officer', 'Russian', 'MV Pacific Star', 'Chief Mate CoC', '2027-03-20', '2026-02-01', '2026-08-01', 'On Board', 320, '+7-495-123-4567', 'Fit', null],
    ['Chen Wei', 'Chief Engineer', 'Chinese', 'MV Dragon Pearl', 'Chief Engineer CoC', '2026-12-30', '2025-12-15', '2026-06-15', 'On Board', 380, '+86-21-5555-1234', 'Fit', 'Due for cert renewal soon'],
    ['Rajesh Kumar', 'Second Officer', 'Indian', 'MV Arabian Sea', 'OOW CoC', '2027-08-10', '2026-03-01', '2026-09-01', 'On Board', 220, '+91-98765-43210', 'Fit', null],
    ['Oleksandr Boyko', 'Bosun', 'Ukrainian', 'MV Atlantic Wave', 'AB Certificate', '2027-01-15', '2026-01-20', '2026-07-20', 'On Board', 150, '+380-44-123-4567', 'Fit', 'Strong deck maintenance skills'],
    ['Maria Santos', 'Third Officer', 'Filipino', null, 'OOW CoC', '2027-05-22', '2025-11-01', '2026-05-01', 'Available', 180, '+63-2-8888-1234', 'Fit', 'Awaiting next assignment'],
    ['Erik Johansson', 'Second Engineer', 'Swedish', 'MV Euro Star', 'Second Engineer CoC', '2027-09-01', '2026-02-15', '2026-08-15', 'On Board', 280, '+46-8-555-1234', 'Fit', null],
    ['Ahmed Hassan', 'AB Seaman', 'Egyptian', 'MV Red Sea', 'AB Certificate', '2027-04-12', '2026-01-05', '2026-07-05', 'On Board', 95, '+20-2-1234-5678', 'Fit', null],
    ['Takeshi Yamada', 'Captain', 'Japanese', 'MV Nippon Maru', 'Master Mariner CoC', '2026-08-20', '2025-10-01', '2026-04-01', 'On Board', 480, '+81-3-5555-1234', 'Fit', 'Cert renewal needed within 5 months'],
    ['Dimitri Papadopoulos', 'Chief Officer', 'Greek', null, 'Chief Mate CoC', '2027-11-30', '2025-09-15', '2026-03-15', 'On Leave', 310, '+30-21-0555-1234', 'Fit', 'Shore leave - returning April'],
    ['Patrick OBrien', 'Cook', 'Irish', 'MV British Pride', 'Ship Cook Certificate', '2027-07-18', '2026-01-10', '2026-07-10', 'On Board', 110, '+353-1-555-1234', 'Fit', 'Certified for vessels >10 crew'],
    ['Andrei Volkov', 'Oiler', 'Russian', 'MV Gulf Trader', 'Engine Rating CoC', '2027-02-28', '2026-02-20', '2026-08-20', 'On Board', 85, '+7-812-555-1234', 'Fit', null],
    ['Miguel Rodriguez', 'AB Seaman', 'Mexican', null, 'AB Certificate', '2026-06-30', '2025-08-01', '2026-02-01', 'Training', 90, '+52-55-5555-1234', 'Pending Exam', 'STCW refresher training'],
    ['Yusuf Ali', 'Second Officer', 'Turkish', 'MV Southern Cross', 'OOW CoC', '2027-10-15', '2026-03-05', '2026-09-05', 'On Board', 210, '+90-212-555-1234', 'Fit', null],
    ['Lars Nielsen', 'Cadet', 'Danish', 'MV Nordic Star', 'Cadet Logbook', '2028-01-01', '2026-02-01', '2026-08-01', 'On Board', 45, '+45-33-555-123', 'Fit', 'First sea phase - good progress']
  ];
  for (const c of crewData) {
    await pool.query(`INSERT INTO crew_management (crew_name, rank, nationality, vessel_assigned, certification, certification_expiry, contract_start, contract_end, status, daily_rate_usd, emergency_contact, medical_status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, c);
  }
  console.log('✅ 15 Crew management records seeded');

  // Seed Port Equipment (15 items)
  const equipmentData = [
    ['STS-001', 'STS Crane', 'ZPMC', 'STS-65', 'Berth B-01', 'Operational', '2026-02-15', '2026-05-15', 12500, 65, 'Electric', 'Operator A. Smith', 'Post-Panamax capable'],
    ['STS-002', 'STS Crane', 'ZPMC', 'STS-65', 'Berth B-02', 'Operational', '2026-01-20', '2026-04-20', 11800, 65, 'Electric', 'Operator B. Jones', null],
    ['STS-003', 'STS Crane', 'Liebherr', 'LHM-800', 'Berth B-04', 'Under Maintenance', '2026-03-10', '2026-03-25', 15200, 100, 'Electric', null, 'Spreader replacement in progress'],
    ['RTG-001', 'RTG Crane', 'Kalmar', 'RTG-16', 'Yard Block A', 'Operational', '2026-02-28', '2026-05-28', 8900, 40, 'Diesel', 'Operator C. Lee', null],
    ['RTG-002', 'RTG Crane', 'Kalmar', 'RTG-16', 'Yard Block B', 'Operational', '2026-03-05', '2026-06-05', 9200, 40, 'Diesel', 'Operator D. Park', null],
    ['RTG-003', 'RTG Crane', 'ZPMC', 'eRTG-20', 'Yard Block C', 'Operational', '2026-01-15', '2026-04-15', 6500, 40, 'Hybrid', 'Operator E. Kim', 'Electric-hybrid model'],
    ['RS-001', 'Reach Stacker', 'Kalmar', 'DRF450', 'Yard Block D', 'Operational', '2026-03-01', '2026-06-01', 7800, 45, 'Diesel', 'Operator F. Wang', null],
    ['RS-002', 'Reach Stacker', 'Hyster', 'H52XM-16CH', 'Yard Block E', 'Out of Service', '2025-12-10', '2026-03-10', 14500, 42, 'Diesel', null, 'Engine overhaul required - awaiting parts'],
    ['FL-001', 'Forklift', 'Toyota', '8FD70', 'Warehouse A', 'Operational', '2026-02-20', '2026-05-20', 4200, 7, 'Diesel', 'Operator G. Singh', null],
    ['FL-002', 'Forklift', 'Linde', 'H80D', 'Warehouse B', 'Operational', '2026-03-08', '2026-06-08', 3800, 8, 'Diesel', 'Operator H. Patel', null],
    ['SC-001', 'Straddle Carrier', 'Kalmar', 'FastCharge', 'Yard Block A', 'Operational', '2026-02-10', '2026-05-10', 5600, 50, 'Electric', 'Operator I. Müller', 'Fast charge capable'],
    ['SC-002', 'Straddle Carrier', 'Noell', 'NSC-644E', 'Yard Block B', 'Standby', '2026-01-25', '2026-04-25', 7200, 50, 'Diesel', null, 'Reserve unit'],
    ['TT-001', 'Terminal Tractor', 'Terberg', 'YT222', 'Terminal Road', 'Operational', '2026-03-12', '2026-06-12', 3100, 70, 'Diesel', 'Operator J. Brown', null],
    ['TT-002', 'Terminal Tractor', 'Terberg', 'YT222', 'Terminal Road', 'Operational', '2026-02-25', '2026-05-25', 2800, 70, 'Diesel', 'Operator K. Davis', null],
    ['MC-001', 'Mobile Crane', 'Liebherr', 'LTM 1300', 'Heavy Lift Area', 'Operational', '2026-01-30', '2026-04-30', 2100, 300, 'Diesel', 'Operator L. Wilson', 'Heavy lift operations only']
  ];
  for (const e of equipmentData) {
    await pool.query(`INSERT INTO port_equipment (equipment_id, equipment_type, manufacturer, model, location, status, last_maintenance, next_maintenance, operating_hours, capacity_tons, fuel_type, operator_assigned, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, e);
  }
  console.log('✅ 15 Port equipment records seeded');

  // Seed Invoices (15 items)
  const invoiceData = [
    ['INV-2026-0301', 'Maersk Agency', 'MV Pacific Star', 'Berth Rental', 45000, 'USD', '2026-03-15', '2026-04-15', 'Pending', null, 28000, 17000, '3-day berth occupancy'],
    ['INV-2026-0302', 'MSC Shipping', 'MV Atlantic Wave', 'Cargo Handling', 62000, 'USD', '2026-03-14', '2026-04-14', 'Pending', null, 15000, 47000, 'Grain discharge - 48hr operation'],
    ['INV-2026-0303', 'COSCO Agency', 'MV Dragon Pearl', 'Berth Rental', 52000, 'USD', '2026-03-10', '2026-04-10', 'Paid', '2026-03-18', 32000, 20000, null],
    ['INV-2026-0304', 'Gulf Maritime', 'MV Gulf Trader', 'Pilotage', 8500, 'USD', '2026-03-12', '2026-04-12', 'Paid', '2026-03-15', 8500, 0, 'Hazmat surcharge included'],
    ['INV-2026-0305', 'Grimaldi Lines', 'MV Euro Star', 'Cargo Handling', 38000, 'EUR', '2026-03-11', '2026-04-11', 'Overdue', null, 12000, 26000, '30 days overdue - send reminder'],
    ['INV-2026-0306', 'NYK Agency', 'MV Nippon Maru', 'Towage', 12000, 'USD', '2026-03-16', '2026-04-16', 'Pending', null, 12000, 0, '2 tugs assigned'],
    ['INV-2026-0307', 'ANL Shipping', 'MV Southern Cross', 'Storage', 15500, 'USD', '2026-03-13', '2026-04-13', 'Partial', '2026-03-17', 5500, 10000, 'Cold storage premium rate'],
    ['INV-2026-0308', 'Emirates Shipping', 'MV Arabian Sea', 'Berth Rental', 48000, 'USD', '2026-03-09', '2026-04-09', 'Paid', '2026-03-12', 30000, 18000, null],
    ['INV-2026-0309', 'P&O Maritime', 'MV British Pride', 'Cargo Handling', 55000, 'GBP', '2026-03-08', '2026-04-08', 'Paid', '2026-03-14', 18000, 37000, null],
    ['INV-2026-0310', 'Saudi Maritime', 'MV Red Sea', 'Pilotage', 15000, 'USD', '2026-03-17', '2026-04-17', 'Pending', null, 15000, 0, 'VLCC pilotage - deep draft'],
    ['INV-2026-0311', 'Evergreen Marine', 'MV Ocean Glory', 'Inspection', 4200, 'USD', '2026-03-15', '2026-04-15', 'Paid', '2026-03-16', 4200, 0, 'Pre-departure inspection'],
    ['INV-2026-0312', 'Maersk Agency', 'MV Pacific Star', 'Fuel Supply', 285000, 'USD', '2026-03-14', '2026-04-14', 'Pending', null, 0, 285000, '500 tons VLSFO @ $570/ton'],
    ['INV-2026-0313', 'COSCO Agency', 'MV Dragon Pearl', 'Customs Clearance', 3800, 'USD', '2026-03-16', '2026-04-16', 'Paid', '2026-03-18', 1500, 2300, null],
    ['INV-2026-0314', 'Gulf Maritime', 'MV Gulf Trader', 'Towage', 9500, 'USD', '2026-03-18', '2026-04-18', 'Pending', null, 9500, 0, 'Departure towing'],
    ['INV-2026-0315', 'MSC Shipping', 'MV Atlantic Wave', 'Storage', 22000, 'USD', '2026-03-07', '2026-04-07', 'Overdue', null, 8000, 14000, 'Extended storage - grain silos']
  ];
  for (const inv of invoiceData) {
    await pool.query(`INSERT INTO invoices (invoice_number, client_name, vessel_name, service_type, amount, currency, issue_date, due_date, payment_status, payment_date, port_charges, handling_charges, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, inv);
  }
  console.log('✅ 15 Invoice records seeded');

  // Seed Incidents (15 items)
  const incidentData = [
    ['INC-2026-001', 'Cargo Damage', 'Minor', 'Berth B-04', '2026-03-12 14:30', 'MV Dragon Pearl', 'Container dropped 0.5m during crane operation - minor dent to container corner', 0, 'None', 'Crane spreader alignment', 'Recalibrated crane spreader locks', 'Resolved', 'Crane Operator C. Lee'],
    ['INC-2026-002', 'Personal Injury', 'Moderate', 'Yard Block A', '2026-03-14 09:15', null, 'Dock worker twisted ankle on uneven surface while guiding container placement', 1, 'None', 'Poor ground maintenance', 'Repaired yard surface, issued safety alert', 'Resolved', 'Supervisor M. Torres'],
    ['INC-2026-003', 'Near Miss', 'Minor', 'Main Channel', '2026-03-15 06:45', 'MV Pacific Star', 'Close quarters situation with fishing vessel in approach channel', 0, 'None', 'Unauthorized fishing vessel in channel', 'Notified coast guard, increased patrol', 'Closed', 'Pilot J. Henderson'],
    ['INC-2026-004', 'Environmental Spill', 'Major', 'Berth B-05', '2026-03-11 16:20', 'MV Gulf Trader', 'Small hydraulic oil leak from cargo manifold during chemical transfer - 50L spilled', 0, 'Moderate', 'Worn manifold gasket', 'Deployed absorbent booms, replaced gasket, environmental cleanup completed', 'Resolved', 'Terminal Manager R. White'],
    ['INC-2026-005', 'Equipment Failure', 'Moderate', 'Berth B-01', '2026-03-16 11:00', null, 'STS Crane STS-003 spreader mechanism failed during container lift', 0, 'None', 'Worn locking mechanism', 'Crane taken out of service for repair', 'Under Investigation', 'Engineer S. Nakamura'],
    ['INC-2026-006', 'Fire', 'Critical', 'Warehouse C', '2026-03-10 03:45', null, 'Electrical fire in warehouse C distribution panel - detected by smoke alarm', 0, 'Minor', 'Electrical short circuit', 'Fire suppression activated, panel replaced, full electrical audit ordered', 'Under Investigation', 'Security Officer K. Osei'],
    ['INC-2026-007', 'Collision', 'Minor', 'South Channel', '2026-03-13 19:30', 'MV Euro Star', 'Minor contact with channel marker buoy during berthing approach', 0, 'None', 'Strong crosswind during approach', 'Buoy replaced, approach procedures reviewed for high wind', 'Closed', 'Pilot A. Fernandez'],
    ['INC-2026-008', 'Cargo Damage', 'Moderate', 'Yard Block D', '2026-03-17 08:00', 'MV Nippon Maru', 'Reefer container CMAU2345678 temperature excursion - contents may be compromised', 0, 'None', 'Power cable disconnected', 'Reconnected, contents inspection pending', 'Open', 'Reefer Technician P. Lau'],
    ['INC-2026-009', 'Security Breach', 'Moderate', 'Gate 3', '2026-03-15 22:15', null, 'Unauthorized vehicle entered restricted area through Gate 3', 0, 'None', 'Gate barrier malfunction', 'Barrier repaired, CCTV footage reviewed, ISPS incident report filed', 'Resolved', 'Security Chief B. Akinwale'],
    ['INC-2026-010', 'Near Miss', 'Minor', 'Yard Block B', '2026-03-18 10:30', null, 'Straddle carrier SC-001 narrowly avoided collision with pedestrian worker', 0, 'None', 'Worker in blind spot', 'Refresher training for all yard personnel, added mirror at intersection', 'Open', 'Safety Officer D. Gupta'],
    ['INC-2026-011', 'Personal Injury', 'Minor', 'Berth B-02', '2026-03-12 07:45', 'MV Atlantic Wave', 'Mooring line handler suffered rope burn during berthing operation', 1, 'None', 'Worn mooring gloves', 'Replaced PPE stock, reinforced glove inspection SOP', 'Closed', 'Mooring Foreman T. Bergström'],
    ['INC-2026-012', 'Equipment Failure', 'Minor', 'Terminal Road', '2026-03-16 15:20', null, 'Terminal tractor TT-001 brake failure - stopped safely using engine brake', 0, 'None', 'Brake pad wear beyond limit', 'All tractors inspected, maintenance intervals shortened', 'Resolved', 'Fleet Manager H. Suzuki'],
    ['INC-2026-013', 'Grounding', 'Major', 'North Channel', '2026-03-09 04:30', 'MV Red Sea', 'Vessel touched bottom in North Channel during low tide approach - no hull breach', 0, 'None', 'Insufficient tide clearance for draft', 'Channel approach restricted for VLCC to HW +/- 2hrs', 'Under Investigation', 'Harbor Master L. de Vries'],
    ['INC-2026-014', 'Cargo Damage', 'Minor', 'Warehouse A', '2026-03-14 13:00', null, 'Forklift FL-001 punctured packaging on pallet of electronics', 0, 'None', 'Operator error - incorrect fork height', 'Operator retrained, damage claim filed', 'Resolved', 'Warehouse Supervisor R. Tanaka'],
    ['INC-2026-015', 'Environmental Spill', 'Minor', 'Berth B-07', '2026-03-17 12:00', 'MV Euro Star', 'Small diesel fuel sheen observed around vessel - approx 5L', 0, 'Minor', 'Leaking fuel day tank vent', 'Absorbent pads deployed, vent repaired', 'Closed', 'Environmental Officer N. Costa']
  ];
  for (const inc of incidentData) {
    await pool.query(`INSERT INTO incidents (incident_id, incident_type, severity, location, date_time, vessel_involved, description, injuries, environmental_impact, root_cause, corrective_action, status, reported_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, inc);
  }
  console.log('✅ 15 Incident records seeded');

  // Seed Dock Inspections (15 items)
  const inspectionData = [
    ['INS-2026-001', 'MV Pacific Star', 'Capt. R. Thompson', 'Port State Control', '2026-03-10', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 1, 'Passed', '2026-06-10'],
    ['INS-2026-002', 'MV Atlantic Wave', 'Mr. J. van Dijk', 'Port State Control', '2026-03-08', 'Fair', 'Pass', 'Minor Issues', 'Pass', 'C - Satisfactory', 3, 'Conditional Pass', '2026-06-08'],
    ['INS-2026-003', 'MV Dragon Pearl', 'Capt. L. Chen', 'Classification Society', '2026-03-05', 'Excellent', 'Pass', 'Pass', 'Pass', 'A - Excellent', 0, 'Passed', '2026-09-05'],
    ['INS-2026-004', 'MV Gulf Trader', 'Mr. A. Petersen', 'Port State Control', '2026-03-12', 'Fair', 'Minor Issues', 'Pass', 'Pass', 'C - Satisfactory', 4, 'Conditional Pass', '2026-06-12'],
    ['INS-2026-005', 'MV Euro Star', 'Capt. G. Rossi', 'Flag State', '2026-03-07', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 1, 'Passed', '2026-09-07'],
    ['INS-2026-006', 'MV Nippon Maru', 'Mr. T. Watanabe', 'Classification Society', '2026-03-14', 'Excellent', 'Pass', 'Pass', 'Pass', 'A - Excellent', 0, 'Passed', '2026-09-14'],
    ['INS-2026-007', 'MV Southern Cross', 'Capt. R. Thompson', 'Port State Control', '2026-03-11', 'Good', 'Pass', 'Pass', 'Minor Issues', 'B - Good', 2, 'Passed', '2026-06-11'],
    ['INS-2026-008', 'MV Arabian Sea', 'Mr. J. van Dijk', 'Port State Control', '2026-03-09', 'Poor', 'Minor Issues', 'Fail', 'Minor Issues', 'D - Substandard', 8, 'Failed', '2026-04-09'],
    ['INS-2026-009', 'MV British Pride', 'Capt. L. Chen', 'Internal Audit', '2026-03-13', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 1, 'Passed', '2026-06-13'],
    ['INS-2026-010', 'MV Indian Ocean', 'Mr. A. Petersen', 'Port State Control', '2026-03-06', 'Fair', 'Minor Issues', 'Minor Issues', 'Pass', 'C - Satisfactory', 5, 'Conditional Pass', '2026-06-06'],
    ['INS-2026-011', 'MV Brasil Star', 'Capt. G. Rossi', 'Safety Drill', '2026-03-15', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 0, 'Passed', '2026-06-15'],
    ['INS-2026-012', 'MV Red Sea', 'Mr. T. Watanabe', 'Pre-departure', '2026-03-16', 'Fair', 'Pass', 'Pass', 'Minor Issues', 'C - Satisfactory', 3, 'Conditional Pass', '2026-04-16'],
    ['INS-2026-013', 'MV Nordic Star', 'Capt. R. Thompson', 'Flag State', '2026-03-04', 'Excellent', 'Pass', 'Pass', 'Pass', 'A - Excellent', 0, 'Passed', '2026-09-04'],
    ['INS-2026-014', 'MV Korea Express', 'Mr. J. van Dijk', 'Port State Control', '2026-03-17', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 1, 'Passed', '2026-06-17'],
    ['INS-2026-015', 'MV Ocean Glory', 'Capt. L. Chen', 'Pre-departure', '2026-03-18', 'Good', 'Pass', 'Pass', 'Pass', 'B - Good', 0, 'Pending Review', '2026-06-18']
  ];
  for (const ins of inspectionData) {
    await pool.query(`INSERT INTO dock_inspections (inspection_id, vessel_name, inspector_name, inspection_type, date, hull_condition, safety_equipment, fire_systems, navigation_systems, overall_rating, deficiencies_found, status, next_inspection_due) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, ins);
  }
  console.log('✅ 15 Dock inspection records seeded');

  // Seed Warehouse (15 items)
  const warehouseData = [
    ['WH-A', 'A - General', 'A-01-01', 'Electronics', 450, 'Pallets', 85.5, 'TechWorld GmbH', '2026-03-12', null, false, 72, 'Stored'],
    ['WH-A', 'A - General', 'A-02-03', 'Consumer Goods', 320, 'Boxes', 48.2, 'RetailMax USA', '2026-03-08', null, false, 65, 'Stored'],
    ['WH-A', 'A - General', 'A-03-02', 'Furniture', 180, 'Units', 92.0, 'UK Consumer Goods Ltd', '2026-03-14', null, false, 58, 'Awaiting Pickup'],
    ['WH-B', 'B - Refrigerated', 'B-01-01', 'Frozen Seafood', 200, 'Pallets', 42.0, 'Fresh Foods Inc', '2026-03-15', '2026-04-15', true, 88, 'Stored'],
    ['WH-B', 'B - Refrigerated', 'B-01-03', 'Frozen Beef', 150, 'Pallets', 38.5, 'MeatCo Premium', '2026-03-13', '2026-05-13', true, 75, 'Stored'],
    ['WH-B', 'B - Refrigerated', 'B-02-01', 'Fresh Salmon', 80, 'Boxes', 12.8, 'Nordic Seafood AS', '2026-03-17', '2026-03-27', true, 42, 'In Processing'],
    ['WH-C', 'C - Hazardous', 'C-01-01', 'Industrial Chemicals', 50, 'Drums', 28.0, 'ChemCorp International', '2026-03-11', null, false, 35, 'Stored'],
    ['WH-C', 'C - Hazardous', 'C-02-01', 'Petroleum Products', 30, 'Drums', 22.5, 'PetroChem Europe', '2026-03-16', null, false, 25, 'Awaiting Pickup'],
    ['WH-D', 'D - Bulk', 'D-01-01', 'Coffee Beans', 500, 'Bags', 32.5, 'Coffee Masters BV', '2026-03-10', '2026-09-10', false, 82, 'Stored'],
    ['WH-D', 'D - Bulk', 'D-02-01', 'Cotton Fabric', 350, 'Rolls', 28.0, 'Textile House SA', '2026-03-09', null, false, 68, 'Stored'],
    ['WH-D', 'D - Bulk', 'D-03-01', 'Iron Ore Samples', 20, 'Bags', 4.2, 'Steel India Corp', '2026-03-14', null, false, 12, 'Released'],
    ['WH-E', 'E - High Value', 'E-01-01', 'Semiconductor Chips', 100, 'Boxes', 2.8, 'SmartTech Inc', '2026-03-15', null, false, 45, 'Stored'],
    ['WH-E', 'E - High Value', 'E-01-02', 'Gaming Consoles', 280, 'Pallets', 35.0, 'Digital World LLC', '2026-03-16', null, false, 62, 'Stored'],
    ['WH-A', 'A - General', 'A-04-01', 'Auto Parts', 220, 'Pallets', 55.0, 'AutoParts Europe', '2026-03-07', null, false, 48, 'Awaiting Pickup'],
    ['WH-B', 'B - Refrigerated', 'B-03-01', 'Dairy Products', 90, 'Pallets', 18.0, 'Euro Dairy Co', '2026-03-12', '2026-03-22', true, 30, 'Expired']
  ];
  for (const w of warehouseData) {
    await pool.query(`INSERT INTO warehouse (warehouse_id, zone, rack_number, cargo_type, quantity, unit, weight_tons, owner, arrival_date, expiry_date, temperature_required, occupancy_pct, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, w);
  }
  console.log('✅ 15 Warehouse records seeded');

  // Seed Voyages (15 items)
  const voyageData = [
    ['VOY-2026-PS-12', 'MV Pacific Star', 'Shanghai', 'Rotterdam', '2026-03-01 08:00', '2026-03-22 14:00', 'General Cargo', 42000, 2850000, 'In Progress', 25, 'Singapore, Suez', 'Main trade lane - full load'],
    ['VOY-2026-AW-08', 'MV Atlantic Wave', 'New Orleans', 'Hamburg', '2026-03-05 12:00', '2026-03-21 08:00', 'Grain', 55000, 1650000, 'In Progress', 22, 'Direct', 'Bulk grain shipment'],
    ['VOY-2026-DP-15', 'MV Dragon Pearl', 'Shenzhen', 'Los Angeles', '2026-03-10 06:00', '2026-03-25 16:00', 'Mixed', 38000, 3200000, 'Confirmed', 24, 'Direct trans-Pacific', 'High value electronics cargo'],
    ['VOY-2026-OG-09', 'MV Ocean Glory', 'Singapore', 'Felixstowe', '2026-03-08 10:00', '2026-03-23 10:00', 'Machinery', 35000, 2100000, 'In Progress', 23, 'Colombo, Suez', null],
    ['VOY-2026-GT-11', 'MV Gulf Trader', 'Houston', 'Jeddah', '2026-03-06 14:00', '2026-03-28 06:00', 'Chemicals', 28000, 1890000, 'In Progress', 20, 'Gibraltar, Suez', 'Hazmat cargo - special handling'],
    ['VOY-2026-ES-06', 'MV Euro Star', 'Genoa', 'Southampton', '2026-03-15 08:00', '2026-03-20 22:00', 'Vehicles', 12000, 980000, 'In Progress', 18, 'Direct', '450 vehicles'],
    ['VOY-2026-KE-14', 'MV Korea Express', 'Busan', 'Long Beach', '2026-03-12 06:00', '2026-03-26 12:00', 'Electronics', 40000, 3500000, 'In Progress', 24, 'Direct', 'Samsung shipment'],
    ['VOY-2026-NM-10', 'MV Nippon Maru', 'Tokyo', 'Rotterdam', '2026-03-04 08:00', '2026-03-24 08:00', 'Electronics', 36000, 2750000, 'In Progress', 23, 'Singapore, Suez', null],
    ['VOY-2026-SC-07', 'MV Southern Cross', 'Melbourne', 'Dubai', '2026-03-09 12:00', '2026-03-27 14:00', 'Frozen Goods', 18000, 1420000, 'In Progress', 20, 'Colombo', 'Reefer cargo throughout'],
    ['VOY-2026-BP-13', 'MV British Pride', 'Felixstowe', 'New York', '2026-03-14 04:00', '2026-03-23 06:00', 'Consumer Goods', 32000, 1950000, 'Confirmed', 22, 'Direct', null],
    ['VOY-2026-RS-03', 'MV Red Sea', 'Ras Tanura', 'Rotterdam', '2026-03-20 20:00', '2026-03-29 08:00', 'Crude Oil', 280000, 42000000, 'Planning', 30, 'Suez', 'VLCC voyage - high revenue'],
    ['VOY-2026-NS-17', 'MV Nordic Star', 'Oslo', 'Halifax', '2026-03-11 06:00', '2026-03-22 10:00', 'Fish Products', 15000, 890000, 'In Progress', 19, 'Direct', 'ECA zone - MGO fuel only'],
    ['VOY-2026-IO-04', 'MV Indian Ocean', 'Chennai', 'Durban', '2026-03-13 08:00', '2026-03-25 20:00', 'Textiles', 22000, 720000, 'In Progress', 20, 'Direct', null],
    ['VOY-2026-BS-16', 'MV Brasil Star', 'Santos', 'Antwerp', '2026-03-07 10:00', '2026-03-24 14:00', 'Coffee', 25000, 1350000, 'In Progress', 21, 'Las Palmas', null],
    ['VOY-2026-AS-05', 'MV Arabian Sea', 'Abu Dhabi', 'Mumbai', '2026-03-18 12:00', '2026-03-22 18:00', 'Iron Ore', 60000, 580000, 'Confirmed', 22, 'Direct', 'Short coastal voyage']
  ];
  for (const v of voyageData) {
    await pool.query(`INSERT INTO voyages (voyage_number, vessel_name, departure_port, arrival_port, departure_date, arrival_date, cargo_type, cargo_weight_tons, revenue_usd, status, crew_count, stops, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, v);
  }
  console.log('✅ 15 Voyage records seeded');

  // Seed Shipping Lines (10 items)
  const shippingLines = [
    ['Maersk Line', 'MAEU', 'Denmark', 'Lars Jensen', 'lars.jensen@maersk.com', '+45-3363-3363', 'https://www.maersk.com', 730, 'Asia-Europe, Trans-Pacific, Trans-Atlantic', 'Active', '2027-12-31', 'Net 30', 'Largest container line globally'],
    ['MSC Mediterranean Shipping', 'MSCU', 'Switzerland', 'Diego Aponte', 'commercial@msc.com', '+41-22-703-8888', 'https://www.msc.com', 680, 'Global - all major trade lanes', 'Active', '2027-06-30', 'Net 30', null],
    ['CMA CGM Group', 'CMAU', 'France', 'Rodolphe Saade', 'contact@cma-cgm.com', '+33-4-88-91-90-00', 'https://www.cma-cgm.com', 590, 'Asia-Europe, Trans-Atlantic, Africa', 'Active', '2027-09-30', 'Net 45', null],
    ['COSCO Shipping', 'COSU', 'China', 'Wei Chen', 'charter@cosco.com', '+86-21-6596-6105', 'https://www.coscoshipping.com', 480, 'Asia-Europe, Intra-Asia, Trans-Pacific', 'Active', '2027-03-31', 'Net 30', 'State-owned enterprise'],
    ['Hapag-Lloyd', 'HLCU', 'Germany', 'Rolf Habben Jansen', 'info@hlag.com', '+49-40-3001-0', 'https://www.hapag-lloyd.com', 260, 'Trans-Atlantic, Asia-Europe, Latin America', 'Active', '2026-12-31', 'Net 30', null],
    ['Evergreen Marine', 'EISU', 'Taiwan', 'Chang Yen-I', 'service@evergreen-line.com', '+886-2-2505-7766', 'https://www.evergreen-line.com', 210, 'Asia-Europe, Trans-Pacific, Intra-Asia', 'Active', '2027-06-30', 'Net 45', null],
    ['ONE (Ocean Network Express)', 'ONEY', 'Japan', 'Tanaka Yuki', 'customer.service@one-line.com', '+81-3-6860-3080', 'https://www.one-line.com', 210, 'Trans-Pacific, Asia-Europe, Intra-Asia', 'Active', '2026-09-30', 'Net 30', 'Merger of MOL, NYK, K Line container ops'],
    ['Yang Ming Marine', 'YMLU', 'Taiwan', 'Cheng Cheng-Mount', 'service@yml.com.tw', '+886-2-2381-5999', 'https://www.yangming.com', 100, 'Trans-Pacific, Asia-Europe', 'Active', '2027-03-31', 'Net 30', null],
    ['ZIM Integrated Shipping', 'ZIMU', 'Israel', 'Eli Glickman', 'info@zim.com', '+972-4-865-2111', 'https://www.zim.com', 130, 'Trans-Pacific, Asia-US East Coast', 'Under Review', '2026-06-30', 'Net 60', 'Contract renewal pending'],
    ['PIL (Pacific International Lines)', 'PCIU', 'Singapore', 'Lars Kastrup', 'general@pilship.com', '+65-6223-0811', 'https://www.pilship.com', 85, 'Intra-Asia, Africa, Middle East', 'Active', '2027-01-31', 'Net 45', 'Regional specialist']
  ];
  for (const s of shippingLines) {
    await pool.query(`INSERT INTO shipping_lines (company_name, code, country, contact_person, email, phone, website, fleet_size, service_routes, contract_status, contract_expiry, payment_terms, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, s);
  }
  console.log('✅ 10 Shipping Lines seeded');

  // Seed Shipping Documents (12 items)
  const documents = [
    ['BL-2026-001', 'Bill of Lading', 'MV Pacific Star', 'VOY-2026-PS-12', 'Shanghai Export Co.', 'Rotterdam Import BV', 'Shanghai', 'Rotterdam', '2026-03-01', '2026-06-01', 'Active', 'Shanghai Customs', 'Original 3/3'],
    ['BL-2026-002', 'Bill of Lading', 'MV Atlantic Wave', 'VOY-2026-AW-08', 'Cargill Grain', 'Hamburg Milling GmbH', 'New Orleans', 'Hamburg', '2026-03-05', '2026-06-05', 'Active', 'US Customs', null],
    ['MF-2026-001', 'Cargo Manifest', 'MV Dragon Pearl', 'VOY-2026-DP-15', 'Shenzhen Electronics', 'LA Distribution Inc', 'Shenzhen', 'Los Angeles', '2026-03-10', null, 'Active', 'Shenzhen Port Authority', '2500 TEU manifest'],
    ['COO-2026-001', 'Certificate of Origin', 'MV Pacific Star', 'VOY-2026-PS-12', 'Shanghai Export Co.', 'Rotterdam Import BV', 'Shanghai', 'Rotterdam', '2026-03-01', '2026-09-01', 'Active', 'China Chamber of Commerce', null],
    ['PHY-2026-001', 'Phytosanitary Certificate', 'MV Atlantic Wave', 'VOY-2026-AW-08', 'Cargill Grain', 'Hamburg Milling GmbH', 'New Orleans', 'Hamburg', '2026-03-04', '2026-04-04', 'Active', 'USDA APHIS', 'Grain cargo clearance'],
    ['INS-2026-001', 'Insurance Certificate', 'MV Gulf Trader', 'VOY-2026-GT-11', 'Houston Chemical Corp', 'Jeddah Industries', 'Houston', 'Jeddah', '2026-03-06', '2026-03-28', 'Active', 'Lloyds of London', 'Hazmat coverage'],
    ['DG-2026-001', 'Dangerous Goods Declaration', 'MV Gulf Trader', 'VOY-2026-GT-11', 'Houston Chemical Corp', 'Jeddah Industries', 'Houston', 'Jeddah', '2026-03-06', null, 'Active', 'IMO Certified', 'IMDG Class 8 - Corrosives'],
    ['BL-2026-003', 'Bill of Lading', 'MV Euro Star', 'VOY-2026-ES-06', 'Fiat Automobiles', 'UK Motor Dealers', 'Genoa', 'Southampton', '2026-03-15', '2026-06-15', 'Active', 'Genoa Port Authority', '450 vehicles'],
    ['CUS-2026-001', 'Customs Declaration', 'MV Nippon Maru', 'VOY-2026-NM-10', 'Sony Corporation', 'EU Distribution Center', 'Tokyo', 'Rotterdam', '2026-03-04', null, 'Pending', 'Tokyo Customs', 'Electronics - duty classification pending'],
    ['BL-2026-004', 'Bill of Lading', 'MV Brasil Star', 'VOY-2026-BS-16', 'Santos Coffee Export', 'Antwerp Coffee Traders', 'Santos', 'Antwerp', '2026-03-07', '2026-06-07', 'Active', 'Santos Customs', null],
    ['SWB-2026-001', 'Sea Waybill', 'MV Southern Cross', 'VOY-2026-SC-07', 'Melbourne Fresh Foods', 'Dubai Cold Storage', 'Melbourne', 'Dubai', '2026-03-09', null, 'Active', 'Melbourne Port', 'Non-negotiable - reefer cargo'],
    ['BL-2026-005', 'Bill of Lading', 'MV Red Sea', 'VOY-2026-RS-03', 'Saudi Aramco', 'Shell Trading Rotterdam', 'Ras Tanura', 'Rotterdam', '2026-03-20', '2026-06-20', 'Draft', 'Ras Tanura Port', 'VLCC crude oil shipment - awaiting final quantity']
  ];
  for (const d of documents) {
    await pool.query(`INSERT INTO shipping_documents (document_number, document_type, vessel_name, voyage_number, shipper, consignee, origin_port, destination_port, issue_date, expiry_date, status, issuing_authority, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, d);
  }
  console.log('✅ 12 Shipping Documents seeded');

  // Seed Port Tariffs (12 items)
  const tariffs = [
    ['TRF-001', 'Berthage', 'Vessel berthage charge per meter per hour', 'Per meter/hour', 2.50, 'USD', 'All', 500, 50000, '2026-01-01', '2026-12-31', 'Active', 'Standard berthage rate'],
    ['TRF-002', 'Pilotage', 'Pilot services for vessel entry/exit', 'Per movement', 3500, 'USD', 'All', 2000, 15000, '2026-01-01', '2026-12-31', 'Active', 'Includes pilot boat'],
    ['TRF-003', 'Towage', 'Tug assistance for berthing/unberthing', 'Per tug/hour', 1800, 'USD', 'All', 1800, 12000, '2026-01-01', '2026-12-31', 'Active', '2 tugs minimum for vessels >200m'],
    ['TRF-004', 'Container Handling', 'Loading/unloading containers from vessel', 'Per TEU', 185, 'USD', 'Container', 185, null, '2026-01-01', '2026-12-31', 'Active', '20ft equivalent unit'],
    ['TRF-005', 'Container Storage', 'Yard storage for containers', 'Per TEU/day', 25, 'USD', 'Container', 25, null, '2026-01-01', '2026-12-31', 'Active', 'First 3 days free'],
    ['TRF-006', 'Bulk Cargo Handling', 'Bulk cargo loading/unloading', 'Per ton', 8.50, 'USD', 'Bulk Carrier', 5000, 500000, '2026-01-01', '2026-12-31', 'Active', null],
    ['TRF-007', 'Tanker Services', 'Pipeline and pump station usage', 'Per ton', 4.20, 'USD', 'Tanker', 10000, 800000, '2026-01-01', '2026-12-31', 'Active', 'Includes vapor recovery'],
    ['TRF-008', 'Fresh Water Supply', 'Potable water delivery to vessel', 'Per ton', 12, 'USD', 'All', 100, 5000, '2026-01-01', '2026-12-31', 'Active', null],
    ['TRF-009', 'Waste Disposal', 'Ship waste collection and disposal', 'Per cubic meter', 45, 'USD', 'All', 200, 10000, '2026-01-01', '2026-12-31', 'Active', 'MARPOL compliant'],
    ['TRF-010', 'Reefer Connection', 'Shore power for refrigerated containers', 'Per unit/day', 35, 'USD', 'Container', 35, null, '2026-01-01', '2026-12-31', 'Active', '440V supply'],
    ['TRF-011', 'RoRo Ramp Usage', 'Vehicle ramp access for RoRo operations', 'Per hour', 950, 'USD', 'RoRo', 950, 15000, '2026-01-01', '2026-12-31', 'Active', null],
    ['TRF-012', 'Hazmat Surcharge', 'Additional charge for dangerous goods handling', 'Per TEU', 250, 'USD', 'All', 250, null, '2026-01-01', '2026-12-31', 'Active', 'IMO class dependent']
  ];
  for (const t of tariffs) {
    await pool.query(`INSERT INTO port_tariffs (tariff_code, service_category, description, unit, rate_usd, currency, vessel_type_applicable, min_charge, max_charge, effective_date, expiry_date, status, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, t);
  }
  console.log('✅ 12 Port Tariffs seeded');

  // Seed Tide Schedules (10 items)
  const tides = [
    ['Port Rotterdam', '2026-03-21', '03:15', 2.10, '09:42', 0.45, '15:38', 2.25, '22:05', 0.52, 1.73, 'Spring', 'Large tidal range - check berth clearances'],
    ['Port Rotterdam', '2026-03-22', '04:02', 1.95, '10:28', 0.55, '16:25', 2.08, '22:52', 0.60, 1.48, 'Spring', null],
    ['Port Rotterdam', '2026-03-23', '04:48', 1.82, '11:15', 0.62, '17:12', 1.92, '23:38', 0.68, 1.24, 'Transition', null],
    ['Port Rotterdam', '2026-03-24', '05:35', 1.70, '12:02', 0.72, '17:58', 1.78, null, null, 1.06, 'Neap', 'Reduced tidal range'],
    ['Port Rotterdam', '2026-03-25', '06:22', 1.60, '12:48', 0.78, '18:45', 1.68, '00:25', 0.75, 0.90, 'Neap', null],
    ['Port Hamburg', '2026-03-21', '02:45', 3.80, '09:10', 0.30, '15:08', 3.95, '21:35', 0.35, 3.60, 'Spring', 'Elbe river influence - strong currents'],
    ['Port Hamburg', '2026-03-22', '03:32', 3.65, '09:58', 0.40, '15:55', 3.78, '22:22', 0.42, 3.36, 'Spring', null],
    ['Port Singapore', '2026-03-21', '01:20', 2.85, '07:45', 0.55, '13:42', 2.90, '20:10', 0.50, 2.40, 'Spring', 'Minimal variation typical for equatorial ports'],
    ['Port Singapore', '2026-03-22', '02:05', 2.78, '08:30', 0.60, '14:28', 2.82, '20:55', 0.55, 2.27, 'Spring', null],
    ['Port Singapore', '2026-03-23', '02:50', 2.68, '09:15', 0.65, '15:15', 2.72, '21:40', 0.62, 2.10, 'Transition', null]
  ];
  for (const t of tides) {
    await pool.query(`INSERT INTO tide_schedules (port_name, date, high_tide_1, high_tide_1_height_m, low_tide_1, low_tide_1_height_m, high_tide_2, high_tide_2_height_m, low_tide_2, low_tide_2_height_m, tidal_range_m, spring_neap, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, t);
  }
  console.log('✅ 10 Tide Schedules seeded');

  // Seed Port Notices (10 items)
  const notices = [
    ['PN-2026-042', 'Channel Dredging Operations - North Channel', 'Navigation', 'high', 'Harbour Master', '2026-03-18', '2026-03-20', '2026-04-05', 'North Channel, Berths B-09 to B-12', 'Dredging operations underway in North Channel. Vessels to use Main Channel during this period. Maximum draft restriction of 10m applies to North Channel approaches.', 'Active', 15],
    ['PN-2026-043', 'New Pilotage Regulations Effective April 1st', 'Regulatory', 'normal', 'Port Authority', '2026-03-15', '2026-04-01', null, 'All port areas', 'Updated pilotage regulations require compulsory pilotage for all vessels over 150m LOA. Previous threshold was 200m. All agents to update vessel notifications accordingly.', 'Active', 22],
    ['PN-2026-044', 'Berth B-06 Crane Maintenance Closure', 'Operations', 'normal', 'Terminal Manager', '2026-03-19', '2026-03-19', '2026-03-25', 'Berth B-06', 'STS Crane #3 at Berth B-06 undergoing scheduled maintenance. Berth unavailable for container operations until repairs complete. Estimated completion March 25th.', 'Active', 8],
    ['PN-2026-045', 'Storm Warning - Gale Force Winds Expected', 'Weather', 'urgent', 'Harbour Master', '2026-03-20', '2026-03-21', '2026-03-22', 'All port areas', 'Met Office warning: winds expected to reach 45-55 knots from SW during March 21-22. All port operations may be suspended. Vessels at berth to double up mooring lines. No vessel movements during wind warning period.', 'Active', 30],
    ['PN-2026-046', 'Annual Port Tariff Revision Notice', 'Commercial', 'normal', 'Finance Department', '2026-03-01', '2026-04-01', null, 'All services', 'Annual tariff revision effective April 1, 2026. Average increase of 3.2% across all services. New tariff schedule available at port administration office and online portal.', 'Active', 18],
    ['PN-2026-047', 'Environmental Compliance - Ballast Water', 'Environmental', 'high', 'Environmental Officer', '2026-03-10', '2026-03-15', null, 'All berths', 'All vessels must comply with updated ballast water management requirements per IMO BWM Convention. Ballast water exchange logs must be submitted 24 hours prior to arrival. Non-compliant vessels subject to delays.', 'Active', 25],
    ['PN-2026-048', 'VTS System Upgrade - Temporary Procedures', 'Navigation', 'high', 'VTS Supervisor', '2026-03-25', '2026-03-28', '2026-03-30', 'Port approaches', 'Vessel Traffic Service undergoing system upgrade March 28-30. Manual reporting procedures in effect. All vessels to maintain VHF Ch.12 watch and report positions every 15 minutes in approach channels.', 'Upcoming', 5],
    ['PN-2026-049', 'Hazmat Storage Area Relocation', 'Safety', 'normal', 'Safety Manager', '2026-03-12', '2026-04-01', null, 'Warehouse Zone C', 'Hazardous materials storage relocating from Zone C-West to new purpose-built facility in Zone C-East. New facility offers improved containment and monitoring. Transition period: April 1-15.', 'Active', 12],
    ['PN-2026-050', 'Port Holiday Schedule - Easter Period', 'Operations', 'normal', 'Port Administration', '2026-03-01', '2026-04-03', '2026-04-06', 'All port areas', 'Reduced operations during Easter period April 3-6. Essential services only. Vessel movements limited to emergency and pre-scheduled departures. Normal operations resume April 7.', 'Active', 20],
    ['PN-2026-051', 'Security Level Increase - Temporary', 'Security', 'urgent', 'Port Security Officer', '2026-03-19', '2026-03-19', '2026-03-26', 'All port areas', 'ISPS security level raised to Level 2. Enhanced security measures in effect. Additional ID checks at all gate entries. 72-hour advance crew manifests required. Random vehicle inspections in effect.', 'Active', 28]
  ];
  for (const n of notices) {
    await pool.query(`INSERT INTO port_notices (notice_number, title, category, priority, issued_by, issue_date, effective_date, expiry_date, affected_areas, description, status, acknowledgements) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, n);
  }
  console.log('✅ 10 Port Notices seeded');

  console.log('\n🎉 All seed data inserted successfully!');
  console.log('📊 Summary: 1 user, 15 items per original feature + 5 new non-AI features = 279 records total\n');

  await pool.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
