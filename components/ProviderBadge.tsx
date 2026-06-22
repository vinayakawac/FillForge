import React from 'react';
import type { ProviderType } from '../lib/types';

interface ProviderBadgeProps {
  provider: ProviderType | null;
  className?: string;
}

const PROVIDER_LABELS: Record<ProviderType, string> = {
  'gemini': 'Gemini',
  'groq': 'Groq',
  'ollama-local': 'Ollama',
  'ollama-cloud': 'Ollama Cloud',
  'openrouter': 'OpenRouter',
};

export default function ProviderBadge({ provider, className = '' }: ProviderBadgeProps) {
  if (!provider) return null;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-ff-accent/10 text-ff-accent ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-ff-success" />
      {PROVIDER_LABELS[provider] || provider}
    </span>
  );
}
