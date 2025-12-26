import express from 'express';
import cors from 'cors';
import axios from 'axios';
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
    
    if (req.method === 'GET') {
        try {
            // Requête vers Supabase pour récupérer les articles
            const { data, error } = await supabase
                .from('articles')
                .select('*');

            // Gestion des erreurs de Supabase
            if (error) throw error;

            // Vérifie s'il y a des articles
            if (data.length === 0) {
                return res.status(404).json({ message: "No articles found" });
            }

            // Envoi de la réponse avec les données des articles
            res.status(200).json(data);
        } catch (error) {
            // En cas d'erreur, retourne un statut 500 avec le message d'erreur
            res.status(500).json({ error: error.message });
        }
    } else {
        // Méthode non supportée
        res.setHeader('Allow', ['GET', 'OPTIONS']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    
}