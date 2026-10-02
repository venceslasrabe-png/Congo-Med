import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Méthode non autorisée.' }) };
  }

  try {
    const { query, specialty } = JSON.parse(event.body || '{}');

    if (!query || typeof query !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'La requête de recherche est requise.' }),
      };
    }

    const systemPrompt = `Tu es le conseiller scientifique et réglementaire officiel de CongoMed (Brazzaville, République du Congo).
Tu assistes les médecins, chirurgiens, directeurs de cliniques et pharmaciens en fournissant des informations précises, fiables et vérifiées en direct via Google Search.
Couvre les normes CE, ISO 13485, recommandations OMS, protocoles d'asepsie, traçabilité et réglementation en Afrique Centrale / Congo.
Réponds de manière claire, structurée et professionnelle en français avec puces et conseils pratiques.`;

    const fullPrompt = `${systemPrompt}

Domaine ou spécialité : ${specialty || 'Matériel & Consommables Médicaux'}
Question ou recherche : ${query}

Vérifie les données récentes sur le web et cite les sources fiables.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = response.text || 'Aucune réponse générée.';
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const sources = searchChunks
      .filter((chunk) => chunk.web && chunk.web.uri)
      .map((chunk) => ({
        title: chunk.web.title || 'Source vérifiée Google',
        uri: chunk.web.uri,
      }));

    return {
      statusCode: 200,
      body: JSON.stringify({ answer, sources, searchQueries }),
    };
  } catch (error) {
    console.error('Error during Google Search Grounding:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erreur lors de la recherche avec Google Search Grounding.',
        details: error.message,
      }),
    };
  }
};
