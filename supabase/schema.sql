-- ============================================================================
-- KTSZE VILAG- ES UTCAZENEI FESZTIVAL 2026 (PUNKOSD)
-- PROGRAM MANAGEMENT & PRODUCTION SCHEMA
-- Prefix: fest_ (Teljes szeparalas a meglevo KTSZE tablakhoz kepest)
-- ============================================================================

-- 1. Felhasznalok / Csapattagok & Szervezok
CREATE TABLE IF NOT EXISTS fest_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Szervező',
    badge TEXT NOT NULL DEFAULT 'Technika', -- 'Technika', 'Helyszín', 'Elnökség', 'Pénzügy', 'Biztonság', 'Önkéntes'
    phone TEXT,
    email TEXT,
    pin TEXT DEFAULT '1532', -- Belepesi PIN kod (barki belephet, akinek kodot adsz)
    radio TEXT DEFAULT 'URH Ch-1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alaperelmezett KTSZE csapattagok
INSERT INTO fest_team (name, role, badge, phone, email, pin, radio) VALUES
('Szilveszter', 'Nagyszínpad Koordinátor & Műszaki vezető', 'Technika', '+36 30 987 6543', 'szilveszter@ktsze.hu', '1532', 'URH Ch-1'),
('Gábor', 'KTSZE Elnök & Főszervező', 'Elnökség', '+36 30 876 5432', 'gabor@ktsze.hu', '1532', 'URH Ch-1'),
('Zoltán', 'Pénzügyi & Pályázati Felelős', 'Pénzügy', '+36 30 765 4321', 'zoltan@ktsze.hu', '1532', 'URH Ch-3'),
('Műszaki Stáb', 'Hang & Fénytechnikai Csapat', 'Technika', '+36 30 654 3210', 'technika@ktsze.hu', '1532', 'URH Ch-2'),
('Önkéntes Csapat', 'Helyszíni Koordináció & Zsákos Ügyelet', 'Helyszín', '+36 30 543 2109', 'onkentes@ktsze.hu', '1532', 'URH Ch-4')
ON CONFLICT (name) DO NOTHING;

-- 2. Aktivitasi Naplo / Audit Trail (Ki mit csinalt, ki pipalta ki, ki szerkesztette)
CREATE TABLE IF NOT EXISTS fest_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    action_type TEXT NOT NULL, -- TASK_COMPLETED, ARTIST_UPDATED, ITEM_CHECKED, VENDOR_UPDATED, BUDGET_EDITED, CONTRACTOR_UPDATED, SHOPPING_PURCHASED
    module TEXT NOT NULL,      -- 'To-Do', 'Nagyszinpad', 'Arusok', 'Keszlet', 'Koltsegvetes', 'Artisjus', 'Szolgaltatok', 'Bevasarlolista'
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Szinpadok es Helyszinek
CREATE TABLE IF NOT EXISTS fest_stages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    capacity INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO fest_stages (id, name, location, description, capacity) VALUES
('main_stage', 'Nagyszinpad (Fo ter)', 'Fo ter (Borok tere)', '10x8m fedett nagyszinpad, Line Array rendszer, Vardisco es nagykoncertek', 4000),
('small_stage_1', 'Kisszinpad 1 (Jurisics ter)', 'Jurisics ter (Etelek utcaja)', 'Utcazenei, akusztikus, vilagzenei es delutani DJ pont', 1200),
('small_stage_2', 'Kisszinpad 2 (Varjatszoter)', 'Varjatszoter & Vararok', 'Gyerekbirodalom, csaladi es gyermekkoncertek, interaktiv musorok', 800),
('street_points', 'Utcazene Kapualjak', 'Belvaros kapualjai es setanyai', 'Egyedi akusztikus es kis PA-s utcazeneszek', 300)
ON CONFLICT (id) DO NOTHING;

-- 4. Fellepok es Zenekarok
CREATE TABLE IF NOT EXISTS fest_artists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    stage_id TEXT REFERENCES fest_stages(id),
    day TEXT NOT NULL, -- 'Pentek', 'Szombat', 'Vasarnap', 'Hetfo'
    genre TEXT,
    origin TEXT,
    members_count INT DEFAULT 1,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    fee_huf NUMERIC DEFAULT 0,
    fee_type TEXT DEFAULT 'Atutalas / Kft szamla',
    contract_status TEXT DEFAULT 'Tervezet',
    payment_status TEXT DEFAULT 'Fizetesre var',
    contract_url TEXT,
    tech_rider_status TEXT DEFAULT 'Egyeztetes alatt',
    tech_rider_notes TEXT,
    hospitality_notes TEXT,
    diet_requirements TEXT,
    parking_passes INT DEFAULT 1,
    accommodation_needed TEXT,
    created_by TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Menetrend / Lineup & Timeup
