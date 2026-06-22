import React, { useState, useCallback } from 'react';

interface FieldRowProps {
  label: string;
  value: string;
  path: string;
  locked: boolean;
  onEdit: (path: string, value: string) => void;
  onToggleLock: (path: string, locked: boolean) => void;
}

export default function FieldRow({ label, value, path, locked, onEdit, onToggleLock }: FieldRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = useCallback(() => {
    onEdit(path, editValue);
    setIsEditing(false);
  }, [path, editValue, onEdit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  }, [handleSave, value]);

  return (
    <div className="flex items-center gap-2 py-1.5 px-3 hover:bg-ff-bg-elevated/50 group">
      <div className="w-[90px] shrink-0 text-ff-text-secondary text-[11px] truncate" title={label}>
        {label}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-[11px] py-0.5 px-1.5"
          />
        ) : (
          <div
            onClick={() => { setEditValue(value); setIsEditing(true); }}
            className={`text-[11px] truncate cursor-text py-0.5 px-1.5 rounded hover:bg-ff-bg-secondary
              ${value ? 'text-ff-text-primary' : 'text-ff-text-muted italic'}
            `}
            title={value || 'Click to edit'}
          >
            {value || '—'}
          </div>
        )}
      </div>

      <button
        onClick={() => onToggleLock(path, !locked)}
        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px]
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          ${locked ? 'text-ff-warning opacity-100' : 'text-ff-text-muted hover:text-ff-text-secondary'}
        `}
        title={locked ? 'Unlock field (allow re-parse)' : 'Lock field (preserve on re-parse)'}
      >
        {locked ? '🔒' : '🔓'}
      </button>
    </div>
  );
}
