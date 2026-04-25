import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'

interface Drug {
  name: string
  perKg: number
  units: 'mg' | 'ml'
  freq: string
  notes: string
}

const DRUGS: Drug[] = [
  { name: 'Paracetamol', perKg: 15, units: 'mg', freq: 'every 6 hours', notes: 'Max 60 mg/kg/day' },
  { name: 'Amoxicillin', perKg: 25, units: 'mg', freq: 'twice daily for 5 days', notes: 'Pneumonia, otitis media' },
  { name: 'Ibuprofen', perKg: 10, units: 'mg', freq: 'every 8 hours', notes: 'Avoid <6 months' },
  { name: 'ORS', perKg: 75, units: 'ml', freq: 'over 4 hours', notes: 'Plan B for some dehydration' },
  { name: 'Zinc', perKg: 0, units: 'mg', freq: 'once daily for 14 days', notes: '10 mg if <6mo, 20 mg if ≥6mo' },
]

function DoseCard({ drug, weight, dose }: { drug: Drug; weight: number; dose: number | null }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm space-y-2">
      <div className="font-bold text-brand-700 text-base">{drug.name}</div>
      {dose != null && (
        <div className="text-2xl font-bold text-stone-900">
          {dose.toFixed(1)} {drug.units}
          <span className="text-sm font-normal text-stone-500 ms-2">per dose</span>
        </div>
      )}
      <div className="text-stone-700">For {weight} kg · {drug.perKg} {drug.units}/kg · {drug.freq}</div>
      <div className="text-xs text-stone-500">{drug.notes}</div>
      <div className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded">
        ⚠ Verify dose against current local protocol before administering.
      </div>
    </div>
  )
}

function DrugDoseForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const [drugIdx, setDrugIdx] = useState(0)
  const [weight, setWeight] = useState('')

  const submit = () => {
    const drug = DRUGS[drugIdx]
    const w = Number(weight)
    if (!w || w <= 0) return
    const dose = drug.perKg > 0 ? drug.perKg * w : null
    ctx.appendInline({
      role: 'tool',
      content: '',
      card: <DoseCard drug={drug} weight={w} dose={dose} />,
    })
    onClose()
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1">Drug</label>
        <select value={drugIdx} onChange={(e) => setDrugIdx(Number(e.target.value))}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white">
          {DRUGS.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-stone-600 mb-1">Weight (kg)</label>
        <input
          autoFocus
          type="number"
          step="0.1"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      <button onClick={submit} disabled={!weight}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Calculate
      </button>
    </div>
  )
}

registerTool({
  id: 'drugDose',
  group: 'lookup',
  label: { en: 'Drug dose', ar: 'جرعة دواء' },
  Form: DrugDoseForm,
})
