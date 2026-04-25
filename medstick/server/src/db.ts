import Database from 'better-sqlite3'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

export type DB = Database.Database

export type Sex = 'm' | 'f' | 'other' | 'unknown'
export type Lang = 'en' | 'ar'
export type Role = 'system' | 'user' | 'assistant' | 'tool'
export type EncounterMode = 'chat' | 'xray' | 'compare' | 'derm' | 'lab' | 'locate'

export interface Patient {
  id: string
  name: string
  dob: string | null
  age_years: number | null
  sex: Sex
  lang_pref: Lang
  created_at: string
  updated_at: string
}

export interface Chat {
  id: string
  patient_id: string | null
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: Role
  content: string
  image_ids: string | null
  created_at: string
}

export interface Encounter {
  id: string
  patient_id: string | null
  chat_id: string | null
  mode: EncounterMode
  soap_subjective: string | null
  soap_objective: string | null
  soap_assessment: string | null
  soap_plan: string | null
  red_flags: string | null
  raw_result: string | null
  created_at: string
}

export interface Photo {
  id: string
  patient_id: string | null
  encounter_id: string | null
  filepath: string
  mime: string
  width: number | null
  height: number | null
  caption: string | null
  created_at: string
}

export interface Protocol {
  id: string
  lang: Lang
  topic: string
  content: string
  source: string
  created_at: string
}

const now = () => new Date().toISOString()

export function openDb(path: string): DB {
  const db = new Database(path)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  const sql = readFileSync(join(__dirname, 'init.sql'), 'utf-8')
  db.exec(sql)
  return db
}

// ---------- patients ----------

export function createPatient(db: DB, input: {
  name: string
  dob?: string | null
  age_years?: number | null
  sex?: Sex
  lang_pref?: Lang
}): Patient {
  const p: Patient = {
    id: randomUUID(),
    name: input.name,
    dob: input.dob ?? null,
    age_years: input.age_years ?? null,
    sex: input.sex ?? 'unknown',
    lang_pref: input.lang_pref ?? 'en',
    created_at: now(),
    updated_at: now(),
  }
  db.prepare(`INSERT INTO patients (id, name, dob, age_years, sex, lang_pref, created_at, updated_at)
    VALUES (@id, @name, @dob, @age_years, @sex, @lang_pref, @created_at, @updated_at)`).run(p)
  return p
}

export function getPatient(db: DB, id: string): Patient | null {
  return (db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as Patient | undefined) ?? null
}

export function listPatients(db: DB, opts: { q?: string } = {}): Patient[] {
  if (opts.q) {
    return db.prepare(`SELECT * FROM patients WHERE name LIKE ? COLLATE NOCASE ORDER BY updated_at DESC`)
      .all(`%${opts.q}%`) as Patient[]
  }
  return db.prepare('SELECT * FROM patients ORDER BY updated_at DESC').all() as Patient[]
}

export function updatePatient(db: DB, id: string, patch: Partial<Patient>): Patient | null {
  const cur = getPatient(db, id)
  if (!cur) return null
  const next: Patient = { ...cur, ...patch, id, updated_at: now() }
  db.prepare(`UPDATE patients SET name=@name, dob=@dob, age_years=@age_years, sex=@sex,
    lang_pref=@lang_pref, updated_at=@updated_at WHERE id=@id`).run(next)
  return next
}

export function deletePatient(db: DB, id: string): void {
  db.prepare('DELETE FROM patients WHERE id = ?').run(id)
}

// ---------- chats ----------

export function createChat(db: DB, patient_id: string | null = null): Chat {
  const c: Chat = { id: randomUUID(), patient_id, created_at: now() }
  db.prepare('INSERT INTO chats (id, patient_id, created_at) VALUES (@id, @patient_id, @created_at)').run(c)
  return c
}

export function getChat(db: DB, id: string): Chat | null {
  return (db.prepare('SELECT * FROM chats WHERE id = ?').get(id) as Chat | undefined) ?? null
}

export function listChats(db: DB, opts: { patient_id?: string } = {}): Chat[] {
  if (opts.patient_id) {
    return db.prepare('SELECT * FROM chats WHERE patient_id = ? ORDER BY created_at DESC').all(opts.patient_id) as Chat[]
  }
  return db.prepare('SELECT * FROM chats ORDER BY created_at DESC').all() as Chat[]
}

export function appendMessage(db: DB, msg: {
  chat_id: string
  role: Role
  content: string
  image_ids?: string | null
}): Message {
  const m: Message = {
    id: randomUUID(),
    chat_id: msg.chat_id,
    role: msg.role,
    content: msg.content,
    image_ids: msg.image_ids ?? null,
    created_at: now(),
  }
  db.prepare(`INSERT INTO messages (id, chat_id, role, content, image_ids, created_at)
    VALUES (@id, @chat_id, @role, @content, @image_ids, @created_at)`).run(m)
  return m
}

