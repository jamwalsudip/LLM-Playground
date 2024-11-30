import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { providers } from '../services/providers';
import type { Box } from '../types/llm';

interface APIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: Omit<Box, 'id' | 'response' | 'loading' | 'error'>) => void;
  buttonRef: React.RefObject<HTMLDivElement>;
}

export function APIConfigModal({ isOpen, onClose, onConfirm, buttonRef }: APIConfigModalProps) {
  const [provider, setProvider] = useState<Box['provider']>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current && modalRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const modalWidth = modalRef.current.offsetWidth;
      
      // Center align the modal
      const leftPosition = Math.max(0, (windowWidth - modalWidth) / 2);
      
      modalRef.current.style.top = '160px';
      modalRef.current.style.left = `${leftPosition}px`;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm({
      provider,
      apiKey,
      selectedModel,
    });
    onClose();
    // Reset form
    setProvider(null);
    setApiKey('');
    setSelectedModel(null);
  };

  if (!isOpen) return null;

  const availableModels = provider ? providers[provider].models : [];

  return (
    <div 
      ref={modalRef}
      className="fixed bg-white rounded-2xl p-8 w-[480px] shadow-xl z-50"
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-bold mb-6">API Configuration</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2">API Provider</label>
          <select
            value={provider || ''}
            onChange={(e) => {
              setProvider(e.target.value as Box['provider']);
              setSelectedModel(null);
            }}
            className="w-full p-3 border border-gray-300 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">Select Provider</option>
            {Object.entries(providers).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="w-full p-3 border border-gray-300 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-black bg-white placeholder:text-gray-300"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">API Model</label>
          <select
            value={selectedModel || ''}
            onChange={(e) => setSelectedModel(e.target.value || null)}
            disabled={!provider}
            className="w-full p-3 border border-gray-300 rounded-[15px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white"
          >
            <option value="">Select Model</option>
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!provider || !apiKey || !selectedModel}
          className="w-full mt-6 py-3 px-6 bg-black text-white rounded-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span className="text-lg">Confirm Settings</span>
        </button>
      </div>
    </div>
  );
}
