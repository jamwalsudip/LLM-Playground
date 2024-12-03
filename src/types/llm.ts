export interface LLMProvider {
  id: string;
  name: string;
  available_models: string[];
}

export interface Box {
  id: string;
  provider: 'openai' | 'anthropic' | 'gemini' | null;
  apiKey: string;
  selectedModel: string | null;
  response: string;
  loading: boolean;
  error: string | null;
}
