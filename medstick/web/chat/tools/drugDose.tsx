'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
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
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-sm space-y-2 shadow-regular-xs">
      <div className="text-primary-base font-bold text-base">{drug.name}</div>
      {dose != null && (
        <div className="text-2xl font-bold text-text-strong-950">
          {dose.toFixed(1)} {drug.units}
          <span className="text-sm font-normal text-text-soft-400 ms-2">per dose</span>
        </div>
      )}
      <div className="text-text-sub-600">For {weight} kg · {drug.perKg} {drug.units}/kg · {drug.freq}</div>
      <div className="text-xs text-text-soft-400">{drug.notes}</div>
      <div className="text-[10px] text-warning-dark bg-warning-lighter px-2 py-1 rounded">
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

  const fc =
    'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base'

  return (
    <div className="space-y-2.5">
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] uppercase tracking-wider font-semibold">Drug</label>
        <select value={drugIdx} onChange={(e) => setDrugIdx(Number(e.target.value))} className={fc}>
          {DRUGS.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] uppercase tracking-wider font-semibold">Weight (kg)</label>
        <input
          autoFocus
          type="number"
          step="0.1"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={fc}
        />
      </div>
      <Button.Root onClick={submit} disabled={!weight} className="w-full">
        Calculate
      </Button.Root>
    </div>
  )
}

registerTool({
  id: 'drugDose',
  group: 'lookup',
  label: { en: 'Drug dose', ar: 'جرعة دواء' },
  Form: DrugDoseForm,
})
