import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.post('/api/generate', async (req, res) => {
  const { provider, model, prompt, apiKey } = req.body;

  try {
    let response;

    switch (provider) {
      case 'anthropic':
        response = await axios.post(
          'https://api.anthropic.com/v1/messages',
          {
            model,
            max_tokens: 1024,
            system: "You are Claude, a helpful AI assistant.",
            messages: [{
              role: 'user',
              content: prompt
            }]
          },
          {
            headers: {
              'anthropic-version': '2023-06-01',
              'x-api-key': apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
        res.json({ output: response.data.content });
        return;

      case 'openai':
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model,
            messages: [{ role: 'user', content: prompt }]
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        res.json({ output: response.data.choices[0].message.content });
        return;

      default:
        res.status(400).json({ error: 'Unsupported provider' });
        return;
    }
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error);
    const errorMessage = error.response?.data?.error?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to get response';
    res.status(500).json({ error: errorMessage });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});