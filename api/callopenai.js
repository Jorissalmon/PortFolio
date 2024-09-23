// Utilise une importation dynamique pour node-fetch
import fetch from 'node-fetch';

export default async function handler(req, res) {

  // Liste des domaines autorisés
  const allowedOrigins = ['https://www.jorissalmon.com', 'https://porte-folio-kappa.vercel.app'];
  const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
      res.setHeader('Access-Control-Allow-Origin', 'null'); // Si non autorisé, mettre null
  } // Change '*' par ton domaine si tu veux restreindre
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
      // Pour les requêtes préflight
      res.status(200).end();
      return;
  }

  if (req.method === 'POST') {
    const { messages } = req.body;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
