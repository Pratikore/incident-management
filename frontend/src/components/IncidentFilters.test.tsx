import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IncidentFilters from './IncidentFilters';

describe('IncidentFilters', () => {
  it('emits the selected severity', async () => {
    const onChange = vi.fn();
    render(<IncidentFilters filters={{}} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText(/severity/i), 'CRITICAL');

    expect(onChange).toHaveBeenCalledWith({ severity: 'CRITICAL' });
  });

  it('shows a clear button only when a filter is active and resets on click', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<IncidentFilters filters={{}} onChange={onChange} />);
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument();

    rerender(<IncidentFilters filters={{ status: 'OPEN' }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    expect(onChange).toHaveBeenCalledWith({});
  });
});
