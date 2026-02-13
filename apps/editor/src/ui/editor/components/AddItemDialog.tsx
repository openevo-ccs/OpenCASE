import { useMemo, useState } from 'react'
import { Button } from '@/ui/shared/components/ui/button'
import { ComboboxInput } from '@/ui/shared/components/ui/combobox-input'
import type { ComboboxOption } from '@/ui/shared/components/ui/combobox-input'
import { TagComboboxInput } from '@/ui/shared/components/ui/tag-combobox-input'
import type { TagComboboxOption } from '@/ui/shared/components/ui/tag-combobox-input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/ui/shared/components/ui/dialog'
import { Input } from '@/ui/shared/components/ui/input'
import { Label } from '@/ui/shared/components/ui/label'
import { Textarea } from '@/ui/shared/components/ui/textarea'
import { useEditor } from '@/ui/editor/state/EditorContext'

export type AddItemDraft = {
  fullStatement: string
  abbreviatedStatement?: string
  alternativeLabel?: string
  humanCodingScheme?: string
  CFItemType?: string
  /** @deprecated Use subjects array instead */
  subjectCsv?: string
  /** Subjects as a string array (preferred over subjectCsv) */
  subjects?: string[]
  educationLevelCsv?: string
  conceptKeywordsCsv?: string
  notes?: string
}

type Props = {
  open: boolean
  parentLabel?: string
  draft: AddItemDraft
  onChange: (patch: Partial<AddItemDraft>) => void
  onCancel: () => void
  onCreate: () => void
}

export default function AddItemDialog({ open, parentLabel, draft, onChange, onCancel, onCreate }: Readonly<Props>) {
  const { cfItemTypes, cfSubjects } = useEditor()
  const [touched, setTouched] = useState(false)

  /** Deduplicate options by value (title). First occurrence wins. */
  const dedup = <T extends { value: string }>(arr: T[]): T[] => {
    const seen = new Set<string>()
    return arr.filter((o) => {
      if (seen.has(o.value)) return false
      seen.add(o.value)
      return true
    })
  }

  const cfItemTypeOptions: ComboboxOption[] = useMemo(
    () => dedup(cfItemTypes.map((t) => ({ value: t.title ?? t.identifier, label: t.title ?? t.identifier, description: t.description }))),
    [cfItemTypes],
  )

  const cfSubjectOptions: TagComboboxOption[] = useMemo(
    () => dedup(cfSubjects.map((s) => ({ value: s.title ?? s.identifier, label: s.title ?? s.identifier, description: s.description }))),
    [cfSubjects],
  )

  const statementError = useMemo(() => {
    if (!touched) return null
    return draft.fullStatement.trim().length ? null : 'Statement is required.'
  }, [draft.fullStatement, touched])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Add item</DialogTitle>
          <DialogDescription>
            {parentLabel ? (
              <>
                You’re adding a child of <span className="font-medium text-slate-900">{parentLabel}</span>.
              </>
            ) : (
              'Enter the statement and basic information. You can refine details later.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="add-item-statement">Statement</Label>
            <Textarea
              id="add-item-statement"
              rows={4}
              value={draft.fullStatement}
              onChange={(e) => {
                if (!touched) setTouched(true)
                onChange({ fullStatement: e.target.value })
              }}
              placeholder="Write the full statement for this item…"
            />
            {statementError ? <div className="text-sm text-red-600">{statementError}</div> : null}
          </div>

          <div className="grid gap-3 rounded-xl border border-black/10 bg-slate-900/2 p-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">About this item</div>
              <div className="text-xs text-slate-600">Basic metadata to help people identify it.</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="add-item-code">Code</Label>
                <Input
                  id="add-item-code"
                  value={draft.humanCodingScheme ?? ''}
                  onChange={(e) => onChange({ humanCodingScheme: e.target.value })}
                  placeholder="e.g. 3.NF.A.1"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-item-type">Type</Label>
                <ComboboxInput
                  id="add-item-type"
                  value={draft.CFItemType ?? ''}
                  onChange={(v) => onChange({ CFItemType: v })}
                  options={cfItemTypeOptions}
                  placeholder="Select or type a type…"
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-item-label">Label (optional)</Label>
                <Input
                  id="add-item-label"
                  value={draft.alternativeLabel ?? ''}
                  onChange={(e) => onChange({ alternativeLabel: e.target.value })}
                  placeholder="Short label"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-item-abbrev">Short statement (optional)</Label>
                <Input
                  id="add-item-abbrev"
                  value={draft.abbreviatedStatement ?? ''}
                  onChange={(e) => onChange({ abbreviatedStatement: e.target.value })}
                  placeholder="Short display text"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="add-item-subject">Subject(s)</Label>
                <TagComboboxInput
                  id="add-item-subject"
                  values={draft.subjects ?? []}
                  onChange={(vals) => onChange({ subjects: vals, subjectCsv: vals.join(', ') })}
                  options={cfSubjectOptions}
                  placeholder="Select or type subjects…"
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-item-edlevel">Education level (comma-separated)</Label>
                <Input
                  id="add-item-edlevel"
                  value={draft.educationLevelCsv ?? ''}
                  onChange={(e) => onChange({ educationLevelCsv: e.target.value })}
                  placeholder="e.g. Grade 3, Grade 4"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-item-keywords">Keywords (comma-separated)</Label>
              <Input
                id="add-item-keywords"
                value={draft.conceptKeywordsCsv ?? ''}
                onChange={(e) => onChange({ conceptKeywordsCsv: e.target.value })}
                placeholder="e.g. fractions, number line"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="add-item-notes">Notes</Label>
              <Textarea
                id="add-item-notes"
                rows={3}
                value={draft.notes ?? ''}
                onChange={(e) => onChange({ notes: e.target.value })}
                placeholder="Optional context for your team…"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setTouched(true)
              if (!draft.fullStatement.trim()) return
              onCreate()
            }}
          >
            Create item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

