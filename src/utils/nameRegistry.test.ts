import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeWhitespace,
  validateNameInput,
  extractInitials,
  formatDisplayName,
  generateSerialCode,
  buildGreetingMessage,
  filterNameEntries,
  entriesToCsv,
  INITIAL_SEED_ENTRIES,
} from './nameRegistry';

test('normalizeWhitespace trims and collapses multiple spaces', () => {
  assert.equal(normalizeWhitespace('   Ada    Lovelace  '), 'Ada Lovelace');
  assert.equal(normalizeWhitespace(''), '');
});

test('validateNameInput rejects empty or invalid names and accepts valid names', () => {
  const emptyRes = validateNameInput('   ');
  assert.equal(emptyRes.valid, false);
  assert.equal(emptyRes.error, 'Please enter your name before submitting.');

  const shortRes = validateNameInput('A');
  assert.equal(shortRes.valid, false);
  assert.equal(shortRes.error, 'Your name must be at least 2 characters long.');

  const digitsOnlyRes = validateNameInput('12345');
  assert.equal(digitsOnlyRes.valid, false);
  assert.equal(digitsOnlyRes.error, 'Please include alphabetic characters in your name.');

  const validRes = validateNameInput('  Grace   Hopper ', '');
  assert.equal(validRes.valid, true);
  assert.equal(validRes.normalizedFullName, 'Grace Hopper');
  assert.equal(validRes.normalizedPreferredName, 'Grace');
});

test('extractInitials computes accurate two-letter initials', () => {
  assert.equal(extractInitials('Ada Lovelace'), 'AL');
  assert.equal(extractInitials('Jean-Luc Picard'), 'JP');
  assert.equal(extractInitials('Plato'), 'PL');
  assert.equal(extractInitials(''), '—');
});

test('formatDisplayName supports standard, formal, and uppercase styles', () => {
  assert.equal(formatDisplayName('Ada Lovelace', 'Dr.', 'standard'), 'Dr. Ada Lovelace');
  assert.equal(formatDisplayName('Ada Lovelace', 'Dr.', 'formal'), 'Lovelace, Dr. Ada');
  assert.equal(formatDisplayName('Ada Lovelace', '', 'uppercase'), 'ADA LOVELACE');
});

test('generateSerialCode creates deterministic padded codes', () => {
  assert.equal(generateSerialCode(4, 'Ada Lovelace'), 'NM-0004-AL');
  assert.equal(generateSerialCode(125, 'Alan Turing'), 'NM-0125-AT');
});

test('buildGreetingMessage creates a personalized welcome headline', () => {
  assert.equal(
    buildGreetingMessage({ fullName: 'Ada Lovelace', preferredName: 'Ada', honorific: '' }),
    'Welcome, Ada'
  );
});

test('filterNameEntries filters by name or serial code', () => {
  const matches = filterNameEntries(INITIAL_SEED_ENTRIES, 'elena');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].fullName, 'Elena Rostova');

  const serialMatches = filterNameEntries(INITIAL_SEED_ENTRIES, 'NM-0003');
  assert.equal(serialMatches.length, 1);
  assert.equal(serialMatches[0].fullName, 'Sora Takahashi');
});

test('entriesToCsv outputs valid header and rows', () => {
  const csv = entriesToCsv(INITIAL_SEED_ENTRIES.slice(0, 1));
  assert.equal(csv.includes('Serial Code,Full Name,Preferred Name'), true);
  assert.equal(csv.includes('"NM-0001-ER","Elena Rostova","Elena"'), true);
});
