import { useEffect, useRef, useState } from 'react';
import { sendChatMessage } from '../api/client';
import type { ChatMessage } from '../types/incident';

const ASSISTANT_NAME = 'Aria';

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    `Hi, I'm ${ASSISTANT_NAME}, your incident assistant. Ask me about open or critical ` +
    'incidents, or the status of a specific one (e.g. INC-0001).',
};

const SUGGESTIONS = ['Status of INC-0001', 'How many are open?', 'Which are critical?'];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;

    const history = messages.filter((m) => m !== GREETING);
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setError(null);
    setSending(true);
    try {
      const reply = await sendChatMessage(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply.text }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reach the assistant');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-30 flex h-[26rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">{ASSISTANT_NAME}</p>
              <p className="text-xs text-white/80">Your incident assistant</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-white/80 hover:text-white">
              &times;
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {messages.length === 1 && !sending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {sending && <p className="text-xs text-slate-400">{ASSISTANT_NAME} is typing...</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="max-h-24 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle chat assistant"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-xl transition hover:scale-105"
      >
        {open ? (
          <span className="text-2xl leading-none">&times;</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path
              fillRule="evenodd"
              d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.9 48.9 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.678 3.348-3.97Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </>
  );
}
