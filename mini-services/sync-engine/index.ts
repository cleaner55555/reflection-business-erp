import { Database } from "bun:sqlite";
import { serve } from "bun";

// ─── Configuration ───────────────────────────────────────────────────────────
const PORT = 3020;
const POLL_INTERVAL_MS = 30_000; // 30 seconds
const DB_PATH = "/home/z/my-project/db/custom.db";
const MAIN_APP_BASE = "http://localhost:3000";

// ─── State ───────────────────────────────────────────────────────────────────
let activeConnectors = 0;
let lastCheckAt: string | null = null;
let isPolling = false;
let lastRecurringCheckAt: string | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timestamp(): string {
  return new Date().toISOString();
}

function log(level: "info" | "warn" | "error", msg: string) {
  const ts = timestamp();
  const prefix = { info: "INFO ", warn: "WARN ", error: "ERROR" }[level];
  console.log(`[${ts}] [${prefix}] ${msg}`);
}

// ─── Database ────────────────────────────────────────────────────────────────
const db = new Database(DB_PATH, { readonly: true });
log("info", `Database opened: ${DB_PATH}`);

interface SyncConnectorRow {
  id: string;
  name: string;
  type: string;
  isActive: number; // SQLite boolean → 0 or 1
  status: string;
  syncInterval: number; // minutes
  lastSyncAt: string | null; // ISO string or null
}

function getActiveConnectorsDueForSync(): SyncConnectorRow[] {
  const rows = db
    .query(
      `
      SELECT id, name, type, isActive, status, syncInterval, lastSyncAt
      FROM SyncConnector
      WHERE isActive = 1
        AND status = 'connected'
    `
    )
    .all() as SyncConnectorRow[];

  // Filter in JS: only connectors where lastSyncAt is NULL or older than syncInterval minutes
  return rows.filter((row) => {
    const intervalMs = (row.syncInterval || 60) * 60_000;
    const cutoffTime = new Date(Date.now() - intervalMs);

    if (!row.lastSyncAt) {
      return true; // never synced → due immediately
    }

    const lastSync = new Date(row.lastSyncAt);
    return lastSync < cutoffTime;
  });
}

// ─── Sync Trigger ────────────────────────────────────────────────────────────
async function triggerSync(connector: SyncConnectorRow): Promise<void> {
  const url = `${MAIN_APP_BASE}/api/integrations/connectors/${connector.id}/sync`;

  log("info", `Triggering sync for connector "${connector.name}" (${connector.id}) → ${url}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      log(
        "warn",
        `Sync failed for "${connector.name}" — HTTP ${response.status}: ${body.slice(0, 200)}`
      );
      return;
    }

    const data = await response.json().catch(() => ({}));
    log("info", `Sync completed for "${connector.name}" — ${JSON.stringify(data).slice(0, 200)}`);
  } catch (err) {
    log("error", `Sync error for "${connector.name}": ${(err as Error).message}`);
  }
}

// ─── Recurring Invoice Check ───────────────────────────────────────────────
async function checkRecurringInvoices(): Promise<void> {
  log("info", "Checking recurring invoices for auto-generation...");

  try {
    const response = await fetch(`${MAIN_APP_BASE}/api/recurring-invoices/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      log("warn", `Recurring check failed — HTTP ${response.status}: ${body.slice(0, 200)}`);
      return;
    }

    const data = await response.json().catch(() => ({}));
    if (data.generated > 0) {
      log("info", `Recurring invoices: ${data.generated} invoice(s) auto-generated from ${data.total} due`);
    } else {
      log("info", `Recurring invoices: 0 due — ${data.message || "all up to date"}`);
    }
    lastRecurringCheckAt = timestamp();
  } catch (err) {
    log("error", `Recurring invoice check error: ${(err as Error).message}`);
  }
}

// ─── Polling Loop ────────────────────────────────────────────────────────────
async function pollConnectors(): Promise<void> {
  if (isPolling) {
    log("warn", "Previous poll still in progress, skipping this cycle");
    return;
  }

  isPolling = true;
  const pollStart = timestamp();

  try {
    const dueConnectors = getActiveConnectorsDueForSync();
    activeConnectors = dueConnectors.length;
    lastCheckAt = pollStart;

    log("info", `Poll: found ${dueConnectors.length} connector(s) due for sync`);

    // Trigger syncs sequentially to avoid overwhelming the main app
    for (const connector of dueConnectors) {
      await triggerSync(connector);
    }

    // Check recurring invoices
    await checkRecurringInvoices();
  } catch (err) {
    log("error", `Poll error: ${(err as Error).message}`);
  } finally {
    isPolling = false;
  }
}

// ─── HTTP Server ─────────────────────────────────────────────────────────────
const server = serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    // GET / — status overview
    if (url.pathname === "/" && req.method === "GET") {
      return Response.json({
        status: "running",
        connectors: activeConnectors,
        lastCheck: lastCheckAt,
        lastRecurringCheck: lastRecurringCheckAt,
        uptime: process.uptime(),
      });
    }

    // GET /health — health check
    if (url.pathname === "/health" && req.method === "GET") {
      return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // 404 for everything else
    return Response.json({ error: "Not found" }, { status: 404 });
  },
});

// ─── Startup ─────────────────────────────────────────────────────────────────
log("info", `Sync Engine started on port ${PORT}`);
log("info", `Polling every ${POLL_INTERVAL_MS / 1000}s | DB: ${DB_PATH}`);

// Run first poll immediately, then start interval
pollConnectors().catch(() => {});
setInterval(() => {
  pollConnectors().catch(() => {});
}, POLL_INTERVAL_MS);

export { server };
