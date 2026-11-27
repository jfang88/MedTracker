'use strict';

const storageKey = 'medtracker.entries.v1';
const sites = [
  'Left arm', 'Right arm',
  'Left thigh', 'Right thigh',
  'Upper left stomach', 'Upper right stomach',
  'Lower left stomach', 'Lower right stomach',
];

const form = document.querySelector('#entry');
const date = document.querySelector('#date');
const dose = document.querySelector('#dose');
const picker = document.querySelector('#picker');
const customLabel = document.querySelector('#custom-label');

function toggleCustomDose() {
  const custom = picker.value === 'custom';
  customLabel.hidden = !custom;
  dose.disabled = !custom;
}

picker.addEventListener('change', toggleCustomDose);
const spots = document.querySelector('#spots');
const historyList = document.querySelector('#history');
const empty = document.querySelector('#empty');
const status = document.querySelector('#status');
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

for (const site of sites) {
  const label = document.createElement('label');
  const radio = document.createElement('input');
  radio.type = 'radio';
  radio.name = 'site';
  radio.value = site;
  radio.required = true;
  label.append(radio, site);
  spots.append(label);
}

function setToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  date.value = `${now.getFullYear()}-${month}-${day}`;
}

function readEntries() {
  const entries = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (!Array.isArray(entries)) throw new Error('Invalid history');
  return entries;
}

function deleteEntry(entry, displayedEntries) {
  const summary = [dateFormat.format(new Date(entry.date)), entry.site, entry.dose].join(' · ');
  if (!window.confirm(`Delete this entry?\n${summary}`)) return;

  try {
    const current = readEntries();
    if (JSON.stringify(current) !== JSON.stringify(displayedEntries)) {
      showEntries(current);
      status.textContent = 'History has changed. Select the entry again.';
      return;
    }
    const remaining = displayedEntries.filter(item => item !== entry);
    localStorage.setItem(storageKey, JSON.stringify(remaining));
    showEntries(remaining);
    status.textContent = 'Entry deleted.';
  } catch {
    status.textContent = 'Could not delete this entry. Please try again.';
  }
}

function showEntries(entries) {
  const newestFirst = [...entries].reverse().sort((a, b) => b.date.localeCompare(a.date));
  empty.hidden = newestFirst.length > 0;
  const lastDose = newestFirst[0]?.dose ?? '';
  const preset = Array.from(picker.options).some(option =>
    option.parentElement.tagName === 'OPTGROUP' && option.value === lastDose);
  picker.value = preset || !lastDose ? lastDose : 'custom';
  dose.value = preset ? '' : lastDose;
  toggleCustomDose();
  historyList.replaceChildren();

  for (const entry of newestFirst) {
    const row = document.createElement('li');
    const when = document.createElement('time');
    const where = document.createElement('strong');
    const amount = document.createElement('span');
    when.dateTime = entry.date;
    when.textContent = dateFormat.format(new Date(entry.date));
    where.textContent = entry.site;
    amount.textContent = entry.dose;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${entry.site}, ${entry.dose}, ${when.textContent}`);
    remove.addEventListener('click', () => deleteEntry(entry, entries));
    row.append(when, where, amount, remove);
    historyList.append(row);
  }
}

setToday();
try {
  showEntries(readEntries());
} catch {
  status.textContent = 'Saved history could not be loaded from this browser.';
}

dose.addEventListener('input', () => dose.setCustomValidity(''));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = picker.value === 'custom' ? dose.value.trim() : picker.value;
  if (!amount) {
    dose.setCustomValidity('Enter the amount you took.');
    dose.reportValidity();
    return;
  }

  const entry = { date: date.value, site: new FormData(form).get('site'), dose: amount };
  let entries;
  try {
    entries = [...readEntries(), entry];
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    status.textContent = 'Could not save this entry. Check that browser storage is available and try again.';
    return;
  }
  form.reset();
  setToday();
  showEntries(entries);
  status.textContent = 'Entry saved.';
});
