/**
 * article.js - Gestion de l'affichage des articles individuels (Version améliorée)
 */

document.addEventListener('DOMContentLoaded', function() {
  // Récupérer l'ID de l'article depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  
  if (!articleId) {
    displayError("Aucun identifiant d'article spécifié");
    return;
  }
  
  // Charger l'article
  loadArticle(articleId);
});

// Ajoutez cette vérification au début de article.js
if (window.documentToHtmlString) {
  console.log('Bibliothèque rich-text-html-renderer disponible');
} else {
  console.error('Bibliothèque rich-text-html-renderer non disponible');
}

// Puis dans contentful.js, utilisez cette bibliothèque pour le rendu
if (fields.contenu && typeof fields.contenu === 'object') {
  if (window.documentToHtmlString) {
    // Création des options pour inclure les assets
    const options = {
      renderNode: {
        'embedded-asset-block': (node) => {
          const assetId = node.data.target.sys.id;
          if (data.includes && data.includes.Asset) {
            const asset = data.includes.Asset.find(a => a.sys.id === assetId);
            if (asset && asset.fields && asset.fields.file) {
              const assetUrl = `https:${asset.fields.file.url}`;
              return `<figure>
                <img src="${assetUrl}" alt="${asset.fields.title || 'Image'}" class="content-image">
                ${asset.fields.description ? `<figcaption>${asset.fields.description}</figcaption>` : ''}
              </figure>`;
            }
          }
          return '';
        }
      }
    };
    
    content = window.documentToHtmlString(fields.contenu, options);
  } else {
    // Votre logique de secours
  }
}

/**
 * Vérifie si l'image existe et est accessible
 * @param {string} imageUrl - URL de l'image à vérifier
 */
function checkImage(imageUrl) {
  if (!imageUrl) return;
  
  const img = new Image();
  img.onload = function() {
    console.log('Image chargée avec succès:', imageUrl);
  };
  img.onerror = function() {
    console.error('Erreur de chargement de l\'image:', imageUrl);
    // Fallback à l'image par défaut
    const headerElement = document.querySelector('.article-header');
    if (headerElement) {
      headerElement.style.backgroundImage = `url('img/blog/placeholder1.jpg')`;
    }
  };
  img.src = imageUrl;
}

/**
 * Charge et affiche un article spécifique
 * @param {string} articleId - Identifiant de l'article
 */
async function loadArticle(articleId) {
  try {
    // Afficher un état de chargement
    const contentElement = document.querySelector('.article-content .content');
    if (contentElement) {
      contentElement.innerHTML = `
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="mt-3">Chargement de l'article...</p>
        </div>
      `;
    }
    
    // Récupérer les données de l'article depuis Contentful
    const article = await window.contentfulService.getArticleById(articleId);
    
    if (!article) {
      throw new Error("Article non trouvé");
    }
    
    // Mettre à jour le titre de la page
    document.title = `${article.title} - Joris Salmon`;
    
    // Mise à jour de l'en-tête de l'article avec l'image
    const headerElement = document.querySelector('.article-header');
    if (headerElement) {
      console.log('URL d\'image utilisée:', article.image_url);
      
      if (article.image_url) {
        headerElement.style.backgroundImage = `url('${article.image_url}')`;
        
        // Vérifier l'image après avoir défini l'URL
        checkImage(article.image_url);
      } else {
        console.warn('Aucune URL d\'image fournie');
        headerElement.style.backgroundImage = `url('img/blog/placeholder1.jpg')`;
      }
      
      // Vérification visuelle pour confirmer que l'image est définie
      console.log('Style backgroundImage défini:', headerElement.style.backgroundImage);
    }
    
    // Mettre à jour les éléments du DOM de façon sécurisée
    const titleElement = document.querySelector('.article-header h1');
    if (titleElement) titleElement.textContent = article.title;
    
    const authorElement = document.querySelector('.article-meta .author');
    if (authorElement) authorElement.textContent = article.author;
    
    const dateElement = document.querySelector('.article-meta .date');
    if (dateElement) dateElement.textContent = article.date;
    
    // Mettre à jour le contenu de l'article de façon sécurisée
    if (contentElement) {
      // CORRECTION: Traitement sécurisé du contenu pour éviter la récursion
      let contentHtml = '';
      
      // Si le contenu est une chaîne, l'utiliser directement
      if (typeof article.content === 'string') {
        contentHtml = article.content;
      } 
      // Sinon, afficher un message d'erreur
      else {
        contentHtml = '<p>Le contenu de cet article n\'est pas disponible dans un format lisible.</p>';
        console.error('Format de contenu non pris en charge:', typeof article.content);
      }
      
      // Assigner le HTML de façon sécurisée
      contentElement.innerHTML = contentHtml;
    }
    
    // Mettre à jour les liens de partage
    updateShareLinks(article.title);
    
  } catch (error) {
    console.error('Erreur lors du chargement de l\'article:', error);
    displayError("Impossible de charger cet article: " + error.message);
  }
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur à afficher
 */
function displayError(message) {
  const contentElement = document.querySelector('.article-content .content');
  if (contentElement) {
    contentElement.innerHTML = `
      <div class="alert alert-danger text-center my-5">
        <i class="fas fa-exclamation-circle me-2"></i>
        ${message}
        <div class="mt-3">
          <a href="index.html#blog" class="btn btn-primary">Retour aux articles</a>
        </div>
      </div>
    `;
  }
  
  // Mettre à jour le titre également
  const titleElement = document.querySelector('.article-header h1');
  if (titleElement) {
    titleElement.textContent = "Erreur de chargement";
  }
}

/**
 * Met à jour les liens de partage
 * @param {string} title - Titre de l'article
 */
function updateShareLinks(title) {
  const currentUrl = window.location.href;
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);
  
  // Twitter
  const twitterLink = document.querySelector('.share-twitter');
  if (twitterLink) {
    twitterLink.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  }
  
  // Facebook
  const facebookLink = document.querySelector('.share-facebook');
  if (facebookLink) {
    facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  }
  
  // LinkedIn
  const linkedinLink = document.querySelector('.share-linkedin');
  if (linkedinLink) {
    linkedinLink.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  }
}