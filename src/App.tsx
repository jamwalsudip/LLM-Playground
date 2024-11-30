// @ts-ignore
import React, { useState, useRef } from 'react';
import { Plus, Check } from 'lucide-react';
import type { Box } from './types/llm';
import { BoxComponent } from './components/BoxComponent';
import { APIConfigModal } from './components/APIConfigModal';

export function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [confirmedBoxes, setConfirmedBoxes] = useState<Box[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const addButtonRef = useRef<HTMLDivElement>(null);
  const maxBoxes = 3;

  const handleSubmit = async () => {
    if (prompt.trim() === '' || confirmedBoxes.length === 0) return;
    
    setIsSubmitted(true);
    setConfirmedBoxes(confirmedBoxes.map(box => ({
      ...box,
      loading: true,
      error: null
    })));

    try {
      const updatedBoxes = await Promise.all(
        confirmedBoxes.map(async (box) => {
          if (!box.provider || !box.apiKey || !box.selectedModel) {
            return {
              ...box,
              loading: false,
              error: 'Please configure the API settings'
            };
          }
          
          try {
            const response = await fetch('http://localhost:3000/api/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                provider: box.provider,
                model: box.selectedModel,
                prompt,
                apiKey: box.apiKey
              }),
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            return {
              ...box,
              loading: false,
              response: `${data.output}`
            };
          } catch (error: any) {
            return {
              ...box,
              loading: false,
              error: error.message || 'Failed to get response'
            };
          }
        })
      );
      
      setConfirmedBoxes(updatedBoxes);
    } catch (error) {
      setConfirmedBoxes(confirmedBoxes.map(box => ({
        ...box,
        loading: false,
        error: 'An unexpected error occurred'
      })));
    } finally {
      setIsSubmitted(false);
    }
  };

  const addBox = () => {
    if (confirmedBoxes.length >= maxBoxes) return;
    setIsModalOpen(true);
  };

  const handleConfirmSettings = (config: Omit<Box, 'id' | 'response' | 'loading' | 'error'>) => {
    const newBox: Box = {
      ...config,
      id: Date.now().toString(),
      response: '',
      loading: false,
      error: null
    };
    setConfirmedBoxes([...confirmedBoxes, newBox]);
  };

  const removeBox = (id: string) => {
    setConfirmedBoxes(confirmedBoxes.filter(box => box.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative font-sans">
      <h1 
        className="absolute left-1/2 transform -translate-x-1/2 text-6xl font-bold text-black" 
        style={{ top: '15vh' }}
      >
        LLM Playground
      </h1>

      <div 
        className="absolute left-1/2 transform -translate-x-1/2 w-full px-6"
        style={{ 
          top: '40vh',
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Input Query Section */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex w-full bg-white rounded-[30px] shadow-lg">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && (e.key === 'Enter' || e.key === 'Return')) {
                  handleSubmit();
                }
              }}
              placeholder="Enter your query here"
              className="flex-1 h-14 px-6 bg-transparent outline-none text-gray-600 placeholder-gray-400"
            />
            <div className="group">
              <button
                onClick={handleSubmit}
                className={`w-14 h-14 flex items-center justify-center transition-colors ${
                  isSubmitted ? 'bg-green-600' : 'bg-black'
                } rounded-[30px]`}
              >
                <Check className="w-6 h-6 text-white transition-transform duration-200 group-hover:scale-125" />
              </button>
            </div>
          </div>
        </div>

        {/* Add API Button */}
        <div className="text-center mb-8">
          <div ref={addButtonRef} className="inline-block group">
            <button
              onClick={addBox}
              disabled={confirmedBoxes.length >= maxBoxes}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-[20px] transition-all disabled:opacity-50"
            >
              <span className="transition-transform duration-300 transform group-hover:scale-125">
                <Plus className="w-4 h-4" />
              </span>
              <span>Add API Response</span>
            </button>
          </div>
        </div>

        {/* API Configuration Modal */}
        <APIConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmSettings}
          buttonRef={addButtonRef}
        />

        {/* Comparison Boxes Container */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedBoxes.map(box => (
              <BoxComponent 
                key={box.id} 
                {...box} 
                onRemove={removeBox}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
