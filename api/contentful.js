// /api/contentful.js - À utiliser sur Vercel
// Ce fichier est exécuté côté serveur, pas dans le navigateur

export default async function handler(req, res) {
  // Rejeter les requêtes non-POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  
  try {
    // Récupérer les clés depuis les variables d'environnement
    const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
    const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
    
    if (!SPACE_ID || !ACCESS_TOKEN) {
      console.error('Variables d\'environnement Contentful manquantes');
      return res.status(500).json({ 
        error: 'Configuration serveur incomplète',
        details: 'Les variables d\'environnement CONTENTFUL_SPACE_ID et CONTENTFUL_ACCESS_TOKEN doivent être définies'
      });
    }
    
    // Extraire les paramètres de la requête
    const { endpoint, id, queryParams } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Paramètre endpoint manquant' });
    }
    
    // Construire l'URL de l'API Contentful
    let apiUrl = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master`;
    
    // Ajouter le point de terminaison spécifique
    switch (endpoint) {
      case 'entries':
        apiUrl += `/entries`;
        break;
      case 'entry':
        if (!id) {
          return res.status(400).json({ error: 'ID d\'entrée manquant' });
        }
        apiUrl += `/entries/${id}`;
        break;
      case 'assets':
        apiUrl += `/assets`;
        break;
      case 'asset':
        if (!id) {
          return res.status(400).json({ error: 'ID d\'asset manquant' });
        }
        apiUrl += `/assets/${id}`;
        break;
      default:
        return res.status(400).json({ error: 'Endpoint non valide' });
    }
    
    // Ajouter le token d'accès
    apiUrl += `?access_token=${ACCESS_TOKEN}`;
    
    // Ajouter des paramètres de requête supplémentaires
    if (queryParams && typeof queryParams === 'object') {
      Object.keys(queryParams).forEach(key => {
        apiUrl += `&${key}=${encodeURIComponent(queryParams[key])}`;
      });
    }
    
    console.log('Appel API Contentful:', apiUrl.replace(ACCESS_TOKEN, 'HIDDEN_TOKEN'));
    
    // Appeler l'API Contentful (avec node-fetch si nécessaire)
    const fetch = require('node-fetch');
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Contentful (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Erreur API Contentful:', error);
    return res.status(500).json({
      error: 'Erreur lors de la communication avec Contentful',
      message: error.message
    });
  }
}