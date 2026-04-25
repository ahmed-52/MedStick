'use client'
import { registerTool } from '../ToolRegistry'
import { useApp } from '@/store/app'

registerTool({
  id: 'clearPatient',
  group: 'patient',
  label: { en: 'Clear patient context', ar: 'مسح سياق المريض' },
  run: (ctx) => {
    useApp.getState().setActivePatient(null)
    useApp.getState().setActiveChat(null)
    ctx.appendInline({ role: 'tool', content: 'Patient context cleared' })
  },
})
