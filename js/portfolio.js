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
    
    // Vide le conteneur
    projectsContainer.innerHTML = "";
      
    // Parcours et affichage des projets
    projects.forEach((project, index) => {
      // Création d'un élément pour chaque projet
      const projectElement = createProjectElement(project, index);
      
      // Ajout au conteneur
      projectsContainer.appendChild(projectElement);
    });
    
    // Initialisation d'Isotope pour le filtrage
    initializeIsotope();
    
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
 * Crée un élément HTML pour un projet
 * @param {Object} project - Données du projet
 * @param {number} index - Index du projet (pour l'animation)
 * @returns {HTMLElement} Élément HTML du projet
 */
/**
 * Crée un élément HTML pour un projet avec un design amélioré
 * @param {Object} project - Données du projet
 * @param {number} index - Index du projet (pour l'animation)
 * @returns {HTMLElement} Élément HTML du projet
 */
/**
 * Crée un élément HTML pour un projet avec un design optimisé
 * @param {Object} project - Données du projet
 * @param {number} index - Index du projet (pour l'animation)
 * @returns {HTMLElement} Élément HTML du projet
 */
function createProjectElement(project, index) {
  // Calcul du délai d'animation
  const delay = (index % 3) * 100; // Décalage pour une animation en cascade
  
  // Création du div principal
  const projectDiv = document.createElement("div");
  projectDiv.classList.add("col-lg-4", "col-md-6", "portfolio-item", project.category);
  
  if (window.AOS) {
    projectDiv.setAttribute("data-aos", "zoom-in");
    projectDiv.setAttribute("data-aos-delay", delay.toString());
  }
  
  // Mapper les catégories vers des noms plus lisibles
  const categoryMap = {
    'filter-bi': 'Business Intelligence',
    'filter-data': 'Data Science',
    'filter-recherche': 'Recherche'
  };
  
  const categoryName = categoryMap[project.category] || 'Projet';
  
  // Structure HTML interne améliorée avec le bouton "Voir le projet"
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
 * Initialise Isotope pour le filtrage des projets
 */
function initializeIsotope() {
  // Sélection du conteneur
  const portfolioContainer = document.querySelector('.portfolio-container');
  
  if (!portfolioContainer) {
    console.warn("Conteneur portfolio non trouvé pour Isotope");
    return;
  }
  
  // Initialisation d'Isotope avec un délai pour s'assurer que les images sont chargées
  setTimeout(() => {
    try {
      const portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows'
      });
      
      // Gestionnaire d'événements pour les filtres
      document.querySelectorAll('.portfolio-filter li').forEach(filter => {
        filter.addEventListener('click', function() {
          // Retirer la classe active de tous les filtres
          const activeFilter = document.querySelector('.portfolio-filter .filter-active');
          if (activeFilter) {
            activeFilter.classList.remove('filter-active');
          }
          
          // Ajouter la classe active au filtre cliqué
          this.classList.add('filter-active');
          
          // Appliquer le filtre
          portfolioIsotope.arrange({
            filter: this.getAttribute('data-filter')
          });
          
          // Animation AOS
          if (window.AOS) {
            AOS.refresh();
          }
        });
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation d'Isotope:", error);
    }
  }, 500);
}

/**
 * Fonction pour recharger les projets (utile pour les mises à jour)
 */
window.reloadProjects = loadProjects;