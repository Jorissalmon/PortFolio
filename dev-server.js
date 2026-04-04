/**
 * dev-server.js - Serveur de développement local
 * Permet de tester l'intégration Contentful en local
 */

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import contentful from 'contentful';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Client Contentful
const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
});

// Route API Contentful (compatible avec Vercel)
app.post('/api/contentful', async (req, res) => {
    try {
        const { endpoint, id, queryParams } = req.body;

        let result;

        switch (endpoint) {
            case 'entries':
                result = await client.getEntries(queryParams);
                break;

            case 'entry':
                if (!id) {
                    return res.status(400).json({ error: 'ID manquant pour entry' });
                }
                result = await client.getEntry(id, queryParams);
                break;

            case 'assets':
                result = await client.getAssets(queryParams);
                break;

            case 'asset':
                if (!id) {
                    return res.status(400).json({ error: 'ID manquant pour asset' });
                }
                result = await client.getAsset(id);
                break;

            default:
                return res.status(400).json({ error: `Endpoint inconnu: ${endpoint}` });
        }

        res.json(result);
    } catch (error) {
        console.error('Erreur API Contentful:', error);
        res.status(500).json({
            error: error.message,
            details: error.sys || {}
        });
    }
});

// Route API OpenAI/OpenRouter (compatible avec Vercel et local)
app.post('/api/callopenai', async (req, res) => {
    try {
        const { messages } = req.body;
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        const fetchResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'Joris Salmon Portfolio (Local)',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-lite-001',
                messages: messages,
            }),
        });

        if (!fetchResponse.ok) {
            const errorData = await fetchResponse.json();
            throw new Error(`OpenRouter API error: ${fetchResponse.status} - ${JSON.stringify(errorData)}`);
        }

        const data = await fetchResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Erreur API Chatbot:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  🚀 Serveur de développement local démarré                 ║
║                                                            ║
║  📍 URL: http://localhost:${PORT}                           ║
║  📡 API Contentful: http://localhost:${PORT}/api/contentful ║
║                                                            ║
║  ✅ Contentful configuré avec:                             ║
║     Space: ${process.env.CONTENTFUL_SPACE_ID || 'NON CONFIGURÉ'}                       ║
║                                                            ║
║  ⚡ Serveur prêt pour les tests locaux!                    ║
╚════════════════════════════════════════════════════════════╝
  `);
});
