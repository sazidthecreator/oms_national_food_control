-- ============================================================
--  OMS NATIONAL CONTROL PLATFORM
--  Complete Database Schema — PostgreSQL 15+
--
--  Prepared for : Ministry of Food, Government of Bangladesh
--  Document Ver : v1.0 — March 2026
--  Classification: CONFIDENTIAL
-- ============================================================
--
--  TABLE INDEX
--  ───────────────────────────────────────────────────────────
--  A. MASTER DATA (10-year retention, version-controlled)
--     1.  offices               — Administrative hierarchy
--     2.  roles                 — System roles (super_user, inspector, dealer, officer)
--     3.  permissions           — Granular permission definitions
--     4.  role_permissions      — Role ↔ permission mapping
--     5.  users                 — All system users
--     6.  dealers               — Licensed OMS dealers
--     7.  beneficiaries         — Registered food recipients
--     8.  programs              — OMS distribution programs
--
--  B. TRANSACTION DATA (append-only, immutable after commit)
--     9.  allotments            — Dealer food allotments
--     10. delivery_orders       — DO orders for allotment collection
--     11. transactions          — Food distribution events (partitioned by month)
--
--  C. OPERATIONAL DATA (high-velocity, Redis-backed)
--     12. daily_beneficiary_index  — Same-day duplicate check index
--     13. monthly_quota_tracking   — Per-beneficiary monthly quota
--
--  D. AUDIT DATA (append-only, no UPDATE/DELETE permissions)
--     14. audit_logs            — Tamper-evident action log
--
--  E. SESSION / SYNC DATA (short retention, TTL-driven)
--     15. sessions              — Active user sessions & JWT metadata
--     16. sync_queue            — Offline transaction upload queue
--
-- ============================================================



-- ────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_partman"; -- table partitioning



-- ============================================================
--  A. MASTER DATA TABLES
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  1. OFFICES
--     Hierarchical administrative structure aligned with Bangladesh:
--     national → division → district → upazila → center
-- ────────────────────────────────────────────────────────────
CREATE TABLE offices (
  office_id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  office_code       VARCHAR(20) NOT NULL UNIQUE,           -- e.g. DHK-DIV-001
  office_name       VARCHAR(255) NOT NULL,
  office_name_bn    VARCHAR(255),                          -- Bengali name
  office_type       VARCHAR(20) NOT NULL
                    CHECK (office_type IN ('national','division','district','upazila','center')),
  parent_office_id  UUID        REFERENCES offices(office_id),
  address           VARCHAR(500),
  phone_number      VARCHAR(20),
  email             VARCHAR(255),
  latitude          DECIMAL(10,7),
  longitude         DECIMAL(10,7),
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive')),
  created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT offices_hierarchy_ck CHECK (
    (office_type = 'national' AND parent_office_id IS NULL) OR
    (office_type != 'national' AND parent_office_id IS NOT NULL)
  )
);

CREATE INDEX idx_offices_parent      ON offices(parent_office_id);
CREATE INDEX idx_offices_type        ON offices(office_type);
CREATE INDEX idx_offices_status      ON offices(status);

-- Seed: National office (required before any other records)
INSERT INTO offices (office_code, office_name, office_name_bn, office_type)
VALUES ('BGD-NAT-001', 'Directorate General of Food', 'খাদ্য অধিদপ্তর', 'national');

COMMENT ON TABLE offices IS
  'Hierarchical administrative offices. Self-referencing via parent_office_id.
   national → division → district → upazila → center.
   All entity records (dealers, beneficiaries, users) scoped to an office.';


