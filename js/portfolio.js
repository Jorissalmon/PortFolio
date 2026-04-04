document.addEventListener('DOMContentLoaded', function () {
  // Les projets sont déjà rendus statiquement par le script de génération.
  // On initialise uniquement l'interactivité.
  initializeInteractivity();
});

/**
 * Initialise l'interactivité du portfolio (filtres et navigation)
 */
function initializeInteractivity() {
  const container = document.getElementById("projectsContainer");
  if (!container) return;

  // Configuration simplifiée pour les filtres existants
  const carouselConfig = {
    container: container,
    allItems: Array.from(container.querySelectorAll('.portfolio-item'))
  };

  // Initialiser les boutons de filtrage
  initFilterButtons(carouselConfig);

  // Initialiser les contrôles du carrousel
  initCarouselControls(carouselConfig);
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
    container: document.getElementById('projectsContainer'),
  };

  // Ajouter les contrôles de navigation du carrousel s'ils n'existent pas déjà
  addCarouselControls();

  // Initialiser les boutons de filtrage
  initFilterButtons(carouselConfig);

  // Initialiser les contrôles du carrousel
  initCarouselControls(carouselConfig);

  // Afficher tous les projets (au lieu d'une page)
  renderAllProjects(carouselConfig);
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
    button.addEventListener('click', function () {
      // Mettre à jour l'état actif
      const activeFilter = document.querySelector('.portfolio-filter .filter-active');
      if (activeFilter) {
        activeFilter.classList.remove('filter-active');
      }
      this.classList.add('filter-active');

      // Appliquer le filtre
      const filterValue = this.getAttribute('data-filter');
      
      carouselConfig.allItems.forEach(item => {
        if (filterValue === '*' || item.classList.contains(filterValue.substring(1))) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });

      // Réinitialiser le défilement
      carouselConfig.container.scrollLeft = 0;
      
      // Sync AOS
      if (window.AOS) {
        AOS.refresh();
      }
    });
  });
}

/**
 * Initialise les contrôles du carrousel
 * @param {Object} carouselConfig - Configuration du carrousel
 */
function initCarouselControls(carouselConfig) {
  const prevButton = document.querySelector('.portfolio-prev'); // Changé de carousel-prev
  const nextButton = document.querySelector('.portfolio-next'); // Changé de carousel-next

  if (prevButton && nextButton) {
    // Supprimer les anciens écouteurs d'événements s'il y en a
    const newPrevButton = prevButton.cloneNode(true);
    const newNextButton = nextButton.cloneNode(true);

    prevButton.parentNode.replaceChild(newPrevButton, prevButton);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);

    // Bouton précédent
    newPrevButton.addEventListener('click', function () {
      const firstItem = carouselConfig.container.querySelector('.modern-scroll-item');
      const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
      carouselConfig.container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Bouton suivant
    newNextButton.addEventListener('click', function () {
      const firstItem = carouselConfig.container.querySelector('.modern-scroll-item');
      const scrollAmount = firstItem ? firstItem.offsetWidth + 30 : 400;
      carouselConfig.container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  }
}

/**
 * Affiche tous les projets filtrés
 * @param {Object} carouselConfig - Configuration du carrousel
 */
function renderAllProjects(carouselConfig) {
  // Vider le conteneur
  carouselConfig.container.innerHTML = '';

  // Si aucun projet après filtrage
  if (carouselConfig.filteredProjects.length === 0) {
    carouselConfig.container.innerHTML = `
      <div class="col-12 text-center py-4">
        <div class="alert alert-info">
          Aucun projet ne correspond au filtre sélectionné.
        </div>
      </div>
    `;
    return;
  }

  // Créer un élément pour chaque projet
  carouselConfig.filteredProjects.forEach((project, index) => {
    const projectElement = createProjectElement(project, index);
    carouselConfig.container.appendChild(projectElement);
  });

  // Sync AOS
  if (window.AOS) {
    AOS.refresh();
  }
}

/**
 * Met à jour les contrôles du carrousel (Optionnel pour le scroll horizontal)
 */
function updateControls(carouselConfig) {
  // Les boutons restent actifs car le scroll est libre
  const prevButton = document.querySelector('.portfolio-prev');
  const nextButton = document.querySelector('.portfolio-next');
  if (prevButton && nextButton) {
    prevButton.classList.remove('disabled');
    nextButton.classList.remove('disabled');
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
  const delay = (index % 3) * 100; // Modifié pour 3 par page

  const projectDiv = document.createElement("div");
  projectDiv.classList.add("modern-scroll-item", "portfolio-item", project.category);

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
    <div class="blog-card">
      <div class="blog-img">
        <img src="${project.image_url}" class="img-fluid" alt="${project.name}" onerror="this.onerror=null; this.src='img/portfolio/placeholder1.jpg'">
      </div>
      <div class="blog-content">
        <span class="portfolio-category" style="color: var(--accent-cyan); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${categoryName}</span>
        <h3 class="mt-2">${project.name}</h3>
        <p>${project.description || 'Aucune description disponible.'}</p>
        <a href="${project.link}" class="read-more">Voir le projet</a>
      </div>
    </div>
  `;

  return projectDiv;
}

/**
/**
 * Fonction supprimée car les projets sont maintenant chargés statiquement
 */