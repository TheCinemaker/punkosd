import React from 'react';

// Melyik pályázati / költségvetési sorhoz tartozik a kiadás
export function BudgetLineSelect({ budget = [], value, name = 'budgetLine' }) {
  return (
    <div>
      <label className="field-label">Költségvetési sor (elszámoláshoz)</label>
      <select name={name} defaultValue={value || ''}>
        <option value="">— nincs hozzárendelve —</option>
        {budget.map(b => (
          <option key={b.id} value={b.id}>{b.code ? `${b.code} · ` : ''}{b.name}</option>
        ))}
      </select>
    </div>
  );
}
