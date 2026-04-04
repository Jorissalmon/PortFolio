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
let itemsPerPage = 100; // Render all articles for scroll

document.addEventListener('DOMContentLoaded', function () {
  // Les articles sont déjà rendus statiquement.
  initializeBlogInteractivity();
});

/**
 * Initialise l'interactivité du blog
 */
function initializeBlogInteractivity() {
  const container = document.getElementById("blogjorisContainer");
  if (!container) return;

  const carouselConfig = {
    container: container,
    allItems: Array.from(container.querySelectorAll('.blog-item'))
  };

  // Gestionnaires d'événements pour les boutons du carrousel
  const prevButton = document.querySelector('.blog-prev');
  const nextButton = document.querySelector('.blog-next');
  
  if (prevButton && nextButton) {
    prevButton.addEventListener('click', () => {
      const firstItem = container.querySelector('.modern-scroll-item');
      const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    nextButton.addEventListener('click', () => {
      const firstItem = container.querySelector('.modern-scroll-item');
      const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }

  // Initialiser les filtres
  initializeFilters(carouselConfig);
}

/**
 * Crée un élément HTML pour un article
 * @param {Object} article - Données de l'article
 * @param {number} index - Index de l'article (pour l'animation)
 * @returns {HTMLElement} Élément HTML de l'article
 */
function createBlogElement(article, index) {
  // Calcul du délai d'animation
  const delay = (index % 3) * 100; // Décalage pour une animation en cascade

  // Création du div principal
  const articleDiv = document.createElement("div");

  // S'assurer que la catégorie est exactement comme attendue
  let categoryClass = article.category || "filter-data";
  // Si la catégorie n'a pas le préfixe "filter-", l'ajouter
  if (!categoryClass.startsWith("filter-")) {
    console.warn(`Catégorie "${categoryClass}" sans préfixe "filter-". Article:`, article.title);
  }

  articleDiv.classList.add("modern-scroll-item", "blog-item", categoryClass);

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
        <img src="${article.image_url}" class="img-fluid" alt="${article.title}" onerror="this.onerror=null; this.src='img/blog/placeholder1.jpg'">
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

  itemsPerPage = 100; // Always render all for horizontal scroll

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

  // Afficher tous les articles filtrés
  filteredBlogItems.forEach(item => {
    blogContainer.appendChild(item.cloneNode(true));
  });

  // Vérifier s'il y a des articles à afficher
  if (filteredBlogItems.length === 0) {
    blogContainer.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Aucun article ne correspond à ce filtre.
        </div>
      </div>
    `;
    return;
  }

  // Montrer le wrapper si articles présents
  const wrapper = blogContainer.closest('.modern-carousel-wrapper');
  if (wrapper) {
    wrapper.style.display = 'block';
  }

  // Afficher les articles de la page actuelle
  // All rendered

  // Réinitialiser les animations AOS
  if (window.AOS) {
    AOS.refresh();
  }
}

/**
 * Initialise les filtres pour les articles
 */
function initializeFilters(carouselConfig) {
  // Gestionnaire d'événements pour les filtres
  document.querySelectorAll('.blog-filter li').forEach(filter => {
    filter.addEventListener('click', function () {
      // Retirer la classe active de tous les filtres
      const activeFilter = document.querySelector('.blog-filter .filter-active');
      if (activeFilter) {
        activeFilter.classList.remove('filter-active');
      }

      // Ajouter la classe active au filtre cliqué
      this.classList.add('filter-active');

      // Obtenir la valeur du filtre
      const filterValue = this.getAttribute('data-filter');

      carouselConfig.allItems.forEach(item => {
        if (filterValue === '*' || item.classList.contains(filterValue.substring(1))) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Réinitialiser le scroll
      carouselConfig.container.scrollLeft = 0;

      // Sync AOS
      if (window.AOS) {
        AOS.refresh();
      }
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

  // Réinitialiser le scroll
  const blogContainer = document.getElementById("blogjorisContainer");
  if (blogContainer) blogContainer.scrollLeft = 0;

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
  const blogContainer = document.getElementById("blogjorisContainer");
  if (blogContainer) {
    const firstItem = blogContainer.querySelector('.modern-scroll-item');
    const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
    blogContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }
}

/**
 * Déplace le carrousel vers la page suivante
 */
function moveNext() {
  const blogContainer = document.getElementById("blogjorisContainer");
  if (blogContainer) {
    const firstItem = blogContainer.querySelector('.modern-scroll-item');
    const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
    blogContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

/**
 * Met à jour l'état des boutons du carrousel
 */
function updateCarouselButtons() {
  const prevButton = document.querySelector('.blog-prev');
  const nextButton = document.querySelector('.blog-next');
  if (prevButton && nextButton) {
    prevButton.classList.remove('disabled');
    nextButton.classList.remove('disabled');
  }
}