'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  RiAddLine,
  RiArrowRightLine,
  RiChat3Line,
  RiShieldCheckLine,
  RiVirusLine,
  RiWifiOffLine,
} from '@remixicon/react'
import { useApp } from '@/store/app'
import { useFetch } from '@/lib/useFetch'
import { api } from '@/lib/api'
import { Tile } from './Tile'
import { ModeListItem } from './ModeListItem'
import { ConsultActivityCard } from './ConsultActivityCard'
import { AskMedstickCard } from './AskMedstickCard'
import { downscaleImage } from '@/lib/image'
import { TOOL_STYLES } from '@/chat/toolStyles'
import '@/chat/tools'

function CholeraHeroTile() {
  const router = useRouter()
  const setPendingTool = useApp((s) => s.setPendingTool)
  const handleClick = () => {
    setPendingTool('cholera')
    router.push('/chat')
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative flex w-full items-stretch overflow-hidden rounded-2xl border border-[var(--color-who-blue)] bg-[var(--color-who-blue)] text-start text-white clinical-press transition-colors hover:bg-[var(--color-who-blue-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-who-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-who-canvas)]"
    >
      <div className="flex flex-1 flex-col gap-2.5 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <RiVirusLine className="size-6" />
          </span>
          <div className="min-w-0">
            <div className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-white/75 mb-1">
              Outbreak protocol · Number one
            </div>
            <h2 className="font-headline text-[22px] md:text-[26px] leading-tight text-balance">
              Cholera response — grounded in the WHO field manual
            </h2>
            <p className="mt-1 text-[12.5px] md:text-[13px] text-white/85 leading-snug max-w-[60ch]">
              Attach the manual to a new chat and ask about case definition, severity, ORS, IV resuscitation, antibiotics, or contact tracing. Replies cite the source section.
            </p>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white px-3 py-2 text-[13px] font-semibold text-[var(--color-who-blue-deep)] md:ml-4">
          Start cholera consult
          <RiArrowRightLine className="size-4" />
        </div>
      </div>
    </button>
  )
}

function ModelDot() {
  const [online, setOnline] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    const check = async () => {
      try {
        const r = await api.health()
        if (alive) setOnline(r.llama)
      } catch {
        if (alive) setOnline(false)
      }
    }
    check()
    const id = setInterval(check, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])
  const cls =
    online === null
      ? 'bg-[var(--color-who-ink-mute)]'
      : online
        ? 'bg-[var(--color-who-ok)]'
        : 'bg-[var(--color-who-err)]'
  const label = online === null ? 'Checking inference…' : online ? 'On-device inference ready' : 'Inference offline'
  return (
    <span className="inline-flex items-center gap-2 text-[12px] font-medium text-[var(--color-who-ink-soft)] font-tabular">
      <span className={`size-2 rounded-full ${cls}`} />
      {label}
    </span>
  )
}

function StatusBar() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11.5px] text-[var(--color-who-ink-soft)] font-medium">
      <ModelDot />
      <span className="inline-flex items-center gap-1.5">
        <RiShieldCheckLine className="size-3.5 text-[var(--color-who-blue-deep)]" />
        WHO IMCI corpus loaded
      </span>
      <span className="inline-flex items-center gap-1.5">
        <RiWifiOffLine className="size-3.5 text-[var(--color-who-ink-mute)]" />
        No network required
      </span>
    </div>
  )
}

function ActivePatientPill() {
  const id = useApp((s) => s.activePatientId)
  const setViewing = useApp((s) => s.setViewingPatient)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const router = useRouter()
  const { data: p } = useFetch(
    () => (id ? api.getPatient(id) : Promise.resolve(null)),
    [id],
  )
  if (!id || !p) return null
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-white border border-[var(--color-who-ring)] px-2.5 py-1.5">
      <span className="size-5 rounded-sm bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)] flex items-center justify-center text-[10px] font-bold">
        {p.name.slice(0, 2).toUpperCase()}
      </span>
      <button
        onClick={() => {
          setViewing(p.id)
          router.push('/patients')
        }}
        className="text-[12.5px] font-semibold text-[var(--color-who-ink)] hover:text-[var(--color-who-blue-deep)] hover:underline"
      >
        {p.name}
      </button>
      {p.age_years != null && (
        <span className="text-[11.5px] text-[var(--color-who-ink-mute)] font-tabular">{p.age_years}y</span>
      )}
      <button
        onClick={() => {
          setActive(null)
          setActiveChat(null)
        }}
        className="text-[14px] text-[var(--color-who-ink-mute)] hover:text-[var(--color-who-ink)] ms-0.5 leading-none"
        aria-label="clear"
      >
        ×
      </button>
    </span>
  )
}

