const router = require('express').Router();
const https = require('https');
const pool = require('../db');

function callOpenRouter(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Maritime Logistics AI'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            reject(new Error(parsed.error.message || 'OpenRouter API error'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(new Error('Failed to parse OpenRouter response'));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Container Yard Optimization AI
router.post('/container-optimization', async (req, res) => {
  try {
    const containers = await pool.query('SELECT * FROM containers ORDER BY id LIMIT 50');
    const prompt = `You are an AI port logistics expert. Analyze these containers and provide optimization recommendations for yard layout.

CONTAINERS DATA:
${JSON.stringify(containers.rows, null, 2)}

Provide a detailed analysis with:
1. **Yard Layout Score** (0-100) - Current efficiency rating
2. **Stacking Optimization** - Recommendations for container stacking order
3. **Retrieval Efficiency** - How to minimize reshuffling moves
4. **Hot Zone Identification** - Containers that need priority repositioning
5. **Space Utilization** - Current vs optimal capacity usage
6. **Action Items** - Specific, prioritized recommendations

Format your response in clear sections with specific data-driven insights.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Berth Scheduling AI
router.post('/berth-scheduling', async (req, res) => {
  try {
    const berths = await pool.query('SELECT * FROM berths ORDER BY arrival_time LIMIT 50');
    const prompt = `You are an AI berth scheduling optimizer for a major port. Analyze the current berth schedule and provide optimization.

BERTH SCHEDULE DATA:
${JSON.stringify(berths.rows, null, 2)}

Provide:
1. **Schedule Efficiency Score** (0-100)
2. **Conflict Detection** - Any overlapping or problematic bookings
3. **Turnaround Optimization** - How to reduce vessel turnaround time
4. **Tide Window Analysis** - Optimal scheduling considering tide-dependent vessels
5. **Resource Allocation** - Crane and labor distribution recommendations
6. **Predicted Delays** - Vessels at risk of delay and mitigation strategies
7. **Action Items** - Specific scheduling changes recommended

Be specific with berth numbers, vessel names, and timeframes.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vessel Route Optimization AI
router.post('/route-optimization', async (req, res) => {
  try {
    const vessels = await pool.query('SELECT * FROM vessels ORDER BY id LIMIT 50');
    const weather = await pool.query('SELECT * FROM weather_impact ORDER BY date DESC LIMIT 20');
    const prompt = `You are an AI vessel route optimization specialist. Analyze vessel routes and weather conditions to recommend optimal routes.

VESSEL DATA:
${JSON.stringify(vessels.rows, null, 2)}

WEATHER CONDITIONS:
${JSON.stringify(weather.rows, null, 2)}

Provide:
1. **Route Efficiency Overview** - Current vs optimal routes
2. **Weather Rerouting** - Vessels that should adjust routes due to weather
3. **Speed Optimization** - Optimal speed for each vessel considering fuel economy
4. **ETA Accuracy** - How likely current ETAs are and adjusted estimates
5. **Fuel Savings Potential** - Estimated savings from route optimization
6. **Safety Alerts** - Any vessels in potentially dangerous routes
7. **Recommended Actions** - Specific route adjustments per vessel

Include specific coordinates, speed recommendations, and estimated savings.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customs Pre-clearance AI
router.post('/customs-analysis', async (req, res) => {
  try {
    const customs = await pool.query('SELECT * FROM customs ORDER BY id LIMIT 50');
    const prompt = `You are an AI customs compliance and risk assessment specialist. Analyze these customs declarations for risk and pre-clearance optimization.

CUSTOMS DECLARATIONS:
${JSON.stringify(customs.rows, null, 2)}

Provide:
1. **Risk Assessment Summary** - Overall risk profile of current declarations
2. **High-Risk Flagging** - Declarations that need additional scrutiny and why
3. **Document Completeness** - Missing or incomplete documentation
4. **HS Code Verification** - Any potential misclassifications
5. **Pre-clearance Eligibility** - Which shipments qualify for fast-track clearance
6. **Compliance Score** (0-100) - Overall compliance rating
7. **Recommended Actions** - Specific steps to expedite clearance

Reference specific declaration numbers and provide actionable intelligence.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fuel Consumption Modeling AI
router.post('/fuel-modeling', async (req, res) => {
  try {
    const fuel = await pool.query('SELECT * FROM fuel_consumption ORDER BY id LIMIT 50');
    const prompt = `You are an AI fuel consumption modeling specialist for maritime vessels. Analyze fuel data and provide optimization recommendations.

FUEL CONSUMPTION DATA:
${JSON.stringify(fuel.rows, null, 2)}

Provide:
1. **Fleet Fuel Efficiency Score** (0-100)
2. **Consumption Patterns** - Identify vessels with abnormal consumption
3. **Speed vs Fuel Tradeoff** - Optimal speed profiles for each voyage
4. **Weather Impact on Fuel** - How weather conditions affect consumption
5. **CO2 Emissions Report** - Emissions analysis and reduction opportunities
6. **Cost Optimization** - Potential savings from fuel optimization
7. **Predictive Modeling** - Estimated fuel needs for upcoming voyages
8. **Green Shipping Recommendations** - Steps toward IMO 2030/2050 targets

Include specific tonnage figures, cost estimates, and percentage improvements.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cargo Tracking AI
router.post('/cargo-intelligence', async (req, res) => {
  try {
    const cargo = await pool.query('SELECT * FROM cargo_tracking ORDER BY id LIMIT 50');
    const prompt = `You are an AI cargo logistics intelligence specialist. Analyze cargo tracking data for insights and optimization.

CARGO TRACKING DATA:
${JSON.stringify(cargo.rows, null, 2)}

Provide:
1. **Delivery Performance Score** (0-100)
2. **Delay Predictions** - Shipments likely to be delayed and reasons
3. **Route Bottlenecks** - Common delay points in the supply chain
4. **Temperature-Controlled Cargo** - Status and risk assessment for sensitive cargo
5. **Customer Impact Analysis** - Which consignees are affected by delays
6. **Optimization Opportunities** - Ways to improve delivery performance
7. **Action Items** - Immediate steps to address at-risk shipments

Reference specific tracking numbers and provide timeline estimates.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port Traffic Management AI
router.post('/traffic-analysis', async (req, res) => {
  try {
    const traffic = await pool.query('SELECT * FROM port_traffic ORDER BY scheduled_time LIMIT 50');
    const prompt = `You are an AI port traffic management specialist. Analyze vessel traffic patterns and optimize port operations.

PORT TRAFFIC DATA:
${JSON.stringify(traffic.rows, null, 2)}

Provide:
1. **Traffic Flow Score** (0-100)
2. **Congestion Analysis** - Peak times and bottleneck identification
3. **Channel Optimization** - Better scheduling for channel transits
4. **Pilot & Tug Allocation** - Resource optimization for vessel movements
5. **Delay Root Causes** - Analysis of delay patterns and common causes
6. **Throughput Improvement** - How to increase vessels handled per day
7. **Safety Assessment** - Any traffic patterns that pose safety risks
8. **Recommended Schedule Changes** - Specific timing adjustments

Include specific vessel names, times, and quantified improvements.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weather Impact Analysis AI
router.post('/weather-analysis', async (req, res) => {
  try {
    const weather = await pool.query('SELECT * FROM weather_impact ORDER BY date DESC LIMIT 50');
    const berths = await pool.query('SELECT * FROM berths ORDER BY arrival_time LIMIT 30');
    const prompt = `You are an AI maritime weather impact analyst. Analyze weather data and its impact on port operations.

WEATHER DATA:
${JSON.stringify(weather.rows, null, 2)}

CURRENT BERTH SCHEDULE:
${JSON.stringify(berths.rows, null, 2)}

Provide:
1. **Operational Risk Score** (0-100)
2. **Weather Forecast Impact** - How current/upcoming weather affects operations
3. **Vessel Safety Alerts** - Vessels at risk due to weather conditions
4. **Operations Advisory** - Which operations should be suspended or modified
5. **Berth Schedule Impact** - Which scheduled arrivals/departures are affected
6. **Historical Pattern Analysis** - Weather trends and seasonal patterns
7. **Contingency Recommendations** - Specific actions to mitigate weather impact

Be specific about wind speeds, wave heights, and their operational thresholds.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crew Management Analysis AI
router.post('/crew-analysis', async (req, res) => {
  try {
    const crew = await pool.query('SELECT * FROM crew_management ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime crew management specialist. Analyze crew data to optimize scheduling, compliance, and workforce efficiency.

CREW MANAGEMENT DATA:
${JSON.stringify(crew.rows, null, 2)}

Provide a detailed analysis with:
1. **Crew Scheduling Efficiency** (0-100) - Overall scheduling effectiveness and coverage gaps
2. **Certification Compliance** - Review of crew certifications, expiry dates, and renewal urgency; flag any non-compliant or soon-to-expire credentials (STCW, medical, flag-state endorsements)
3. **Workload Distribution** - Identify over-worked and under-utilized crew members, watch hour compliance per MLC 2006, and fatigue risk assessment
4. **Cost Optimization** - Crew cost analysis per vessel, overtime patterns, and recommendations to reduce labor expenses without compromising safety
5. **Safety Compliance** - Manning level adequacy per Safe Manning Certificate, rest hour violations, and drug/alcohol testing compliance
6. **Retention & Morale Indicators** - Turnover risk based on contract lengths, shore leave patterns, and crew rotation schedules
7. **Action Items** - Specific, prioritized recommendations for immediate crew management improvements

Reference specific crew members, vessels, and certification details where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Port Equipment Analysis AI
router.post('/equipment-analysis', async (req, res) => {
  try {
    const equipment = await pool.query('SELECT * FROM port_equipment ORDER BY id LIMIT 50');
    const prompt = `You are an AI port equipment management specialist. Analyze equipment data to optimize utilization, maintenance, and capital planning.

PORT EQUIPMENT DATA:
${JSON.stringify(equipment.rows, null, 2)}

Provide a detailed analysis with:
1. **Equipment Utilization Score** (0-100) - Overall fleet utilization rate and efficiency rating
2. **Maintenance Scheduling** - Review of maintenance logs, upcoming scheduled maintenance, overdue services, and recommended preventive maintenance windows to minimize operational disruption
3. **Downtime Prediction** - Identify equipment at high risk of unplanned failure based on age, usage hours, maintenance history, and operational stress patterns
4. **Capacity Optimization** - Analysis of equipment allocation across terminals, peak demand coverage, and recommendations for redeployment to balance workloads
5. **Replacement Planning** - Equipment nearing end-of-life, cost-benefit analysis of repair vs replace, and capital expenditure forecasting for fleet renewal
6. **Energy & Emissions** - Fuel/power consumption patterns per equipment type and opportunities for electrification or efficiency improvements
7. **Action Items** - Specific, prioritized recommendations for equipment management improvements

Reference specific equipment IDs, types, and locations where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoice Analysis AI
router.post('/invoice-analysis', async (req, res) => {
  try {
    const invoices = await pool.query('SELECT * FROM invoices ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime financial analysis specialist. Analyze invoice data to optimize revenue, collections, and client profitability.

INVOICES DATA:
${JSON.stringify(invoices.rows, null, 2)}

Provide a detailed analysis with:
1. **Revenue Health Score** (0-100) - Overall financial health based on invoice data
2. **Revenue Trends** - Analysis of invoicing volume over time, seasonal patterns, growth or decline indicators, and revenue concentration risk across clients
3. **Payment Delay Analysis** - Average days-to-payment by client, identification of chronic late payers, aging receivables breakdown (30/60/90+ days), and impact on cash flow
4. **Outstanding Receivables** - Total outstanding amount, high-risk receivables likely to become bad debt, and recommended collection priority list
5. **Client Profitability** - Revenue per client ranking, service cost allocation, margin analysis, and identification of unprofitable client relationships
6. **Cost Optimization** - Billing efficiency, discount leakage, fee structure recommendations, and opportunities to increase revenue per transaction
7. **Action Items** - Specific, prioritized recommendations for improving financial performance and collections

Reference specific invoice numbers, client names, and monetary amounts where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Incident Analysis AI
router.post('/incident-analysis', async (req, res) => {
  try {
    const incidents = await pool.query('SELECT * FROM incidents ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime safety and incident analysis specialist. Analyze incident records to identify patterns, assess risks, and recommend prevention strategies.

INCIDENTS DATA:
${JSON.stringify(incidents.rows, null, 2)}

Provide a detailed analysis with:
1. **Safety Performance Score** (0-100) - Overall safety rating based on incident frequency, severity, and trends
2. **Safety Patterns** - Classification of incidents by type (collision, grounding, cargo damage, personal injury, environmental spill, near-miss), frequency distribution, and correlation with operational conditions
3. **Risk Area Identification** - Geographic hotspots, high-risk berths or terminals, hazardous cargo correlations, and time-of-day/shift patterns that elevate risk
4. **Incident Trend Analysis** - Month-over-month and year-over-year trend lines, whether safety is improving or deteriorating, and leading indicator assessment
5. **Root Cause Patterns** - Common root causes (human error, equipment failure, procedural gaps, environmental factors), systemic issues, and organizational contributing factors
6. **Prevention Recommendations** - Specific preventive measures for each identified pattern, training needs, procedural changes, equipment upgrades, and investment priorities ranked by risk reduction impact
7. **Action Items** - Immediate corrective actions, short-term improvements, and long-term safety culture recommendations

Reference specific incident IDs, dates, locations, and severity levels where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dock Inspection Analysis AI
router.post('/inspection-analysis', async (req, res) => {
  try {
    const inspections = await pool.query('SELECT * FROM dock_inspections ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime inspection and regulatory compliance specialist. Analyze dock inspection records to assess fleet compliance and identify risk areas.

DOCK INSPECTIONS DATA:
${JSON.stringify(inspections.rows, null, 2)}

Provide a detailed analysis with:
1. **Fleet Compliance Score** (0-100) - Overall compliance rating across all inspected vessels and facilities
2. **Deficiency Patterns** - Most common deficiency categories (structural, safety equipment, fire protection, navigation, pollution prevention, ISM Code, ISPS Code), repeat offenders, and severity distribution
3. **Inspection Schedule Optimization** - Analysis of inspection frequency, overdue inspections, risk-based scheduling recommendations, and resource allocation for inspection teams
4. **Safety Ratings** - Vessel and dock safety rankings, comparison against Port State Control benchmarks, and identification of substandard vessels requiring detention consideration
5. **Regulatory Risk Assessment** - Exposure to flag state and port state control detentions, upcoming regulatory changes (SOLAS, MARPOL, BWM Convention), and gap analysis against current compliance status
6. **Trend Analysis** - Improvement or deterioration in compliance over time, effectiveness of corrective actions from previous inspections, and predictive risk scoring
7. **Action Items** - Priority corrective actions, targeted inspection plans, training recommendations, and regulatory filing deadlines

Reference specific inspection IDs, vessel names, deficiency codes, and dates where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Warehouse Analysis AI
router.post('/warehouse-analysis', async (req, res) => {
  try {
    const warehouse = await pool.query('SELECT * FROM warehouse ORDER BY id LIMIT 50');
    const prompt = `You are an AI warehouse and inventory management specialist for maritime port operations. Analyze warehouse data to optimize storage, throughput, and inventory control.

WAREHOUSE DATA:
${JSON.stringify(warehouse.rows, null, 2)}

Provide a detailed analysis with:
1. **Space Utilization Score** (0-100) - Current warehouse capacity usage versus optimal levels, dead space identification, and density improvement opportunities
2. **Inventory Turnover Analysis** - Turnover rates by product category, slow-moving and dead stock identification, dwell time analysis, and comparison against industry benchmarks for port warehousing
3. **Storage Optimization** - Recommendations for slotting strategy, zone layout improvements, rack configuration, temperature-controlled area efficiency, and hazardous materials segregation compliance
4. **Expiry Risk Assessment** - Perishable and time-sensitive cargo at risk of expiration, FIFO/FEFO compliance status, and alerts for goods approaching customs bond expiry or free storage period limits
5. **Capacity Planning** - Demand forecasting based on vessel schedules, seasonal storage needs, expansion or consolidation recommendations, and contingency plans for peak periods
6. **Operational Efficiency** - Pick/pack/ship cycle times, labor productivity metrics, equipment utilization within warehouse, and throughput bottleneck identification
7. **Action Items** - Specific, prioritized recommendations for immediate warehouse improvements and long-term strategic changes

Reference specific warehouse zones, product categories, and storage locations where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Voyage Analysis AI
router.post('/voyage-analysis', async (req, res) => {
  try {
    const voyages = await pool.query('SELECT * FROM voyages ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime voyage performance and commercial analysis specialist. Analyze voyage data to optimize profitability, efficiency, and scheduling.

VOYAGES DATA:
${JSON.stringify(voyages.rows, null, 2)}

Provide a detailed analysis with:
1. **Voyage Profitability Score** (0-100) - Overall voyage portfolio profitability rating based on revenue, costs, and margins
2. **Route Efficiency** - Analysis of distance vs time performance per route, port rotation optimization, ballast leg minimization, and comparison of actual vs planned routes
3. **Schedule Adherence** - On-time performance metrics, delay frequency and causes, laytime and demurrage exposure, and schedule reliability scoring per trade lane
4. **Cargo Utilization** - Load factor analysis per voyage, deadweight utilization, TEU/tonnage optimization, and identification of underperforming voyages with low cargo fill rates
5. **Revenue Optimization** - Freight rate analysis per route, spot vs contract mix optimization, backhaul revenue opportunities, and recommendations for pricing strategy adjustments
6. **Cost Breakdown** - Voyage cost components (bunker, port charges, canal fees, agency costs), cost-per-ton benchmarking, and identification of cost reduction opportunities
7. **Action Items** - Specific, prioritized recommendations for improving voyage economics, scheduling, and commercial performance

Reference specific voyage numbers, vessel names, routes, and financial figures where applicable.`;

    const aiResponse = await callOpenRouter(prompt);
    res.json({
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
