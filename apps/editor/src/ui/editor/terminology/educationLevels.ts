/**
 * Seeded education-level values for the TagComboboxInput.
 *
 * `educationLevel` is a plain `string[]` in CASE v1.1 — it is NOT backed
 * by a CFDefinitions type.  These are static, editor-side suggestions that
 * cover the most common labelling conventions across sectors.
 */

export type EducationLevelOption = {
  value: string
  label: string
  /** Sector hint for future lens-aware sorting */
  sector?: string
}

/**
 * Comprehensive list of education levels spanning K-12, higher-ed,
 * vocational, workforce, and lifelong-learning sectors.
 *
 * The `sector` tag is metadata only — it does not appear in the UI
 * but can be used for lens-aware priority sorting in the future.
 */
export const EDUCATION_LEVEL_OPTIONS: readonly EducationLevelOption[] = [
  // ── K-12 ──────────────────────────────────────────────────────────
  { value: 'Pre-K', label: 'Pre-K', sector: 'k12' },
  { value: 'Kindergarten', label: 'Kindergarten', sector: 'k12' },
  { value: 'Grade 1', label: 'Grade 1', sector: 'k12' },
  { value: 'Grade 2', label: 'Grade 2', sector: 'k12' },
  { value: 'Grade 3', label: 'Grade 3', sector: 'k12' },
  { value: 'Grade 4', label: 'Grade 4', sector: 'k12' },
  { value: 'Grade 5', label: 'Grade 5', sector: 'k12' },
  { value: 'Grade 6', label: 'Grade 6', sector: 'k12' },
  { value: 'Grade 7', label: 'Grade 7', sector: 'k12' },
  { value: 'Grade 8', label: 'Grade 8', sector: 'k12' },
  { value: 'Grade 9', label: 'Grade 9', sector: 'k12' },
  { value: 'Grade 10', label: 'Grade 10', sector: 'k12' },
  { value: 'Grade 11', label: 'Grade 11', sector: 'k12' },
  { value: 'Grade 12', label: 'Grade 12', sector: 'k12' },

  // ── Higher Education ──────────────────────────────────────────────
  { value: 'Undergraduate', label: 'Undergraduate', sector: 'higher-ed' },
  { value: 'Postgraduate', label: 'Postgraduate', sector: 'higher-ed' },
  { value: 'Masters', label: 'Masters', sector: 'higher-ed' },
  { value: 'Doctoral', label: 'Doctoral', sector: 'higher-ed' },
  { value: 'Level 4', label: 'Level 4', sector: 'higher-ed' },
  { value: 'Level 5', label: 'Level 5', sector: 'higher-ed' },
  { value: 'Level 6', label: 'Level 6', sector: 'higher-ed' },
  { value: 'Level 7', label: 'Level 7', sector: 'higher-ed' },
  { value: 'Level 8', label: 'Level 8', sector: 'higher-ed' },

  // ── Vocational / Training ─────────────────────────────────────────
  { value: 'Level 1', label: 'Level 1', sector: 'vocational' },
  { value: 'Level 2', label: 'Level 2', sector: 'vocational' },
  { value: 'Level 3', label: 'Level 3', sector: 'vocational' },
  { value: 'Certificate', label: 'Certificate', sector: 'vocational' },
  { value: 'Diploma', label: 'Diploma', sector: 'vocational' },
  { value: 'Advanced Diploma', label: 'Advanced Diploma', sector: 'vocational' },
  { value: 'Apprenticeship', label: 'Apprenticeship', sector: 'vocational' },

  // ── Workforce ─────────────────────────────────────────────────────
  { value: 'Entry', label: 'Entry', sector: 'workforce' },
  { value: 'Junior', label: 'Junior', sector: 'workforce' },
  { value: 'Mid', label: 'Mid', sector: 'workforce' },
  { value: 'Senior', label: 'Senior', sector: 'workforce' },
  { value: 'Lead', label: 'Lead', sector: 'workforce' },
  { value: 'Principal', label: 'Principal', sector: 'workforce' },

  // ── Lifelong Learning ─────────────────────────────────────────────
  { value: 'Foundation', label: 'Foundation', sector: 'lifelong' },
  { value: 'Intermediate', label: 'Intermediate', sector: 'lifelong' },
  { value: 'Advanced', label: 'Advanced', sector: 'lifelong' },
  { value: 'Professional', label: 'Professional', sector: 'lifelong' },
] as const
