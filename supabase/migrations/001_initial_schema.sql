-- ============================================================
-- Khala Matrix — Initial Schema
-- ============================================================

-- ── Helper: auto-update updated_at ──────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Hot Topics Domain
-- ============================================================

-- Page-level metadata (singleton row keyed "default")
CREATE TABLE page_configs (
  id          TEXT        PRIMARY KEY DEFAULT 'default',
  headline    TEXT        NOT NULL DEFAULT '',
  subheadline TEXT        NOT NULL DEFAULT '',
  watchlist   TEXT[]      NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER page_configs_updated_at
  BEFORE UPDATE ON page_configs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

INSERT INTO page_configs (id) VALUES ('default');

-- Individual AI domain topics
CREATE TABLE topics (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT        NOT NULL,
  domain                TEXT        NOT NULL,
  summary               TEXT        NOT NULL DEFAULT '',
  heat_score            INTEGER     NOT NULL DEFAULT 0,
  weekly_growth_percent NUMERIC(6,2) NOT NULL DEFAULT 0,
  maturity              TEXT        NOT NULL DEFAULT 'emerging'
                        CHECK (maturity IN ('emerging', 'scaling', 'mainstream')),
  notable_signals       TEXT[]      NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_topics_heat_score ON topics (heat_score DESC);
CREATE INDEX idx_topics_domain     ON topics (domain);

-- Summary statistics cards
CREATE TABLE market_stats (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT        NOT NULL,
  value      TEXT        NOT NULL,
  delta      TEXT        NOT NULL DEFAULT '',
  sort_order INTEGER     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER market_stats_updated_at
  BEFORE UPDATE ON market_stats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Briefing timeline entries
CREATE TABLE briefing_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  date       TEXT        NOT NULL,
  headline   TEXT        NOT NULL,
  impact     TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_briefing_items_created ON briefing_items (created_at DESC);

-- Data source registry
CREATE TABLE source_feeds (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN ('paper', 'product', 'policy', 'market')),
  url             TEXT        NOT NULL,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Office Domain (Agent Status)
-- ============================================================

CREATE TABLE agents (
  id                TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'offline'
                    CHECK (status IN ('idle', 'running', 'busy', 'offline', 'error')),
  owner             TEXT        NOT NULL DEFAULT 'Unassigned',
  task              TEXT        NOT NULL DEFAULT '',
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_agents_status ON agents (status);

-- Historical log of agent status changes
CREATE TABLE agent_status_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id    TEXT        NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL,
  task        TEXT        NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_status_log_agent   ON agent_status_log (agent_id, recorded_at DESC);

-- ============================================================
-- Webhook Events
-- ============================================================

CREATE TABLE webhook_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,
  payload      JSONB       NOT NULL DEFAULT '{}',
  received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_events_source ON webhook_events (source, received_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE page_configs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics            ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_stats      ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_feeds      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_status_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events    ENABLE ROW LEVEL SECURITY;

-- Public read for display tables
CREATE POLICY "public_read_page_configs"   ON page_configs   FOR SELECT USING (true);
CREATE POLICY "public_read_topics"         ON topics         FOR SELECT USING (true);
CREATE POLICY "public_read_market_stats"   ON market_stats   FOR SELECT USING (true);
CREATE POLICY "public_read_briefing_items" ON briefing_items FOR SELECT USING (true);
CREATE POLICY "public_read_source_feeds"   ON source_feeds   FOR SELECT USING (true);
CREATE POLICY "public_read_agents"         ON agents         FOR SELECT USING (true);
CREATE POLICY "public_read_agent_log"      ON agent_status_log FOR SELECT USING (true);

-- Write access for service_role only (backend and external skills)
CREATE POLICY "service_write_page_configs"   ON page_configs   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_topics"         ON topics         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_market_stats"   ON market_stats   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_briefing_items" ON briefing_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_source_feeds"   ON source_feeds   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_agents"         ON agents         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_agent_log"      ON agent_status_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_write_webhook_events" ON webhook_events FOR ALL USING (true) WITH CHECK (true);
