'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Document, Lang } from '../lib/types'

export type Surface = 'chat' | 'patients' | 'library' | 'settings'

interface AppState {
  lang: Lang
  surface: Surface
  activePatientId: string | null
  activeChatId: string | null
  viewingPatientId: string | null
  stagedPhotoIds: string[]
  pendingTool: string | null
  pendingPrompt: string | null
  chatListVersion: number
  activeDocs: Document[]

  setLang: (l: Lang) => void
  setSurface: (s: Surface) => void
  setActivePatient: (id: string | null) => void
  setActiveChat: (id: string | null) => void
  setViewingPatient: (id: string | null) => void
  addStagedPhoto: (id: string) => void
  removeStagedPhoto: (id: string) => void
  clearStagedPhotos: () => void
  setPendingTool: (id: string | null) => void
  setPendingPrompt: (text: string | null) => void
  bumpChatList: () => void
  setActiveDocs: (docs: Document[]) => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      surface: 'chat',
      activePatientId: null,
      activeChatId: null,
      viewingPatientId: null,
      stagedPhotoIds: [],
      pendingTool: null,
      pendingPrompt: null,
      chatListVersion: 0,
      activeDocs: [],

      setLang: (lang) => {
        document.documentElement.lang = lang
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        set({ lang })
      },
      setSurface: (surface) => set({ surface }),
      setActivePatient: (activePatientId) => set({ activePatientId }),
      setActiveChat: (activeChatId) => set({ activeChatId }),
      setViewingPatient: (viewingPatientId) => set({ viewingPatientId }),
      addStagedPhoto: (id) =>
        set((s) => ({ stagedPhotoIds: [...s.stagedPhotoIds, id] })),
      removeStagedPhoto: (id) =>
        set((s) => ({ stagedPhotoIds: s.stagedPhotoIds.filter((x) => x !== id) })),
      clearStagedPhotos: () => set({ stagedPhotoIds: [] }),
      setPendingTool: (pendingTool) => set({ pendingTool }),
      setPendingPrompt: (pendingPrompt) => set({ pendingPrompt }),
      bumpChatList: () => set((s) => ({ chatListVersion: s.chatListVersion + 1 })),
      setActiveDocs: (activeDocs) => set({ activeDocs }),
    }),
    {
      name: 'medstick-app',
      partialize: (s) => ({
        lang: s.lang,
        activePatientId: s.activePatientId,
        activeChatId: s.activeChatId,
      }),
    },
  ),
)

// initialize <html dir> on first load
if (typeof document !== 'undefined') {
  const initial = useApp.getState().lang
  document.documentElement.lang = initial
  document.documentElement.dir = initial === 'ar' ? 'rtl' : 'ltr'
}
