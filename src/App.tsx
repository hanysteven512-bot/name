/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { NameBadgePreview } from './components/NameBadgePreview';
import { RegistryDirectory } from './components/RegistryDirectory';
import {
  buildGreetingMessage,
  extractInitials,
  generateSerialCode,
  INITIAL_SEED_ENTRIES,
  NameEntry,
  NameFormatStyle,
  validateNameInput,
} from './utils/nameRegistry';

const STORAGE_KEY = 'nomen_registered_entries_v1';

export default function App() {
  const [entries, setEntries] = useState<NameEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed entries if localStorage fails
    }
    return INITIAL_SEED_ENTRIES;
  });

  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [honorific, setHonorific] = useState('');
  const [contextNote, setContextNote] = useState('General Check-In');

  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedEntry, setSubmittedEntry] = useState<NameEntry | null>(null);
  const [activeEntry, setActiveEntry] = useState<NameEntry | null>(
    () => entries[0] ?? null
  );
  const [formatStyle, setFormatStyle] = useState<NameFormatStyle>('standard');
  const [searchQuery, setSearchQuery] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors
    }
  }, [entries]);

  const handleFocusNameInput = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateNameInput(fullName, preferredName);
    if (!validation.valid) {
      setValidationError(validation.error || 'Please enter a valid name.');
      return;
    }

    setValidationError(null);

    const nextSeq = entries.length + 1;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newEntry: NameEntry = {
      id: `entry-${Date.now()}`,
      fullName: validation.normalizedFullName,
      preferredName: validation.normalizedPreferredName,
      honorific: honorific.trim(),
      contextNote: contextNote.trim() || 'General Check-In',
      initials: extractInitials(validation.normalizedFullName),
      serialCode: generateSerialCode(nextSeq, validation.normalizedFullName),
      submittedAt: formattedTime,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setSubmittedEntry(newEntry);
    setActiveEntry(newEntry);
    setFullName('');
    setPreferredName('');
  };

  const handleResetForm = () => {
    setFullName('');
    setPreferredName('');
    setHonorific('');
    setContextNote('General Check-In');
    setValidationError(null);
    setSubmittedEntry(null);
    nameInputRef.current?.focus();
  };

  const handleRemoveEntry = (id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (activeEntry?.id === id) {
        setActiveEntry(updated[0] ?? null);
      }
      if (submittedEntry?.id === id) {
        setSubmittedEntry(null);
      }
      return updated;
    });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAFAFA] text-slate-900">
      <Header onFocusNameInput={handleFocusNameInput} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6">
        {/* Hero & Primary Name Request Split Section */}
        <section
          id="request-name"
          aria-labelledby="hero-heading"
          className="py-10 sm:py-14"
        >
          <div className="mb-8 max-w-3xl">
            <p className="text-xs text-slate-500">
              <span>Visitor &amp; Guest Identification</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>Direct Name Request</span>
            </p>
            <h1
              id="hero-heading"
              className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mt-2 text-balance"
            >
              May we have your name?
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-2xl">
              Enter your name below to register your arrival, format your preferred
              spoken address, and generate your instant check-in credential.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Primary Name Request Form & Personalized Confirmation */}
            <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <div>
                <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Name Request Form
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span>Required field marked with an asterisk (*)</span>
                    </p>
                  </div>
                  {(fullName || preferredName || submittedEntry) && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Clear Form</span>
                    </button>
                  )}
                </div>

                {/* Confirmation Alert Banner when a name was just submitted */}
                {submittedEntry && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="mt-6 p-4 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-display text-sm font-bold text-emerald-950">
                          {buildGreetingMessage(submittedEntry)}
                        </p>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          Registered as{' '}
                          <span className="font-semibold">{submittedEntry.fullName}</span>{' '}
                          with code{' '}
                          <span className="font-mono font-semibold">
                            {submittedEntry.serialCode}
                          </span>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Error Banner */}
                {validationError && (
                  <div
                    role="alert"
                    className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3 text-red-900"
                  >
                    <AlertCircle
                      className="w-5 h-5 text-red-700 shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-xs font-medium">{validationError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                  <div>
                    <label
                      htmlFor="full-name-input"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Your Full Name <span className="text-blue-700">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your full legal or professional name as it should appear on
                      your pass.
                    </p>
                    <input
                      ref={nameInputRef}
                      id="full-name-input"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="e.g., Ada Lovelace"
                      className="mt-2 w-full px-4 py-3 text-base bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="preferred-name-input"
                        className="block text-sm font-semibold text-slate-900"
                      >
                        Preferred / Spoken Name
                      </label>
                      <input
                        id="preferred-name-input"
                        name="preferredName"
                        type="text"
                        value={preferredName}
                        onChange={(e) => setPreferredName(e.target.value)}
                        placeholder="e.g., Ada (optional)"
                        className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="honorific-select"
                        className="block text-sm font-semibold text-slate-900"
                      >
                        Title / Honorific
                      </label>
                      <select
                        id="honorific-select"
                        name="honorific"
                        value={honorific}
                        onChange={(e) => setHonorific(e.target.value)}
                        className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-colors"
                      >
                        <option value="">No Title</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mx.">Mx.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="context-select"
                      className="block text-sm font-semibold text-slate-900"
                    >
                      Check-In Purpose
                    </label>
                    <select
                      id="context-select"
                      name="contextNote"
                      value={contextNote}
                      onChange={(e) => setContextNote(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 transition-colors"
                    >
                      <option value="General Check-In">General Check-In</option>
                      <option value="Guest Delegate">Guest Delegate</option>
                      <option value="Keynote Speaker">Keynote Speaker</option>
                      <option value="Architectural Review">Architectural Review</option>
                      <option value="Press & Media">Press &amp; Media</option>
                    </select>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                      <span>Instant verification</span>
                      <span aria-hidden="true" className="mx-1.5">·</span>
                      <span>Saved to local session</span>
                    </p>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Submit Name
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Real-Time Name Badge & Credential Preview */}
            <div className="lg:col-span-5">
              <NameBadgePreview
                draftFullName={fullName}
                draftPreferredName={preferredName}
                draftHonorific={honorific}
                draftContextNote={contextNote}
                activeEntry={activeEntry}
                nextSequenceNumber={entries.length + 1}
                formatStyle={formatStyle}
                onChangeFormatStyle={setFormatStyle}
              />
            </div>
          </div>

          {/* Full-width KPI summary strip below the hero split */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-xl p-6">
            <div>
              <p className="text-xs text-slate-500">Registered Today</p>
              <p
                data-testid="total-registered-count"
                className="font-display font-mono text-2xl font-bold text-slate-900 mt-1"
              >
                {entries.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Latest Check-In</p>
              <p className="font-display text-base font-bold text-slate-900 mt-1 truncate">
                {entries[0]?.fullName || 'None yet'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Next Serial Code</p>
              <p className="font-mono text-base font-semibold text-slate-900 mt-1">
                {generateSerialCode(entries.length + 1, fullName || 'YN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Display Format</p>
              <p className="font-display text-base font-bold text-slate-900 mt-1 capitalize">
                {formatStyle === 'formal' ? 'Last, First' : formatStyle}
              </p>
            </div>
          </div>
        </section>

        {/* Registered Names Directory Section */}
        <RegistryDirectory
          entries={entries}
          activeEntryId={activeEntry?.id ?? null}
          searchQuery={searchQuery}
          formatStyle={formatStyle}
          onSearchChange={setSearchQuery}
          onSelectEntry={(entry) => setActiveEntry(entry)}
          onRemoveEntry={handleRemoveEntry}
          onFocusNameInput={handleFocusNameInput}
        />

        {/* Editorial Naming Standards Section */}
        <section
          id="guidelines"
          aria-labelledby="guidelines-heading"
          className="py-12 border-t border-slate-200"
        >
          <div className="max-w-2xl mb-8">
            <p className="text-xs text-slate-500">
              <span>02. Formatting Protocol</span>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>Unicode &amp; Honorific Support</span>
            </p>
            <h2
              id="guidelines-heading"
              className="font-display text-2xl font-bold text-slate-900 mt-1"
            >
              How Names Are Processed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                01. Whitespace Normalization
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Leading, trailing, and repeated internal spaces are automatically trimmed
                while preserving hyphens, apostrophes, and international diacritics.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                02. Spoken First-Name Extraction
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                If you leave the preferred name field blank, Nomen derives your given
                first name automatically for spoken greetings and reception desks.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-display text-base font-bold text-slate-900">
                03. Instant Directory &amp; CSV Export
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                All submitted names are indexed with a tabular serial number and can be
                searched in real time or exported as a standard CSV roster.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900">Nomen</span>
            <span aria-hidden="true">·</span>
            <span>Name Check-In &amp; Credential Registry</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#request-name" className="hover:text-slate-900 transition-colors">
              Request Form
            </a>
            <a href="#registry-directory" className="hover:text-slate-900 transition-colors">
              Directory
            </a>
            <a href="#guidelines" className="hover:text-slate-900 transition-colors">
              Standards
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
