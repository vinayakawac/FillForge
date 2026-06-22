import React, { useState, useEffect } from 'react';
import type { FillResult } from '../lib/types';

export default function DebugTab() {
  const [llmResponse, setLlmResponse] = useState('');
  const [fillLog, setFillLog] = useState<FillResult[]>([]);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_DEBUG' }, (res) => {
      if (res?.llmResponse) setLlmResponse(res.llmResponse);
      if (res?.fillLog) setFillLog(res.fillLog);
    });
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Fill Log */}
      {fillLog.length > 0 && (
        <div className="border border-ff-border rounded-component overflow-hidden">
          <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-b border-ff-border">
            Last Fill Log ({fillLog.length} fields)
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {fillLog.map((result, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1 border-b border-ff-border/30 text-[10px]">
                <span className={result.filled ? 'text-ff-success' : 'text-ff-warning'}>
                  {result.filled ? '✓' : '—'}
                </span>
                <span className="text-ff-text-secondary truncate flex-1" title={result.field}>
                  {result.field}
                </span>
                <span className="text-ff-text-muted">
                  {result.confidence > 0 ? `${(result.confidence * 100).toFixed(0)}%` : ''}
                </span>
                {result.filled ? (
                  <span className="text-ff-text-primary truncate max-w-[80px]" title={result.value}>
                    {result.value}
                  </span>
                ) : (
                  <span className="text-ff-text-muted italic truncate max-w-[80px]" title={result.reason}>
                    {result.reason}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw LLM Response */}
      {llmResponse && (
        <div className="border border-ff-border rounded-component overflow-hidden">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="w-full text-left text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-b border-ff-border hover:bg-ff-bg-elevated"
          >
            Raw LLM Response {showRaw ? '▼' : '▶'}
          </button>
          {showRaw && (
            <pre className="p-3 text-[10px] text-ff-text-secondary overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words font-mono">
              {llmResponse}
            </pre>
          )}
        </div>
      )}

      {/* Empty state */}
      {!fillLog.length && !llmResponse && (
        <div className="text-center py-8 text-ff-text-muted text-xs">
          No debug data yet. Parse a resume or fill a page first.
        </div>
      )}
    </div>
  );
}
