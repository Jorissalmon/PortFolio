/**
 * portfolio.js - Gestion de l'affichage des projets avec Contentful
 * 
 * Ce fichier gère le chargement, le filtrage et l'affichage des projets
 * dans la section portfolio du site.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Chargement des projets
  loadProjects();
});

/**
 * Charge les projets depuis Contentful
 */
async function loadProjects() {
  try {
    // Afficher un indicateur de chargement
    const projectsContainer = document.getElementById("projectsContainer");
    
    if (!projectsContainer) {
      console.error("Conteneur de projets introuvable");
      return;
    }
    
    projectsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <p class="mt-2">Chargement des projets...</p>
      </div>
    `;
    
    // Récupération des projets depuis Contentful
    const projects = await window.contentfulService.getProjects();
    
    // Vérifier s'il y a des projets
    if (!projects || projects.length === 0) {
      projectsContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="alert alert-info">
            Aucun projet n'est disponible pour le moment.
          </div>
        </div>
      `;
      return;
    }
    
    console.log("Projets chargés:", projects.length);
    
    // Initialiser le carrousel avec les projets chargés
    initializeCarousel(projects);
    
    // Rafraîchir les animations AOS
    if (window.AOS) {
      AOS.refresh();
    }
    
  } catch (error) {
    console.error("Erreur lors du chargement des projets:", error);
    
    const projectsContainer = document.getElementById("projectsContainer");
    if (projectsContainer) {
      projectsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <i class="fas fa-exclamation-triangle me-2"></i> 
            Erreur lors du chargement des projets. Veuillez réessayer plus tard.
          </div>
        </div>
      `;
    }
  }
}

/**
 * Initialise le carrousel de projets
 * @param {Array} projects - Tableau des projets à afficher
 */
function initializeCarousel(projects) {
  // Configuration du carrousel
  const carouselConfig = {
    projects: projects,
    filteredProjects: projects,
    currentPage: 0,
    itemsPerPage: 3,
    container: document.getElementById('projectsContainer'),
  };
  
  // Ajouter les contrôles de navigation du carrousel s'ils n'existent pas déjà
  addCarouselControls();
  
  // Initialiser les boutons de filtrage
  initFilterButtons(carouselConfig);
  
  // Initialiser les contrôles du carrousel
  initCarouselControls(carouselConfig);
  
  // Afficher la première page
  renderProjectsPage(carouselConfig);
}

/**
 * Ajoute les contrôles de navigation du carrousel si nécessaire
 */
function addCarouselControls() {
  // Vérifier si les contrôles existent déjà
  if (!document.querySelector('.carousel-nav')) {
    const portfolioSection = document.querySelector('.portfolio-section .container');
    const portfolioFilter = document.querySelector('.portfolio-filter');
    
    if (portfolioSection && portfolioFilter) {
      // Créer l'élément des contrôles
      const controlsDiv = document.createElement('div');
      controlsDiv.className = 'carousel-nav';
      controlsDiv.setAttribute('data-aos', 'fade-up');
      controlsDiv.setAttribute('data-aos-delay', '150');
      
      // Ajouter le HTML des contrôles avec le compteur de pages
      controlsDiv.innerHTML = `
        <button class="carousel-prev" aria-label="Projets précédents">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="portfolio-counter">
          <span class="current-page">1</span> sur <span class="total-pages">1</span>
        </div>
        <button class="carousel-next" aria-label="Projets suivants">
          <i class="fas fa-chevron-right"></i>
        </button>
      `;
      
      // Insérer après les filtres
      portfolioFilter.after(controlsDiv);
      
      // Ajouter des styles pour le compteur si nécessaire
      addCarouselStyles();
    }
  }
}

/**
 * Ajoute les styles CSS nécessaires pour le carrousel
 */
function addCarouselStyles() {
  // Vérifier si les styles sont déjà définis
  if (!document.getElementById('carousel-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'carousel-styles';
    styleEl.textContent = `
      /* Styles pour le compteur de pages */
      .portfolio-counter {
        display: inline-block;
        font-size: 15px;
        font-weight: 500;
        color: var(--secondary-color);
        margin: 0 15px;
      }
      
      .portfolio-counter .current-page, 
      .portfolio-counter .total-pages {
        font-weight: 600;
        color: var(--primary-color);
      }
    `;
    
    document.head.appendChild(styleEl);
  }
}

/**
 * Initialise les boutons de filtrage
 * @param {Object} carouselConfig - Configuration du carrousel
 */
function initFilterButtons(carouselConfig) {
  const filterButtons = document.querySelectorAll('.portfolio-filter li');
  
  filterButtons.forEach(button => {
    // Supprimer les anciens écouteurs d'événements s'il y en a
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Ajouter le nouvel écouteur d'événements
    newButton.addEventListener('click', function() {
      // Mettre à jour l'état actif
      const activeFilter = document.querySelector('.portfolio-filter .filter-active');
      if (activeFilter) {
        activeFilter.classList.remove('filter-active');
      }
      this.classList.add('filter-active');
      
      // Appliquer le filtre
      const filterValue = this.getAttribute('data-filter');
      
      if (filterValue === '*') {
        carouselConfig.filteredProjects = carouselConfig.projects;
      } else {
        carouselConfig.filteredProjects = carouselConfig.projects.filter(project => 
          '.' + project.category === filterValue
        );
      }
      
      // Réinitialiser la page et afficher les projets
      carouselConfig.currentPage = 0;
      renderProjectsPage(carouselConfig);
    });
  });
}

/**
 * Initialise les contrôles du carrousel
 * @param {Object} carouselConfig - Configuration du carrousel
 */
function initCarouselControls(carouselConfig) {
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  
  if (prevButton && nextButton) {
    // Supprimer les anciens écouteurs d'événements s'il y en a
    const newPrevButton = prevButton.cloneNode(true);
    const newNextButton = nextButton.cloneNode(true);
    
    prevButton.parentNode.replaceChild(newPrevButton, prevButton);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    
    // Bouton précédent
    newPrevButton.addEventListener('click', function() {
      if (carouselConfig.currentPage > 0) {
        carouselConfig.currentPage--;
        renderProjectsPage(carouselConfig);
      } else {
        // Ajouter la classe disabled quand on ne peut pas aller plus loin
        this.classList.add('disabled');
      }
    });
    
    // Bouton suivant
    newNextButton.addEventListener('click', function() {
      const totalPages = Math.ceil(carouselConfig.filteredProjects.length / carouselConfig.itemsPerPage);
      if (carouselConfig.currentPage < totalPages - 1) {
        carouselConfig.currentPage++;
        renderProjectsPage(carouselConfig);
      } else {
        // Ajouter la classe disabled quand on ne peut pas aller plus loin
        this.classList.add('disabled');
      }
    });
  }
}

/**
 * Affiche une page de projets
 * @param {Object} carouselConfig - Configuration du carrousel
 */
function renderProjectsPage(carouselConfig) {
  // Calculer les indices de début et fin pour la page courante
  const startIndex = carouselConfig.currentPage * carouselConfig.itemsPerPage;
  const endIndex = startIndex + carouselConfig.itemsPerPage;
  
  // Projets à afficher pour cette page
  const pageProjects = carouselConfig.filteredProjects.slice(startIndex, endIndex);
  
  // Vider le conteneur
  carouselConfig.container.innerHTML = '';
  
  // Si aucun projet après filtrage
  if (pageProjects.length === 0) {
    carouselConfig.container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-info">
          Aucun projet ne correspond au filtre sélectionné.
        </div>
      </div>
    `;
    
    // Mettre à jour les contrôles
    updateControls(carouselConfig, 0);
    return;
  }
  
  // Créer un élément pour chaque projet
  pageProjects.forEach((project, index) => {
    const projectElement = createProjectElement(project, index);
    carouselConfig.container.appendChild(projectElement);
  });
  
  // Mettre à jour les contrôles et indicateurs
  const totalPages = Math.ceil(carouselConfig.filteredProjects.length / carouselConfig.itemsPerPage);
  updateControls(carouselConfig, totalPages);
  
  // Animation AOS
  if (window.AOS) {
    AOS.refresh();
  }
}

