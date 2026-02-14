/**
 * UI labels and placeholder overrides.
 *
 * Labels are intentionally kept **consistent across all lenses** so the
 * UI vocabulary is universally understandable.  Only placeholder
 * *examples* change per lens to give contextually helpful hints.
 *
 * The lens primarily drives **dropdown option sorting** (see lensOptions.ts),
 * not field renaming.  Sector-specific label wording (e.g. "Standard
 * Statement" vs "Learning Outcome") needs community consultation before
 * being adopted.
 */

import type { LensId } from './lensTypes'

/* ── Field keys ───────────────────────────────────────────────────── */

export type LensField =
  | 'statementLabel'
  | 'statementPlaceholder'
  | 'codeLabel'
  | 'codePlaceholder'
  | 'codeHint'
  | 'typeLabel'
  | 'typePlaceholder'
  | 'subjectLabel'
  | 'subjectPlaceholder'
  | 'educationLabel'
  | 'educationPlaceholder'
  | 'conceptLabel'
  | 'conceptPlaceholder'
  | 'conceptHint'
  | 'keywordsLabel'
  | 'keywordsPlaceholder'
  | 'aboutSectionTitle'
  | 'aboutSectionHint'

/* ── Universal labels (shared by all lenses) ──────────────────────── */

const GENERAL: Record<LensField, string> = {
  statementLabel: 'Statement',
  statementPlaceholder: 'Write the full statement for this item…',
  codeLabel: 'Code',
  codePlaceholder: 'e.g. 3.NBT.A.1',
  codeHint: 'A short human-readable identifier for this item.',
  typeLabel: 'Type',
  typePlaceholder: 'Select or type a type…',
  subjectLabel: 'Subject / Area',
  subjectPlaceholder: 'Select or type a subject area…',
  educationLabel: 'Level',
  educationPlaceholder: 'e.g. Grade 3, Level 6',
  conceptLabel: 'Learning Domain',
  conceptPlaceholder: 'Select or type a learning domain…',
  conceptHint: 'What kind of thinking or ability? (e.g. Critical Thinking, Technical Skill)',
  keywordsLabel: 'Keywords',
  keywordsPlaceholder: 'e.g. fractions, place value',
  aboutSectionTitle: 'About this item',
  aboutSectionHint: 'Helps people find and organize items.',
}

/* ── Per-lens placeholder examples only ───────────────────────────── */

type LensOverrides = Partial<Record<LensField, string>>

const OVERRIDES: Record<Exclude<LensId, 'general'>, LensOverrides> = {
  k12: {
    codePlaceholder: 'e.g. 3.NBT.A.1',
    educationPlaceholder: 'e.g. Grade 3, Grade 4',
    keywordsPlaceholder: 'e.g. fractions, photosynthesis',
  },

  'higher-ed': {
    codePlaceholder: 'e.g. LO-201',
    educationPlaceholder: 'e.g. Level 6, Masters',
    keywordsPlaceholder: 'e.g. regression, epistemology',
  },

  vocational: {
    codePlaceholder: 'e.g. VT-301',
    educationPlaceholder: 'e.g. Level 2, Level 3',
    keywordsPlaceholder: 'e.g. welding, safety procedures',
  },

  workforce: {
    codePlaceholder: 'e.g. SK-4.2',
    educationPlaceholder: 'e.g. Entry, Mid, Senior',
    keywordsPlaceholder: 'e.g. Python, client relations',
  },

  lifelong: {
    codePlaceholder: 'e.g. LP-101',
    educationPlaceholder: 'e.g. Foundation, Advanced',
    keywordsPlaceholder: 'e.g. time management, self-assessment',
  },
}

/* ── Public accessor ──────────────────────────────────────────────── */

/**
 * Get a UI label/placeholder string for the given lens and field.
 * Labels are the same across all lenses; only placeholder examples vary.
 */
export function getLabel(lens: LensId, field: LensField): string {
  if (lens === 'general') return GENERAL[field]
  return OVERRIDES[lens]?.[field] ?? GENERAL[field]
}
