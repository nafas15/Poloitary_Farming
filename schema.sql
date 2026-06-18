-- =========================================================================
-- AKSHA FARM ERP DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor to create all necessary tables.
-- =========================================================================

-- 1. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    type TEXT CHECK (type IN ('Broiler', 'Layer')) NOT NULL,
    arrival_date DATE NOT NULL,
    initial_quantity INTEGER NOT NULL,
    current_quantity INTEGER NOT NULL,
    purchase_price NUMERIC NOT NULL,
    status TEXT CHECK (status IN ('Active', 'Sold')) DEFAULT 'Active' NOT NULL,
    initial_quantity_kg NUMERIC,
    purchase_price_per_kg NUMERIC
);

-- 2. Mortality Logs Table
CREATE TABLE IF NOT EXISTS mortality_logs (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    reason TEXT NOT NULL
);

-- 3. Feed Purchases Table
CREATE TABLE IF NOT EXISTS feed_purchases (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    feed_type TEXT NOT NULL,
    quantity_kg NUMERIC NOT NULL,
    cost NUMERIC NOT NULL,
    vendor TEXT NOT NULL
);

-- 4. Feed Consumption Table
CREATE TABLE IF NOT EXISTS feed_consumptions (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    feed_type TEXT NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    quantity_kg NUMERIC NOT NULL
);

-- 5. Vaccine Schedules Table
CREATE TABLE IF NOT EXISTS vaccine_schedules (
    id TEXT PRIMARY KEY,
    vaccine_name TEXT NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Pending' NOT NULL
);

-- 6. Medical Records Table
CREATE TABLE IF NOT EXISTS medical_records (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE NOT NULL,
    disease TEXT NOT NULL,
    medicine TEXT NOT NULL,
    dosage TEXT NOT NULL,
    cost NUMERIC NOT NULL
);

-- 7. Egg Collections Table
CREATE TABLE IF NOT EXISTS egg_collections (
    date DATE PRIMARY KEY,
    collected_qty INTEGER NOT NULL,
    damaged_qty INTEGER NOT NULL,
    net_qty INTEGER NOT NULL
);

-- 8. Sales Table
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('Bird', 'Egg')) NOT NULL,
    date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_contact TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    details TEXT,
    weight_kg NUMERIC,
    price_per_kg NUMERIC
);

-- 9. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    category TEXT CHECK (category IN ('Feed', 'Medicine', 'Electricity', 'Labor', 'Water', 'Other')) NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_auto_generated BOOLEAN DEFAULT FALSE NOT NULL,
    reference_id TEXT
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables security, but allows all anon/authenticated access for development ease
-- =========================================================================

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccine_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to batches" ON batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to mortality_logs" ON mortality_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to feed_purchases" ON feed_purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to feed_consumptions" ON feed_consumptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to vaccine_schedules" ON vaccine_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to medical_records" ON medical_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to egg_collections" ON egg_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- REALTIME SUB-PUBLICATION SETUP
-- Tells Supabase to broadcast change events to websockets for all tables
-- =========================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE batches;
ALTER PUBLICATION supabase_realtime ADD TABLE mortality_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_purchases;
ALTER PUBLICATION supabase_realtime ADD TABLE feed_consumptions;
ALTER PUBLICATION supabase_realtime ADD TABLE vaccine_schedules;
ALTER PUBLICATION supabase_realtime ADD TABLE medical_records;
ALTER PUBLICATION supabase_realtime ADD TABLE egg_collections;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- =========================================================================
-- DATABASE MIGRATIONS (For existing databases)
-- =========================================================================
ALTER TABLE batches ADD COLUMN IF NOT EXISTS initial_quantity_kg NUMERIC;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS purchase_price_per_kg NUMERIC;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS weight_kg NUMERIC;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS price_per_kg NUMERIC;

