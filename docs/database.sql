PRAGMA foreign_keys = ON;

-- Création de la table des comptes
CREATE TABLE IF NOT EXISTS t_account_acc (
  acc_id INTEGER PRIMARY KEY AUTOINCREMENT,
  acc_name VARCHAR(64) NOT NULL,
  acc_description TEXT,
  acc_type VARCHAR(32) NOT NULL
);

-- Création de la table des transactions
CREATE TABLE IF NOT EXISTS t_transaction_trn (
  trn_id INTEGER PRIMARY KEY AUTOINCREMENT,
  trn_date DATETIME NOT NULL DEFAULT (datetime('now')),
  trn_name VARCHAR(64)
);

-- Création de la table des mouvements
CREATE TABLE IF NOT EXISTS t_movement_mvt (
  mvt_id INTEGER PRIMARY KEY AUTOINCREMENT,
  mvt_debit DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
  mvt_credit DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
  mvt_transaction_id INTEGER NOT NULL REFERENCES t_transaction_trn(trn_id),
  mvt_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
);

-- Création de la vue des soldes des comptes
CREATE VIEW IF NOT EXISTS v_account_balance_abl AS
  SELECT
    acc.acc_id AS account_id,
    acc.acc_name AS account_name,
    SUM(mvt.mvt_debit) AS total_debit,
    SUM(mvt.mvt_credit) AS total_credit,
    SUM(mvt.mvt_debit) - SUM(mvt.mvt_credit) AS total_balance
  FROM t_account_acc AS acc
    LEFT JOIN t_movement_mvt AS mvt
        ON mvt.mvt_account_id = acc.acc_id
  GROUP BY acc.acc_id, acc.acc_name;

-- Création de la table des revenus
CREATE TABLE IF NOT EXISTS t_income_inc (
  inc_id INTEGER PRIMARY KEY AUTOINCREMENT,
  inc_name VARCHAR(64) NOT NULL, 
  inc_amount DECIMAL(10, 2) NOT NULL,
  inc_expect_date DATE NOT NULL,
  inc_description TEXT,
  inc_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
);


-- Création de la table des comptes bancaires
CREATE TABLE IF NOT EXISTS t_bank_account_bnk (
  bnk_id INTEGER PRIMARY KEY AUTOINCREMENT,
  bnk_name TEXT NOT NULL,
  bnk_description TEXT,
  bnk_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
);

-- Création de la table des catégories de dépenses
CREATE TABLE IF NOT EXISTS t_category_cat (
  cat_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cat_name TEXT NOT NULL,
  cat_color TEXT NOT NULL,
  cat_icon TEXT NOT NULL,
  cat_description TEXT,
  cat_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
);


-- Création de la table des envelopes
CREATE TABLE IF NOT EXISTS t_envelope_evp (
  evp_id INTEGER PRIMARY KEY AUTOINCREMENT,
  evp_name VARCHAR(64) NOT NULL,
  evp_due_date DATE NOT NULL,
  evp_target_amount DECIMAL(10,2) NOT NULL,
  evp_target_period TEXT NOT NULL,
  evp_description TEXT,
  evp_category_id INTEGER NOT NULL REFERENCES t_category_cat(cat_id),
  evp_account_id INTEGER NOT NULL REFERENCES t_account_acc(acc_id)
);

-- Création de la table des envelopes
CREATE TABLE IF NOT EXISTS t_settings_set (
  set_id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_name TEXT NOT NULL UNIQUE,
  set_value TEXT NOT NULL
);

--
-- Default Data
--
INSERT INTO t_account_acc (acc_name, acc_description, acc_type) VALUES ('Budget Used', '', 'Budget_Used');

INSERT OR IGNORE INTO t_settings_set (set_name, set_value)
  SELECT 'version', '1.0.0'
  WHERE NOT EXISTS (SELECT * FROM t_settings_set WHERE set_name = 'version');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Habitation' as cat_name, 'purple' as cat_color, 'home' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Habitation');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Alimentation' as cat_name, 'yellow' as cat_color, 'spoon' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Alimentation');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Loisirs' as cat_name, 'cyan' as cat_color, 'beer' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Loisirs');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Banque' as cat_name, 'orange' as cat_color, 'bank' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Banque');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Achats & Shopping' as cat_name, 'red' as cat_color, 'shopping-cart' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Achats & Shopping');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Transport' as cat_name, 'blue' as cat_color, 'car' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Transport');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Santé' as cat_name, 'green' as cat_color, 'heart' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Santé');

INSERT INTO t_category_cat (cat_name, cat_color, cat_icon )
  SELECT 'Autres' as cat_name, 'grey' as cat_color, 'home' as cat_icon
  WHERE NOT EXISTS (SELECT * FROM t_category_cat WHERE cat_name = 'Autres');
