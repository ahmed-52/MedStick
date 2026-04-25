'use client'
import type { ComponentType, ReactNode } from 'react'
import type { Lang } from '../lib/types'

export type ToolGroup = 'protocols' | 'patient' | 'attachments' | 'lookup' | 'modes' | 'language'

export interface ToolMessage {
  role: 'tool' | 'user' | 'assistant'
  content: string
  card?: ReactNode
  image_ids?: string[]
}

export interface ToolContext {
  lang: Lang
  activePatientId: string | null
  activeChatId: string | null
  appendInline: (msg: ToolMessage) => string
  replaceInline: (id: string, msg: ToolMessage) => void
  closeMenu: () => void
}

export interface Tool {
  id: string
  group: ToolGroup
  label: { en: string; ar: string }
  Form?: ComponentType<{ ctx: ToolContext; onClose: () => void }>
  run?: (ctx: ToolContext) => void | Promise<void>
}

const tools: Tool[] = []

export function registerTool(t: Tool) {
  if (tools.find((x) => x.id === t.id)) return
  tools.push(t)
}

export function getTools(): Tool[] {
  return tools
}
