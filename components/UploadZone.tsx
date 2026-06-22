import React, { useState, useCallback, useRef } from 'react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  filename?: string;
}

const ACCEPTED_TYPES = '.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp';
const ACCEPTED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/png', 'image/jpeg', 'image/webp',
];

export default function UploadZone({ onFileSelected, isLoading, filename }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (ACCEPTED_MIME.includes(file.type) || /\.(pdf|docx?|png|jpe?g|webp)$/i.test(file.name)) {
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [handleFile]);

  return (
    <div
      id="upload-zone"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`border border-dashed rounded-component p-4 text-center cursor-pointer transition-colors duration-150
        ${isDragging
          ? 'border-ff-accent bg-ff-accent/5'
          : 'border-ff-border hover:border-ff-text-muted'
        }
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleChange}
        className="hidden"
      />

      {isLoading ? (
        <div className="py-2">
          <div className="text-ff-text-secondary text-xs">Parsing resume...</div>
          <div className="mt-2 h-1 bg-ff-bg-elevated rounded overflow-hidden">
            <div className="h-full bg-ff-accent rounded animate-pulse w-2/3" />
          </div>
        </div>
      ) : filename ? (
        <div className="py-1">
          <div className="text-ff-text-primary text-xs font-medium truncate">{filename}</div>
          <div className="text-ff-text-muted text-[11px] mt-1">Click or drag to replace</div>
        </div>
      ) : (
        <div className="py-2">
          <div className="text-ff-text-secondary text-xs mb-1">
            Drop resume here or click to upload
          </div>
          <div className="text-ff-text-muted text-[11px]">
            PDF, DOCX, PNG, JPG, WEBP
          </div>
        </div>
      )}
    </div>
  );
}
