/**
 * blog.js - Gestion de l'affichage des articles du blog avec Contentful
 * 
 * Ce fichier gère le chargement, le filtrage et l'affichage des articles
 * dans la section blog du site, avec un système de carrousel.
 */

// Variables globales pour le carrousel
let currentPosition = 0;
let allBlogItems = [];
let filteredBlogItems = [];
let itemsPerPage = 2; // Nombre d'articles par page

document.addEventListener('DOMContentLoaded', function() {
  // Chargement des articles
  loadArticles();
  
  // Gestionnaires d'événements pour les boutons du carrousel
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', movePrev);
    nextButton.addEventListener('click', moveNext);
  }
  
  // Redimensionnement de la fenêtre
  window.addEventListener('resize', adjustItemsPerPage);
});

/**
 * Charge les articles depuis Contentful
 */
async function loadArticles() {
  try {
    // Référence au conteneur des articles
    const blogContainer = document.getElementById("blogjorisContainer");
    
    if (!blogContainer) {
      console.error("Conteneur d'articles introuvable");
      return;
    }
    
    // Afficher un indicateur de chargement
    blogContainer.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-2">Chargement des articles...</p>
      </div>
    `;
    
    // Récupération des articles depuis Contentful
    const articles = await window.contentfulService.getArticles();
    
    // Vérifier s'il y a des articles
    if (!articles || articles.length === 0) {
      blogContainer.innerHTML = `
        <div class="col-12 text-center py-4">
          <div class="alert alert-info">
            Aucun article n'est disponible pour le moment.
          </div>
        </div>
      `;
      
      // Masquer les boutons de navigation
      const navButtons = document.querySelector('.carousel-nav');
      if (navButtons) {
        navButtons.style.display = 'none';
      }
      return;
    }
    
    console.log("Articles chargés:", articles.length);
    
    // Vide le conteneur
    blogContainer.innerHTML = "";
    
    // Créer les éléments HTML pour chaque article
    allBlogItems = articles.map((article, index) => createBlogElement(article, index));
    
    // Initialiser les articles filtrés avec tous les articles
    filteredBlogItems = [...allBlogItems];
    
    // Ajuster le nombre d'articles par page en fonction de la taille de l'écran
    adjustItemsPerPage();
    
    // Afficher la première page
    displayCurrentPage();
    
    // Initialiser les filtres
    initializeFilters();
    
    // Rafraîchir les animations AOS
    if (window.AOS) {
      AOS.refresh();
    }
    
  } catch (error) {
    console.error("Erreur lors du chargement des articles:", error);
    
    const blogContainer = document.getElementById("blogjorisContainer");
    if (blogContainer) {
      blogContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle me-2"></i> 
            Erreur lors du chargement des articles. Veuillez réessayer plus tard.
          </div>
        </div>
      `;
    }
    
    // Masquer les boutons de navigation
    const navButtons = document.querySelector('.carousel-nav');
    if (navButtons) {
      navButtons.style.display = 'none';
    }
  }
}

/**
 * Crée un élément HTML pour un article
 * @param {Object} article - Données de l'article
 * @param {number} index - Index de l'article (pour l'animation)
 * @returns {HTMLElement} Élément HTML de l'article
 */
function createBlogElement(article, index) {
  // Calcul du délai d'animation
  const delay = (index % 2) * 100; // Décalage pour une animation en cascade
  
  // Création du div principal
  const articleDiv = document.createElement("div");
  
  // S'assurer que la catégorie est exactement comme attendue
  let categoryClass = article.category || "filter-data";
  // Si la catégorie n'a pas le préfixe "filter-", l'ajouter
  if (!categoryClass.startsWith("filter-")) {
    console.warn(`Catégorie "${categoryClass}" sans préfixe "filter-". Article:`, article.title);
  }
  
  articleDiv.classList.add("col-lg-6", "blog-item", categoryClass);
  
  // Débogage des classes
  console.log(`Article créé: ${article.title}`, {
    category: article.category,
    classes: Array.from(articleDiv.classList)
  });
  if (window.AOS) {
    articleDiv.setAttribute("data-aos", "fade-up");
    articleDiv.setAttribute("data-aos-delay", delay.toString());
  }
  
  // Structure HTML interne
  articleDiv.innerHTML = `
    <div class="blog-card">
      <div class="blog-img">
        <img src="${article.image_url}" class="img-fluid" alt="${article.title}" onerror="this.src='img/blog/placeholder1.jpg'">
      </div>
      <div class="blog-content">
        <h3>${article.title}</h3>
        <p class="author">${article.author} | ${article.date}</p>
        <p>${article.summary}</p>
        <a href="${article.link}" class="read-more">Lire plus</a>
      </div>
    </div>
  `;
  
  return articleDiv;
}

