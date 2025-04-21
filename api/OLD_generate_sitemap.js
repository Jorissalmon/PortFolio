import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
    
    if (req.method === 'GET') {
    try {
        // Récupérer tous les articles
        const { data: articles, error } = await supabase
            .from('articles')
            .select('id, updated_at');

        if (error) throw error;

        // Génération des balises XML pour chaque article
        const articlesUrls = articles.map(article => {
            const articleUrl = `https://www.jorissalmon.com/articles/${article.id}.html`;
            const lastmod = new Date(article.updated_at).toISOString().split('T')[0]; // Format YYYY-MM-DD

            return `
    <url>
        <loc>${articleUrl}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        }).join('\n');

        // Contenu du sitemap avec les URLs des articles
        const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Page d'accueil -->
    <url>
        <loc>https://www.jorissalmon.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Articles -->
    ${articlesUrls}
</urlset>`;

        // Enregistrer le fichier sitemap.xml
        const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
        if (!fs.existsSync(path.dirname(sitemapPath))) {
            fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
        }
        fs.writeFileSync(sitemapPath, sitemapContent, 'utf8');

        res.json({ message: "Sitemap generated successfully", path: sitemapPath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}};
