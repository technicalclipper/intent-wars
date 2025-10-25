'use client';

import React, { useState } from 'react';

interface SpellInput {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  options?: string[];
}

interface SpellConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigure: (config: Record<string, string>) => void;
  spellType: string;
  inputs: SpellInput[];
}

export function SpellConfigDialog({ isOpen, onClose, onConfigure, spellType, inputs }: SpellConfigDialogProps) {
  const [config, setConfig] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigure(config);
    onClose();
  };

  const handleInputChange = (inputId: string, value: string) => {
    setConfig({ ...config, [inputId]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border border-primary/40 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-3xl">⚗️</div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Configure {spellType} Spell</h3>
            <p className="text-sm text-muted-foreground">Set your magical parameters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {inputs.map((input) => (
            <div key={input.id}>
              <label className="block text-sm font-bold text-accent mb-2">
                {input.label}
              </label>
              {input.type === 'select' ? (
                <select
                  value={config[input.id] || ''}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
                  required
                >
                  <option value="" disabled>
                    {input.placeholder}
                  </option>
                  {input.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={input.type}
                  value={config[input.id] || ''}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  placeholder={input.placeholder}
                  className="w-full px-3 py-2 bg-input border border-primary/40 rounded-lg text-foreground focus:outline-none focus:border-accent/80"
                  required
                />
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-bold hover:bg-destructive/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-bold hover:bg-accent/80 transition-colors"
            >
              Configure Spell
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
