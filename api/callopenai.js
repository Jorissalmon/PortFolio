// Utilise une importation dynamique pour node-fetch
import fetch from 'node-fetch';

export default async function handler(req, res) {
         res.setHeader('Access-Control-Allow-Origin', '*'); // You can restrict this by specifying a domain
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Add headers as needed

    if (req.method === 'OPTIONS') {
        // Pour les requêtes préflight
        res.status(200).end();
        return;
    }

    // Vérifie que la méthode de la requête est POST
    if (req.method === 'POST') {
        try {
            // Récupère les messages du corps de la requête
            const { messages } = req.body;
            
            // Configuration OpenRouter
            const OPENROUTER_API_KEY = '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';
            
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'HTTP-Referer': 'https://www.jorissalmon.com', // Optionnel pour OpenRouter
                    'X-Title': 'Joris Salmon Portfolio', // Optionnel pour OpenRouter
                },
                body: JSON.stringify({
                    model: 'google/gemini-2.0-flash-lite-001', // Modèle performant et économique
                    messages: messages,
                }),
            });

            if (!response.ok) {
              const errorData = await response.json(); // Obtenez les détails de l'erreur
              throw new Error(`OpenAI API error: ${response.status} - ${errorData.error.message}`);
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
