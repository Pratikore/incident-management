import { useState } from 'react';
import { recommendSeverity, uploadAttachment } from '../api/client';
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
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recommending, setRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const createMutation = useCreateIncident();

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = 'Title is required';
    if (!description.trim()) next.description = 'Description is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const created = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        severity,
        category,
      });
      if (files.length > 0 && created?.id) {
        setUploading(true);
        for (const file of files) {
          await uploadAttachment(created.id, file);
        }
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
      } else {
        setErrors({ form: err instanceof Error ? err.message : 'Failed to create incident' });
      }
    } finally {
      setUploading(false);
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Attachments <span className="font-normal text-slate-400">(screenshots or files, optional)</span>
            </label>
            <label
              htmlFor="attachments"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-4 text-sm text-slate-500 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z"
                  clipRule="evenodd"
                />
              </svg>
              Click to add files
            </label>
            <input
              id="attachments"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <span className="truncate">
                      {file.name} <span className="text-slate-400">({Math.ceil(file.size / 1024)} KB)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 shrink-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                      aria-label={`Remove ${file.name}`}
                    >
                      &times;
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              disabled={createMutation.isPending || uploading}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
            >
              {uploading ? 'Uploading files...' : createMutation.isPending ? 'Creating...' : 'Create incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
