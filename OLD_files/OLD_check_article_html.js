import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
    // Vérification du CORS (si nécessaire)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Endpoint pour vérifier l'existence du fichier HTML d'un article
    if (req.method === 'GET') {
        const articleId = req.query.article_id; // Récupère l'article ID dans les paramètres de la requête

        if (!articleId) {
            return res.status(400).json({ error: "L'ID de l'article est requis en tant que paramètre de requête." });
        }

        const filePath = path.join(process.cwd(), 'articles', `${articleId}.html`);

        // Vérification de l'existence du fichier
        if (fs.existsSync(filePath)) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } else {
        // Méthode non supportée
        res.setHeader('Allow', ['GET', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
