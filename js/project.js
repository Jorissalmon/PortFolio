/**
 * project.js - Script pour la page de détail du projet
 */

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID du projet depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    if (!projectId) {
        // Rediriger vers la page portfolio si aucun ID n'est fourni
        window.location.href = 'index.html#portfolio';
        return;
    }
    
    // Charger les détails du projet
    loadProjectDetails(projectId);
    
    // Initialiser AOS pour les animations
    AOS.init({
        duration: 1000,
        once: true
    });
});

/**
 * Charge les détails d'un projet spécifique
 * @param {string} projectId - ID du projet à afficher
 */
async function loadProjectDetails(projectId) {
    try {
        // Afficher un indicateur de chargement
        document.getElementById('projectContent').innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-3">Chargement du projet...</p>
            </div>
        `;
        
        // Récupérer les données du projet
        const project = await window.dataService.getProjectById(projectId);
        
        if (!project) {
            showError("Projet introuvable. Veuillez réessayer.");
            return;
        }
        
        // Mettre à jour le titre de la page
        document.title = `${project.title} | Joris Salmon`;
        
        // Afficher les informations du projet
        displayProjectInformation(project);
        
        // Charger des projets similaires
        loadRelatedProjects(project.category, projectId);
        
    } catch (error) {
        console.error("Erreur lors du chargement du projet:", error);
        showError("Une erreur est survenue lors du chargement du projet.");
    }
}

/**
 * Affiche les informations du projet sur la page
 * @param {Object} project - Données du projet
 */
function displayProjectInformation(project) {
    // Titre et catégorie
    document.getElementById('projectTitle').textContent = project.title;
    
    // Définir l'image de fond pour la section hero
    const heroSection = document.getElementById('projectHeroSection');
    heroSection.style.backgroundImage = `url('${project.image_url}')`;
    
    // Catégorie
    const categoryMap = {
        'filter-bi': 'Business Intelligence',
        'filter-data': 'Data Science',
        'filter-recherche': 'Recherche'
    };
    
    const categoryBadge = document.getElementById('projectCategoryBadge');
    categoryBadge.textContent = categoryMap[project.category] || 'Projet';
    
    // Informations de base
    document.getElementById('projectDate').textContent = project.date || '--';
    document.getElementById('projectTechnologies').textContent = project.technologies || '--';
    document.getElementById('projectClient').textContent = project.client || '--';
    document.getElementById('projectType').textContent = project.type || '--';
    
    // Résumé du projet
    document.getElementById('projectSummary').innerHTML = `
        <p>${project.description}</p>
    `;
    
    // Contenu détaillé
    document.getElementById('projectContent').innerHTML = project.content || '<p>Aucun contenu détaillé disponible pour ce projet.</p>';
    
    // Gérer le lien externe
    const externalLink = document.getElementById('projectExternalLink');
    const externalLinkContainer = externalLink.parentNode;
    
    // Vérifier si l'URL externe est définie et valide
    if (project.external_url && typeof project.external_url === 'string' && project.external_url.trim() !== '' && project.external_url !== '#') {
        // Définir l'URL sur le lien
        externalLink.href = project.external_url;
        
        // S'assurer que le conteneur est visible
        externalLinkContainer.style.display = 'block';
        
        // Réinitialiser les event listeners existants pour éviter les conflits
        const newExternalLink = externalLink.cloneNode(true);
        externalLinkContainer.replaceChild(newExternalLink, externalLink);
        
        // Journaliser pour le débogage
        console.log('Lien externe configuré:', project.external_url);
    } else {
        // Masquer le conteneur si aucun lien valide n'est disponible
        externalLinkContainer.style.display = 'none';
        console.log('Aucun lien externe valide trouvé:', project.external_url);
    }
    
    // Galerie d'images
    handleGallery(project.gallery);
    
    // Vidéo du projet
    handleVideo(project.video_url);
}

/**
 * Gère l'affichage de la galerie d'images
 * @param {Array} gallery - Tableau d'URL d'images
 */
function handleGallery(gallery) {
    const gallerySection = document.getElementById('gallerySection');
    const galleryContainer = document.getElementById('projectGallery');
    
    if (!gallery || gallery.length === 0) {
        // Masquer la section si aucune image n'est disponible
        gallerySection.style.display = 'none';
        return;
    }
    
    // Afficher la section
    gallerySection.style.display = 'block';
    
    // Vider le conteneur
    galleryContainer.innerHTML = '';
    
    // Ajouter chaque image à la galerie
    gallery.forEach((imageUrl, index) => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        
        col.innerHTML = `
            <div class="gallery-item" onclick="openImageModal('${imageUrl}')">
                <img src="${imageUrl}" alt="Image ${index + 1}" class="img-fluid">
            </div>
        `;
        
        galleryContainer.appendChild(col);
    });
    
    // Créer le modal pour les images si nécessaire
    if (!document.getElementById('imageModal')) {
        const modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'image-modal';
        
        modal.innerHTML = `
            <span class="modal-close" onclick="closeImageModal()">&times;</span>
            <img class="modal-content" id="modalImage">
        `;
        
        document.body.appendChild(modal);
        
        // Fermer le modal en cliquant n'importe où
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeImageModal();
            }
        });
        
        // Fermer le modal avec la touche Echap
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && modal.style.display === 'flex') {
                closeImageModal();
            }
        });
    }
}

/**
 * Ouvre le modal pour afficher une image en grand
 * @param {string} imageUrl - URL de l'image à afficher
 */
function openImageModal(imageUrl) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    
    modal.style.display = 'flex';
    modalImg.src = imageUrl;
    
    // Ajouter la classe pour l'animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Empêcher le défilement de la page
    document.body.style.overflow = 'hidden';
}

/**
 * Ferme le modal d'image
 */
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    
    // Enlever la classe pour l'animation
    modal.classList.remove('show');
    
    // Attendre la fin de l'animation avant de cacher
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Réactiver le défilement de la page
    document.body.style.overflow = 'auto';
}

/**
 * Gère l'affichage de la vidéo du projet
 * @param {string} videoUrl - URL de la vidéo
 */
function handleVideo(videoUrl) {
    const videoSection = document.getElementById('videoSection');
    const videoContainer = document.getElementById('projectVideo');
    
    if (!videoUrl) {
        // Masquer la section si aucune vidéo n'est disponible
        videoSection.style.display = 'none';
        return;
    }
    
    // Afficher la section
    videoSection.style.display = 'block';
    
    // Déterminer le type de vidéo et créer l'embed
    let embedUrl = '';
    
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        // YouTube
        let videoId = '';
        
        if (videoUrl.includes('youtube.com/watch?v=')) {
            videoId = videoUrl.split('v=')[1].split('&')[0];
        } else if (videoUrl.includes('youtu.be/')) {
            videoId = videoUrl.split('youtu.be/')[1];
        }
        
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
    } else if (videoUrl.includes('vimeo.com')) {
        // Vimeo
        const videoId = videoUrl.split('vimeo.com/')[1];
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
        
    } else {
        // Autres vidéos
        embedUrl = videoUrl;
    }
    
    // Créer l'iframe
    videoContainer.innerHTML = `
        <iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
}

/**
 * Charge les projets similaires
 * @param {string} category - Catégorie du projet actuel
 * @param {string} currentId - ID du projet actuel à exclure
 */
async function loadRelatedProjects(category, currentId) {
    try {
        // Récupérer tous les projets
        const allProjects = await window.dataService.getProjects();
        
        if (!allProjects || allProjects.length === 0) {
            document.querySelector('.related-projects-section').style.display = 'none';
            return;
        }
        
        // Filtrer pour obtenir les projets de la même catégorie, en excluant le projet courant
        let relatedProjects = allProjects.filter(project => 
            project.category === category && project.id !== currentId
        );
        
        // Si moins de 3 projets, ajouter d'autres projets aléatoires
        if (relatedProjects.length < 3) {
            const otherProjects = allProjects
                .filter(project => project.id !== currentId && !relatedProjects.some(p => p.id === project.id))
                .sort(() => 0.5 - Math.random());
                
            relatedProjects = [...relatedProjects, ...otherProjects].slice(0, 3);
        } else {
            // Limiter à 3 projets
            relatedProjects = relatedProjects.slice(0, 3);
        }
        
        displayRelatedProjects(relatedProjects);
        
    } catch (error) {
        console.error("Erreur lors du chargement des projets similaires:", error);
        document.querySelector('.related-projects-section').style.display = 'none';
    }
}

/**
 * Affiche les projets similaires
 * @param {Array} projects - Liste des projets à afficher
 */
function displayRelatedProjects(projects) {
    const container = document.getElementById('relatedProjectsContainer');
    
    if (!projects || projects.length === 0) {
        document.querySelector('.related-projects-section').style.display = 'none';
        return;
    }
    
    // Afficher la section
    document.querySelector('.related-projects-section').style.display = 'block';
    
    // Vider le conteneur
    container.innerHTML = '';
    
    // Mapper les catégories
    const categoryMap = {
        'filter-bi': 'Business Intelligence',
        'filter-data': 'Data Science',
        'filter-recherche': 'Recherche',
        'filter-1': 'Business Intelligence',
        'filter-2': 'Data Science',
        'filter-3': 'Recherche'
    };
    
    // Créer une carte pour chaque projet
    projects.forEach(project => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6';
        
        col.innerHTML = `
            <div class="related-project-card">
                <div class="related-project-image">
                    <img src="${project.image_url}" alt="${project.name}">
                </div>
                <div class="related-project-content">
                    <span class="project-category-label">${categoryMap[project.category] || 'Projet'}</span>
                    <h3>${project.name}</h3>
                    <p>${truncateText(project.description, 80)}</p>
                    <a href="project.html?id=${project.id}" class="btn btn-sm btn-outline">Voir le projet</a>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

/**
 * Tronque un texte à une longueur donnée
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
function truncateText(text, maxLength) {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Affiche un message d'erreur sur la page
 * @param {string} message - Message d'erreur à afficher
 */
function showError(message) {
    // Masquer les sections qui ne devraient pas être affichées en cas d'erreur
    document.getElementById('gallerySection').style.display = 'none';
    document.getElementById('videoSection').style.display = 'none';
    document.querySelector('.related-projects-section').style.display = 'none';
    
    // Afficher le message d'erreur dans le contenu
    document.getElementById('projectContent').innerHTML = `
        <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle me-2"></i> ${message}
        </div>
        <div class="text-center mt-4">
            <a href="index.html#portfolio" class="btn btn-primary">
                <i class="fas fa-arrow-left me-2"></i>Retour au portfolio
            </a>
        </div>
    `;
    
    // Mettre à jour le titre
    document.getElementById('projectTitle').textContent = 'Projet non trouvé';
    document.title = 'Projet non trouvé | Joris Salmon';
}

// Fonctions pour le modal (doivent être globales pour être accessibles via onclick)
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;