# Audit Note — AIMaritimeShippingPortLogistics

Source audit: `_AUDIT/reports/batch_05.md` § 13

## Original audit recommendations

### Missing AI endpoints
- `/liability-risk-assessment`
- `/piracy-threat-detector`
- `/environmental-compliance-checker`

### Missing non-AI features
- Real-time vessel tracking (AIS integration)
- Electronic manifest submission
- Shipper portal
- Insurance claim management
- Labor pool management
- Environmental monitoring

### Custom feature suggestions
- Agentic customs clearing
- Streaming port optimization agent
- Multi-modal incident investigation
- Autonomous supply chain coordination
- Environmental compliance & sustainability agent
- Predictive demurrage management

## Implemented in this pass
1. **POST `/api/ai/liability-risk-assessment`** — combines vessels, cargo, recent weather → liability score + premium outlook.
2. **POST `/api/ai/environmental-compliance-checker`** — validates against IMO MARPOL (configurable jurisdiction), returns violations and remediation list.

Both follow existing `routes/ai.js` patterns: `https`-based `callOpenRouter`, `parseAIJson`, `persistAnalysis` for DB logging, `aiRateLimiter`. Syntax checked.

## Backlog (priority order)

### Mechanical
- `/piracy-threat-detector` (text-only threat scoring; no maritime intel data feed needed)

### Needs creds / external SDK
- AIS real-time vessel tracking (Spire, MarineTraffic)
- Electronic manifest submission (ACE/AMS APIs)
- Insurance claim integrations
- Environmental sensors / IoT pipeline

### Needs product decision
- Shipper portal (auth roles, scope of cargo visibility)
- Labor pool management (union rules, certifications)
- Streaming optimization (long-running session lifecycle)
- Multi-modal incident investigation (data fusion architecture)

## Apply pass 3 (frontend)

- **Action**: LEFT-AS-IS.
- `frontend/src/pages/AIToolsPage.jsx` enumerates `/ai/liability-risk-assessment` and `/ai/environmental-compliance-checker` (the apply-2 backend endpoints) by `key` and `endpoint`, dispatching via the shared API client with JWT Bearer auth.
- No FE wiring required.
- Files modified this pass: none.