export function HomeScreen() {
  const router = useRouter()
  const activePatientId = useApp((s) => s.activePatientId)
  const activeChatId = useApp((s) => s.activeChatId)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const addStaged = useApp((s) => s.addStagedPhoto)
  const clearStaged = useApp((s) => s.clearStagedPhotos)

  const newConsult = () => {
    setActiveChat(null)
    clearStaged()
    router.push('/chat')
  }

  const uploadImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = false
    ;(input as any).capture = 'environment'
    input.onchange = async () => {
      const f = input.files?.[0]
      if (!f) return
      try {
        const blob = await downscaleImage(f, 1024, 0.85)
        const photo = await api.uploadPhoto(blob, f.name, {
          patient_id: activePatientId ?? undefined,
        })
        addStaged(photo.id)
        router.push('/chat')
      } catch (e) {
        window.alert(`Upload failed: ${String(e)}`)
      }
    }
    input.click()
  }

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-[var(--color-who-canvas)] lg:border-[var(--color-who-ring)] relative flex h-full flex-col overflow-y-auto lg:rounded-2xl lg:border lg:py-4 lg:pr-5 lg:pl-6 px-4 py-4">
        <div className="max-w-6xl w-full mx-auto flex flex-col gap-4 md:gap-5">
          {/* ── Institutional header ── */}
          <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 pt-1">
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-[0.22em] font-semibold text-[var(--color-who-ink-mute)] mb-1.5">
                MedStick · Clinical Console
              </p>
              <h1 className="font-headline text-[var(--color-who-navy)] text-[26px] md:text-[30px] lg:text-[34px] text-balance">
                Offline AI workspace
              </h1>

            </div>
            <button
              onClick={newConsult}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-[var(--color-who-blue)] hover:bg-[var(--color-who-blue-hover)] px-4 py-2.5 text-white font-semibold clinical-press text-[13.5px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-who-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-who-canvas)]"
            >
              <RiAddLine className="size-4" />
              New consult
            </button>
          </header>

          {/* ── Featured outbreak protocol — number one CTA ── */}
          <CholeraHeroTile />

          {/* ── Activity chart (left) + Mode list (right) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="lg:col-span-3 h-[320px] md:h-[360px]">
              <ConsultActivityCard />
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <div className="flex items-baseline justify-between mb-2 px-0.5">
                <h2 className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[var(--color-who-ink-mute)]">
                  Diagnostic modes
                </h2>
                <span className="text-[10.5px] text-[var(--color-who-ink-mute)] font-tabular">5 available</span>
              </div>
              <div className="bg-white border border-[var(--color-who-ring)] rounded-2xl overflow-hidden flex flex-col">
                <ModeListItem
                  title="Image consultation"
                  blurb="Attach an image and pick how to read it"
                  icon={TOOL_STYLES.attachPhoto.icon}
                  iconBg={TOOL_STYLES.attachPhoto.bg}
                  iconColor={TOOL_STYLES.attachPhoto.fg}
                  badge="Primary"
                  onClick={uploadImage}
                />
                <ModeListItem
                  title="Chest X-ray"
                  blurb="Findings · impression · action"
                  icon={TOOL_STYLES.xray.icon}
                  iconBg={TOOL_STYLES.xray.bg}
                  iconColor={TOOL_STYLES.xray.fg}
                  pendingTool="xray"
                />
                <ModeListItem
                  title="Dermatology"
                  blurb="ABCDE · morphology"
                  icon={TOOL_STYLES.derm.icon}
                  iconBg={TOOL_STYLES.derm.bg}
                  iconColor={TOOL_STYLES.derm.fg}
                  pendingTool="derm"
                />
                <ModeListItem
                  title="Lab report"
                  blurb="Structured results · flags"
                  icon={TOOL_STYLES.lab.icon}
                  iconBg={TOOL_STYLES.lab.bg}
                  iconColor={TOOL_STYLES.lab.fg}
                  pendingTool="lab"
                />
                <ModeListItem
                  title="X-ray comparison"
                  blurb="Prior vs. current study"
                  icon={TOOL_STYLES.compareXrays.icon}
                  iconBg={TOOL_STYLES.compareXrays.bg}
                  iconColor={TOOL_STYLES.compareXrays.fg}
                  pendingTool="compareXrays"
                />
              </div>
            </div>
          </section>

          {/* ── Ask MedStick AI ── */}
          <section>
            <AskMedstickCard />
          </section>

          {/* ── Patient & reference tools ── */}
          <section>
            <div className="flex items-baseline justify-between mb-2 px-0.5">
              <h2 className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[var(--color-who-ink-mute)]">
                Patient · Reference
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-2.5">
              <Tile
                size="micro"
                title="New patient"
                icon={TOOL_STYLES.newPatient.icon}
                iconBg={TOOL_STYLES.newPatient.bg}
                iconColor={TOOL_STYLES.newPatient.fg}
                pendingTool="newPatient"
              />
              <Tile
                size="micro"
                title="Find patient"
                icon={TOOL_STYLES.loadPatient.icon}
                iconBg={TOOL_STYLES.loadPatient.bg}
                iconColor={TOOL_STYLES.loadPatient.fg}
                pendingTool="loadPatient"
              />
              <Tile
                size="micro"
                title="Search guidelines"
                icon={TOOL_STYLES.searchProtocol.icon}
                iconBg={TOOL_STYLES.searchProtocol.bg}
                iconColor={TOOL_STYLES.searchProtocol.fg}
                pendingTool="searchProtocol"
              />
              <Tile
                size="micro"
                title="Drug dose"
                icon={TOOL_STYLES.drugDose.icon}
                iconBg={TOOL_STYLES.drugDose.bg}
                iconColor={TOOL_STYLES.drugDose.fg}
                pendingTool="drugDose"
              />
              <Tile
                size="micro"
                title="Anatomy locator"
                icon={TOOL_STYLES.locate.icon}
                iconBg={TOOL_STYLES.locate.bg}
                iconColor={TOOL_STYLES.locate.fg}
                pendingTool="locate"
              />
              <Tile
                size="micro"
                title={activeChatId ? 'Resume session' : 'No active session'}
                icon={RiChat3Line}
                disabled={!activeChatId}
                onClick={() => router.push('/chat')}
              />
            </div>
          </section>

          {/* ── Footer status row ── */}
          <footer className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-t border-[var(--color-who-ring)] -mx-1 px-1">
            <ActivePatientPill />
            <StatusBar />
          </footer>
        </div>
      </div>
    </div>
  )
}
