import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forms } from '../src/data/forms.ts';

test('each form has unique field names, none reserved by Netlify', () => {
  for (const [name, form] of Object.entries(forms)) {
    const names = form.fields.map((f) => f.name);
    assert.equal(new Set(names).size, names.length, `${name} repeats a field`);
    for (const reserved of ['form-name', 'bot-field']) assert.ok(!names.includes(reserved), `${name} uses ${reserved}`);
  }
});

test('select fields list their options', () => {
  for (const form of Object.values(forms)) {
    for (const f of form.fields) if (f.type === 'select') assert.ok(f.options?.length, `${f.name} has no options`);
  }
});
