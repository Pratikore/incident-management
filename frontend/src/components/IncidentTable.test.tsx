import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test/utils';
import IncidentTable from './IncidentTable';
import type { Incident } from '../types/incident';

const incident: Incident = {
  id: 'abc-123',
  reference: 'INC-0001',
  title: 'Checkout latency spike',
  description: 'p99 latency above 2s',
  severity: 'HIGH',
  category: 'APPLICATION',
  status: 'OPEN',
  createdBy: 'admin',
  createdAt: '2026-07-01T10:00:00Z',
  updatedAt: '2026-07-01T10:00:00Z',
};

describe('IncidentTable', () => {
  it('shows an empty state when there are no incidents', () => {
    renderWithProviders(<IncidentTable incidents={[]} />);
    expect(screen.getByText(/no incidents found/i)).toBeInTheDocument();
  });

  it('renders incident rows with reference, title, reporter, severity and status', () => {
    renderWithProviders(<IncidentTable incidents={[incident]} />);
    expect(screen.getByText('INC-0001')).toBeInTheDocument();
    expect(screen.getByText(/checkout latency spike/i)).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });
});