export function listMessages(db: DB, chat_id: string): Message[] {
  return db.prepare('SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC').all(chat_id) as Message[]
}

// ---------- encounters ----------

export function createEncounter(db: DB, input: {
  patient_id?: string | null
  chat_id?: string | null
  mode: EncounterMode
  soap_subjective?: string | null
  soap_objective?: string | null
  soap_assessment?: string | null
  soap_plan?: string | null
  red_flags?: string | null
  raw_result?: string | null
}): Encounter {
  const e: Encounter = {
    id: randomUUID(),
    patient_id: input.patient_id ?? null,
    chat_id: input.chat_id ?? null,
    mode: input.mode,
    soap_subjective: input.soap_subjective ?? null,
    soap_objective: input.soap_objective ?? null,
    soap_assessment: input.soap_assessment ?? null,
    soap_plan: input.soap_plan ?? null,
    red_flags: input.red_flags ?? null,
    raw_result: input.raw_result ?? null,
    created_at: now(),
  }
  db.prepare(`INSERT INTO encounters
    (id, patient_id, chat_id, mode, soap_subjective, soap_objective, soap_assessment, soap_plan, red_flags, raw_result, created_at)
    VALUES (@id, @patient_id, @chat_id, @mode, @soap_subjective, @soap_objective, @soap_assessment, @soap_plan, @red_flags, @raw_result, @created_at)`).run(e)
  return e
}

export function listEncounters(db: DB, opts: { patient_id?: string } = {}): Encounter[] {
  if (opts.patient_id) {
    return db.prepare('SELECT * FROM encounters WHERE patient_id = ? ORDER BY created_at DESC').all(opts.patient_id) as Encounter[]
  }
  return db.prepare('SELECT * FROM encounters ORDER BY created_at DESC').all() as Encounter[]
}

// ---------- photos ----------

export function createPhoto(db: DB, input: {
  patient_id?: string | null
  encounter_id?: string | null
  filepath: string
  mime: string
  width?: number | null
  height?: number | null
  caption?: string | null
}): Photo {
  const ph: Photo = {
    id: randomUUID(),
    patient_id: input.patient_id ?? null,
    encounter_id: input.encounter_id ?? null,
    filepath: input.filepath,
    mime: input.mime,
    width: input.width ?? null,
    height: input.height ?? null,
    caption: input.caption ?? null,
    created_at: now(),
  }
  db.prepare(`INSERT INTO photos
    (id, patient_id, encounter_id, filepath, mime, width, height, caption, created_at)
    VALUES (@id, @patient_id, @encounter_id, @filepath, @mime, @width, @height, @caption, @created_at)`).run(ph)
  return ph
}

export function getPhoto(db: DB, id: string): Photo | null {
  return (db.prepare('SELECT * FROM photos WHERE id = ?').get(id) as Photo | undefined) ?? null
}

export function listPhotosForPatient(db: DB, patient_id: string): Photo[] {
  return db.prepare('SELECT * FROM photos WHERE patient_id = ? ORDER BY created_at DESC').all(patient_id) as Photo[]
}

// ---------- protocols ----------

function normalize(s: string): string {
  return s
    .replace(/[ً-ْٰ]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
}

export function insertProtocol(db: DB, input: {
  lang: Lang
  topic: string
  content: string
  source: string
}): Protocol {
  const p: Protocol = {
    id: randomUUID(),
    lang: input.lang,
    topic: input.topic,
    content: input.content,
    source: input.source,
    created_at: now(),
  }
  db.prepare(`INSERT INTO protocols (id, lang, topic, content, source, created_at)
    VALUES (@id, @lang, @topic, @content, @source, @created_at)`).run(p)
  return p
}

export function countProtocols(db: DB): number {
  return (db.prepare('SELECT COUNT(*) as c FROM protocols').get() as { c: number }).c
}

export function searchProtocols(db: DB, q: string, lang: Lang, limit = 3): Protocol[] {
  const all = db.prepare('SELECT * FROM protocols WHERE lang = ?').all(lang) as Protocol[]
  const nq = normalize(q)
  if (!nq) return []
  const tokens = nq.split(/\s+/).filter(Boolean)
  const scored = all.map(p => {
    const haystack = normalize(`${p.topic} ${p.content}`)
    let score = 0
    for (const t of tokens) {
      if (haystack.includes(t)) score++
    }
    return { p, score }
  })
  return scored.filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.p)
}
