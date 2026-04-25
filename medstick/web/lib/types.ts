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
  title?: string | null
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

export interface Document {
  id: string
  title: string
  source_path: string | null
  pdf_hash: string
  page_count: number
  lang: Lang
  created_at: string
}
