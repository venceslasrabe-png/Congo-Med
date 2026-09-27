import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI SDK (server-side only)
const ai = new GoogleGenAI({});

// API: Medical Search Grounding with Google Search
app.post('/api/medical-grounding', async (req, res) => {
  try {
    const { query, specialty } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'La requête de recherche est requise.' });
    }

    const systemPrompt = `Tu es le conseiller scientifique et réglementaire officiel de CongoMed (Brazzaville, République du Congo).
Tu assistes les médecins, chirurgiens, directeurs de cliniques et pharmaciens en fournissant des informations précises, fiables et vérifiées en direct via Google Search.
Couvre les normes CE, ISO 13485, recommandations OMS, protocoles d'asepsie, traçabilité et réglementation en Afrique Centrale / Congo.
Réponds de manière claire, structurée et professionnelle en français avec puces et conseils pratiques.`;

    const fullPrompt = `${systemPrompt}

Domaine ou spécialité : ${specialty || 'Matériel & Consommables Médicaux'}
Question ou recherche : ${query}

Vérifie les données récentes sur le web et cite les sources fiables.`;

    // Use gemini-2.5-flash with googleSearch tool as requested
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = response.text || 'Aucune réponse générée.';
    const searchChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries =
      response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    // Extract web source links
    const sources = searchChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source vérifiée Google',
        uri: chunk.web.uri,
      }));

    return res.json({
      answer,
      sources,
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error during Google Search Grounding:', error);
    return res.status(500).json({
      error: 'Erreur lors de la recherche avec Google Search Grounding.',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV === 'development';
  const hasDist = fs.existsSync(path.join(__dirname, 'dist', 'index.html'));
  const isProd = !isDev && (process.env.NODE_ENV === 'production' || Boolean(process.env.K_SERVICE) || hasDist);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CongoMed server running on http://0.0.0.0:${PORT} [${isProd ? 'PROD' : 'DEV'}]`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
