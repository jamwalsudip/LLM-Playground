import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import axios from 'axios';

interface Provider {
  id: string;
  name: string;
  models: string[];
}

interface Providers {
  [key: string]: Provider;
}

interface Box {
  id: string;
  provider: string;
  apiKey: string;
  selectedModel: string;
  output: string;
  loading: boolean;
  error: string | null;
  response?: string;
}

const providers: Providers = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-3.5-turbo', 'gpt-4']
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022']
  }
};

const LLMPlayground: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [showApiForm, setShowApiForm] = useState<boolean>(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [confirmedBoxes, setConfirmedBoxes] = useState<Box[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setConfirmedBoxes(confirmedBoxes.map(box => ({
      ...box,
      loading: true
    })));

    try {
      const responses = await Promise.all(confirmedBoxes.map(box => 
        axios.post('/api/generate', {
          provider: box.provider,
          model: box.selectedModel,
          prompt,
          apiKey: box.apiKey
        })
      ));

      setConfirmedBoxes(prev => 
        prev.map((box, index) => ({
          ...box,
          loading: false,
          response: responses[index].data.output,
          error: null
        }))
      );
    } catch (error) {
      setConfirmedBoxes(prev =>
        prev.map(box => ({
          ...box,
          loading: false,
          error: 'Failed to generate response. Please try again.'
        }))
      );
    }
  };

  const addBox = () => {
    setBoxes([
      ...boxes,
      {
        id: Date.now().toString(),
        provider: '',
        apiKey: '',
        selectedModel: '',
        output: '',
        loading: false,
        error: null
      }
    ]);
  };

  const removeBox = (id: string) => {
    setConfirmedBoxes(confirmedBoxes.filter(box => box.id !== id));
  };

  const toggleApiForm = () => {
    if (confirmedBoxes.length >= 3) return;
    setShowApiForm(!showApiForm);
    if (!showApiForm && boxes.length === 0) {
      addBox();
    }
  };

  const confirmSettings = (box: Box) => {
    if (!box.apiKey.startsWith(box.provider === 'anthropic' ? 'sk-ant-' : 'sk-')) {
      alert('Invalid API key format');
      return;
    }
    setConfirmedBoxes([...confirmedBoxes, { ...box, response: '' }]);
    setBoxes(boxes.filter(b => b.id !== box.id));
    setShowApiForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <h1 
        className="absolute left-1/2 transform -translate-x-1/2 text-6xl font-bold text-black" 
        style={{ 
          top: '15vh',
          fontFamily: 'SF Pro Display, SF Pro, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        LLM Playground
      </h1>

      <div 
        className="absolute left-1/2 transform -translate-x-1/2 w-full px-6"
        style={{ 
          top: '40vh',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'SF Pro Display, SF Pro, -apple-system, BlinkMacSystemFont, sans-serif'
        }}
      >
        {/* Input Query Section */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="flex w-full bg-white rounded-[30px] shadow-lg">
            <input
              type="text"
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setIsSubmitted(false);
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && (e.key === 'Enter' || e.key === 'Return')) {
                  handleSubmit();
                }
              }}
              placeholder="Enter your query here"
              className="flex-1 h-14 px-6 bg-transparent outline-none text-gray-600 placeholder-gray-400"
              style={{ 
                fontFamily: 'SF Pro Display, SF Pro, -apple-system, BlinkMacSystemFont, sans-serif'
              }}
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
          <div className="inline-block group">
            <button
              onClick={toggleApiForm}
              disabled={confirmedBoxes.length >= 3}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-[20px] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span className="transition-transform duration-300 transform group-hover:scale-125">
                <Plus className="w-4 h-4" />
              </span>
              <span>Add API Response</span>
            </button>
          </div>
        </div>

        {/* Response Cards Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedBoxes.map((box) => (
              <div 
                key={box.id}
                className="bg-white rounded-lg shadow-sm p-4"
                style={{ minHeight: '200px' }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="text-xl font-bold">{providers[box.provider].name}</div>
                    <div className="text-sm">{box.selectedModel}</div>
                  </div>
                  <button 
                    onClick={() => removeBox(box.id)}
                    className="text-red-500 text-2xl font-thin hover:opacity-70"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs text-gray-400">response</div>
                  <div className="mt-1 p-3 border border-gray-200 rounded-md min-h-[100px]">
                    <div className="text-sm text-gray-400">
                      {box.loading ? 'Processing...' : box.error ? box.error : box.response || 'sample response...'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Configuration Modal */}
        {showApiForm && (
          <div className="relative">
            <div 
              className="absolute left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md mt-8"
            >
              {boxes.map((box) => (
                <div key={box.id} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">API Configuration</h3>
                    <button 
                      onClick={() => setShowApiForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Provider
                    </label>
                    <select
                      value={box.provider}
                      onChange={(e) => setBoxes(boxes.map(b => 
                        b.id === box.id ? { ...b, provider: e.target.value } : b
                      ))}
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black p-2"
                    >
                      <option value="">Select Provider</option>
                      {Object.values(providers).map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={box.apiKey}
                      onChange={(e) => setBoxes(boxes.map(b => 
                        b.id === box.id ? { ...b, apiKey: e.target.value } : b
                      ))}
                      placeholder="Enter your API key"
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Model
                    </label>
                    <select
                      value={box.selectedModel}
                      onChange={(e) => setBoxes(boxes.map(b => 
                        b.id === box.id ? { ...b, selectedModel: e.target.value } : b
                      ))}
                      disabled={!box.provider}
                      className="w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black p-2"
                    >
                      <option value="">Select Model</option>
                      {providers[box.provider]?.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => confirmSettings(box)}
                    disabled={!box.provider || !box.apiKey || !box.selectedModel}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    Confirm Settings
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMPlayground;