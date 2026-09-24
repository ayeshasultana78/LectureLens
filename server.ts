import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// Analyze lecture or whiteboard image/notes endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Using pre-loaded interactive TA lesson.',
      });
    }

    const { imageBase64, mimeType = 'image/jpeg', notesText, topic = 'Computer Science / Operating Systems' } = req.body;

    if (!imageBase64 && !notesText) {
      return res.status(400).json({ error: 'Please provide an image or text notes to analyze.' });
    }

    const contents: any[] = [];

    if (imageBase64) {
      // Clean base64 prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9.+]+;base64,/, '');
      contents.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }

    const promptText = `
You are an expert Teaching Assistant. Analyze this uploaded lecture or whiteboard image (or notes).
Subject/Domain context: ${topic}
${notesText ? `User-provided notes/transcription: "${notesText}"` : ''}

You must provide:
1) A plain-English conceptual summary covering the core intuition, motivation, and practical real-world significance.
2) A step-by-step breakdown of every mathematical formula, symbol, or code snippet present, and crucially identify any ambiguities, sloppy blackboard handwriting, or transcription errors made by the instructor.
3) Two multiple-choice practice questions with 4 options each, an indicated correct answer index (0-3), and an in-depth pedagogical explanation.

Format your response strictly as JSON matching the requested schema.
`;

    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: 'You are an expert, encouraging university Teaching Assistant who excels at converting raw classroom whiteboards and lecture slides into crystal-clear structured pedagogical guides.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title of the lecture topic' },
            topicCategory: { type: Type.STRING, description: 'Subject domain e.g. Operating Systems' },
            conceptualSummary: { type: Type.STRING, description: 'Detailed plain-English conceptual summary (Markdown supported)' },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 key takeaway bullet points',
            },
            stepByStepBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Step or sub-concept name' },
                  formulaOrCode: { type: Type.STRING, description: 'LaTeX formula or code notation' },
                  explanation: { type: Type.STRING, description: 'Step-by-step conceptual derivation & meaning' },
                  ambiguitiesOrErrors: { type: Type.STRING, description: 'Ambiguities, notation quirks, or transcription errors on the board' },
                },
                required: ['title', 'formulaOrCode', 'explanation'],
              },
            },
            practiceQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING, description: 'The practice question' },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '4 multiple-choice options',
                  },
                  correctIndex: { type: Type.INTEGER, description: '0-based index of correct option' },
                  explanation: { type: Type.STRING, description: 'Detailed TA explanation of the answer' },
                },
                required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['title', 'conceptualSummary', 'stepByStepBreakdown', 'practiceQuestions'],
        },
      },
    });

    const textOutput = response.text?.trim() || '{}';
    const parsedData = JSON.parse(textOutput);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing lecture whiteboard:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze lecture whiteboard image.',
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LectureLens TA Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
