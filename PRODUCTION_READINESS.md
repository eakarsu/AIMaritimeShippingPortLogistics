# Governed port-call planning

The durable path is `/api/governed-port-call-plans`. Port membership, Bearer auth, `X-Tenant-Id`, and `Idempotency-Key` are mandatory. Port calls move through authoritative source synchronization, constraint and environmental review, plan proposal, harbor approval, dispatch receipt, execution, exception recovery, and outcome. Stale weather/tide data, uncleared customs status, or unverified safety limits cause an operational hold; no navigation, customs clearance, berth command, or regulated allocation is emitted.

Apply `backend/migrations/001_governed_port_operations.sql` only through the reviewed deployment migration process. AIS/port-community, TOS, customs, weather/tide, ERP/WMS/TMS, maintenance, environmental-rule, and notification connectors remain declared but unconfigured until credentials, replay behavior, timestamps, and contract tests are approved. Generated provider agents are quarantined in production.

Historical validation must cover duplicated/delayed/missing events, forecast error, resource constraints, environmental effective dates, latency, and realized port outcomes. Harbor, customs, environmental, safety, and external-data gates fail closed.

Configure secrets from `.env.example`; keep demo/bootstrap/provider switches false. Verify with `node --test backend/governance/workflow.test.cjs` and `bash -n start.sh`. Startup is nondestructive and refuses occupied ports.