CREATE TABLE IF NOT EXISTS fest_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES fest_artists(id) ON DELETE CASCADE,
    stage_id TEXT REFERENCES fest_stages(id),
    day TEXT NOT NULL,
    event_title TEXT NOT NULL,
    load_in_time TEXT,
    soundcheck_time TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_minutes INT,
    stage_manager TEXT DEFAULT 'Szilveszter',
    status TEXT DEFAULT 'Visszaigazolva',
    notes TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Szerzodott Szolgaltatok es Alvallalkozok (Szinpadtechnika, aram, kuka, mento, security, ToiToi, nyomda stb.)
CREATE TABLE IF NOT EXISTS fest_contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'TECH-01', 'EON-01', 'KUKA-01', 'SEC-01', 'MED-01', 'TOI-01'
    company_name TEXT NOT NULL,
    category TEXT NOT NULL,
    service TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    fee_huf NUMERIC DEFAULT 0,
    contract_status TEXT DEFAULT 'Alairva',
    payment_status TEXT DEFAULT 'Elokoltseg kifizetve',
    contract_doc TEXT,
    quote_doc TEXT,
    completion_doc TEXT,
    invoice_number TEXT,
    notes TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Mester Beszerzesi es Igenylista (A szinpadtol a szemeteszsakig: ki irta be, kinek a dolga beszerezni/egyeztetni)
CREATE TABLE IF NOT EXISTS fest_shopping_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Kellékek & Kellékanyagok', -- 'Színpad & Technika', 'Áram & Gép', 'Higiénia & Hulladék', 'Catering & Backstage', 'Biztonság & Kordon', 'Nyomda & Reklám'
    store TEXT NOT NULL, -- Bolt / Szállító / Partner
    qty NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'db',
    estimated_price NUMERIC DEFAULT 0,
    actual_price NUMERIC DEFAULT 0,
    created_by TEXT NOT NULL DEFAULT 'Szilveszter', -- Ki írta be az igényt
    assigned_to TEXT NOT NULL DEFAULT 'Szilveszter', -- Kinek a dolga beszerezni / egyeztetni
    priority TEXT DEFAULT 'Normál', -- 'Sürgős', 'Magas', 'Normál', 'Alacsony'
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_by TEXT, -- Ki szerezte be / pipálta ki
    purchased_at TIMESTAMPTZ, -- Mikor szerezte be / pipálta ki
    has_receipt BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Arusok es Vendeglatok (Borok tere & Etelek utcaja)
CREATE TABLE IF NOT EXISTS fest_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code TEXT UNIQUE NOT NULL, -- 'BOR-01', 'GASZT-01'
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    power_demand TEXT,
    water_demand BOOLEAN DEFAULT FALSE,
    trash_bins_count INT DEFAULT 1,
    trash_bags_issued INT DEFAULT 5,
    deposit_fee_huf NUMERIC DEFAULT 50000,
    pitch_fee_huf NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Visszaigazolva',
    notes TEXT,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. To-Do es Feladatkezelo
CREATE TABLE IF NOT EXISTS fest_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'Normal', -- 'Surgos', 'Magas', 'Normal', 'Alacsony'
    assigned_to TEXT NOT NULL,
    due_date DATE,
    due_time TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_by TEXT,
    completed_at TIMESTAMPTZ,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Keszlet es Eszkozok
CREATE TABLE IF NOT EXISTS fest_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'db',
    location_assigned TEXT,
    responsible_person TEXT,
    status TEXT DEFAULT 'Raktaron',
    notes TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tracklist & Artisjus Adatszolgaltatas
CREATE TABLE IF NOT EXISTS fest_tracklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES fest_artists(id) ON DELETE CASCADE,
    track_order INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    composers TEXT NOT NULL,
    lyricists TEXT,
    duration TEXT,
    genre TEXT,
    track_type TEXT DEFAULT 'Sajat szerzemeny',
    is_reported BOOLEAN DEFAULT FALSE,
    updated_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Koltsegvetes es Palyazati elszamolas
CREATE TABLE IF NOT EXISTS fest_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    quantity NUMERIC DEFAULT 1,
    unit TEXT DEFAULT 'db',
    unit_price_huf NUMERIC DEFAULT 0,
    total_price_huf NUMERIC DEFAULT 0,
    grant_funded_huf NUMERIC DEFAULT 0,
    own_funded_huf NUMERIC DEFAULT 0,
    supplier_name TEXT,
    invoice_number TEXT,
    payment_status TEXT DEFAULT 'Tervezett',
    is_grant_eligible BOOLEAN DEFAULT TRUE,
    notes TEXT,
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatikus indexek
CREATE INDEX IF NOT EXISTS idx_fest_activity_created ON fest_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fest_tasks_completed ON fest_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_fest_contractors_code ON fest_contractors(code);
CREATE INDEX IF NOT EXISTS idx_fest_shopping_purchased ON fest_shopping_list(is_purchased);
CREATE INDEX IF NOT EXISTS idx_fest_artists_stage ON fest_artists(stage_id);
CREATE INDEX IF NOT EXISTS idx_fest_inventory_code ON fest_inventory(item_code);
