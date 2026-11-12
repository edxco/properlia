import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import LeadsTable from '@/app/[locale]/(dashboard)/leads/LeadsTable';
import { DEFAULT_LEAD_SORT, toggleLeadSort } from '@/app/[locale]/(dashboard)/leads/leadsSort';

vi.mock('@properlia/shared/components/TranslationProvider', () => ({
  useT: () => (key: string) => key,
  useLocale: () => 'es',
}));

vi.mock('@/src/services/leads/queries', () => ({
  useChangeLeadStatus: () => ({ mutate: vi.fn(), isPending: false }),
}));

const lead = {
  id: '1',
  full_name: 'Ana Perez',
  email: 'ana@example.com',
  phone: '5512345678',
  whatsapp_consent: true,
  source: 'property_form',
  source_detail: {},
  status: 'new_lead',
  interest_operation: 'buy',
  score: 0,
  contact_attempts: 0,
  consent_marketing: false,
  property: { id: 'p1', title: 'Casa Centro' },
  created_at: '2026-11-11T12:00:00Z',
  updated_at: '2026-11-11T12:00:00Z',
};

const renderTable = (onSortChange = vi.fn(), sort = DEFAULT_LEAD_SORT) =>
  render(
    <LeadsTable
      leads={[lead] as never}
      isLoading={false}
      filters={{}}
      onFilterChange={vi.fn()}
      sort={sort}
      onSortChange={onSortChange}
    />
  );

describe('LeadsTable sorting', () => {
  it('calls onSortChange with the clicked column', () => {
    const onSortChange = vi.fn();
    renderTable(onSortChange);

    fireEvent.click(screen.getByRole('button', { name: 'property' }));
    fireEvent.click(screen.getByRole('button', { name: 'name' }));

    expect(onSortChange).toHaveBeenNthCalledWith(1, 'property');
    expect(onSortChange).toHaveBeenNthCalledWith(2, 'full_name');
  });

  it('marks the active column with aria-sort', () => {
    renderTable(vi.fn(), { column: 'full_name', direction: 'asc' });

    expect(screen.getByRole('columnheader', { name: 'name' }).getAttribute('aria-sort')).toBe('ascending');
    expect(screen.getByRole('columnheader', { name: 'leadsDate' }).getAttribute('aria-sort')).toBe('none');
  });
});

describe('toggleLeadSort', () => {
  it('flips the direction when the same column is clicked', () => {
    expect(toggleLeadSort({ column: 'full_name', direction: 'asc' }, 'full_name')).toEqual({
      column: 'full_name',
      direction: 'desc',
    });
  });

  it('starts new columns ascending, except date and attempts which start descending', () => {
    expect(toggleLeadSort(DEFAULT_LEAD_SORT, 'property')).toEqual({ column: 'property', direction: 'asc' });
    expect(toggleLeadSort({ column: 'property', direction: 'asc' }, 'created_at')).toEqual({
      column: 'created_at',
      direction: 'desc',
    });
  });
});