/**
 * Met à jour les contrôles du carrousel
 * @param {Object} carouselConfig - Configuration du carrousel
 * @param {Number} totalPages - Nombre total de pages
 */
function updateControls(carouselConfig, totalPages) {
  const prevButton = document.querySelector('.carousel-prev');
  const nextButton = document.querySelector('.carousel-next');
  
  if (prevButton && nextButton) {
    // Activer/désactiver les boutons suivant/précédent
    if (carouselConfig.currentPage === 0) {
      prevButton.classList.add('disabled');
    } else {
      prevButton.classList.remove('disabled');
    }
    
    if (carouselConfig.currentPage >= totalPages - 1 || totalPages === 0) {
      nextButton.classList.add('disabled');
    } else {
      nextButton.classList.remove('disabled');
    }
  }
  
  // Mettre à jour le compteur de projets
  const currentPageElement = document.querySelector('.portfolio-counter .current-page');
  const totalPagesElement = document.querySelector('.portfolio-counter .total-pages');
  
  if (currentPageElement && totalPagesElement) {
    // Calculer les indices de début et fin pour la page courante
    const startIndex = (carouselConfig.currentPage * carouselConfig.itemsPerPage) + 1;
    const endIndex = Math.min((startIndex + carouselConfig.itemsPerPage - 1), carouselConfig.filteredProjects.length);
    
    // Afficher les projets actuels sur le total
    if (carouselConfig.filteredProjects.length > 0) {
      currentPageElement.textContent = `${startIndex}-${endIndex}`;
      totalPagesElement.textContent = carouselConfig.filteredProjects.length;
    } else {
      currentPageElement.textContent = "0";
      totalPagesElement.textContent = "0";
    }
  }
}