-- ────────────────────────────────────────────────────────────
--  2. ROLES
-- ────────────────────────────────────────────────────────────
CREATE TABLE roles (
  role_id      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name    VARCHAR(100) NOT NULL UNIQUE,
  description  TEXT,
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (role_name, description) VALUES
  ('super_user',         'Full system access — Ministry / DG Food level'),
  ('division_officer',   'Division-level monitoring and approval'),
  ('district_officer',   'District-level dealer and beneficiary management'),
  ('inspector',          'Field inspection and observation'),
  ('beneficiary_officer','Beneficiary registration and quota management'),
  ('dealer',             'Transaction entry via mobile app');

COMMENT ON TABLE roles IS
  'System roles. Each user is assigned exactly one role.
   Permissions are granted per role via role_permissions table.';


-- ────────────────────────────────────────────────────────────
--  3. PERMISSIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE permissions (
  permission_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_name VARCHAR(100) NOT NULL UNIQUE,  -- e.g. dealer:approve
  module          VARCHAR(50) NOT NULL,           -- dealer, beneficiary, transaction, etc.
  description     TEXT,
  created_at      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO permissions (permission_name, module, description) VALUES
  ('dealer:register',           'dealer',       'Submit dealer registration'),
  ('dealer:approve',            'dealer',       'Approve or reject dealer application'),
  ('dealer:suspend',            'dealer',       'Suspend or cancel dealer license'),
  ('dealer:allotment:create',   'dealer',       'Create dealer allotment'),
  ('dealer:deposit:approve',    'dealer',       'Approve dealer deposit payment'),
  ('beneficiary:register',      'beneficiary',  'Register new beneficiary'),
  ('beneficiary:view',          'beneficiary',  'View beneficiary profile and history'),
  ('beneficiary:deactivate',    'beneficiary',  'Deactivate beneficiary record'),
  ('transaction:create',        'transaction',  'Record food distribution transaction'),
  ('transaction:view',          'transaction',  'View transaction records'),
  ('observation:inspect',       'observation',  'Submit physical inspection report'),
  ('observation:monitor',       'observation',  'View dealer sales activity'),
  ('analytics:view',            'analytics',    'Access analytics and reports'),
  ('user:create',               'user',         'Create system user'),
  ('user:manage',               'user',         'Manage roles and permissions'),
  ('audit:export',              'audit',        'Export audit log reports'),
  ('system:configure',          'system',       'Configure OMS programs and office settings');

COMMENT ON TABLE permissions IS
  'Granular permission definitions. Assigned to roles via role_permissions.';


-- ────────────────────────────────────────────────────────────
--  4. ROLE_PERMISSIONS (junction)
-- ────────────────────────────────────────────────────────────
CREATE TABLE role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(role_id),
  permission_id UUID NOT NULL REFERENCES permissions(permission_id),
  granted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by    UUID,                               -- nullable: seeded records have no granter
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS
  'Maps roles to permissions. Many-to-many junction table.
   Changing a role''s permissions here immediately affects all users with that role.';


-- ────────────────────────────────────────────────────────────
--  5. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE users (
  user_id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  username            VARCHAR(100) NOT NULL UNIQUE,
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,          -- bcrypt cost 12
  full_name           VARCHAR(255) NOT NULL,
  full_name_bn        VARCHAR(255),                   -- Bengali name
  phone_number        VARCHAR(20),
  office_id           UUID         NOT NULL REFERENCES offices(office_id),
  role_id             UUID         NOT NULL REFERENCES roles(role_id),
  status              VARCHAR(20)  NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','inactive','suspended')),
  last_login_at       TIMESTAMP,
  password_changed_at TIMESTAMP,
  failed_login_count  SMALLINT     NOT NULL DEFAULT 0,
  locked_until        TIMESTAMP,
  created_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by          UUID         REFERENCES users(user_id),

  CONSTRAINT users_email_fmt_ck CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE INDEX idx_users_username  ON users(username);
CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_office    ON users(office_id);
CREATE INDEX idx_users_role      ON users(role_id);
CREATE INDEX idx_users_status    ON users(status);

COMMENT ON TABLE users IS
  'All system users: government officers, inspectors, and dealer login accounts.
   password_hash: bcrypt(cost=12). Auto-lock after 5 failed logins (locked_until).
   status: active | inactive | suspended.';


-- ────────────────────────────────────────────────────────────
--  6. DEALERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE dealers (
  dealer_id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_code            VARCHAR(20)  NOT NULL UNIQUE,     -- e.g. DLR-0041
  dealer_name            VARCHAR(255) NOT NULL,
  dealer_name_bn         VARCHAR(255),
  registration_number    VARCHAR(50)  NOT NULL UNIQUE,
  phone_number           VARCHAR(20)  NOT NULL,
  email                  VARCHAR(255),
  address                VARCHAR(500) NOT NULL,
  address_bn             VARCHAR(500),
  office_id              UUID         NOT NULL REFERENCES offices(office_id),
  status                 VARCHAR(20)  NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','approved','active','suspended','cancelled')),
  approval_date          TIMESTAMP,
  approval_by            UUID         REFERENCES users(user_id),
  suspension_reason      VARCHAR(500),
  suspension_start_date  DATE,
  suspension_end_date    DATE,
  bank_account_number    VARCHAR(50),
  bank_name              VARCHAR(100),
  business_license_url   VARCHAR(500),    -- Cloud storage path
  national_id_number     VARCHAR(13),
  national_id_url        VARCHAR(500),
  compliance_score       DECIMAL(5,2) DEFAULT 100.00,   -- 0–100, updated by Analytics Service
  created_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by             UUID         NOT NULL REFERENCES users(user_id),

  CONSTRAINT dealers_phone_ck CHECK (phone_number ~ '^\\+8801[0-9]{9}$'),
  CONSTRAINT dealers_nid_ck   CHECK (national_id_number IS NULL OR national_id_number ~ '^[0-9]{13}$'),
  CONSTRAINT dealers_score_ck CHECK (compliance_score BETWEEN 0 AND 100)
);

CREATE INDEX idx_dealers_office       ON dealers(office_id);
CREATE INDEX idx_dealers_status       ON dealers(status);
CREATE INDEX idx_dealers_reg_num      ON dealers(registration_number);
CREATE INDEX idx_dealers_compliance   ON dealers(compliance_score);

COMMENT ON TABLE dealers IS
  'Licensed OMS dealers. status lifecycle: pending → approved → active → suspended | cancelled.
   compliance_score updated nightly by Analytics Service based on transaction patterns.
   business_license_url and national_id_url reference document storage (not raw files in DB).';


-- ────────────────────────────────────────────────────────────
--  7. BENEFICIARIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE beneficiaries (
  beneficiary_id      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_code    VARCHAR(20)   NOT NULL UNIQUE,   -- e.g. BEN-10021
  national_id         VARCHAR(13)   NOT NULL UNIQUE,
  full_name           VARCHAR(255)  NOT NULL,
  full_name_bn        VARCHAR(255),
  phone_number        VARCHAR(20),
  address             VARCHAR(500)  NOT NULL,
  address_bn          VARCHAR(500),
  office_id           UUID          NOT NULL REFERENCES offices(office_id),
  program_id          UUID          REFERENCES programs(program_id),
  category            VARCHAR(50)   NOT NULL
                      CHECK (category IN ('widow','elderly','disabled','poor_family','other')),
  daily_limit_kg      DECIMAL(10,2) NOT NULL,
  monthly_limit_kg    DECIMAL(10,2) NOT NULL,
  face_photo_url      VARCHAR(500),            -- Cloud storage path
  face_encoding       BYTEA,                   -- Encrypted binary — AES-256 on application level
  enrollment_status   VARCHAR(20)   NOT NULL DEFAULT 'pending'
                      CHECK (enrollment_status IN ('pending','approved','rejected')),
  status              VARCHAR(20)   NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','inactive','suspended')),
  enrolled_at         TIMESTAMP,
  enrolled_by         UUID          REFERENCES users(user_id),
  created_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by          UUID          NOT NULL REFERENCES users(user_id),

  CONSTRAINT beneficiaries_nid_ck          CHECK (national_id ~ '^[0-9]{13}$'),
  CONSTRAINT beneficiaries_daily_limit_ck  CHECK (daily_limit_kg  > 0 AND daily_limit_kg  <= 10),
  CONSTRAINT beneficiaries_monthly_limit_ck CHECK (monthly_limit_kg > 0 AND monthly_limit_kg <= 100)
);

CREATE INDEX idx_beneficiaries_nid          ON beneficiaries(national_id);
CREATE INDEX idx_beneficiaries_office       ON beneficiaries(office_id);
CREATE INDEX idx_beneficiaries_status       ON beneficiaries(status);
CREATE INDEX idx_beneficiaries_enrollment   ON beneficiaries(enrollment_status);
CREATE INDEX idx_beneficiaries_category     ON beneficiaries(category);

COMMENT ON TABLE beneficiaries IS
  'Registered food recipients. face_encoding stored as AES-256 encrypted BYTEA — never raw image.
   daily_limit_kg and monthly_limit_kg can be overridden per-beneficiary or inherited from program.
   national_id: 13-digit Bangladesh NID.';


-- ────────────────────────────────────────────────────────────
--  8. PROGRAMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE programs (
  program_id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  program_code         VARCHAR(20)   NOT NULL UNIQUE,
  program_name         VARCHAR(255)  NOT NULL,
  program_name_bn      VARCHAR(255),
  program_type         VARCHAR(50)   NOT NULL
                       CHECK (program_type IN ('regular','emergency','seasonal','ramadan')),
  product_types        VARCHAR(100)  NOT NULL DEFAULT 'rice,flour',  -- CSV: rice,flour
  default_daily_limit_kg    DECIMAL(10,2) NOT NULL,
  default_monthly_limit_kg  DECIMAL(10,2) NOT NULL,
  eligible_categories  VARCHAR(255),   -- CSV: widow,elderly,disabled,poor_family
  start_date           DATE          NOT NULL,
  end_date             DATE          NOT NULL,
  status               VARCHAR(20)   NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','inactive','completed')),
  description          TEXT,
  created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by           UUID          NOT NULL REFERENCES users(user_id),

  CONSTRAINT programs_dates_ck    CHECK (start_date <= end_date),
  CONSTRAINT programs_daily_ck    CHECK (default_daily_limit_kg > 0),
  CONSTRAINT programs_monthly_ck  CHECK (default_monthly_limit_kg > 0)
);

CREATE INDEX idx_programs_status     ON programs(status);
CREATE INDEX idx_programs_dates      ON programs(start_date, end_date);

COMMENT ON TABLE programs IS
  'OMS distribution programs (configurable by Module 5 — OMS Setup).
   product_types: comma-separated list of allowed food products.
   eligible_categories: restricts which beneficiary categories qualify.';



-- ============================================================
--  B. TRANSACTION DATA TABLES
--     Append-only — records are never modified after commit.
--     Partitioned by month for performance at scale.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  9. ALLOTMENTS
-- ────────────────────────────────────────────────────────────
CREATE TABLE allotments (
  allotment_id      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  allotment_code    VARCHAR(30)   NOT NULL UNIQUE,      -- e.g. ALT-20260320-0041
  dealer_id         UUID          NOT NULL REFERENCES dealers(dealer_id),
  office_id         UUID          NOT NULL REFERENCES offices(office_id),
  program_id        UUID          REFERENCES programs(program_id),
  quantity_kg       DECIMAL(10,2) NOT NULL,
  product_type      VARCHAR(20)   NOT NULL CHECK (product_type IN ('rice','flour')),
  delivery_date     DATE          NOT NULL,
  price_per_kg      DECIMAL(10,2) NOT NULL,
  total_amount      DECIMAL(15,2) NOT NULL,
  status            VARCHAR(30)   NOT NULL DEFAULT 'pending_deposit'
                    CHECK (status IN ('pending_deposit','deposit_received','do_issued','delivered','cancelled')),
  deposit_amount    DECIMAL(15,2),
  deposit_date      DATE,
  deposit_ref       VARCHAR(100),            -- Bangladesh Bank payment reference
  notes             TEXT,
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by        UUID          NOT NULL REFERENCES users(user_id),

  CONSTRAINT allotments_qty_ck    CHECK (quantity_kg > 0),
  CONSTRAINT allotments_price_ck  CHECK (price_per_kg > 0),
  CONSTRAINT allotments_total_ck  CHECK (total_amount > 0)
);

CREATE INDEX idx_allotments_dealer       ON allotments(dealer_id);
CREATE INDEX idx_allotments_delivery     ON allotments(delivery_date);
CREATE INDEX idx_allotments_status       ON allotments(status);

COMMENT ON TABLE allotments IS
  'Dealer food allotments. Lifecycle: pending_deposit → deposit_received → do_issued → delivered.
   deposit_ref: Bangladesh Bank payment gateway reference number (Phase 2 integration).';


-- ────────────────────────────────────────────────────────────
--  10. DELIVERY_ORDERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE delivery_orders (
  delivery_order_id   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  do_number           VARCHAR(50) NOT NULL UNIQUE,   -- e.g. DO-2026-000042
  allotment_id        UUID        NOT NULL REFERENCES allotments(allotment_id),
  dealer_id           UUID        NOT NULL REFERENCES dealers(dealer_id),
  office_id           UUID        NOT NULL REFERENCES offices(office_id),
  collection_date     DATE        NOT NULL,
  status              VARCHAR(30) NOT NULL DEFAULT 'pending_collection'
                      CHECK (status IN ('pending_collection','collected','cancelled')),
  collection_time     TIMESTAMP,
  collection_witness  UUID        REFERENCES users(user_id),
  notes               TEXT,
  created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by          UUID        NOT NULL REFERENCES users(user_id),

  CONSTRAINT do_number_fmt_ck CHECK (do_number ~ '^DO-[0-9]{4}-[0-9]{6}$')
);

CREATE INDEX idx_do_dealer       ON delivery_orders(dealer_id);
CREATE INDEX idx_do_date         ON delivery_orders(collection_date);
CREATE INDEX idx_do_status       ON delivery_orders(status);

COMMENT ON TABLE delivery_orders IS
  'Delivery orders for dealer allotment collection from warehouse.
   collection_witness: user who recorded/witnessed the collection.';


-- ────────────────────────────────────────────────────────────
--  11. TRANSACTIONS (partitioned by month)
--      Immutable after INSERT. This is the core anti-leakage table.
-- ────────────────────────────────────────────────────────────
CREATE TABLE transactions (
  transaction_id              UUID          NOT NULL DEFAULT gen_random_uuid(),
  transaction_code            VARCHAR(40)   NOT NULL UNIQUE,  -- e.g. TXN-20260320-7001
  event_id                    UUID          NOT NULL UNIQUE,  -- UUID v4 from mobile — idempotency key
  beneficiary_id              UUID          NOT NULL REFERENCES beneficiaries(beneficiary_id),
  dealer_id                   UUID          NOT NULL REFERENCES dealers(dealer_id),
  office_id                   UUID          NOT NULL REFERENCES offices(office_id),
  program_id                  UUID          REFERENCES programs(program_id),
  quantity_kg                 DECIMAL(10,2) NOT NULL,
  product_type                VARCHAR(20)   NOT NULL CHECK (product_type IN ('rice','flour')),

  -- Biometric verification outcome
  face_verification_status    VARCHAR(20)   NOT NULL
                              CHECK (face_verification_status IN ('matched','retry','exception','manual_override')),
  face_confidence_score       DECIMAL(5,4),             -- 0.0000 to 1.0000
  face_verification_event_id  UUID,                     -- FK to biometric verification log

  -- Business rule outcomes
  duplicate_check_status      VARCHAR(20)   NOT NULL
                              CHECK (duplicate_check_status IN ('pass','blocked_daily','blocked_monthly')),
  quota_check_status          VARCHAR(20)   NOT NULL
                              CHECK (quota_check_status IN ('pass','blocked')),

  -- Final result
  transaction_status          VARCHAR(20)   NOT NULL
                              CHECK (transaction_status IN ('accepted','blocked','exception')),

  -- Quota snapshot at time of transaction
  monthly_consumed_before_kg  DECIMAL(10,2),
  monthly_consumed_after_kg   DECIMAL(10,2),

  -- Context
  transaction_date            DATE          NOT NULL,
  transaction_timestamp       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  device_id                   VARCHAR(100),             -- Dealer device fingerprint
  sync_source                 VARCHAR(20)   NOT NULL DEFAULT 'online'
                              CHECK (sync_source IN ('online','offline_sync')),
  synced_at                   TIMESTAMP,               -- NULL if recorded online directly
  notes                       TEXT,
  created_by                  UUID          NOT NULL REFERENCES users(user_id),

  CONSTRAINT transactions_qty_ck           CHECK (quantity_kg > 0),
  CONSTRAINT transactions_confidence_ck    CHECK (face_confidence_score IS NULL OR face_confidence_score BETWEEN 0 AND 1),
  PRIMARY KEY (transaction_id, transaction_date)       -- Composite PK required for partitioning
) PARTITION BY RANGE (transaction_date);

-- Create monthly partitions for 2026 (extend annually)
CREATE TABLE transactions_2026_01 PARTITION OF transactions FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE transactions_2026_02 PARTITION OF transactions FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE transactions_2026_03 PARTITION OF transactions FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE transactions_2026_04 PARTITION OF transactions FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE transactions_2026_05 PARTITION OF transactions FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE transactions_2026_06 PARTITION OF transactions FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE transactions_2026_07 PARTITION OF transactions FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE transactions_2026_08 PARTITION OF transactions FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE transactions_2026_09 PARTITION OF transactions FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE transactions_2026_10 PARTITION OF transactions FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE transactions_2026_11 PARTITION OF transactions FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE transactions_2026_12 PARTITION OF transactions FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Indexes (applied to all partitions)
CREATE INDEX idx_txn_beneficiary_date ON transactions(beneficiary_id, transaction_date);
CREATE INDEX idx_txn_dealer_date      ON transactions(dealer_id, transaction_date);
CREATE INDEX idx_txn_office_date      ON transactions(office_id, transaction_date);
CREATE INDEX idx_txn_status           ON transactions(transaction_status);
CREATE INDEX idx_txn_event_id         ON transactions(event_id);     -- Idempotency lookup
CREATE INDEX idx_txn_device           ON transactions(device_id);

COMMENT ON TABLE transactions IS
  'Core food distribution events. Append-only — no UPDATE after INSERT.
   event_id (UUID v4 from dealer device) is the idempotency key for offline sync deduplication.
   Partitioned by transaction_date (monthly) — pg_partman manages future partition creation.
   composite PK (transaction_id, transaction_date) required by PostgreSQL partitioning.
   All three checks (face, duplicate, quota) must have status=pass for transaction_status=accepted.';



-- ============================================================
--  C. OPERATIONAL DATA TABLES
--     High-velocity reads/writes. Redis-cached for performance.
--     Cleared/reset on schedule.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  12. DAILY_BENEFICIARY_INDEX
--      Real-time same-day duplicate prevention lookup.
--      Redis mirror maintained by Beneficiary Service.
--      PostgreSQL is source of truth; Redis is the fast path.
-- ────────────────────────────────────────────────────────────
CREATE TABLE daily_beneficiary_index (
  index_id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id             UUID          NOT NULL REFERENCES beneficiaries(beneficiary_id),
  office_id                  UUID          NOT NULL REFERENCES offices(office_id),
  dealer_id                  UUID          REFERENCES dealers(dealer_id),
  index_date                 DATE          NOT NULL,
  last_distribution_time     TIMESTAMP     NOT NULL,
  quantity_received_today_kg DECIMAL(10,2) NOT NULL,
  transaction_id             UUID,                        -- Link to transactions table

  UNIQUE (beneficiary_id, index_date)                    -- One record per beneficiary per day
);

CREATE INDEX idx_dbi_date         ON daily_beneficiary_index(index_date);
CREATE INDEX idx_dbi_beneficiary  ON daily_beneficiary_index(beneficiary_id);

-- Scheduled job: DELETE records older than 2 days (retain yesterday for reconciliation)
-- Run: DELETE FROM daily_beneficiary_index WHERE index_date < CURRENT_DATE - INTERVAL '2 days';

COMMENT ON TABLE daily_beneficiary_index IS
  'Fast lookup for same-day duplicate prevention. Populated on every accepted transaction.
   Redis cache (key: dbi:{beneficiary_id}:{date}) mirrors this table for sub-ms lookup.
   Unique constraint (beneficiary_id, index_date) enforces one lifting record per beneficiary per day.
   Purged nightly via scheduled job — retain yesterday for reconciliation only.';


-- ────────────────────────────────────────────────────────────
--  13. MONTHLY_QUOTA_TRACKING
-- ────────────────────────────────────────────────────────────
CREATE TABLE monthly_quota_tracking (
  quota_id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id        UUID          NOT NULL REFERENCES beneficiaries(beneficiary_id),
  office_id             UUID          NOT NULL REFERENCES offices(office_id),
  year_month            VARCHAR(7)    NOT NULL,           -- Format: 'YYYY-MM' e.g. '2026-03'
  monthly_limit_kg      DECIMAL(10,2) NOT NULL,
  total_consumed_kg     DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_kg          DECIMAL(10,2) GENERATED ALWAYS AS (monthly_limit_kg - total_consumed_kg) STORED,
  last_updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (beneficiary_id, year_month),
  CONSTRAINT mqt_consumed_ck    CHECK (total_consumed_kg >= 0),
  CONSTRAINT mqt_limit_ck       CHECK (monthly_limit_kg  >  0),
  CONSTRAINT mqt_year_month_ck  CHECK (year_month ~ '^[0-9]{4}-[0-9]{2}$')
);

CREATE INDEX idx_mqt_beneficiary   ON monthly_quota_tracking(beneficiary_id);
CREATE INDEX idx_mqt_year_month    ON monthly_quota_tracking(year_month);
CREATE INDEX idx_mqt_remaining     ON monthly_quota_tracking(remaining_kg);

COMMENT ON TABLE monthly_quota_tracking IS
  'Monthly quota consumption per beneficiary. Updated atomically on each accepted transaction.
   remaining_kg: generated column (monthly_limit_kg - total_consumed_kg).
   Redis cache (key: quota:{beneficiary_id}:{year_month}) mirrors this for sub-ms enforcement.
   Records kept for 13 months for year-on-year comparison in analytics.';



-- ============================================================
--  D. AUDIT DATA TABLE
--     Append-only. Application user has INSERT only.
--     No UPDATE or DELETE permissions granted.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  14. AUDIT_LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  audit_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_code     VARCHAR(40) NOT NULL UNIQUE,          -- e.g. AUD-1710870000-101
  user_id        UUID        NOT NULL REFERENCES users(user_id),
  action_type    VARCHAR(100) NOT NULL,                -- distribute, block, login, approve, suspend, ...
  entity_type    VARCHAR(100),                         -- transaction, dealer, beneficiary, user, ...
  entity_id      UUID,                                 -- PK of affected record
  old_values     JSONB,                                -- Snapshot before change
  new_values     JSONB,                                -- Snapshot after change
  result_status  VARCHAR(20) NOT NULL
                 CHECK (result_status IN ('success','blocked','failed','exception')),
  ip_address     INET,                                 -- Supports both IPv4 and IPv6
  user_agent     VARCHAR(500),
  device_id      VARCHAR(100),
  error_message  TEXT,
  created_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_timestamp   ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_action      ON audit_logs(action_type);
CREATE INDEX idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_result      ON audit_logs(result_status);
CREATE INDEX idx_audit_device      ON audit_logs(device_id);

-- !! CRITICAL: Revoke UPDATE and DELETE from application user
-- REVOKE UPDATE, DELETE ON audit_logs FROM oms_app_user;
-- This is enforced at DB user level — not just application code.

COMMENT ON TABLE audit_logs IS
  'Tamper-evident append-only audit trail. Records every state-changing action.
   CRITICAL: application DB user must have INSERT only on this table — no UPDATE, no DELETE.
   old_values / new_values: JSONB snapshots for field-level change tracking.
   action_type examples: distribute, block_duplicate, block_quota, login, logout, approve_dealer,
     suspend_dealer, register_beneficiary, exception_override, sync_batch, anomaly_flag.
   Exportable as CSV/PDF via Admin Dashboard for government oversight review.';



-- ============================================================
--  E. SESSION & SYNC DATA TABLES
--     Short retention. Purged by scheduled jobs.
-- ============================================================


-- ────────────────────────────────────────────────────────────
--  15. SESSIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE sessions (
  session_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(user_id),
  token_hash       VARCHAR(255) NOT NULL UNIQUE,        -- SHA-256 of JWT — not raw token
  device_id        VARCHAR(100),
  ip_address       INET,
  user_agent       VARCHAR(500),
  expires_at       TIMESTAMP   NOT NULL,
  created_at       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked          BOOLEAN     NOT NULL DEFAULT FALSE,
  revoked_at       TIMESTAMP,
  revoked_by       UUID        REFERENCES users(user_id)
);

CREATE INDEX idx_sessions_user       ON sessions(user_id);
CREATE INDEX idx_sessions_expires    ON sessions(expires_at);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_device     ON sessions(device_id);

-- Scheduled purge: DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '7 days';

COMMENT ON TABLE sessions IS
  'Active JWT session records. token_hash = SHA-256(JWT) — raw token never stored.
   revoked: admin can remotely invalidate sessions. Auth Service checks revoked=TRUE on every request.
   Device binding: dealer mobile tokens tied to device_id — mismatch triggers security alert.
   Purged 7 days after expiry by scheduled job.';


-- ────────────────────────────────────────────────────────────
--  16. SYNC_QUEUE
-- ────────────────────────────────────────────────────────────
CREATE TABLE sync_queue (
  queue_id       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id      UUID        NOT NULL REFERENCES dealers(dealer_id),
  device_id      VARCHAR(100) NOT NULL,
  event_id       UUID        NOT NULL UNIQUE,           -- Same UUID v4 from mobile transaction
  action_type    VARCHAR(50) NOT NULL
                 CHECK (action_type IN ('create_transaction','register_beneficiary','sync_quota')),
  payload        JSONB       NOT NULL,                  -- Full transaction payload
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','processing','acknowledged','conflicted','failed')),
  retry_count    SMALLINT    NOT NULL DEFAULT 0,
  conflict_reason VARCHAR(500),                         -- If status=conflicted: why
  error_message  TEXT,
  received_at    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  processed_at   TIMESTAMP,

  CONSTRAINT sync_retry_ck CHECK (retry_count BETWEEN 0 AND 5)
);

CREATE INDEX idx_sync_dealer     ON sync_queue(dealer_id);
CREATE INDEX idx_sync_status     ON sync_queue(status);
CREATE INDEX idx_sync_event      ON sync_queue(event_id);
CREATE INDEX idx_sync_received   ON sync_queue(received_at);

-- Scheduled purge: DELETE FROM sync_queue WHERE status IN ('acknowledged','failed') AND received_at < NOW() - INTERVAL '30 days';

COMMENT ON TABLE sync_queue IS
  'Offline transaction upload queue. Populated by POST /api/v1/transactions/sync.
   event_id (UUID v4) is the idempotency key — duplicate submissions are safely ignored.
   status lifecycle: pending → processing → acknowledged | conflicted | failed.
   conflicted: server-side validation failed (e.g. quota already exceeded) — flagged in dealer app UI.
   Max 5 retries (retry_count). After 5 failures, status=failed and admin is notified.
   Purged after 30 days for acknowledged/failed records.';



-- ============================================================
--  VIEWS — Governance intelligence shortcuts
-- ============================================================

-- Today's distribution summary (refreshed hourly as materialized view in production)
CREATE VIEW v_today_summary AS
  SELECT
    o.office_name,
    COUNT(*)                                  AS transaction_count,
    SUM(t.quantity_kg)                        AS total_kg_distributed,
    COUNT(DISTINCT t.beneficiary_id)          AS unique_beneficiaries,
    SUM(CASE WHEN t.transaction_status = 'blocked' THEN 1 ELSE 0 END) AS blocked_count,
    SUM(CASE WHEN t.face_verification_status = 'exception' THEN 1 ELSE 0 END) AS exception_count,
    SUM(CASE WHEN t.sync_source = 'offline_sync' THEN 1 ELSE 0 END) AS offline_sync_count
  FROM transactions t
  JOIN offices o ON t.office_id = o.office_id
  WHERE t.transaction_date = CURRENT_DATE
  GROUP BY o.office_id, o.office_name;

-- Dealer compliance snapshot
CREATE VIEW v_dealer_compliance AS
  SELECT
    d.dealer_code,
    d.dealer_name,
    d.compliance_score,
    d.status,
    COUNT(t.transaction_id)                   AS total_transactions_30d,
    AVG(t.face_confidence_score)              AS avg_face_confidence,
    SUM(CASE WHEN t.transaction_status = 'blocked' THEN 1 ELSE 0 END) AS blocked_attempts_30d
  FROM dealers d
  LEFT JOIN transactions t
    ON d.dealer_id = t.dealer_id
    AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY d.dealer_id, d.dealer_code, d.dealer_name, d.compliance_score, d.status;

-- Beneficiary quota status (for dashboard)
CREATE VIEW v_beneficiary_quota_current AS
  SELECT
    b.beneficiary_code,
    b.full_name,
    b.category,
    m.year_month,
    m.monthly_limit_kg,
    m.total_consumed_kg,
    m.remaining_kg,
    ROUND((m.total_consumed_kg / m.monthly_limit_kg) * 100, 1) AS utilization_pct,
    COALESCE(d.last_distribution_time, NULL)  AS last_lifted_at,
    CASE WHEN d.index_date = CURRENT_DATE THEN TRUE ELSE FALSE END AS lifted_today
  FROM beneficiaries b
  LEFT JOIN monthly_quota_tracking m
    ON b.beneficiary_id = m.beneficiary_id
    AND m.year_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
  LEFT JOIN daily_beneficiary_index d
    ON b.beneficiary_id = d.beneficiary_id
    AND d.index_date = CURRENT_DATE;



-- ============================================================
--  DATABASE USER PERMISSIONS
--  Run as superuser after schema creation
-- ============================================================

-- Application user (microservices connect as this user)
-- CREATE USER oms_app_user WITH PASSWORD '<<strong-password>>';
-- GRANT CONNECT ON DATABASE oms TO oms_app_user;
-- GRANT USAGE ON SCHEMA public TO oms_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO oms_app_user;
-- REVOKE UPDATE, DELETE ON audit_logs FROM oms_app_user;   -- Audit log: INSERT only
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO oms_app_user;

-- Read-only user (analytics, reporting, dashboard read paths)
-- CREATE USER oms_read_user WITH PASSWORD '<<strong-password>>';
-- GRANT CONNECT ON DATABASE oms TO oms_read_user;
-- GRANT USAGE ON SCHEMA public TO oms_read_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO oms_read_user;

-- Backup user
-- CREATE USER oms_backup_user WITH PASSWORD '<<strong-password>>';
-- GRANT CONNECT ON DATABASE oms TO oms_backup_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO oms_backup_user;



-- ============================================================
--  SAMPLE DATA — For testing and demonstration
-- ============================================================

-- Sample Division office (under national)
INSERT INTO offices (office_code, office_name, office_name_bn, office_type, parent_office_id)
SELECT 'DHK-DIV-001', 'Dhaka Division Food Office', 'ঢাকা বিভাগীয় খাদ্য অফিস', 'division', office_id
FROM offices WHERE office_code = 'BGD-NAT-001';

-- Sample District office
INSERT INTO offices (office_code, office_name, office_name_bn, office_type, parent_office_id)
SELECT 'DHK-DST-001', 'Dhaka District Food Office', 'ঢাকা জেলা খাদ্য অফিস', 'district', office_id
FROM offices WHERE office_code = 'DHK-DIV-001';

-- Sample OMS Program
-- (requires a super_user record to be created first — omitted for brevity)

-- ============================================================
--  END OF SCHEMA
--  OMS National Control Platform — Database Schema v1.0
--  Ministry of Food, Government of Bangladesh
--  March 2026 | CONFIDENTIAL
-- ============================================================
