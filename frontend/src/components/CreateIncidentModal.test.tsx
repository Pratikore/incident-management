import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import CreateIncidentModal from './CreateIncidentModal';

const mutateAsync = vi.fn();

vi.mock('../hooks/useIncidents', () => ({
  useCreateIncident: () => ({ mutateAsync, isPending: false }),
}));

describe('CreateIncidentModal', () => {
  beforeEach(() => {
    mutateAsync.mockReset();
  });

  it('shows validation errors and does not submit when required fields are empty', async () => {
    renderWithProviders(<CreateIncidentModal onClose={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /create incident/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('submits a valid incident and closes', async () => {
    mutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    renderWithProviders(<CreateIncidentModal onClose={onClose} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'DB outage');
    await userEvent.type(screen.getByLabelText(/description/i), 'Primary DB unreachable');
    await userEvent.click(screen.getByRole('button', { name: /create incident/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      title: 'DB outage',
      description: 'Primary DB unreachable',
      severity: 'MEDIUM',
      category: 'APPLICATION',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
