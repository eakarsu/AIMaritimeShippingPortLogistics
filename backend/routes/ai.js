const router = require('express').Router();
const https = require('https');
const pool = require('../db');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// ============ STARTUP: Create ai_analyses table ============
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(100),
    input_filters JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('Failed to create ai_analyses table:', err.message));

// ============ HELPERS ============
function callOpenRouter(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.env.OPENROUTER_API_KEY) {
      reject(new Error('OPENROUTER_API_KEY is required'));
      return;
    }
    const baseUrl = new URL(process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1');
    const data = JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const options = {
      protocol: baseUrl.protocol,
      hostname: baseUrl.hostname,
      port: baseUrl.port || undefined,
      path: `${baseUrl.pathname.replace(/\/$/, '')}/chat/completions`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Maritime Logistics AI',
      },
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

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const s = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(s); } catch (e) {}
  const i = text.indexOf('{');
  const j = text.lastIndexOf('}');
  if (i !== -1 && j !== -1) {
    try { return JSON.parse(text.slice(i, j + 1)); } catch (e) {}
  }
  return null;
}

function persistAnalysis(userId, endpoint, inputFilters, result) {
  pool.query(
    'INSERT INTO ai_analyses (user_id, endpoint, input_filters, result, created_at) VALUES ($1, $2, $3, $4, NOW())',
    [userId, endpoint, JSON.stringify(inputFilters), JSON.stringify(result)]
  ).catch(err => console.error('Failed to persist AI analysis:', err.message));
}

