import { useEffect, useState } from 'react';
import { fetchAttachmentBlob } from '../api/client';
import type { Attachment } from '../types/incident';
import { formatDateTime } from '../utils/format';

function isImage(attachment: Attachment): boolean {
  return (attachment.contentType ?? '').startsWith('image/');
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CardProps {
  incidentId: string;
  attachment: Attachment;
}

function AttachmentCard({ incidentId, attachment }: CardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const image = isImage(attachment);

  useEffect(() => {
    if (!image) return undefined;
    let active = true;
    let objectUrl: string | null = null;
    fetchAttachmentBlob(incidentId, attachment.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [incidentId, attachment.id, image]);

  const download = async () => {
    try {
      const blob = await fetchAttachmentBlob(incidentId, attachment.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      {image && previewUrl ? (
        <a href={previewUrl} target="_blank" rel="noreferrer" className="block bg-slate-50 dark:bg-slate-800/50">
          <img src={previewUrl} alt={attachment.filename} className="h-32 w-full object-cover" />
        </a>
      ) : (
        <div className="flex h-32 items-center justify-center bg-slate-50 text-slate-400 dark:bg-slate-800/50">
          {error ? (
            <span className="text-xs text-red-500">Failed to load</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
              <path
                fillRule="evenodd"
                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM14.25 5.25a5.23 5.23 0 0 0-1.279-3.434 9.768 9.768 0 0 1 6.963 6.963A5.23 5.23 0 0 0 16.5 7.5h-1.875a.375.375 0 0 1-.375-.375V5.25Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{attachment.filename}</p>
          <p className="text-[11px] text-slate-400">
            {humanSize(attachment.size)} &middot; {formatDateTime(attachment.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={download}
          className="shrink-0 text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Download
        </button>
      </div>
    </div>
  );
}

interface Props {
  incidentId: string;
  attachments: Attachment[];
}

export default function AttachmentGallery({ incidentId, attachments }: Props) {
  if (attachments.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">No attachments.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {attachments.map((attachment) => (
        <AttachmentCard key={attachment.id} incidentId={incidentId} attachment={attachment} />
      ))}
    </div>
  );
}
