/**
 * Seed a small set of realistic demo patients (English UI, Arabic-origin
 * transliterated names). Idempotent — skips any name already in the DB.
 *
 *   npm --prefix server run seed:patients
 */
import { resolve } from 'node:path'
import * as db from '../db.js'

interface SeedPatient {
  name: string
  age_years: number
  sex: 'm' | 'f'
}

const PATIENTS: SeedPatient[] = [
  { name: 'Ahmed Al-Mansour',    age_years: 34, sex: 'm' },
  { name: 'Fatima Hassan',        age_years: 28, sex: 'f' },
  { name: 'Yusuf Khalid',         age_years: 5,  sex: 'm' },
  { name: 'Layla Ibrahim',        age_years: 67, sex: 'f' },
  { name: 'Omar Nasser',          age_years: 12, sex: 'm' },
  { name: 'Mariam Al-Sayed',      age_years: 41, sex: 'f' },
  { name: 'Khalid Al-Najjar',     age_years: 56, sex: 'm' },
  { name: 'Nour El-Din',          age_years: 1,  sex: 'f' },
  { name: 'Hassan Al-Rashid',     age_years: 72, sex: 'm' },
  { name: 'Zainab Saleh',         age_years: 23, sex: 'f' },
  { name: 'Tariq Mahmoud',        age_years: 45, sex: 'm' },
  { name: 'Aisha Karim',          age_years: 3,  sex: 'f' },
]

async function main() {
  const dataDir = resolve(
    process.env.DATA_DIR ?? new URL('../../../data', import.meta.url).pathname,
  )
  const d = db.openDb(resolve(dataDir, 'medstick.db'))

  const existing = new Set(db.listPatients(d).map((p) => p.name.toLowerCase()))
  let added = 0
  let skipped = 0
  for (const p of PATIENTS) {
    if (existing.has(p.name.toLowerCase())) {
      skipped++
      continue
    }
    db.createPatient(d, {
      name: p.name,
      age_years: p.age_years,
      sex: p.sex,
      lang_pref: 'en',
    })
    added++
  }

  console.log(`✓ patients: +${added} added, ${skipped} already present (total ${existing.size + added})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
