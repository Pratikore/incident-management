import { useState } from 'react';
import { recommendSeverity } from '../api/client';
import { useCreateIncident } from '../hooks/useIncidents';
import { CATEGORIES, SEVERITIES } from '../types/incident';
import type { Category, Severity } from '../types/incident';
import { categoryLabel } from '../utils/incidentMeta';
import { ApiError } from '../api/client';

interface Props {
  onClose: () => void;
}

export default function CreateIncidentModal({ onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('MEDIUM');
  const [category, setCategory] = useState<Category>('APPLICATION');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recommending, setRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const createMutation = useCreateIncident();

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!description.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        severity,
        category,
      });
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Failed to create incident' });
      }
    }
  };

  const handleRecommend = async () => {
    if (!description.trim()) {
      setErrors((prev) => ({ ...prev, description: 'Add a description first for a recommendation' }));
      return;
    }
    setRecommending(true);
    setRecommendation(null);
    try {
      const result = await recommendSeverity(title.trim(), description.trim());
      setSeverity(result.severity);
      setRecommendation(`Suggested ${result.severity}: ${result.rationale}`);
    } catch (err) {
      setRecommendation(err instanceof Error ? err.message : 'Recommendation failed');
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create incident"
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New Incident</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="Short summary of the incident"
            />
            {errors.title && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              placeholder="What is happening, impact, and any relevant context"
            />
            {errors.description && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>}
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label htmlFor="severity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Severity
              </label>
              <button
                type="button"
                onClick={handleRecommend}
                disabled={recommending}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 dark:text-blue-400"
              >
                {recommending ? 'Thinking...' : 'Suggest with AI'}
              </button>
            </div>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {recommendation && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{recommendation}</p>}
          </div>

          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {categoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {errors.form && <p className="text-sm text-red-600 dark:text-red-400">{errors.form}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
