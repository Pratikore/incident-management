import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/utils';
import UsersPage from './UsersPage';

const createMutateAsync = vi.fn();

vi.mock('../hooks/useUsers', () => ({
  useUsers: () => ({ data: [{ id: '1', username: 'admin', role: 'ADMIN', createdAt: '2026-07-01T10:00:00Z' }], isLoading: false, isError: false }),
  useCreateUser: () => ({ mutateAsync: createMutateAsync, isPending: false }),
}));

describe('UsersPage', () => {
  beforeEach(() => createMutateAsync.mockReset());

  it('lists existing users', () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('validates username and password before creating', async () => {
    renderWithProviders(<UsersPage />);

    await userEvent.type(screen.getByLabelText('Username'), 'ab');
    await userEvent.type(screen.getByLabelText('Password'), '123');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(await screen.findByText(/at least 3 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(createMutateAsync).not.toHaveBeenCalled();
  });

  it('creates a user with valid input', async () => {
    createMutateAsync.mockResolvedValue({});
    renderWithProviders(<UsersPage />);

    await userEvent.type(screen.getByLabelText('Username'), 'operator');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /create user/i }));

    expect(createMutateAsync).toHaveBeenCalledWith({
      username: 'operator',
      password: 'secret123',
      role: 'USER',
    });
  });
});
