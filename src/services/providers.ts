import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const providers = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-3.5-turbo', 'gpt-4o-2024-11-20', 'gpt-4o-mini', 'o1-preview-2024-09-12', 'o1-mini-2024-09-12'],
    async getCompletion(apiKey: string, model: string, prompt: string) {
      try {
        const response = await axios.post(`${API_BASE_URL}/generate`, {
          provider: 'openai',
          model,
          prompt,
          apiKey
        });
        console.log('OpenAI Response:', response.data);
        // OpenAI response format handling
        if (Array.isArray(response.data.output)) {
          return response.data.output[0]?.text || response.data.output[0]?.content || response.data.output;
        }
        return response.data.output?.text || response.data.output?.content || response.data.output;
      } catch (error: any) {
        console.error('OpenAI Error:', error);
        throw new Error(error.response?.data?.error || 'Failed to get completion from OpenAI');
      }
    }
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-3-opus-20240229', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
    async getCompletion(apiKey: string, model: string, prompt: string) {
      try {
        const response = await axios.post(`${API_BASE_URL}/generate`, {
          provider: 'anthropic',
          model,
          prompt,
          apiKey
        });
        console.log('Anthropic Response:', response.data);
        // Anthropic response format handling
        if (Array.isArray(response.data.output)) {
          return response.data.output[0]?.text || response.data.output[0]?.content || response.data.output;
        }
        return response.data.output?.text || response.data.output;
      } catch (error: any) {
        console.error('Anthropic Error:', error);
        throw new Error(error.response?.data?.error || 'Failed to get completion from Anthropic');
      }
    }
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    models: ['gemini-pro'],
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/models',
    async getCompletion(apiKey: string, model: string, prompt: string) {
      try {
        const response = await axios.post(
          `${this.baseURL}/${model}:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          }
        );
        console.log('Gemini Response:', response.data);
        // Gemini response format handling
        return response.data.candidates[0].content.parts[0].text;
      } catch (error) {
        console.error('Gemini Error:', error);
        throw new Error('Failed to get completion from Gemini');
      }
    }
  }
};

export type ProviderKey = keyof typeof providers;