/**
 * Ajuste le nombre d'articles par page en fonction de la taille de l'écran
 */
function adjustItemsPerPage() {
  const windowWidth = window.innerWidth;
  
  if (windowWidth < 768) {
    itemsPerPage = 1; // Mobile: 1 article par page
  } else {
    itemsPerPage = 2; // Tablette/Desktop: 2 articles par page
  }
  
  // Réinitialise la position et affiche la page en cours
  currentPosition = 0;
  displayCurrentPage();
  updateCarouselButtons();
}

/**
 * Affiche la page actuelle des articles
 */
function displayCurrentPage() {
  const blogContainer = document.getElementById("blogjorisContainer");
  if (!blogContainer) return;
  
  blogContainer.innerHTML = '';
  
  const startIndex = currentPosition * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredBlogItems.length);
  
  // Vérifier s'il y a des articles à afficher
  if (filteredBlogItems.length === 0) {
    blogContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Aucun article ne correspond à ce filtre.
        </div>
      </div>
    `;
    
    // Masquer les boutons de navigation
    const navButtons = document.querySelector('.carousel-nav');
    if (navButtons) {
      navButtons.style.display = 'none';
    }
    
    return;
  }
  
  // Afficher les boutons de navigation
  const navButtons = document.querySelector('.carousel-nav');
  if (navButtons) {
    navButtons.style.display = 'flex';
  }
  
  // Afficher les articles de la page actuelle
  for (let i = startIndex; i < endIndex; i++) {
    blogContainer.appendChild(filteredBlogItems[i].cloneNode(true));
  }
  
  // Réinitialiser les animations AOS
  if (window.AOS) {
    AOS.refresh();
  }
}

/**
 * Initialise les filtres pour les articles
 */
function initializeFilters() {
  // Gestionnaire d'événements pour les filtres
  document.querySelectorAll('.blog-filter li').forEach(filter => {
    filter.addEventListener('click', function() {
      // Retirer la classe active de tous les filtres
      const activeFilter = document.querySelector('.blog-filter .filter-active');
      if (activeFilter) {
        activeFilter.classList.remove('filter-active');
      }
      
      // Ajouter la classe active au filtre cliqué
      this.classList.add('filter-active');
      
      // Obtenir la valeur du filtre
      const filterValue = this.getAttribute('data-filter');
      
      // Appliquer le filtre
      applyFilter(filterValue);
    });
  });
}

/**
 * Applique un filtre aux articles
 * @param {string} filterValue - Valeur du filtre à appliquer
 */
function applyFilter(filterValue) {
  // Filtrer les articles
  if (filterValue === '*') {
    // Tous les articles
    filteredBlogItems = [...allBlogItems];
  } else {
    // Articles correspondant au filtre
    // Enlever le point du début du filterValue
    const className = filterValue.replace('.', '');
    filteredBlogItems = allBlogItems.filter(item => 
      item.classList.contains(className)
    );
  }
  
  // Réinitialiser la position
  currentPosition = 0;
  
  // Afficher la première page des articles filtrés
  displayCurrentPage();
  
  // Mettre à jour les boutons du carrousel
  updateCarouselButtons();
}

/**
 * Déplace le carrousel vers la page précédente
 */
function movePrev() {
  if (currentPosition > 0) {
    currentPosition--;
    displayCurrentPage();
    updateCarouselButtons();
  }
}

/**
 * Déplace le carrousel vers la page suivante
 */
function moveNext() {
  const maxPosition = Math.ceil(filteredBlogItems.length / itemsPerPage) - 1;
  if (currentPosition < maxPosition) {
    currentPosition++;
    displayCurrentPage();
    updateCarouselButtons();
  }
}

/**
 * Met à jour l'état des boutons du carrousel
 */
function updateCarouselButtons() {
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  
  if (!prevButton || !nextButton) return;
  
  // Activer/désactiver le bouton précédent
  if (currentPosition <= 0) {
    prevButton.classList.add('disabled');
    prevButton.setAttribute('disabled', 'disabled');
  } else {
    prevButton.classList.remove('disabled');
    prevButton.removeAttribute('disabled');
  }
  
  // Activer/désactiver le bouton suivant
  const maxPosition = Math.ceil(filteredBlogItems.length / itemsPerPage) - 1;
  if (currentPosition >= maxPosition) {
    nextButton.classList.add('disabled');
    nextButton.setAttribute('disabled', 'disabled');
  } else {
    nextButton.classList.remove('disabled');
    nextButton.removeAttribute('disabled');
  }
}