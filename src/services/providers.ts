import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Define interfaces for API responses
interface OutputItem {
  type: string;
  text: string;
  content?: string;
}

interface APIResponse {
  output: OutputItem[] | string | { text?: string; content?: string };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const providers = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-3.5-turbo', 'gpt-4o-2024-11-20', 'gpt-4o-mini', 'o1-preview-2024-09-12', 'o1-mini-2024-09-12'],
    async getCompletion(apiKey: string, model: string, prompt: string): Promise<string> {
      try {
        const response = await axios.post<APIResponse>(`${API_BASE_URL}/generate`, {
          provider: 'openai',
          model,
          prompt,
          apiKey
        });
        console.log('OpenAI Response:', response.data);
        
        const output = response.data.output;
        
        if (Array.isArray(output)) {
          const firstOutput = output[0] as OutputItem;
          return firstOutput?.text || firstOutput?.content || '';
        }
        
        if (typeof output === 'object' && output !== null) {
          const objOutput = output as { text?: string; content?: string };
          return objOutput.text || objOutput.content || '';
        }
        
        return String(output || '');
      } catch (error: unknown) {
        console.error('OpenAI Error:', error);
        if (error instanceof Error) {
          throw new Error(
            axios.isAxiosError(error) 
              ? error.response?.data?.error || error.message
              : 'Failed to get completion from OpenAI'
          );
        }
        throw new Error('Failed to get completion from OpenAI');
      }
    }
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    async getCompletion(apiKey: string, model: string, prompt: string): Promise<string> {
      try {
        const response = await axios.post<APIResponse>(`${API_BASE_URL}/generate`, {
          provider: 'anthropic',
          model,
          prompt,
          apiKey
        });
        console.log('Anthropic Response:', response.data);
        
        const output = response.data.output;
        
        // Handle array of output objects
        if (Array.isArray(output)) {
          const textContent = output
            .filter((item: OutputItem) => item.type === "text")
            .map((item: OutputItem) => item.text)
            .filter(Boolean)  // Remove any undefined or empty strings
            .join('\n');
            
          if (textContent) {
            return textContent;
          }
        }
        
        // Handle direct string output
        if (typeof output === 'string') {
          return output;
        }
        
        // Handle nested output object
        if (typeof output === 'object' && output !== null && 'text' in output) {
          return output.text || '';
        }
        
        return '';  // Return empty string if no valid format is found
        
      } catch (error: unknown) {
        console.error('Anthropic Error:', error);
        if (error instanceof Error) {
          throw new Error(
            axios.isAxiosError(error)
              ? error.response?.data?.error || error.message
              : error.message || 'Failed to get completion from Anthropic'
          );
        }
        throw new Error('Failed to get completion from Anthropic');
      }
    }
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-pro'],
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    async getCompletion(apiKey: string, model: string, prompt: string): Promise<string> {
      try {
        const response = await axios.post<GeminiResponse>(
          `${this.baseURL}/${model}:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          }
        );
        console.log('Gemini Response:', response.data);
        
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || '';  // Return empty string if any part of the chain is undefined
      } catch (error: unknown) {
        console.error('Gemini Error:', error);
        if (error instanceof Error) {
          throw new Error(
            axios.isAxiosError(error)
              ? error.response?.data?.error || error.message
              : 'Failed to get completion from Gemini'
          );
        }
        throw new Error('Failed to get completion from Gemini');
      }
    }
  }
};

export type ProviderKey = keyof typeof providers;