/**
 * Crée un élément HTML pour un projet
 * @param {Object} project - Données du projet
 * @param {number} index - Index du projet (pour l'animation)
 * @returns {HTMLElement} Élément HTML du projet
 */
function createProjectElement(project, index) {
  // Calcul du délai d'animation
  const delay = (index % 4) * 100; // Modifié pour 4 par page
  
  const projectDiv = document.createElement("div");
  projectDiv.classList.add("col-lg-3", "col-md-6", "portfolio-item", project.category); // Modifié à col-lg-3 pour 4 par ligne
  
  if (window.AOS) {
    projectDiv.setAttribute("data-aos", "zoom-in");
    projectDiv.setAttribute("data-aos-delay", delay.toString());
  }
  
  const categoryMap = {
    'filter-bi': 'Business Intelligence',
    'filter-data': 'Data Science',
    'filter-recherche': 'Recherche'
  };
  
  const categoryName = categoryMap[project.category] || 'Projet';
  
  projectDiv.innerHTML = `
    <div class="portfolio-wrap">
      <div class="portfolio-img">
        <img src="${project.image_url}" alt="${project.name}" onerror="this.src='img/portfolio/placeholder1.jpg'">
      </div>
      <div class="portfolio-info">
        <span class="portfolio-category">${categoryName}</span>
        <h4>${project.name}</h4>
        <p>${project.description || 'Aucune description disponible.'}</p>
        <div class="portfolio-links">
          <a href="project.html?id=${project.id}" class="details-link">
            <i class="fas fa-link"></i>Voir le projet
          </a>
        </div>
      </div>
    </div>
  `;
  
  return projectDiv;
}

/**
 * Fonction pour recharger les projets (utile pour les mises à jour)
 */
window.reloadProjects = loadProjects;