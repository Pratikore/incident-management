import { useState } from 'react';
import { useCreateUser, useUsers } from '../hooks/useUsers';
import { ROLES } from '../types/auth';
import type { Role } from '../types/auth';
import { ApiError } from '../api/client';
import { formatDateTime } from '../utils/format';

export default function UsersPage() {
  const { data: users, isLoading, isError, error } = useUsers();
  const createUser = useCreateUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('USER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (username.trim().length < 3) next.username = 'Username must be at least 3 characters';
    if (password.length < 6) next.password = 'Password must be at least 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    if (!validate()) return;
    try {
      await createUser.mutateAsync({ username: username.trim(), password, role });
      setSuccess(`User "${username.trim()}" created.`);
      setUsername('');
      setPassword('');
      setRole('USER');
      setErrors({});
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Failed to create user' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage users and their roles.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Create user</h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="new-username" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Username
              </label>
              <input
                id="new-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.username && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>
            <div>
              <label htmlFor="new-role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                id="new-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {errors.form && <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>}
            {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}

            <button
              type="submit"
              disabled={createUser.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            >
              {createUser.isPending ? 'Creating...' : 'Create user'}
            </button>
          </form>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
            Users
          </h2>
          {isLoading && <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Loading users...</p>}
          {isError && (
            <p className="p-5 text-sm text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
          )}
          {users && (
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Username
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Role
                  </th>
                  <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{u.username}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          u.role === 'ADMIN'
                            ? 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900'
                            : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3 text-sm text-slate-500 dark:text-slate-400 sm:table-cell">
                      {formatDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
