PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS patients (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  dob          TEXT,
  age_years    INTEGER,
  sex          TEXT CHECK(sex IN ('m','f','other','unknown')),
  lang_pref    TEXT CHECK(lang_pref IN ('en','ar')) DEFAULT 'en',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);

CREATE TABLE IF NOT EXISTS chats (
  id           TEXT PRIMARY KEY,
  patient_id   TEXT,
  created_at   TEXT NOT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id           TEXT PRIMARY KEY,
  chat_id      TEXT NOT NULL,
  role         TEXT NOT NULL CHECK(role IN ('system','user','assistant','tool')),
  content      TEXT NOT NULL,
  image_ids    TEXT,
  created_at   TEXT NOT NULL,
  FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS encounters (
  id              TEXT PRIMARY KEY,
  patient_id      TEXT,
  chat_id         TEXT,
  mode            TEXT NOT NULL,
  soap_subjective TEXT,
  soap_objective  TEXT,
  soap_assessment TEXT,
  soap_plan       TEXT,
  red_flags       TEXT,
  raw_result      TEXT,
  created_at      TEXT NOT NULL,
  FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE SET NULL,
  FOREIGN KEY(chat_id)    REFERENCES chats(id)    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS photos (
  id           TEXT PRIMARY KEY,
  patient_id   TEXT,
  encounter_id TEXT,
  filepath     TEXT NOT NULL,
  mime         TEXT NOT NULL,
  width        INTEGER,
  height       INTEGER,
  caption      TEXT,
  created_at   TEXT NOT NULL,
  FOREIGN KEY(patient_id)   REFERENCES patients(id)   ON DELETE SET NULL,
  FOREIGN KEY(encounter_id) REFERENCES encounters(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS protocols (
  id           TEXT PRIMARY KEY,
  lang         TEXT NOT NULL CHECK(lang IN ('en','ar')),
  topic        TEXT NOT NULL,
  content      TEXT NOT NULL,
  source       TEXT NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_protocols_lang_topic ON protocols(lang, topic);
