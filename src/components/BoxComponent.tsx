import React from 'react';
import { X } from 'lucide-react';
import { providers } from '../services/providers';
import type { ProviderKey } from '../services/providers';

interface BoxComponentProps {
  id: string;
  provider: ProviderKey | null;
  selectedModel: string | null;
  loading: boolean;
  error: string | null;
  response?: string;
  onRemove: (id: string) => void;
}

export const BoxComponent: React.FC<BoxComponentProps> = ({
  id,
  provider,
  selectedModel,
  loading,
  error,
  response,
  onRemove
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4"
      style={{ minHeight: '200px' }}
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <div className="text-xl font-bold">
            {provider && providers[provider] ? providers[provider].name : 'Select Provider'}
          </div>
          <div className="text-sm">{selectedModel || 'No model selected'}</div>
        </div>
        <button 
          onClick={() => onRemove(id)}
          className="text-red-500 text-2xl font-thin hover:opacity-70"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mt-4">
        <div className="text-xs text-gray-400">response</div>
        <div className="mt-1 p-3 border border-gray-200 rounded-md min-h-[100px]">
          <div className="text-sm text-gray-400">
            {loading ? 'Processing...' : error ? error : response || 'No response yet'}
          </div>
        </div>
      </div>
    </div>
  );
};