/**
 * Version sécurisée du service Contentful qui utilise l'API Vercel
 */
window.contentfulService = {
  /**
   * Appelle l'API proxy Vercel pour communiquer avec Contentful
   * @param {string} endpoint - Point d'entrée ('entries', 'entry', 'assets', 'asset')
   * @param {string} id - ID de l'entrée ou de l'asset (optionnel selon l'endpoint)
   * @param {Object} queryParams - Paramètres de requête supplémentaires (optionnel)
   * @returns {Promise<Object>} - Données de Contentful
   */
  callContentfulApi: async function(endpoint, id = null, queryParams = {}) {
    try {
      // Appeler notre API proxy Vercel
      const response = await fetch('/api/contentful', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          id,
          queryParams
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API (${response.status}): ${errorData.error || errorData.message || 'Erreur inconnue'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de l'appel à l'API Contentful:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère un asset spécifique par son ID
   * @param {string} assetId - ID de l'asset à récupérer
   * @returns {Promise<Object>} - Données de l'asset
   */
  getAssetById: async function(assetId) {
    if (!assetId) {
      throw new Error('ID d\'asset manquant');
    }
    
    try {
      console.log(`Récupération de l'asset ${assetId} via API Vercel`);
      
      const data = await this.callContentfulApi('asset', assetId);
      return data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'asset ${assetId}:`, error);
      throw error;
    }
  },
  
  /**
   * Récupère un article spécifique par son ID
   * @param {string} id - Identifiant de l'article
   * @returns {Promise<Object>} Données de l'article
   */
  getArticleById: async function(id) {
    try {
      console.log("Récupération de l'article avec ID:", id);
      
      // Appeler l'API avec des paramètres supplémentaires
      const data = await this.callContentfulApi('entry', id, {
        include: 10 // Inclure les ressources liées jusqu'à 10 niveaux
      });
      
      // Log pour déboguer
      console.log("Données brutes de l'article:", data);
      
      // Extraire les champs
      const fields = data.fields;
      if (!fields) {
        throw new Error("Structure des champs manquante");
      }
      
      // Continuer avec votre code existant pour traiter les données...
      let imageUrl = "img/placeholder1.jpg";
      
      try {
        if (fields.imagePrincipale && fields.imagePrincipale.sys && fields.imagePrincipale.sys.id) {
          const imageId = fields.imagePrincipale.sys.id;
          
          if (data.includes && data.includes.Asset) {
            const asset = data.includes.Asset.find(asset => asset.sys.id === imageId);
            
            if (asset && asset.fields && asset.fields.file) {
              imageUrl = `https:${asset.fields.file.url}`;
              console.log("URL d'image principale trouvée:", imageUrl);
            }
          } else {
            // Si l'image principale n'est pas incluse, la récupérer séparément
            try {
              const assetData = await this.getAssetById(imageId);
              if (assetData && assetData.fields && assetData.fields.file) {
                imageUrl = `https:${assetData.fields.file.url}`;
                console.log("URL d'image principale récupérée séparément:", imageUrl);
              }
            } catch (assetError) {
              console.warn("Erreur lors de la récupération de l'image principale:", assetError);
            }
          }
        }
      } catch (e) {
        console.warn("Erreur lors de la récupération de l'image principale:", e);
      }
      
      // Le reste de votre code pour traiter le contenu...
      let content = "";
      
      if (typeof fields.contenu === "string") {
        content = fields.contenu;
      } else if (fields.contenu && typeof fields.contenu === "object") {
        content = this.renderRichTextWithIds(fields.contenu);
        // Reste du code pour ajouter le script...
      } else {
        content = "<p>Le contenu de cet article n'est pas disponible.</p>";
      }
      
      // Formater l'article pour l'affichage
      return {
        id: id,
        title: fields.Titre || "Article sans titre",
        author: fields.auteur || "Joris Salmon",
        date: fields.dateDePublication
          ? new Date(fields.dateDePublication).toLocaleDateString("fr-FR")
          : new Date().toLocaleDateString("fr-FR"),
        content: content,
        image_url: imageUrl,
        category: fields.categorie || "data"
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'article:", error);
      return null;
    }
  },
  
  /**
   * Récupère la liste des articles depuis Contentful
   * @returns {Promise<Array>} Liste des articles formatés
   */
  getArticles: async function() {
    try {
      console.log('Récupération des articles via API Vercel');
      
      // Appeler l'API avec des paramètres spécifiques pour les articles
      const data = await this.callContentfulApi('entries', null, {
        content_type: 'blogPortfolio',
        include: 2
      });
      
      // Vérifier s'il y a des articles
      if (!data.items || data.items.length === 0) {
        console.log('Aucun article trouvé dans Contentful');
        return [];
      }
      
      console.log('Articles récupérés:', data.items.length);
      
      // Traiter les articles avec votre code existant...
      return data.items.map(item => {
        // Votre code de traitement existant...
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      return [];
    }
  },
  
  // Conservez les autres méthodes comme renderRichTextWithIds...
  // ...
  
  /**
   * Récupère les projets depuis Contentful
   * @returns {Promise<Array>} Liste des projets formatés
   */
  getProjects: async function() {
    try {
      console.log('Récupération des projets via API Vercel');
      
      // Appeler l'API avec des paramètres spécifiques pour les projets
      const data = await this.callContentfulApi('entries', null, {
        content_type: 'projectPortfolio',
        include: 2
      });
      
      // Le reste de votre code de traitement existant...
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      return [];
    }
  },
  
  // Adapter votre getProjectById de la même manière...
};