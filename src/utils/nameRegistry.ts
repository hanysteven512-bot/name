export type NameFormatStyle = 'standard' | 'formal' | 'uppercase';

export interface NameEntry {
  id: string;
  fullName: string;
  preferredName: string;
  honorific: string;
  contextNote: string;
  initials: string;
  serialCode: string;
  submittedAt: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedFullName: string;
  normalizedPreferredName: string;
}

/**
 * Normalizes whitespace in a name string (trims ends and collapses multiple spaces).
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Validates a requested name input.
 * Rejects empty strings, strings shorter than 2 characters, or strings without any letters.
 */
export function validateNameInput(
  fullName: string,
  preferredName: string = ''
): ValidationResult {
  const normalizedFull = normalizeWhitespace(fullName);
  const normalizedPref = normalizeWhitespace(preferredName);

  if (!normalizedFull) {
    return {
      valid: false,
      error: 'Please enter your name before submitting.',
      normalizedFullName: '',
      normalizedPreferredName: '',
    };
  }

  if (normalizedFull.length < 2) {
    return {
      valid: false,
      error: 'Your name must be at least 2 characters long.',
      normalizedFullName: normalizedFull,
      normalizedPreferredName: normalizedPref,
    };
  }

  if (normalizedFull.length > 80) {
    return {
      valid: false,
      error: 'Please keep the name under 80 characters.',
      normalizedFullName: normalizedFull,
      normalizedPreferredName: normalizedPref,
    };
  }

  // Must contain at least one alphabetic/unicode letter character
  if (!/\p{L}/u.test(normalizedFull)) {
    return {
      valid: false,
      error: 'Please include alphabetic characters in your name.',
      normalizedFullName: normalizedFull,
      normalizedPreferredName: normalizedPref,
    };
  }

  const effectivePreferred =
    normalizedPref || normalizedFull.split(' ')[0] || normalizedFull;

  return {
    valid: true,
    normalizedFullName: normalizedFull,
    normalizedPreferredName: effectivePreferred,
  };
}

/**
 * Extracts up to 2 uppercase initials from a full name.
 */
export function extractInitials(fullName: string): string {
  const clean = normalizeWhitespace(fullName);
  if (!clean) return '—';
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  const first = parts[0][0] ?? '';
  const last = parts[parts.length - 1][0] ?? '';
  return `${first}${last}`.toUpperCase();
}

/**
 * Formats a display name according to the selected style and optional honorific.
 */
export function formatDisplayName(
  fullName: string,
  honorific: string = '',
  style: NameFormatStyle = 'standard'
): string {
  const cleanName = normalizeWhitespace(fullName);
  const cleanHonorific = normalizeWhitespace(honorific);
  if (!cleanName) return 'Your Name Here';

  if (style === 'uppercase') {
    const combined = cleanHonorific ? `${cleanHonorific} ${cleanName}` : cleanName;
    return combined.toUpperCase();
  }

  if (style === 'formal') {
    const parts = cleanName.split(' ');
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      const rest = parts.slice(0, -1).join(' ');
      const withHonorific = cleanHonorific ? `${cleanHonorific} ${rest}` : rest;
      return `${last}, ${withHonorific}`;
    }
    return cleanHonorific ? `${cleanHonorific} ${cleanName}` : cleanName;
  }

  // 'standard'
  return cleanHonorific ? `${cleanHonorific} ${cleanName}` : cleanName;
}

/**
 * Builds a deterministic serial code based on sequence number and initials.
 */
export function generateSerialCode(sequenceNumber: number, fullName: string): string {
  const initials = extractInitials(fullName).replace(/[^A-Z]/g, 'X') || 'NM';
  const padded = String(Math.max(1, sequenceNumber)).padStart(4, '0');
  return `NM-${padded}-${initials}`;
}

/**
 * Builds a personalized greeting headline after submission.
 */
export function buildGreetingMessage(entry: Pick<NameEntry, 'fullName' | 'preferredName' | 'honorific'>): string {
  const displayTarget = normalizeWhitespace(entry.preferredName || entry.fullName);
  if (!displayTarget) return 'Welcome';
  return `Welcome, ${displayTarget}`;
}

/**
 * Filters a list of registered names by search query across name, preferred name, serial code, or context note.
 */
export function filterNameEntries(entries: NameEntry[], query: string): NameEntry[] {
  const normalizedQuery = normalizeWhitespace(query).toLowerCase();
  if (!normalizedQuery) return entries;

  return entries.filter((item) => {
    return (
      item.fullName.toLowerCase().includes(normalizedQuery) ||
      item.preferredName.toLowerCase().includes(normalizedQuery) ||
      item.serialCode.toLowerCase().includes(normalizedQuery) ||
      item.contextNote.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Converts registered name entries to CSV text.
 */
export function entriesToCsv(entries: NameEntry[]): string {
  const headers = ['Serial Code', 'Full Name', 'Preferred Name', 'Honorific', 'Context', 'Submitted At'];
  const escapeCsvCell = (val: string) => `"${String(val ?? '').replace(/"/g, '""')}"`;

  const rows = entries.map((e) =>
    [
      e.serialCode,
      e.fullName,
      e.preferredName,
      e.honorific || 'None',
      e.contextNote || 'General Check-In',
      e.submittedAt,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export const INITIAL_SEED_ENTRIES: NameEntry[] = [
  {
    id: 'seed-1',
    fullName: 'Elena Rostova',
    preferredName: 'Elena',
    honorific: 'Dr.',
    contextNote: 'Keynote Speaker',
    initials: 'ER',
    serialCode: 'NM-0001-ER',
    submittedAt: '08:15 AM',
  },
  {
    id: 'seed-2',
    fullName: 'Marcus Vance',
    preferredName: 'Marcus',
    honorific: '',
    contextNote: 'Architectural Review',
    initials: 'MV',
    serialCode: 'NM-0002-MV',
    submittedAt: '08:32 AM',
  },
  {
    id: 'seed-3',
    fullName: 'Sora Takahashi',
    preferredName: 'Sora',
    honorific: 'Prof.',
    contextNote: 'Guest Delegate',
    initials: 'ST',
    serialCode: 'NM-0003-ST',
    submittedAt: '08:48 AM',
  },
];
