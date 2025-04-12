let currentPosition = 0;
let itemWidth = 0;
const itemsToShow = 2;

/**
 * Initialise le carrousel responsive
 * @param {Array} allBlogItems - Tous les éléments du blog
 * @param {HTMLElement} carouselContainer - Conteneur du carrousel
 * @returns {Object} - Interface pour manipuler le carrousel
 */
function initializeResponsiveCarousel(allBlogItems, carouselContainer) {
    let currentIndex = 0;
    let itemsPerPage = 2; // Valeur par défaut pour desktop
    let groupedItems = [];
    
    // Boutons de navigation
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    
    /**
     * Calcule le nombre d'éléments à afficher selon la taille de l'écran
     */
    function calculateItemsPerPage() {
        // Adapte le nombre d'éléments selon la taille de l'écran
        if (window.innerWidth < 576) {
            return 1; // Mobile: 1 élément
        } else if (window.innerWidth < 992) {
            return 1; // Tablette: 1 élément
        } else {
            return 2; // Desktop: 2 éléments
        }
    }
    
    /**
     * Groupe les éléments selon le nombre d'éléments par page
     * @param {Array} items - Éléments à regrouper
     * @param {Number} perPage - Nombre d'éléments par page
     * @returns {Array} - Éléments regroupés par page
     */
    function groupItems(items, perPage) {
        const grouped = [];
        for (let i = 0; i < items.length; i += perPage) {
            grouped.push(items.slice(i, i + perPage));
        }
        return grouped;
    }
    
    /**
     * Affiche les éléments avec une transition fluide
     * @param {Array} items - Éléments à afficher
     */
    function renderWithTransition(items) {
        // Animation de transition
        carouselContainer.style.opacity = '0';
        carouselContainer.style.transform = 'translateY(10px)';
        carouselContainer.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        
        setTimeout(() => {
            // Vide le conteneur
            carouselContainer.innerHTML = '';
            
            // Ajoute les nouveaux éléments
            items.forEach(item => {
                // Ajustement des classes selon la largeur de l'écran
                if (itemsPerPage === 1) {
                    // Sur mobile/tablette, utiliser la largeur complète
                    item.className = item.className.replace(/col-lg-\d+/g, 'col-lg-12');
                    item.className = item.className.replace(/col-md-\d+/g, 'col-md-12');
                } else {
                    // Sur desktop, conserver le layout original
                    if (!item.className.includes('col-lg-6')) {
                        item.className = item.className.replace(/col-lg-\d+/g, 'col-lg-6');
                    }
                }
                
                carouselContainer.appendChild(item);
            });
            
            // Révèle les éléments avec animation
            carouselContainer.style.opacity = '1';
            carouselContainer.style.transform = 'translateY(0)';
            
            // Rafraîchir AOS si disponible
            if (window.AOS) {
                setTimeout(() => {
                    AOS.refresh();
                }, 150);
            }
        }, 300);
    }
    
    /**
     * Met à jour l'affichage du carrousel
     */
    function updateCarousel() {
        // Si aucun élément à afficher
        if (groupedItems.length === 0) {
            carouselContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-info">
                        Aucun article ne correspond à votre sélection.
                    </div>
                </div>
            `;
            
            // Masque les boutons de navigation
            if (prevButton) prevButton.style.display = 'none';
            if (nextButton) nextButton.style.display = 'none';
            return;
        }
        
        // Affiche les boutons de navigation
        if (prevButton) prevButton.style.display = 'flex';
        if (nextButton) nextButton.style.display = 'flex';
        
        // Affiche les éléments de la page actuelle
        renderWithTransition(groupedItems[currentIndex]);
        
        // Met à jour l'état des boutons
        updateButtonStates();
    }
    
    /**
     * Met à jour l'état des boutons (actif/inactif)
     */
    function updateButtonStates() {
        if (prevButton) {
            if (currentIndex <= 0) {
                prevButton.classList.add('disabled');
                prevButton.setAttribute('disabled', 'disabled');
            } else {
                prevButton.classList.remove('disabled');
                prevButton.removeAttribute('disabled');
            }
        }
        
        if (nextButton) {
            if (currentIndex >= groupedItems.length - 1) {
                nextButton.classList.add('disabled');
                nextButton.setAttribute('disabled', 'disabled');
            } else {
                nextButton.classList.remove('disabled');
                nextButton.removeAttribute('disabled');
            }
        }
    }
    
    /**
     * Initialise le carrousel
     */
    function initialize() {
        // Calcule le nombre d'éléments par page
        itemsPerPage = calculateItemsPerPage();
        
        // Groupe les éléments
        groupedItems = groupItems(allBlogItems, itemsPerPage);
        
        // Reset l'index
        currentIndex = 0;
        
        // Met à jour l'affichage
        updateCarousel();
    }
    
    /**
     * Page suivante
     */
    function next() {
        if (currentIndex < groupedItems.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    /**
     * Page précédente
     */
    function prev() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    /**
     * Applique un filtre aux éléments
     * @param {String} filterValue - Valeur du filtre ('*' pour tout)
     */
    function applyFilter(filterValue) {
        // Filtre les éléments
        const filteredItems = filterValue === '*' 
            ? [...allBlogItems] 
            : allBlogItems.filter(item => item.classList.contains(filterValue.replace('.', '')));
        
        // Recalcule le nombre d'éléments par page (au cas où la taille d'écran a changé)
        itemsPerPage = calculateItemsPerPage();
        
        // Regroupe les éléments
        groupedItems = groupItems(filteredItems, itemsPerPage);
        
        // Reset l'index
        currentIndex = 0;
        
        // Met à jour l'affichage
        updateCarousel();
    }
    
    // Ajoute les gestionnaires d'événements pour les boutons
    if (prevButton) {
        prevButton.addEventListener('click', prev);
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', next);
    }
    
    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', debounce(function() {
        const newItemsPerPage = calculateItemsPerPage();
        
        // Si le nombre d'éléments par page a changé
        if (newItemsPerPage !== itemsPerPage) {
            itemsPerPage = newItemsPerPage;
            
            // Regroupe les éléments avec la nouvelle valeur
            const currentFilterValue = document.querySelector('.blog-filter .filter-active')?.getAttribute('data-filter') || '*';
            const filteredItems = currentFilterValue === '*' 
                ? [...allBlogItems] 
                : allBlogItems.filter(item => item.classList.contains(currentFilterValue.replace('.', '')));
            
            groupedItems = groupItems(filteredItems, itemsPerPage);
            
            // Ajuste l'index si nécessaire
            if (currentIndex >= groupedItems.length) {
                currentIndex = Math.max(0, groupedItems.length - 1);
            }
            
            // Met à jour l'affichage
            updateCarousel();
        }
    }, 250));
    
    // Fonction debounce pour éviter trop d'appels lors du redimensionnement
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // Initialisation
    initialize();
    
    // Interface publique
    return {
        next,
        prev,
        applyFilter,
        refresh: initialize
    };
}

/**
 * Intégration avec le code de chargement des articles
 * À ajouter dans blog.js
 */
function enhanceBlogCarousel() {
    // Référence au conteneur des articles
    const blogContainer = document.getElementById("blogjorisContainer");
    
    // Si le carrousel existe déjà, sortir
    if (window.blogCarousel) return;
    
    // Création des éléments pour les articles
    if (allBlogItems && allBlogItems.length > 0) {
        // Initialiser le carrousel avec tous les éléments
        window.blogCarousel = initializeResponsiveCarousel(allBlogItems, blogContainer);
        
        // Gestionnaire pour les filtres
        document.querySelectorAll('.blog-filter li').forEach(filter => {
            filter.addEventListener('click', function() {
                // Mise à jour de la classe active
                document.querySelector('.blog-filter .filter-active')?.classList.remove('filter-active');
                this.classList.add('filter-active');
                
                // Application du filtre
                const filterValue = this.getAttribute('data-filter');
                window.blogCarousel.applyFilter(filterValue);
            });
        });
    }
}