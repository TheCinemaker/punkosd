-- ============================================================================
-- KTSZE VILAG- ES UTCAZENEI FESZTIVAL 2027 (PUNKOSD) — FESZTIVAL MENEDZSER
-- Az app EGYETLEN tablat hasznal: fest_records (+ fest-docs tarolo, fest_incidents nezet).
-- Az egesz fajl tobbszor is lefuttathato (idempotens).
-- ============================================================================

-- 0. TAKARITAS: a korabbi, soha nem hasznalt tablak torlese
DROP TABLE IF EXISTS fest_tracklists CASCADE;
DROP TABLE IF EXISTS fest_schedule CASCADE;
DROP TABLE IF EXISTS fest_artists CASCADE;
DROP TABLE IF EXISTS fest_stages CASCADE;
DROP TABLE IF EXISTS fest_team CASCADE;
DROP TABLE IF EXISTS fest_activity_logs CASCADE;
DROP TABLE IF EXISTS fest_contractors CASCADE;
DROP TABLE IF EXISTS fest_shopping_list CASCADE;
DROP TABLE IF EXISTS fest_vendors CASCADE;
DROP TABLE IF EXISTS fest_tasks CASCADE;
DROP TABLE IF EXISTS fest_inventory CASCADE;
DROP TABLE IF EXISTS fest_budget CASCADE;

-- ============================================================================
-- 1. KOZOS ADATTAR (EZT HASZNALJA AZ APP)
-- Minden modul (menetrend, fellepok, feladatok, SOS, terkep stb.) soronkent
-- ide ment: collection = modul neve, id = tetel azonositoja, data = teljes tetel.
-- Elo szinkron: Supabase Realtime (postgres_changes).
-- Ez a blokk onmagaban is lefuttathato, tobbszor is (idempotens).
-- ============================================================================
CREATE TABLE IF NOT EXISTS fest_records (
    collection TEXT NOT NULL,
    id TEXT NOT NULL,
    data JSONB NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (collection, id)
);

CREATE INDEX IF NOT EXISTS idx_fest_records_collection ON fest_records(collection);

ALTER TABLE fest_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fest_records_app_access ON fest_records;
CREATE POLICY fest_records_app_access ON fest_records
    FOR ALL TO anon, authenticated
    USING (true) WITH CHECK (true);

-- Realtime bekapcsolasa a tablara
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE fest_records;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- 2. DOKUMENTUMTAR (riderek, szerzodesek, stage plotok, szamlak)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('fest-docs', 'fest-docs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS fest_docs_read ON storage.objects;
CREATE POLICY fest_docs_read ON storage.objects
    FOR SELECT TO anon, authenticated
    USING (bucket_id = 'fest-docs');

DROP POLICY IF EXISTS fest_docs_upload ON storage.objects;
CREATE POLICY fest_docs_upload ON storage.objects
    FOR INSERT TO anon, authenticated
    WITH CHECK (bucket_id = 'fest-docs');

-- ============================================================================
-- 3. OLVASHATO NEZET: Problemafal (SOS) a Supabase feluleten
-- Csak olvasasra; az app tovabbra is a fest_records tablaba ir.
-- ============================================================================
CREATE OR REPLACE VIEW fest_incidents WITH (security_invoker = true) AS
SELECT
    id,
    data->>'severity'                 AS severity,
    data->>'location'                 AS location,
    data->>'text'                     AS text,
    data->>'reporter'                 AS reporter,
    data->>'time'                     AS reported_time,
    COALESCE((data->>'isResolved')::boolean, false) AS is_resolved,
    data->>'resolvedBy'               AS resolved_by,
    data->>'resolvedAt'               AS resolved_time,
    created_at,
    updated_at
FROM fest_records
WHERE collection = 'incidents'
ORDER BY created_at DESC;
