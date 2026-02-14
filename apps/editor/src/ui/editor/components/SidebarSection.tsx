import { useState, type ReactNode } from 'react'

type SidebarSectionProps = {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  /** Hex color from the item's colorBand; falls back to default accent */
  accentColor?: string
  children: ReactNode
}

const DEFAULT_ACCENT = '#8b5cf6' // violet-500

/**
 * Collapsible sidebar section with left color accent bar.
 * Uses CSS grid-template-rows animation for smooth expand/collapse.
 */
export default function SidebarSection({
  title,
  subtitle,
  defaultOpen = true,
  accentColor,
  children,
}: SidebarSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const color = accentColor || DEFAULT_ACCENT

  return (
    <div className="rounded-xl">
      {/* Header — always visible, styled as a distinct clickable bar */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={[
          'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors',
          'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-slate-50 active:bg-slate-100',
          open ? 'rounded-b-none' : '',
        ].join(' ')}
      >
        {/* Left accent bar */}
        <div
          className="h-8 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />

        {/* Title + subtitle */}
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold leading-tight text-slate-900">{title}</div>
          {subtitle ? (
            <div className="mt-0.5 text-sm leading-snug text-slate-500">{subtitle}</div>
          ) : null}
        </div>

        {/* Chevron */}
        <svg
          className={[
            'h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body — animated */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="rounded-b-xl bg-white px-4 pb-4 pt-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
