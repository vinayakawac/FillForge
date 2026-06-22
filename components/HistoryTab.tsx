import React, { useState, useEffect } from 'react';
import type { FillOperation } from '../lib/types';

export default function HistoryTab() {
  const [history, setHistory] = useState<FillOperation[]>([]);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_HISTORY' }, (res) => {
      if (res?.history) setHistory(res.history);
    });
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-ff-text-muted text-xs">
        No fill history yet
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {history.map((entry) => (
        <div key={entry.id} className="px-3 py-2 border-b border-ff-border hover:bg-ff-bg-elevated/50">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[11px] font-medium text-ff-text-primary truncate max-w-[200px]" title={entry.site}>
              {entry.site || entry.hostname}
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-ff-bg-elevated text-ff-text-muted">
              {entry.platform}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-ff-success">✓ {entry.filledCount} filled</span>
            <span className="text-ff-warning">— {entry.skippedCount} skipped</span>
            <span className="text-ff-text-muted ml-auto">
              {new Date(entry.date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