// ============ AI HISTORY ============
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM ai_analyses WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const result = await pool.query(
      'SELECT id, endpoint, input_filters, result, created_at FROM ai_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Container Yard Optimization AI ============
router.post('/container-optimization', aiRateLimiter, async (req, res) => {
  try {
    const containers = await pool.query(
      "SELECT * FROM containers WHERE status = 'active' OR status IS NULL ORDER BY id LIMIT 50"
    );
    const prompt = `You are an AI port logistics expert. Analyze these containers and provide optimization recommendations for yard layout. Respond with valid JSON only.

CONTAINERS DATA:
${JSON.stringify(containers.rows, null, 2)}

Return a JSON object with exactly these fields:
{
  "yard_layout_score": <number 0-100>,
  "stacking_optimization": "<string>",
  "retrieval_efficiency": "<string>",
  "hot_zones": ["<string>", ...],
  "space_utilization": { "current_pct": <number>, "optimal_pct": <number> },
  "action_items": ["<string>", ...],
  "summary": "<string>"
}`;

    const aiResponse = await callOpenRouter(prompt);
    const rawText = aiResponse.choices[0].message.content;
    const parsed = parseAIJson(rawText);

    const responsePayload = {
      analysis: rawText,
      structured: parsed,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };

    persistAnalysis(req.user.id, 'container-optimization', { count: containers.rows.length }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Berth Scheduling AI ============
router.post('/berth-scheduling', aiRateLimiter, async (req, res) => {
  try {
    const berths = await pool.query(
      "SELECT * FROM berths WHERE arrival_time >= NOW() - interval '7 days' ORDER BY arrival_time LIMIT 50"
    );
    const prompt = `You are an AI berth scheduling optimizer for a major port. Analyze the current berth schedule and provide optimization. Respond with valid JSON only.

BERTH SCHEDULE DATA:
${JSON.stringify(berths.rows, null, 2)}

Return a JSON object with exactly these fields:
{
  "schedule_efficiency_score": <number 0-100>,
  "conflicts": ["<string>", ...],
  "turnaround_optimization": "<string>",
  "tide_window_analysis": "<string>",
  "resource_allocation": "<string>",
  "predicted_delays": [{ "vessel": "<string>", "reason": "<string>", "mitigation": "<string>" }],
  "action_items": ["<string>", ...],
  "summary": "<string>"
}`;

    const aiResponse = await callOpenRouter(prompt);
    const rawText = aiResponse.choices[0].message.content;
    const parsed = parseAIJson(rawText);

    const responsePayload = {
      analysis: rawText,
      structured: parsed,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };

    persistAnalysis(req.user.id, 'berth-scheduling', { count: berths.rows.length }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Vessel Route Optimization AI ============
router.post('/route-optimization', aiRateLimiter, async (req, res) => {
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
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'route-optimization', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Customs Pre-clearance AI ============
router.post('/customs-analysis', aiRateLimiter, async (req, res) => {
  try {
    const customs = await pool.query(
      "SELECT * FROM customs WHERE status NOT IN ('Cleared', 'Rejected') OR status IS NULL ORDER BY id LIMIT 50"
    );
    const prompt = `You are an AI customs compliance and risk assessment specialist. Analyze these customs declarations for risk and pre-clearance optimization. Respond with valid JSON only.

CUSTOMS DECLARATIONS:
${JSON.stringify(customs.rows, null, 2)}

Return a JSON object with exactly these fields:
{
  "compliance_score": <number 0-100>,
  "risk_summary": "<string>",
  "high_risk_declarations": [{ "id": <number>, "declaration_number": "<string>", "reason": "<string>" }],
  "document_completeness": "<string>",
  "hs_code_issues": ["<string>", ...],
  "pre_clearance_eligible": ["<string>", ...],
  "action_items": ["<string>", ...],
  "summary": "<string>"
}`;

    const aiResponse = await callOpenRouter(prompt);
    const rawText = aiResponse.choices[0].message.content;
    const parsed = parseAIJson(rawText);

    const responsePayload = {
      analysis: rawText,
      structured: parsed,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };

    persistAnalysis(req.user.id, 'customs-analysis', { count: customs.rows.length }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Customs AI Clear (per-declaration) ============
router.post('/customs/:id/ai-clear', aiRateLimiter, async (req, res) => {
  try {
    const customsResult = await pool.query('SELECT * FROM customs WHERE id = $1', [req.params.id]);
    if (customsResult.rows.length === 0) return res.status(404).json({ error: 'Customs declaration not found' });
    const declaration = customsResult.rows[0];

    const prompt = `You are a customs risk assessment AI. Analyze this customs declaration and provide a clearance recommendation. Respond with valid JSON only.

DECLARATION:
${JSON.stringify(declaration, null, 2)}

Return a JSON object:
{
  "risk_score": <number 0-100, where 0=safe, 100=very high risk>,
  "recommendation": "CLEAR" | "HOLD" | "INSPECT",
  "risk_factors": ["<string>", ...],
  "required_documents": ["<string>", ...],
  "notes": "<string>"
}`;

    const aiResponse = await callOpenRouter(prompt);
    const rawText = aiResponse.choices[0].message.content;
    const parsed = parseAIJson(rawText);

    if (parsed) {
      await pool.query(
        "UPDATE customs SET ai_status = $1 WHERE id = $2",
        [JSON.stringify(parsed), req.params.id]
      ).catch(() => {});
    }

    const response = parsed || { analysis: rawText };
    persistAnalysis(req.user.id, 'customs-ai-clear', { declaration_id: req.params.id }, response);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Fuel Consumption Modeling AI ============
router.post('/fuel-modeling', aiRateLimiter, async (req, res) => {
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
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'fuel-modeling', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Cargo Tracking AI ============
router.post('/cargo-intelligence', aiRateLimiter, async (req, res) => {
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
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'cargo-intelligence', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Port Traffic Management AI ============
router.post('/traffic-analysis', aiRateLimiter, async (req, res) => {
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
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'traffic-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Weather Impact Analysis AI ============
router.post('/weather-analysis', aiRateLimiter, async (req, res) => {
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
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'weather-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Crew Management Analysis AI ============
router.post('/crew-analysis', aiRateLimiter, async (req, res) => {
  try {
    const crew = await pool.query('SELECT * FROM crew_management ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime crew management specialist. Analyze crew data to optimize scheduling, compliance, and workforce efficiency.

CREW MANAGEMENT DATA:
${JSON.stringify(crew.rows, null, 2)}

Provide a detailed analysis with:
1. **Crew Scheduling Efficiency** (0-100)
2. **Certification Compliance** - Review certifications, expiry dates, flag any non-compliant credentials
3. **Workload Distribution** - Over-worked and under-utilized crew, fatigue risk
4. **Cost Optimization** - Crew cost analysis, overtime patterns
5. **Safety Compliance** - Manning levels, rest hour violations
6. **Retention & Morale Indicators** - Turnover risk
7. **Action Items** - Specific, prioritized recommendations`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'crew-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Port Equipment Analysis AI ============
router.post('/equipment-analysis', aiRateLimiter, async (req, res) => {
  try {
    const equipment = await pool.query('SELECT * FROM port_equipment ORDER BY id LIMIT 50');
    const prompt = `You are an AI port equipment management specialist. Analyze equipment data to optimize utilization, maintenance, and capital planning.

PORT EQUIPMENT DATA:
${JSON.stringify(equipment.rows, null, 2)}

Provide a detailed analysis with:
1. **Equipment Utilization Score** (0-100)
2. **Maintenance Scheduling** - Upcoming scheduled maintenance, overdue services
3. **Downtime Prediction** - Equipment at high risk of unplanned failure
4. **Capacity Optimization** - Equipment allocation across terminals
5. **Replacement Planning** - Equipment nearing end-of-life
6. **Energy & Emissions** - Consumption patterns and electrification opportunities
7. **Action Items** - Specific, prioritized recommendations`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'equipment-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Invoice Analysis AI ============
router.post('/invoice-analysis', aiRateLimiter, async (req, res) => {
  try {
    const invoices = await pool.query('SELECT * FROM invoices ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime financial analysis specialist. Analyze invoice data to optimize revenue, collections, and client profitability.

INVOICES DATA:
${JSON.stringify(invoices.rows, null, 2)}

Provide a detailed analysis with:
1. **Revenue Health Score** (0-100)
2. **Revenue Trends** - Invoicing volume, seasonal patterns
3. **Payment Delay Analysis** - Average days-to-payment, chronic late payers
4. **Outstanding Receivables** - High-risk receivables, collection priority
5. **Client Profitability** - Revenue per client ranking, margin analysis
6. **Cost Optimization** - Billing efficiency, fee structure recommendations
7. **Action Items** - Specific, prioritized recommendations`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'invoice-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Incident Analysis AI ============
router.post('/incident-analysis', aiRateLimiter, async (req, res) => {
  try {
    const incidents = await pool.query('SELECT * FROM incidents ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime safety and incident analysis specialist. Analyze incident records to identify patterns, assess risks, and recommend prevention strategies.

INCIDENTS DATA:
${JSON.stringify(incidents.rows, null, 2)}

Provide a detailed analysis with:
1. **Safety Performance Score** (0-100)
2. **Safety Patterns** - Classification by type, frequency distribution
3. **Risk Area Identification** - Geographic hotspots, high-risk berths
4. **Incident Trend Analysis** - Month-over-month trends
5. **Root Cause Patterns** - Common root causes, systemic issues
6. **Prevention Recommendations** - Specific preventive measures
7. **Action Items** - Immediate corrective actions`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'incident-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Dock Inspection Analysis AI ============
router.post('/inspection-analysis', aiRateLimiter, async (req, res) => {
  try {
    const inspections = await pool.query('SELECT * FROM dock_inspections ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime inspection and regulatory compliance specialist. Analyze dock inspection records to assess fleet compliance and identify risk areas.

DOCK INSPECTIONS DATA:
${JSON.stringify(inspections.rows, null, 2)}

Provide a detailed analysis with:
1. **Fleet Compliance Score** (0-100)
2. **Deficiency Patterns** - Most common deficiency categories
3. **Inspection Schedule Optimization** - Risk-based scheduling recommendations
4. **Safety Ratings** - Vessel and dock safety rankings
5. **Regulatory Risk Assessment** - Exposure to port state control detentions
6. **Trend Analysis** - Improvement or deterioration in compliance over time
7. **Action Items** - Priority corrective actions`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'inspection-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Warehouse Analysis AI ============
router.post('/warehouse-analysis', aiRateLimiter, async (req, res) => {
  try {
    const warehouse = await pool.query('SELECT * FROM warehouse ORDER BY id LIMIT 50');
    const prompt = `You are an AI warehouse and inventory management specialist for maritime port operations. Analyze warehouse data to optimize storage, throughput, and inventory control.

WAREHOUSE DATA:
${JSON.stringify(warehouse.rows, null, 2)}

Provide a detailed analysis with:
1. **Space Utilization Score** (0-100)
2. **Inventory Turnover Analysis** - Turnover rates, slow-moving stock
3. **Storage Optimization** - Slotting strategy, zone layout improvements
4. **Expiry Risk Assessment** - Perishable cargo at risk
5. **Capacity Planning** - Demand forecasting, seasonal storage needs
6. **Operational Efficiency** - Cycle times, labor productivity metrics
7. **Action Items** - Specific, prioritized recommendations`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'warehouse-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Voyage Analysis AI ============
router.post('/voyage-analysis', aiRateLimiter, async (req, res) => {
  try {
    const voyages = await pool.query('SELECT * FROM voyages ORDER BY id LIMIT 50');
    const prompt = `You are an AI maritime voyage performance and commercial analysis specialist. Analyze voyage data to optimize profitability, efficiency, and scheduling.

VOYAGES DATA:
${JSON.stringify(voyages.rows, null, 2)}

Provide a detailed analysis with:
1. **Voyage Profitability Score** (0-100)
2. **Route Efficiency** - Distance vs time performance per route
3. **Schedule Adherence** - On-time performance, delay frequency
4. **Cargo Utilization** - Load factor analysis, deadweight utilization
5. **Revenue Optimization** - Freight rate analysis, backhaul opportunities
6. **Cost Breakdown** - Voyage cost components, cost-per-ton benchmarking
7. **Action Items** - Specific, prioritized recommendations`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      analysis: aiResponse.choices[0].message.content,
      model: aiResponse.model,
      usage: aiResponse.usage,
      timestamp: new Date().toISOString(),
    };
    persistAnalysis(req.user.id, 'voyage-analysis', {}, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ Demurrage Calculator ============
router.get('/voyages/:id/demurrage', async (req, res) => {
  try {
    const voyageResult = await pool.query('SELECT * FROM voyages WHERE id = $1', [req.params.id]);
    if (voyageResult.rows.length === 0) return res.status(404).json({ error: 'Voyage not found' });
    const voyage = voyageResult.rows[0];

    // Fetch associated berth and invoice data
    const berthResult = await pool.query(
      'SELECT * FROM berths WHERE vessel_name = $1 ORDER BY id LIMIT 1',
      [voyage.vessel_name]
    ).catch(() => ({ rows: [] }));
    const berth = berthResult.rows[0] || null;

    const invoiceResult = await pool.query(
      'SELECT * FROM invoices WHERE vessel_name = $1 ORDER BY id LIMIT 5',
      [voyage.vessel_name]
    ).catch(() => ({ rows: [] }));

    // Calculate laytime
    let laytimeUsedHours = 0;
    let laytimeAllowedHours = 24; // default
    let demurrageAmount = 0;

    if (berth && berth.arrival_time && berth.departure_time) {
      const arrival = new Date(berth.arrival_time);
      const departure = new Date(berth.departure_time);
      laytimeUsedHours = Math.max(0, (departure - arrival) / 3600000);
    }

    const prompt = `You are a maritime charter party expert and demurrage specialist. Analyze this voyage's laytime and demurrage situation.

VOYAGE:
${JSON.stringify(voyage, null, 2)}

BERTH DATA:
${JSON.stringify(berth, null, 2)}

INVOICES:
${JSON.stringify(invoiceResult.rows, null, 2)}

CALCULATED LAYTIME USED: ${laytimeUsedHours.toFixed(2)} hours
ASSUMED LAYTIME ALLOWED: ${laytimeAllowedHours} hours

Provide a detailed explanation in charter party terms covering:
1. Laytime calculation methodology
2. Whether demurrage or dispatch applies
3. Estimated demurrage rate if applicable
4. Recommendations to avoid future demurrage
5. Any despatch money owed if laytime was saved

Be specific with hours, rates, and amounts.`;

    const aiResponse = await callOpenRouter(prompt);
    const responsePayload = {
      voyage_id: req.params.id,
      vessel_name: voyage.vessel_name,
      laytime_used_hours: parseFloat(laytimeUsedHours.toFixed(2)),
      laytime_allowed_hours: laytimeAllowedHours,
      demurrage_amount: demurrageAmount,
      ai_explanation: aiResponse.choices[0].message.content,
      timestamp: new Date().toISOString(),
    };

    persistAnalysis(req.user.id, 'demurrage', { voyage_id: req.params.id }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ LIABILITY RISK ASSESSMENT ============
router.post('/liability-risk-assessment', aiRateLimiter, async (req, res) => {
  try {
    const { vesselId, cargoType } = req.body;
    let vessels = [];
    let cargo = [];
    let weather = [];
    try { vessels = (await pool.query(vesselId ? 'SELECT * FROM vessels WHERE id = $1' : 'SELECT * FROM vessels ORDER BY id LIMIT 25', vesselId ? [vesselId] : [])).rows; } catch (e) {}
    try { cargo = (await pool.query('SELECT * FROM cargo ORDER BY id LIMIT 30')).rows; } catch (e) {}
    try { weather = (await pool.query('SELECT * FROM weather ORDER BY id DESC LIMIT 10')).rows; } catch (e) {}

    const prompt = `You are a maritime insurance liability analyst. Score liability exposure given cargo type, vessel age/condition, and weather context.

VESSELS: ${JSON.stringify(vessels).slice(0, 4000)}
CARGO: ${JSON.stringify(cargo).slice(0, 4000)}
RECENT WEATHER: ${JSON.stringify(weather).slice(0, 1500)}
Cargo type filter: ${cargoType || 'all'}

Return ONLY JSON: { liability_score (0-100), risk_level ("low"|"medium"|"high"|"critical"), top_risk_factors: [{factor, impact, mitigation}], coverage_recommendations: [], premium_outlook }`;

    const aiResponse = await callOpenRouter(prompt);
    const raw = aiResponse.choices[0].message.content;
    const structured = parseAIJson(raw);
    const responsePayload = { raw, structured, model: aiResponse.model, usage: aiResponse.usage, timestamp: new Date().toISOString() };
    persistAnalysis(req.user.id, 'liability-risk-assessment', { vesselId: vesselId || null, cargoType: cargoType || null }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ENVIRONMENTAL COMPLIANCE CHECKER ============
router.post('/environmental-compliance-checker', aiRateLimiter, async (req, res) => {
  try {
    const { jurisdiction = 'IMO MARPOL' } = req.body;
    let vessels = [];
    let fuel = [];
    let incidents = [];
    try { vessels = (await pool.query('SELECT * FROM vessels ORDER BY id LIMIT 25')).rows; } catch (e) {}
    try { fuel = (await pool.query('SELECT * FROM fuel ORDER BY id DESC LIMIT 30')).rows; } catch (e) {}
    try { incidents = (await pool.query("SELECT * FROM incidents ORDER BY id DESC LIMIT 25")).rows; } catch (e) {}

    const prompt = `You are an environmental compliance officer for maritime operations. Validate emissions, fuel handling, waste handling, and ballast water against ${jurisdiction}.

VESSELS: ${JSON.stringify(vessels).slice(0, 3000)}
FUEL/BUNKER: ${JSON.stringify(fuel).slice(0, 3000)}
INCIDENTS: ${JSON.stringify(incidents).slice(0, 2000)}

Return ONLY JSON: { compliance_score (0-100), violations: [{rule, severity, evidence, remediation}], at_risk_areas: [], recommended_audits: [], reporting_deadlines: [] }`;

    const aiResponse = await callOpenRouter(prompt);
    const raw = aiResponse.choices[0].message.content;
    const structured = parseAIJson(raw);
    const responsePayload = { raw, structured, model: aiResponse.model, usage: aiResponse.usage, timestamp: new Date().toISOString() };
    persistAnalysis(req.user.id, 'environmental-compliance-checker', { jurisdiction }, responsePayload);
    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
