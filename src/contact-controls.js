// A donor edit spends the parent's remaining share. Editing the parent redistributes
// the balance among donors in their existing proportions, to whole percentages.
import { FAMILY_ORDER, FAMILIES } from './data/families.js';
import { INFLUENCE_FAMILIES } from './influence.js';

export function contactEditor(form, onEdit) {
  const rows = form.querySelector('#contactRows');
  const add = form.querySelector('#addContact');
  const parent = form.querySelector('#parentShare');
  const shareRow = form.querySelector('#parentShareRow');
  const families = FAMILY_ORDER.filter(f => INFLUENCE_FAMILIES.includes(f));
  const cards = () => Array.from(rows.children);
  const values = () => cards().map(card => ({
    family: card.querySelector('select').value,
    percent: card.querySelector('.percent').valueAsNumber,
    yearsAgo: card.querySelector('.age').valueAsNumber,
  }));

  function update() {
    const contacts = values();
    const total = contacts.reduce((n, c) => n + c.percent, 0);
    parent.value = Number.isFinite(total) ? Math.max(0, 100 - total) : '';
    shareRow.hidden = !contacts.length;
    add.disabled = contacts.length >= families.length;
    for (const card of cards()) {
      const select = card.querySelector('select');
      for (const op of select.options) {
        op.disabled = op.value !== select.value && contacts.some(c => c.family === op.value);
        op.textContent = FAMILIES[op.value].name + (op.value === form.family.value ? ' (sister branch)' : '');
      }
      card.querySelector('.percent').setCustomValidity(total > 100 ? 'Family shares must add up to at most 100% before the parent share.' : '');
    }
  }

  function append({ family, percent, yearsAgo }) {
    const card = document.createElement('div');
    card.className = 'contact-layer';
    card.innerHTML = `<div class="contact-heading"><label>Influence <select></select></label><button type="button" class="remove" aria-label="Remove family influence" title="Remove influence">×</button></div>
      <div class="contact-amounts"><label>Root share (%)<input type="number" class="percent" min="0" max="100" required></label>
      <label>Started (years ago)<input type="number" class="age" min="0" max="3000" required></label></div>`;
    const select = card.querySelector('select');
    for (const f of families) select.add(new Option(FAMILIES[f].name, f));
    select.value = family;
    card.querySelector('.percent').value = percent;
    card.querySelector('.age').value = yearsAgo;
    card.querySelector('.remove').addEventListener('click', () => {
      card.remove();
      update();
      onEdit();
      add.focus();
    });
    rows.append(card);
    return card;
  }

  add.addEventListener('click', () => {
    const available = families.filter(f => !values().some(c => c.family === f));
    const family = available.find(f => f !== form.family.value) || available[0];
    if (!family) return;
    const card = append({ family, percent: Math.min(20, Number(parent.value)), yearsAgo: 500 });
    update();
    onEdit();
    card.querySelector('select').focus();
  });
  rows.addEventListener('input', () => { update(); onEdit(); });
  let startingShares = [];
  parent.addEventListener('focus', () => { startingShares = values().map(c => c.percent); });
  parent.addEventListener('input', () => {
    if (!parent.validity.valid) return;
    const shares = startingShares;
    const sum = shares.reduce((n, v) => n + v, 0);
    let cumulative = 0, assigned = 0;
    cards().forEach((card, i) => {
      cumulative += sum ? shares[i] / sum : 1 / shares.length;
      const rounded = Math.round((100 - parent.valueAsNumber) * cumulative);
      card.querySelector('.percent').value = rounded - assigned;
      assigned = rounded;
    });
    update();
    onEdit();
  });
  form.family.addEventListener('change', update);
  return {
    read: values,
    write(contacts) {
      rows.replaceChildren();
      for (const c of contacts) append(c);
      update();
    },
  };
}
