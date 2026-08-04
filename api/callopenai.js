// api/callopenai.js
// Backend du chatbot. Supporte OpenRouter (recommandé) ET OpenAI.
//
// Pourquoi OpenRouter ne marchait pas avant : cette fonction appelait en dur
// https://api.openai.com avec le modèle "gpt-3.5-turbo". Une clé OpenRouter
// (sk-or-...) placée dans OPENAI_API_KEY échouait forcément, car OpenRouter a
// une autre URL (https://openrouter.ai/api/v1), attend des identifiants de
// modèle préfixés (ex: "openai/gpt-4o-mini") et des en-têtes spécifiques.
//
// Variables d'environnement (à définir dans Vercel) :
//   OPENROUTER_API_KEY   -> active OpenRouter (prioritaire)
//   OPENAI_API_KEY       -> utilisé si OpenRouter absent (fallback)
//   CHAT_MODEL           -> modèle à utiliser (optionnel)
//   SITE_URL             -> ex: https://www.jorissalmon.com (recommandé par OpenRouter)

import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: 'Le champ "messages" est requis.' });
      return;
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // Déterminer le fournisseur à utiliser
    let apiUrl, apiKey, model, extraHeaders = {};

    if (openRouterKey) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = openRouterKey;
      // Modèle par défaut économique et performant chez OpenRouter
      model = process.env.CHAT_MODEL || 'openai/gpt-4o-mini';
      // En-têtes recommandés par OpenRouter (classement + attribution)
      extraHeaders = {
        'HTTP-Referer': process.env.SITE_URL || 'https://www.jorissalmon.com',
        'X-Title': 'Portfolio Joris Salmon',
      };
    } else if (openAiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = openAiKey;
      model = process.env.CHAT_MODEL || 'gpt-4o-mini';
    } else {
      res.status(500).json({
        message: 'Aucune clé API configurée. Définissez OPENROUTER_API_KEY ou OPENAI_API_KEY.',
      });
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let detail = errorText;
      try {
        detail = JSON.parse(errorText)?.error?.message || errorText;
      } catch (_) { /* garder le texte brut */ }
      throw new Error(`Chat API error: ${response.status} - ${detail}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Erreur chatbot:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
