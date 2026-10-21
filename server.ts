import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseRawTextToClients } from './src/utils/parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI dynamically to support runtime env injection
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient multi-model schedule with immediate failover
// Priority: gemini-flash-latest (fast & high availability) -> gemini-3.1-flash-lite (spillover) -> gemini-3.8-flash
const MODEL_SCHEDULE = [
  { model: 'gemini-flash-latest', timeoutMs: 9000 },
  { model: 'gemini-3.1-flash-lite', timeoutMs: 9000 },
  { model: 'gemini-3.8-flash', timeoutMs: 9000 },
];

function isTransientError(err: any): boolean {
  const msg = (err?.message || '').toLowerCase();
  const status = String(err?.status || err?.code || err?.statusCode || '');
  return (
    status === '503' ||
    status === '429' ||
    status === '500' ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('rate limit') ||
    msg.includes('overloaded') ||
    msg.includes('temporary') ||
    msg.includes('spikes in demand') ||
    msg.includes('resource exhausted') ||
    msg.includes('fetch failed') ||
    msg.includes('network error') ||
    msg.includes('timed out') ||
    msg.includes('timeout')
  );
}

function callWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Model request timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

app.post('/api/extract-list', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', rawText } = req.body;

    // Fast-path: If rawText is provided, parse deterministically first!
    // Instant response, 0ms latency, zero reliance on AI availability
    if (rawText && typeof rawText === 'string') {
      const localParsed = parseRawTextToClients(rawText);
      if (localParsed.clients.length > 0) {
        return res.json({
          title: undefined,
          detectedRate: localParsed.detectedRate,
          clients: localParsed.clients.map((c) => ({ name: c.name, sms: c.sms })),
        });
      }
    }

    const ai = getAIClient();
    if (!ai) {
      if (rawText) {
        const fallbackParsed = parseRawTextToClients(rawText);
        return res.json({
          title: undefined,
          detectedRate: fallbackParsed.detectedRate,
          clients: fallbackParsed.clients.map((c) => ({ name: c.name, sms: c.sms })),
        });
      }
      return res.status(400).json({
        error: 'AI key not available. Please click Paste Text to import your list instantly.',
      });
    }

    const systemInstruction = `You are an expert data extraction assistant for client product billing and accounting.
Your job is to read screenshots, tables, lists, or text messages containing client/user names and their corresponding product counts (numbers).

CRITICAL EXTRACTION RULES:
1. Preserve the EXACT original order of the list as it appears from top to bottom (do NOT sort by product count or alphabetically unless explicitly asked).
2. Clean up user names: keep underscores or spaces as given (e.g., "Client_A_Akrash", "KB4_Aqib_ghr", "Faith_Abdullah2").
3. Extract product count as a clean integer number in the 'sms' field.
4. If a rate is mentioned in the image/text (e.g., "Rate 2.3 PKR" or "2.3"), extract it. Default is null if not specified.
5. Return a strict JSON response matching the requested schema.`;

    let contents: any;

    if (imageBase64) {
      // Clean base64 header if included
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: 'Extract all client names and their SMS counts from this screenshot/image. Keep exact top-to-bottom order.',
          },
        ],
      };
    } else if (rawText) {
      contents = `Extract all client names and SMS counts from this text:
"""
${rawText}
"""
Preserve original order.`;
    } else {
      return res.status(400).json({ error: 'Please provide an image or text.' });
    }

    let response: any = null;
    let lastError: any = null;

    // Try model schedule with per-call timeout
    for (let i = 0; i < MODEL_SCHEDULE.length; i++) {
      const { model, timeoutMs } = MODEL_SCHEDULE[i];
      try {
        const generatePromise = ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: `${systemInstruction}
Output format must be a single JSON object:
{
  "detectedRate": number | null,
  "title": string | null,
  "clients": [
    { "name": string, "sms": number }
  ]
}`,
            responseMimeType: 'application/json',
          },
        });

        response = await callWithTimeout(generatePromise, timeoutMs);

        if (response?.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.info(`Model attempt ${i + 1} (${model}) status:`, err?.status || err?.message || 'retry');

        if (isTransientError(err) && i < MODEL_SCHEDULE.length - 1) {
          await new Promise((r) => setTimeout(r, 150));
          continue;
        }

        if (!isTransientError(err)) {
          break;
        }
      }
    }

    if (!response || !response.text) {
      if (rawText) {
        const parsed = parseRawTextToClients(rawText);
        if (parsed.clients.length > 0) {
          return res.json({
            title: undefined,
            detectedRate: parsed.detectedRate,
            clients: parsed.clients.map((c) => ({ name: c.name, sms: c.sms })),
          });
        }
      }

      throw lastError || new Error('Unable to extract data from image.');
    }

    let jsonText = (response.text || '').trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const parsed = JSON.parse(jsonText || '{}');
    return res.json(parsed);
  } catch (error: any) {
    const transient = isTransientError(error);
    const userMsg = transient
      ? 'The AI service is experiencing temporary high demand. Please retry the scan or paste the text list directly.'
      : (error?.message || 'Failed to extract data.');

    return res.status(transient ? 503 : 500).json({
      error: userMsg,
      isTransient: transient,
      canRetry: true,
    });
  }
});

// Always return JSON errors for API routes so frontend never receives unexpected HTML
app.use('/api', (err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('API Error intercepted:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error. Please retry or paste text directly.',
    isTransient: true,
  });
});

// Setup Vite middleware for development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
