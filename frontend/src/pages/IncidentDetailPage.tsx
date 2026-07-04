import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  incidentKeys,
  useAddComment,
  useAttachments,
  useComments,
  useIncident,
  useUpdateStatus,
} from '../hooks/useIncidents';
import { generateSummary, suggestRootCause, uploadAttachment } from '../api/client';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import AttachmentGallery from '../components/AttachmentGallery';
import { STATUSES } from '../types/incident';
import type { IncidentStatus } from '../types/incident';
import { formatDateTime, statusLabel } from '../utils/format';
import { categoryLabel } from '../utils/incidentMeta';

export default function IncidentDetailPage() {
  const { id = '' } = useParams();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: incident, isLoading, isError, error } = useIncident(id);
  const updateStatus = useUpdateStatus(id);

  const { data: comments } = useComments(id);
  const addComment = useAddComment(id);
  const [commentBody, setCommentBody] = useState('');

  const { data: attachments } = useAttachments(id);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const [summary, setSummary] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRootCause, setLoadingRootCause] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (isLoading) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading incident...</p>;
  if (isError || !incident) {
    return (
      <div className="space-y-3">
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error instanceof Error ? error.message : 'Incident not found'}
        </p>
        <Link to="/incidents" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
          Back to incidents
        </Link>
      </div>
    );
  }

  const handleStatusChange = (status: IncidentStatus) => {
    updateStatus.mutate(status);
  };

  const handleAddComment = () => {
    if (!commentBody.trim()) return;
    addComment.mutate(commentBody.trim(), { onSuccess: () => setCommentBody('') });
  };

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadingAttachment(true);
    setAttachmentError(null);
    try {
      for (const file of Array.from(fileList)) {
        await uploadAttachment(id, file);
      }
      queryClient.invalidateQueries({ queryKey: incidentKeys.attachments(id) });
    } catch (err) {
      setAttachmentError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleSummary = async () => {
    setLoadingSummary(true);
    setAiError(null);
    try {
      const result = await generateSummary(id);
      setSummary(result.text);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleRootCause = async () => {
    setLoadingRootCause(true);
    setAiError(null);
    try {
      const result = await suggestRootCause(id);
      setRootCause(result.text);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to suggest root cause');
    } finally {
      setLoadingRootCause(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/incidents" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        &larr; Back to incidents
      </Link>

      <div className="card p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400">
              {incident.reference}
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{incident.title}</h1>
          </div>
          <div className="flex gap-2">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{incident.description}</p>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase text-slate-400">Category</dt>
            <dd className="text-slate-700 dark:text-slate-300">{categoryLabel(incident.category)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Raised by</dt>
            <dd className="text-slate-700 dark:text-slate-300">{incident.createdBy || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Created</dt>
            <dd className="text-slate-700 dark:text-slate-300">{formatDateTime(incident.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-slate-400">Last updated</dt>
            <dd className="text-slate-700 dark:text-slate-300">{formatDateTime(incident.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Status</h2>
          {!isAdmin && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              View only
            </span>
          )}
        </div>
        {isAdmin ? (
          <>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  disabled={status === incident.status || updateStatus.isPending}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    status === incident.status
                      ? 'cursor-default bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {statusLabel(status)}
                </button>
              ))}
            </div>
            {updateStatus.isError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {updateStatus.error instanceof Error ? updateStatus.error.message : 'Update failed'}
              </p>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <StatusBadge status={incident.status} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Only administrators can change the status of an incident.
            </p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Attachments {attachments && attachments.length > 0 && (
              <span className="text-slate-400">({attachments.length})</span>
            )}
          </h2>
          <label
            htmlFor="detail-attachment"
            className="cursor-pointer rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {uploadingAttachment ? 'Uploading...' : '+ Add file'}
          </label>
          <input
            id="detail-attachment"
            type="file"
            multiple
            className="hidden"
            disabled={uploadingAttachment}
            onChange={(e) => {
              void handleUploadFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </div>
        {attachmentError && <p className="mb-2 text-xs text-red-600 dark:text-red-400">{attachmentError}</p>}
        <AttachmentGallery incidentId={id} attachments={attachments ?? []} />
      </div>

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Activity &amp; comments {comments && comments.length > 0 && (
            <span className="text-slate-400">({comments.length})</span>
          )}
        </h2>

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-semibold uppercase text-white">
                    {comment.author.slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{comment.author}</span>
                      <span className="text-[11px] text-slate-400">{formatDateTime(comment.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm text-slate-700 dark:text-slate-300">
                      {comment.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No comments yet. Start the conversation below.
            </p>
          )}

          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <textarea
              rows={3}
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment or update for the team..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <div className="mt-2 flex items-center justify-between">
              {addComment.isError ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {addComment.error instanceof Error ? addComment.error.message : 'Failed to add comment'}
                </p>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!commentBody.trim() || addComment.isPending}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-500 hover:to-violet-500 disabled:opacity-50"
              >
                {addComment.isPending ? 'Posting...' : 'Add comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI assist</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSummary}
              disabled={loadingSummary}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {loadingSummary ? 'Summarizing...' : 'Generate summary'}
            </button>
            <button
              type="button"
              onClick={handleRootCause}
              disabled={loadingRootCause}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {loadingRootCause ? 'Analyzing...' : 'Suggest root cause'}
            </button>
          </div>
        </div>

        {aiError && <p className="mb-2 text-xs text-red-600 dark:text-red-400">{aiError}</p>}

        {(summary ?? incident.aiSummary) && (
          <div className="mb-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Summary</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {summary ?? incident.aiSummary}
            </p>
          </div>
        )}
        {(rootCause ?? incident.aiRootCause) && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-slate-400">Root-cause suggestions</h3>
            <p className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {rootCause ?? incident.aiRootCause}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
