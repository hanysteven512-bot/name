import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  extractInitials,
  formatDisplayName,
  generateSerialCode,
  NameEntry,
  NameFormatStyle,
} from '../utils/nameRegistry';

interface NameBadgePreviewProps {
  draftFullName: string;
  draftPreferredName: string;
  draftHonorific: string;
  draftContextNote: string;
  activeEntry: NameEntry | null;
  nextSequenceNumber: number;
  formatStyle: NameFormatStyle;
  onChangeFormatStyle: (style: NameFormatStyle) => void;
}

export function NameBadgePreview({
  draftFullName,
  draftPreferredName,
  draftHonorific,
  draftContextNote,
  activeEntry,
  nextSequenceNumber,
  formatStyle,
  onChangeFormatStyle,
}: NameBadgePreviewProps) {
  const [copied, setCopied] = useState(false);

  // Determine whether we are previewing live typing or the most recently selected/submitted entry
  const isTyping = draftFullName.trim().length > 0;
  const sourceFullName = isTyping
    ? draftFullName
    : activeEntry?.fullName || 'Your Name Here';
  const sourcePreferred = isTyping
    ? draftPreferredName || draftFullName.trim().split(/\s+/)[0] || ''
    : activeEntry?.preferredName || 'Visitor';
  const sourceHonorific = isTyping ? draftHonorific : activeEntry?.honorific || '';
  const sourceContext = isTyping
    ? draftContextNote || 'General Admission'
    : activeEntry?.contextNote || 'General Admission';

  const formattedTitle = formatDisplayName(sourceFullName, sourceHonorific, formatStyle);
  const initials = extractInitials(
    isTyping ? draftFullName : activeEntry?.fullName || 'YN'
  );
  const serialCode = isTyping
    ? generateSerialCode(nextSequenceNumber, draftFullName)
    : activeEntry?.serialCode || 'NM-0004-YN';
  const timestamp = isTyping ? 'Live Draft' : activeEntry?.submittedAt || 'Ready';

  const handleCopyPass = async () => {
    const summary = `${formattedTitle} (${serialCode}) — ${sourceContext}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div
      id="badge-preview"
      className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-200">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">
              <span>Credential Preview</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span className="font-mono">{serialCode}</span>
            </p>
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              Registered Name Card
            </h2>
          </div>

          {/* Interactive format selector (segmented control) */}
          <div
            role="group"
            aria-label="Name formatting style"
            className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0"
          >
            {(['standard', 'formal', 'uppercase'] as NameFormatStyle[]).map((style) => {
              const labels: Record<NameFormatStyle, string> = {
                standard: 'Standard',
                formal: 'Last, First',
                uppercase: 'Caps',
              };
              const isActive = formatStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => onChangeFormatStyle(style)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[style]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical-inspired architectural name pass */}
        <div className="mt-6 bg-slate-900 text-white rounded-lg p-6 sm:p-7 flex flex-col justify-between min-h-[250px]">
          <div className="flex items-start justify-between gap-4">
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <span>Nomen Identity Pass</span>
              <span aria-hidden="true">·</span>
              <span>{sourceContext}</span>
            </div>
            <span className="font-mono text-xs text-slate-300 tracking-wider">
              {serialCode}
            </span>
          </div>

          <div className="my-6 flex items-center gap-5">
            <div
              aria-hidden="true"
              className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-display text-xl font-bold text-white shrink-0"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400">Full Registered Name</p>
              <p
                data-testid="preview-display-name"
                className="font-display text-2xl sm:text-3xl font-bold tracking-normal text-white truncate mt-0.5"
              >
                {formattedTitle}
              </p>
              <p className="text-xs text-slate-300 mt-1.5">
                <span>Spoken / Preferred: {sourcePreferred}</span>
                <span aria-hidden="true" className="mx-2">·</span>
                <span className="font-mono">{timestamp}</span>
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4 text-xs text-slate-400">
            <span>Verified Check-In Record</span>
            <span className="font-mono">ISO-3103 · {initials}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-500">
          <span>Live preview syncs as you type</span>
        </div>
        <button
          type="button"
          onClick={handleCopyPass}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Copied Credential</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>Copy Credential Text</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
