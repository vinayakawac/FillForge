import React, { useState, useEffect, useCallback } from 'react';
import type { ProfileData, ProviderType, FieldLocks } from '../lib/types';
import { createEmptyProfile } from '../lib/types';
import UploadZone from './UploadZone';
import ProviderBadge from './ProviderBadge';
import FieldRow from './FieldRow';

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData>(createEmptyProfile());
  const [locks, setLocks] = useState<FieldLocks>({});
  const [filename, setFilename] = useState('');
  const [parseProvider, setParseProvider] = useState<ProviderType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fillStatus, setFillStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load profile on mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_PROFILE' }, (res) => {
      if (res?.profile) setProfile(res.profile);
      if (res?.filename) setFilename(res.filename);
      if (res?.parseProvider) setParseProvider(res.parseProvider);
    });
    chrome.runtime.sendMessage({ type: 'GET_LOCKS' }, (res) => {
      if (res?.locks) setLocks(res.locks);
    });
  }, []);

  // Parse resume
  const handleFileSelected = useCallback(async (file: File) => {
    setIsLoading(true);
    setError('');

    // Convert to base64 data URL for message passing
    const reader = new FileReader();
    reader.onload = () => {
      chrome.runtime.sendMessage({
        type: 'PARSE_RESUME',
        payload: {
          fileData: reader.result,
          fileName: file.name,
          fileType: file.type,
        },
      }, (res) => {
        setIsLoading(false);
        if (res?.error) {
          setError(res.error);
        }
        if (res?.profile) {
          setProfile(res.profile);
          setParseProvider(res.provider);
          setFilename(file.name);
        }
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Edit field
  const handleEdit = useCallback((path: string, value: string) => {
    chrome.runtime.sendMessage({
      type: 'UPDATE_PROFILE',
      payload: { path, value },
    });

    // Optimistic update
    setProfile(prev => {
      const updated = structuredClone(prev);
      const keys = path.split('.');
      let current: Record<string, unknown> = updated as unknown as Record<string, unknown>;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as Record<string, unknown>;
      }
      current[keys[keys.length - 1]] = value;
      return updated;
    });
  }, []);

  // Toggle lock
  const handleToggleLock = useCallback((path: string, locked: boolean) => {
    chrome.runtime.sendMessage({
      type: 'LOCK_FIELD',
      payload: { path, locked },
    });
    setLocks(prev => {
      const updated = { ...prev };
      if (locked) updated[path] = true;
      else delete updated[path];
      return updated;
    });
  }, []);

  // Fill current page
  const handleFill = useCallback(() => {
    setFillStatus(null);
    chrome.runtime.sendMessage({ type: 'FILL_PAGE' }, (res) => {
      if (res?.error) {
        setFillStatus({ type: 'error', message: res.error });
      } else if (res?.results) {
        const filled = res.results.filter((r: { filled: boolean }) => r.filled).length;
        const skipped = res.results.filter((r: { filled: boolean }) => !r.filled).length;
        setFillStatus({ type: 'success', message: `✓ ${filled} filled, ${skipped} skipped` });
      }
    });
  }, []);

  const hasProfile = profile.personal.firstName || profile.personal.email;

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Upload Zone */}
      <UploadZone
        onFileSelected={handleFileSelected}
        isLoading={isLoading}
        filename={filename}
      />

      {/* Status */}
      {parseProvider && <ProviderBadge provider={parseProvider} />}

      {error && (
        <div className="text-ff-error text-[11px] px-2 py-1.5 bg-ff-error/10 rounded-component">
          {error}
        </div>
      )}

      {/* Fill Button */}
      {hasProfile && (
        <button
          id="btn-fill"
          onClick={handleFill}
          className="w-full py-2 px-4 bg-ff-accent text-white rounded-component font-medium text-xs
            hover:bg-ff-accent-hover transition-colors duration-150"
        >
          ⚡ Fill This Page
        </button>
      )}

      {fillStatus && (
        <div className={`text-[11px] px-2 py-1 rounded-component ${
          fillStatus.type === 'success' ? 'bg-ff-success/10 text-ff-success' : 'bg-ff-error/10 text-ff-error'
        }`}>
          {fillStatus.message}
        </div>
      )}

      {/* Profile Fields */}
      {hasProfile && (
        <div className="border border-ff-border rounded-component overflow-hidden">
          {/* Personal Info */}
          <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-b border-ff-border">
            Personal
          </div>
          <FieldRow label="First Name" value={profile.personal.firstName} path="personal.firstName" locked={!!locks['personal.firstName']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Last Name" value={profile.personal.lastName} path="personal.lastName" locked={!!locks['personal.lastName']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Email" value={profile.personal.email} path="personal.email" locked={!!locks['personal.email']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Phone" value={profile.personal.phone} path="personal.phone" locked={!!locks['personal.phone']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="LinkedIn" value={profile.personal.linkedin} path="personal.linkedin" locked={!!locks['personal.linkedin']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="GitHub" value={profile.personal.github} path="personal.github" locked={!!locks['personal.github']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Portfolio" value={profile.personal.portfolio} path="personal.portfolio" locked={!!locks['personal.portfolio']} onEdit={handleEdit} onToggleLock={handleToggleLock} />

          {/* Address */}
          <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-y border-ff-border">
            Address
          </div>
          <FieldRow label="Street" value={profile.personal.address.street} path="personal.address.street" locked={!!locks['personal.address.street']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="City" value={profile.personal.address.city} path="personal.address.city" locked={!!locks['personal.address.city']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="State" value={profile.personal.address.state} path="personal.address.state" locked={!!locks['personal.address.state']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Zip" value={profile.personal.address.zip} path="personal.address.zip" locked={!!locks['personal.address.zip']} onEdit={handleEdit} onToggleLock={handleToggleLock} />
          <FieldRow label="Country" value={profile.personal.address.country} path="personal.address.country" locked={!!locks['personal.address.country']} onEdit={handleEdit} onToggleLock={handleToggleLock} />

          {/* Summary */}
          {profile.summary && (
            <>
              <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-y border-ff-border">
                Summary
              </div>
              <div className="px-3 py-2 text-[11px] text-ff-text-primary leading-relaxed">
                {profile.summary}
              </div>
            </>
          )}

          {/* Work Experience */}
          {profile.work.length > 0 && (
            <>
              <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-y border-ff-border">
                Experience ({profile.work.length})
              </div>
              {profile.work.map((w, i) => (
                <div key={i} className="px-3 py-1.5 border-b border-ff-border/50 last:border-0">
                  <div className="text-[11px] font-medium text-ff-text-primary">{w.title}</div>
                  <div className="text-[11px] text-ff-text-secondary">{w.company}</div>
                  <div className="text-[10px] text-ff-text-muted">
                    {[w.startMonth, w.startYear].filter(Boolean).join(' ')} — {w.current ? 'Present' : [w.endMonth, w.endYear].filter(Boolean).join(' ')}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Education */}
          {profile.education.length > 0 && (
            <>
              <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-y border-ff-border">
                Education ({profile.education.length})
              </div>
              {profile.education.map((e, i) => (
                <div key={i} className="px-3 py-1.5 border-b border-ff-border/50 last:border-0">
                  <div className="text-[11px] font-medium text-ff-text-primary">{e.degree} {e.field && `in ${e.field}`}</div>
                  <div className="text-[11px] text-ff-text-secondary">{e.institution}</div>
                  {e.gpa && <div className="text-[10px] text-ff-text-muted">GPA: {e.gpa}{e.maxGpa ? `/${e.maxGpa}` : ''}</div>}
                </div>
              ))}
            </>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <>
              <div className="text-[10px] font-medium text-ff-text-muted uppercase tracking-wider px-3 py-1.5 bg-ff-bg-secondary border-y border-ff-border">
                Skills ({profile.skills.length})
              </div>
              <div className="px-3 py-2 flex flex-wrap gap-1">
                {profile.skills.map((skill, i) => (
                  <span key={i} className="px-1.5 py-0.5 text-[10px] bg-ff-bg-elevated text-ff-text-secondary rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasProfile && !isLoading && (
        <div className="text-center py-6 text-ff-text-muted text-xs">
          Upload a resume to get started
        </div>
      )}
    </div>
  );
}
