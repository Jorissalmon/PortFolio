/**
 * contentful.js - Version adaptée pour Vercel
 */

// Styles CSS pour le bouton amélioré uniquement
document.head.insertAdjacentHTML(
  "beforeend",
  `
  <style>
    /* Style du bouton amélioré */
    .article-nav .btn-primary {
      background-color: #ef233c;
      border: none;
      color: white;
      padding: 12px 25px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 50px;
      box-shadow: 0 4px 10px rgba(239, 35, 60, 0.3);
      transition: all 0.3s ease;
    }
    
    .article-nav .btn-primary:hover {
      background-color: #d90429;
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(239, 35, 60, 0.4);
    }
    
    .article-nav .btn-primary i {
      margin-right: 8px;
    }
  </style>
`
);

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
    console.log(`Appel à l'API Vercel: ${endpoint}${id ? '/' + id : ''}`);
    
    // S'assurer que la méthode est POST et que les en-têtes sont corrects
    const response = await fetch('/api/contentful', {
      method: 'POST',  // Important : doit être POST pour correspondre à ce que votre API accepte
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
      // Tenter de lire la réponse d'erreur
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `Erreur ${response.status}`;
      } catch (e) {
        // Si la réponse n'est pas du JSON, lire le texte brut
        const errorText = await response.text();
        errorMessage = `Erreur ${response.status}: ${errorText.substring(0, 100)}...`;
      }
      throw new Error(`Erreur API (${response.status}): ${errorMessage}`);
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
   * Traite le contenu Rich Text et génère le HTML avec des ID pour les images
   * @param {Object} richTextContent - Contenu Rich Text de Contentful
   * @returns {string} HTML avec des IDs pour les images
   */
  renderRichTextWithIds: function(richTextContent) {
    if (!richTextContent || !richTextContent.content) {
      return "<p>Contenu non disponible.</p>";
    }

    // Journaliser pour le débogage
    console.log("Structure du contenu RichText:", JSON.stringify(richTextContent).slice(0, 500) + "...");

    // Fonction récursive pour le rendu
    function renderNode(node) {
      if (!node) return "";

      // Journaliser pour le débogage des nœuds d'image
      if (node.nodeType === "embedded-asset-block") {
        console.log("Nœud d'image trouvé:", JSON.stringify(node));
      }

      switch (node.nodeType) {
        case "document":
          return node.content.map(renderNode).join("");

        case "paragraph":
          return `<p>${node.content ? node.content.map(renderNode).join("") : ""}</p>`;

        case "heading-1":
          return `<h1>${node.content ? node.content.map(renderNode).join("") : ""}</h1>`;

        case "heading-2":
          return `<h2>${node.content ? node.content.map(renderNode).join("") : ""}</h2>`;

        case "heading-3":
          return `<h3>${node.content ? node.content.map(renderNode).join("") : ""}</h3>`;

        case "heading-4":
          return `<h4>${node.content ? node.content.map(renderNode).join("") : ""}</h4>`;

        case "heading-5":
          return `<h5>${node.content ? node.content.map(renderNode).join("") : ""}</h5>`;

        case "heading-6":
          return `<h6>${node.content ? node.content.map(renderNode).join("") : ""}</h6>`;

        case "unordered-list":
          return `<ul>${node.content ? node.content.map(renderNode).join("") : ""}</ul>`;

        case "ordered-list":
          return `<ol>${node.content ? node.content.map(renderNode).join("") : ""}</ol>`;

        case "list-item":
          return `<li>${node.content ? node.content.map(renderNode).join("") : ""}</li>`;

        case "hyperlink":
          return `<a href="${node.data.uri}" target="_blank" rel="noopener noreferrer">${
            node.content ? node.content.map(renderNode).join("") : ""
          }</a>`;

        case "embedded-asset-block":
          // Gestion améliorée des images intégrées
          try {
            // Vérification détaillée de la structure des données
            if (node.data && node.data.target) {
              let assetId = null;
              
              // Extraire l'ID de l'asset selon plusieurs structures possibles
              if (node.data.target.sys && node.data.target.sys.id) {
                // Structure standard
                assetId = node.data.target.sys.id;
              } else if (typeof node.data.target === 'string') {
                // Parfois, l'ID peut être directement une chaîne
                assetId = node.data.target;
              } else if (Array.isArray(node.data.target) && node.data.target.length > 0) {
                // Si c'est un tableau
                const firstItem = node.data.target[0];
                if (firstItem && firstItem.sys && firstItem.sys.id) {
                  assetId = firstItem.sys.id;
                }
              }
              
              if (assetId) {
                console.log("ID d'asset trouvé:", assetId);
                return `<img id="asset-${assetId}" src="img/placeholder1.jpg" alt="Image en cours de chargement" class="content-image">`;
              }
            }
            
            // Si nous n'avons pas pu extraire un ID valide
            console.warn("Structure d'asset non reconnue:", JSON.stringify(node.data));
            return `<img src="img/placeholder1.jpg" alt="Image" class="content-image">`;
          } catch (error) {
            console.error("Erreur lors du traitement d'une image intégrée:", error);
            return `<img src="img/placeholder1.jpg" alt="Image (erreur)" class="content-image">`;
          }

        case "blockquote":
          return `<blockquote>${
            node.content ? node.content.map(renderNode).join("") : ""
          }</blockquote>`;

        case "hr":
          return "<hr>";

        case "text":
          let text = node.value || "";

          // Ajouter les styles de texte (gras, italique, etc.)
          if (node.marks && node.marks.length > 0) {
            node.marks.forEach(mark => {
              switch (mark.type) {
                case "bold":
                  text = `<strong>${text}</strong>`;
                  break;
                case "italic":
                  text = `<em>${text}</em>`;
                  break;
                case "underline":
                  text = `<u>${text}</u>`;
                  break;
                case "code":
                  text = `<code>${text}</code>`;
                  break;
              }
            });
          }

          return text;

        default:
          console.warn("Type de nœud non pris en charge:", node.nodeType);
          return "";
      }
    }

    const renderedHtml = renderNode(richTextContent);
    console.log("HTML généré (début):", renderedHtml.slice(0, 200) + "...");
    return renderedHtml;
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
      
      // Récupérer l'URL de l'image principale
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
      
      // Traiter le contenu de l'article
      let content = "";
      
      if (typeof fields.contenu === "string") {
        content = fields.contenu;
      } else if (fields.contenu && typeof fields.contenu === "object") {
        // Créer le HTML avec des IDs pour les images
        content = this.renderRichTextWithIds(fields.contenu);
        
        // Ajouter un script pour charger les images après le rendu
        content += `
          <script>
            (async function loadArticleImages() {
              // Exécuter après que la page soit complètement chargée
              if (document.readyState !== 'complete') {
                window.addEventListener('load', loadArticleImages);
                return;
              }
              
              // Chercher tous les éléments d'image avec des IDs d'asset
              const assetImages = document.querySelectorAll('img[id^="asset-"]');
              console.log('Nombre d\'images trouvées:', assetImages.length);
              
              // Pour chaque image
              for (const img of assetImages) {
                const idAttribute = img.getAttribute('id');
                if (!idAttribute || !idAttribute.startsWith('asset-')) continue;
                
                const assetId = idAttribute.replace('asset-', '');
                console.log('Chargement de l\'image pour l\'asset:', assetId);
                
                try {
                  // Récupérer l'asset via l'API
                  const assetData = await window.contentfulService.getAssetById(assetId);
                  
                  if (assetData && assetData.fields && assetData.fields.file && assetData.fields.file.url) {
                    const assetUrl = assetData.fields.file.url.startsWith('//') 
                      ? 'https:' + assetData.fields.file.url 
                      : assetData.fields.file.url;
                    
                    // Mettre à jour l'attribut src de l'image
                    img.src = assetUrl;
                    
                    // Mettre à jour l'attribut alt si un titre est disponible
                    if (assetData.fields.title) {
                      img.alt = assetData.fields.title;
                    }
                    
                    console.log('Image mise à jour avec succès:', assetUrl);
                  }
                } catch (error) {
                  console.error(\`Erreur lors du chargement de l'image \${assetId}:\`, error);
                  // En cas d'erreur, l'image placeholder reste affichée
                }
              }
            })();
          </script>
        `;
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
      
      // Traiter les articles
      return data.items.map(item => {
        const fields = item.fields;
        
        // Récupérer l'URL de l'image principale
        const imageId = fields.imagePrincipale?.sys?.id;
        const asset = imageId && data.includes && data.includes.Asset ? 
          data.includes.Asset.find(asset => asset.sys.id === imageId) : null;
        const imageUrl = asset && asset.fields && asset.fields.file ? 
          `https:${asset.fields.file.url}` : 
          "img/placeholder1.jpg";
        
        // Déterminer la catégorie
        const categoryMap = {
          'data': 'filter-data',
          'bi': 'filter-bi',
          'ia': 'filter-ia',
          'career': 'filter-career'
        };
        const category = categoryMap[fields.categorie] || 'filter-data';
        
        // Formatter la date
        const date = fields.dateDePublication ? 
          new Date(fields.dateDePublication).toLocaleDateString('fr-FR') : 
          new Date().toLocaleDateString('fr-FR');
        
        // Construire l'objet article formaté
        return {
          id: item.sys.id,
          title: fields.Titre || 'Article sans titre',
          author: fields.auteur || 'Joris Salmon',
          date: date,
          summary: fields.rsum || 'Aucun résumé disponible',
          image_url: imageUrl,
          link: `article.html?id=${item.sys.id}`,
          category: category
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      return [];
    }
  },
  
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
      
      // Vérifier s'il y a des projets
      if (!data.items || data.items.length === 0) {
        console.log('Aucun projet trouvé dans Contentful');
        return [];
      }
      
      console.log('Projets récupérés:', data.items.length);
      
      // Traiter les projets
      return data.items.map(item => {
        const fields = item.fields;
        
        // Récupérer l'URL de l'image
        const imageId = fields.image?.sys?.id;
        const asset = imageId && data.includes && data.includes.Asset ? 
          data.includes.Asset.find(asset => asset.sys.id === imageId) : null;
        const imageUrl = asset && asset.fields && asset.fields.file ? 
          `https:${asset.fields.file.url}` : 
          "img/placeholder1.jpg";
        
        // Mapper la catégorie Contentful vers la classe CSS
        const categoryMap = {
          'data-analyse': 'filter-bi',
          'data-science': 'filter-data',
          'recherche': 'filter-recherche'
        };
        const category = categoryMap[fields.category] || 'filter-1';
        
        // Construire l'objet projet formaté
        return {
          id: item.sys.id,
          name: fields.title || 'Projet sans titre',
          description: fields.description || 'Aucune description disponible',
          category: category,
          image_url: imageUrl,
          link: fields.url || '#'
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      return [];
    }
  }
};

/**
 * Adaptation de la méthode getProjectById pour le type de contenu Project Portfolio
 */
window.contentfulService.getProjectById = async function(projectId) {
  try {
    console.log("Récupération du projet avec ID:", projectId);
    
    // Appeler l'API avec des paramètres supplémentaires
    const data = await this.callContentfulApi('entry', projectId, {
      include: 10 // Inclure les ressources liées jusqu'à 10 niveaux
    });
    
    // Log pour déboguer
    console.log("Données brutes du projet:", data);
    
    // Extraire les champs
    const fields = data.fields;
    if (!fields) {
      throw new Error("Structure des champs manquante");
    }
    
    // Récupérer l'URL de l'image principale
    let imageUrl = "img/placeholder1.jpg";
    
    try {
      if (fields.image && fields.image.sys && fields.image.sys.id) {
        const imageId = fields.image.sys.id;
        
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
    
    // Récupérer les images de la galerie
    let galleryImages = [];
    try {
      if (fields.galleryImages && Array.isArray(fields.galleryImages)) {
        for (const galleryImageRef of fields.galleryImages) {
          if (galleryImageRef.sys && galleryImageRef.sys.id) {
            const imageId = galleryImageRef.sys.id;
            
            // Chercher l'image dans les includes
            if (data.includes && data.includes.Asset) {
              const asset = data.includes.Asset.find(asset => asset.sys.id === imageId);
              
              if (asset && asset.fields && asset.fields.file) {
                const galleryImageUrl = `https:${asset.fields.file.url}`;
                galleryImages.push(galleryImageUrl);
                console.log("URL d'image de galerie trouvée:", galleryImageUrl);
              }
            } else {
              // Récupérer l'image séparément si elle n'est pas dans les includes
              try {
                const assetData = await this.getAssetById(imageId);
                if (assetData && assetData.fields && assetData.fields.file) {
                  const galleryImageUrl = `https:${assetData.fields.file.url}`;
                  galleryImages.push(galleryImageUrl);
                  console.log("URL d'image de galerie récupérée séparément:", galleryImageUrl);
                }
              } catch (assetError) {
                console.warn("Erreur lors de la récupération d'une image de galerie:", assetError);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn("Erreur lors de la récupération des images de galerie:", e);
    }
    
    // Traiter le contenu du projet
    let content = "";
    
    if (typeof fields.detailedDescription === "string") {
      content = fields.detailedDescription;
    } else if (fields.detailedDescription && typeof fields.detailedDescription === "object") {
      // Créer le HTML avec des IDs pour les images
      content = this.renderRichTextWithIds(fields.detailedDescription);
      
      // Ajouter un script pour charger les images après le rendu
      content += `
        <script>
          (async function loadProjectImages() {
            // Exécuter après que la page soit complètement chargée
            if (document.readyState !== 'complete') {
              window.addEventListener('load', loadProjectImages);
              return;
            }
            
            // Chercher tous les éléments d'image avec des IDs d'asset
            const assetImages = document.querySelectorAll('img[id^="asset-"]');
            console.log('Nombre d\'images trouvées:', assetImages.length);
            
            // Pour chaque image
            for (const img of assetImages) {
              const idAttribute = img.getAttribute('id');
              if (!idAttribute || !idAttribute.startsWith('asset-')) continue;
              
              const assetId = idAttribute.replace('asset-', '');
              console.log('Chargement de l\'image pour l\'asset:', assetId);
              
              try {
                // Récupérer l'asset via l'API
                const assetData = await window.contentfulService.getAssetById(assetId);
                
                if (assetData && assetData.fields && assetData.fields.file && assetData.fields.file.url) {
                  const assetUrl = assetData.fields.file.url.startsWith('//') 
                    ? 'https:' + assetData.fields.file.url 
                    : assetData.fields.file.url;
                  
                  // Mettre à jour l'attribut src de l'image
                  img.src = assetUrl;
                  
                  // Mettre à jour l'attribut alt si un titre est disponible
                  if (assetData.fields.title) {
                    img.alt = assetData.fields.title;
                  }
                  
                  console.log('Image mise à jour avec succès:', assetUrl);
                }
              } catch (error) {
                console.error(\`Erreur lors du chargement de l'image \${assetId}:\`, error);
                // En cas d'erreur, l'image placeholder reste affichée
              }
            }
          })();
        </script>
      `;
    } else {
      content = "<p>La description détaillée de ce projet n'est pas disponible.</p>";
    }
    
    // Déterminer la catégorie
    const categoryMap = {
      'bi': 'filter-bi',
      'data-science': 'filter-data',
      'recherche': 'filter-recherche'
    };
    const category = categoryMap[fields.category] || 'filter-1';
    
    // Formater la date
    const date = fields.date ? 
      new Date(fields.date).toLocaleDateString('fr-FR') : 
      new Date().toLocaleDateString('fr-FR');
    
    // Construire l'objet projet formaté
    return {
      id: projectId,
      title: fields.title || 'Projet sans titre',
      description: fields.description || 'Aucune description disponible',
      date: date,
      content: content,
      image_url: imageUrl,
      gallery: galleryImages,
      video_url: fields.videoUrl || null,
      external_url: fields.url || null,
      technologies: fields.technologies || null,
      client: fields.client || null,
      type: fields.projectType || null,
      category: category
    };
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    return null;
  }
};

window.dataService = {
  getArticles: function() {
    return window.contentfulService.getArticles();
  },

  getProjects: function() {
    return window.contentfulService.getProjects();
  },

  getProjectById: function(projectId) {
    return window.contentfulService.getProjectById(projectId);
  },

  checkArticleHtmlExists: function(articleId) {
    return Promise.resolve({ exists: true, articleId: articleId });
  }
};

document.dispatchEvent(new Event('dataServiceReady'));

