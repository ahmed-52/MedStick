import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '../../store/app'
import { api } from '../../lib/api'
import { downscaleImage } from '../../lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode } from './_modeBase'

const PROMPT = `You are a clinical laboratory technician reviewing a printed lab report image. Extract every visible test result as a JSON array of objects on the FIRST line, then write a one-line clinical summary on the SECOND line.

Format:
[{"test":"…","value":"…","units":"…","reference":"…","flag":"H|L|N"}, …]
Summary: <one sentence>

Use "N" for in-range, "H" for high, "L" for low. If reference range is not visible use "—". Do not output anything else.`

interface LabRow { test: string; value: string; units: string; reference: string; flag: string }

function parseLab(raw: string): { rows: LabRow[]; summary: string } {
  const trimmed = raw.trim()
  let rows: LabRow[] = []
  let summary = ''
  const firstLine = trimmed.split('\n').find((l) => l.trim().startsWith('['))
  if (firstLine) {
    try {
      const arr = JSON.parse(firstLine.slice(firstLine.indexOf('[')))
      if (Array.isArray(arr)) rows = arr
    } catch {}
  }
  const sm = trimmed.match(/Summary\s*:\s*(.+)/i)
  if (sm) summary = sm[1].trim()
  return { rows, summary }
}

function LabCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const { rows, summary } = parseLab(raw)
  return (
    <SpecialtyCard title="Lab report" emoji="🧪" imageIds={imageIds}>
      {rows.length === 0 ? (
        <Section label="Output" body={raw} />
      ) : (
        <>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-xs">
              <thead className="text-stone-500 uppercase text-[10px] tracking-wide">
                <tr>
                  <th className="text-start px-2 py-1">Test</th>
                  <th className="text-start px-2 py-1">Value</th>
                  <th className="text-start px-2 py-1">Units</th>
                  <th className="text-start px-2 py-1">Range</th>
                  <th className="text-start px-2 py-1">Flag</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-stone-100">
                    <td className="px-2 py-1 font-medium">{r.test}</td>
                    <td className="px-2 py-1">{r.value}</td>
                    <td className="px-2 py-1 text-stone-500">{r.units}</td>
                    <td className="px-2 py-1 text-stone-500">{r.reference}</td>
                    <td className="px-2 py-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.flag === 'H' ? 'bg-rose-100 text-rose-700' :
                        r.flag === 'L' ? 'bg-amber-100 text-amber-700' :
                        'bg-stone-100 text-stone-600'
                      }`}>{r.flag}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {summary && <Section label="Summary" body={summary} />}
        </>
      )}
    </SpecialtyCard>
  )
}

function LabForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const [busy, setBusy] = useState(false)

  const pickAndRun = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    ;(input as any).capture = 'environment'
    const file: File | null = await new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.click()
    })
    if (!file) return
    setBusy(true)
    try {
      const blob = await downscaleImage(file)
      const photo = await api.uploadPhoto(blob, file.name, {
        patient_id: ctx.activePatientId ?? undefined,
      })
      onClose()
      await runSpecialtyMode(ctx, {
        mode: 'lab',
        title: 'Lab report',
        emoji: '🧪',
        systemPrompt: PROMPT,
        imageIds: [photo.id],
        parser: (raw) => <LabCard raw={raw} imageIds={[photo.id]} />,
      })
    } finally {
      setBusy(false)
    }
  }

  const useStaged = async () => {
    if (stagedPhotoIds.length === 0) return
    onClose()
    await runSpecialtyMode(ctx, {
      mode: 'lab',
      title: 'Lab report',
      emoji: '🧪',
      systemPrompt: PROMPT,
      imageIds: [stagedPhotoIds[0]],
      parser: (raw) => <LabCard raw={raw} imageIds={[stagedPhotoIds[0]]} />,
    })
  }

  return (
    <div className="space-y-2">
      <button onClick={pickAndRun} disabled={busy}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Pick lab image
      </button>
      {stagedPhotoIds.length > 0 && (
        <button onClick={useStaged}
          className="w-full rounded-lg bg-stone-100 text-stone-800 py-2.5 text-sm font-semibold hover:bg-stone-200">
          Use staged photo
        </button>
      )}
    </div>
  )
}

registerTool({
  id: 'lab',
  group: 'modes',
  label: { en: 'Lab report', ar: 'تقرير مختبر' },
  Form: LabForm,
})

export { LabCard }
