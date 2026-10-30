import { Search, Download, Trash2 } from 'lucide-react';
import {
  entriesToCsv,
  filterNameEntries,
  formatDisplayName,
  NameEntry,
  NameFormatStyle,
} from '../utils/nameRegistry';

interface RegistryDirectoryProps {
  entries: NameEntry[];
  activeEntryId: string | null;
  searchQuery: string;
  formatStyle: NameFormatStyle;
  onSearchChange: (q: string) => void;
  onSelectEntry: (entry: NameEntry) => void;
  onRemoveEntry: (id: string) => void;
  onFocusNameInput: () => void;
}

export function RegistryDirectory({
  entries,
  activeEntryId,
  searchQuery,
  formatStyle,
  onSearchChange,
  onSelectEntry,
  onRemoveEntry,
  onFocusNameInput,
}: RegistryDirectoryProps) {
  const filtered = filterNameEntries(entries, searchQuery);

  const handleDownloadCsv = () => {
    const csvContent = entriesToCsv(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nomen-registered-names.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="registry-directory"
      aria-labelledby="directory-heading"
      className="py-12 border-t border-slate-200"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs text-slate-500">
            <span>01. Live Roster</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span className="font-mono">{entries.length} Total Registered</span>
          </p>
          <h2
            id="directory-heading"
            className="font-display text-2xl sm:text-3xl font-bold text-slate-900 mt-1"
          >
            Registered Names Directory
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Every submitted name is formatted, assigned a sequential registry code, and
            stored in your session directory. Select any row to inspect its credential pass.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <label htmlFor="directory-search" className="sr-only">
              Search registered names
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="directory-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter by name or code..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 w-64"
            />
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="font-display text-base font-semibold text-slate-900">
              {entries.length === 0
                ? 'No names registered yet'
                : `No matches found for "${searchQuery}"`}
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              {entries.length === 0
                ? 'Submit your name in the request form above to create the first directory entry.'
                : 'Try clearing the search filter or searching by another name or serial code.'}
            </p>
            <div className="mt-5">
              {entries.length === 0 ? (
                <button
                  type="button"
                  onClick={onFocusNameInput}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Request First Name
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th scope="col" className="py-3.5 px-5">
                    Serial Code
                  </th>
                  <th scope="col" className="py-3.5 px-5">
                    Formatted Name
                  </th>
                  <th scope="col" className="py-3.5 px-5">
                    Preferred / Spoken
                  </th>
                  <th scope="col" className="py-3.5 px-5">
                    Context / Purpose
                  </th>
                  <th scope="col" className="py-3.5 px-5 text-right">
                    Submitted
                  </th>
                  <th scope="col" className="py-3.5 px-5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filtered.map((entry) => {
                  const isSelected = entry.id === activeEntryId;
                  const formatted = formatDisplayName(
                    entry.fullName,
                    entry.honorific,
                    formatStyle
                  );
                  return (
                    <tr
                      key={entry.id}
                      onClick={() => onSelectEntry(entry)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/60 hover:bg-blue-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {entry.serialCode}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-slate-900 whitespace-nowrap">
                        {formatted}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                        {entry.preferredName}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                        {entry.contextNote || 'General Check-In'}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-500 text-right whitespace-nowrap">
                        {entry.submittedAt}
                      </td>
                      <td
                        className="py-3.5 px-5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onRemoveEntry(entry.id)}
                          aria-label={`Remove ${entry.fullName}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
