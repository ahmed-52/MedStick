'use client'
import type { ComponentType } from 'react'
import {
  RiPulseLine,
  RiSwap2Line,
  RiScanLine,
  RiTestTubeLine,
  RiMapPin2Line,
  RiUserAddLine,
  RiUserSearchLine,
  RiUserUnfollowLine,
  RiSaveLine,
  RiImageAddLine,
  RiBookOpenLine,
  RiCapsuleLine,
  RiVirusLine,
} from '@remixicon/react'

export interface ToolStyle {
  icon: ComponentType<{ className?: string }>
  bg: string
  fg: string
}

// Per-tool icon + color identity. The same map drives the chat composer's
// tools menu and the dashboard tile/mode-list rows so they stay in sync.
export const TOOL_STYLES: Record<string, ToolStyle> = {
  // protocols (top of the menu — WHO-blue brand identity for grounded RAG)
  cholera:        { icon: RiVirusLine,        bg: '#e6f4fb', fg: '#00669e' },
  // modes
  xray:           { icon: RiPulseLine,        bg: '#dbeafe', fg: '#2563eb' },
  compareXrays:   { icon: RiSwap2Line,        bg: '#e0e7ff', fg: '#4f46e5' },
  derm:           { icon: RiScanLine,         bg: '#ffe4e6', fg: '#e11d48' },
  lab:            { icon: RiTestTubeLine,     bg: '#fef3c7', fg: '#d97706' },
  locate:         { icon: RiMapPin2Line,      bg: '#d1fae5', fg: '#059669' },
  // patient
  newPatient:     { icon: RiUserAddLine,      bg: '#ede9fe', fg: '#7c3aed' },
  loadPatient:    { icon: RiUserSearchLine,   bg: '#cffafe', fg: '#0891b2' },
  clearPatient:   { icon: RiUserUnfollowLine, bg: '#f1f5f9', fg: '#475569' },
  saveEncounter:  { icon: RiSaveLine,         bg: '#ccfbf1', fg: '#0d9488' },
  // attachments
  attachPhoto:    { icon: RiImageAddLine,     bg: '#e0f2fe', fg: '#0284c7' },
  // lookup
  searchProtocol: { icon: RiBookOpenLine,     bg: '#fef3c7', fg: '#b45309' },
  drugDose:       { icon: RiCapsuleLine,      bg: '#fee2e2', fg: '#dc2626' },
}

export const FALLBACK_TOOL_STYLE: ToolStyle = {
  icon: RiBookOpenLine,
  bg: '#e6f4fb',
  fg: '#00669e',
}

export function getToolStyle(id: string): ToolStyle {
  return TOOL_STYLES[id] ?? FALLBACK_TOOL_STYLE
}
