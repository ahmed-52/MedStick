import type { ReactNode } from 'react'
import { MessageSquare, Users, Library, Settings as SettingsIcon } from 'lucide-react'
import { useApp, type Surface } from '../store/app'
import { useI18n } from '../i18n/useI18n'
import { TopBar } from './TopBar'

interface NavItem {
  id: Surface
  label: string
  icon: ReactNode
}

export function Layout({ children }: { children: ReactNode }) {
  const surface = useApp((s) => s.surface)
  const setSurface = useApp((s) => s.setSurface)
  const { t } = useI18n()

  const items: NavItem[] = [
    { id: 'chat', label: t.nav.chat, icon: <MessageSquare size={20} /> },
    { id: 'patients', label: t.nav.patients, icon: <Users size={20} /> },
    { id: 'library', label: t.nav.library, icon: <Library size={20} /> },
    { id: 'settings', label: t.nav.settings, icon: <SettingsIcon size={20} /> },
  ]

  return (
    <div className="h-[100svh] flex flex-col md:flex-row bg-stone-50">
      <aside className="hidden md:flex w-56 flex-col border-e border-stone-200 bg-white">
        <div className="px-4 py-4 border-b border-stone-200">
          <div className="text-lg font-bold text-brand-700">{t.appName}</div>
          <div className="text-xs text-stone-500 mt-0.5">offline clinical AI</div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setSurface(it.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition ${
                surface === it.id
                  ? 'bg-brand-50 text-brand-800 font-semibold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {it.icon}
              <span>{it.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="md:hidden">
          <TopBar />
        </div>
        <div className="hidden md:block">
          <TopBar />
        </div>
        <main className="flex-1 min-h-0 overflow-hidden pb-16 md:pb-0">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 flex justify-around z-40 pb-[env(safe-area-inset-bottom)]">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => setSurface(it.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] ${
              surface === it.id ? 'text-brand-700' : 'text-stone-500'
            }`}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
