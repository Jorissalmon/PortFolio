// /api/contentful.js - Endpoint API pour Contentful
// Ce fichier doit être placé dans un dossier /api/ de votre projet Vercel

export default async function handler(req, res) {
    // Rejeter les requêtes non-POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Méthode non autorisée' });
    }
  
    try {
      // Les clés d'API sécurisées comme variables d'environnement Vercel
      const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
      const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
  
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
  
      // Ajouter le token d'accès et les paramètres de requête
      apiUrl += `?access_token=${ACCESS_TOKEN}`;
      
      // Ajouter des paramètres de requête supplémentaires s'ils existent
      if (queryParams) {
        Object.keys(queryParams).forEach(key => {
          apiUrl += `&${key}=${queryParams[key]}`;
        });
      }
  
      // Appeler l'API Contentful
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`Erreur API Contentful: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Renvoyer les données à votre frontend
      return res.status(200).json(data);
      
    } catch (error) {
      console.error('Erreur API Contentful:', error);
      return res.status(500).json({ 
        error: 'Erreur lors de la communication avec Contentful',
        message: error.message 
      });
    }
  }