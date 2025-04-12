/**
 * main.js - Script principal du portfolio
 * 
 * Ce fichier gère les fonctionnalités générales du site : 
 * animations, scrolling, préchargement, etc.
 */

document.addEventListener('DOMContentLoaded', function() {
    "use strict";
    
    // Initialisation des composants
    initializePreloader();
    enhanceResponsiveMenu();
    // initializeNavbar();
    initializeScrolling();
    initializeBackToTop();
    initializeAOS();
    initializeTyped();
    initializeSkillBars();
    initializeYearUpdate();
    initializeParticles();
    initializeContactForm();
    setupContactForm();

  });
  
  /**
   * Initialise le préchargeur (loader)
   */
  function initializePreloader() {
    const preloader = document.getElementById('preloader');
    
    if (preloader) {
      // Masquer le préchargeur après le chargement complet de la page
      window.addEventListener('load', function() {
        preloader.classList.add('fade-out');
        setTimeout(function() {
          preloader.style.display = 'none';
        }, 500);
      });
    }
  }
  
/**
 * Amélioration du menu responsive
 * Ajouter ce code à votre fichier main.js existant
 */

function enhanceResponsiveMenu() {
    // Sélectionner les éléments
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Gérer le comportement sticky du menu sur scroll
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-sticky');
      } else {
        navbar.classList.remove('navbar-sticky');
      }
    });
    
    // Fermer le menu quand on clique sur un lien (mobile)
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 992) {
          // Si Bootstrap est chargé, utiliser son API pour fermer le menu
          if (typeof bootstrap !== 'undefined') {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
              bsCollapse.hide();
            }
          } else {
            // Méthode alternative pour fermer le menu
            navbarCollapse.classList.remove('show');
            navbarToggler.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });
    
    // Ajouter la navigation active au défilement
    window.addEventListener('scroll', function() {
      // Trouver la section visible actuelle
      let current = '';
      const sections = document.querySelectorAll('section');
      const navHeight = navbar.offsetHeight;
      
      sections.forEach(section => {
        const sectionTop = section.offsetTop - navHeight - 50;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
      
      // Mettre à jour les liens actifs
      navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (href && href.includes('#') && href.substring(href.indexOf('#') + 1) === current) {
          link.classList.add('active');
        }
      });
    });
    
    // Animation lors de l'ouverture/fermeture du menu
    if (navbarToggler) {
      navbarToggler.addEventListener('click', function() {
        // Ajouter une classe pour l'animation si c'est ouvert
        if (this.getAttribute('aria-expanded') === 'true') {
          setTimeout(() => {
            navbarCollapse.classList.add('show');
          }, 10);
        } else {
          navbarCollapse.classList.remove('show');
        }
      });
    }
  }

  function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    const submitButton = document.getElementById('submitButton');
    const spinner = submitButton ? submitButton.querySelector('.spinner-border') : null;
    const buttonText = submitButton ? submitButton.querySelector('span:first-child') : null;
    const contactMessage = document.getElementById('contactMessage');
    
    // Vérifier si l'URL contient submitted=true
    if (window.location.search.includes('submitted=true')) {
      // Afficher un message de succès
      if (contactMessage) {
        contactMessage.classList.remove('d-none');
        contactMessage.classList.add('alert-success');
        contactMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i> Votre message a été envoyé avec succès. Je vous répondrai dès que possible!';
        
        // Faire défiler jusqu'au message
        setTimeout(() => {
          contactMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
        
        // Masquer le message après 8 secondes
        setTimeout(() => {
          contactMessage.classList.add('fade-out');
          setTimeout(() => {
            contactMessage.classList.add('d-none');
            contactMessage.classList.remove('fade-out');
          }, 500);
        }, 8000);
        
        // Nettoyer l'URL
        if (history.pushState) {
          const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname;
          window.history.pushState({ path: newurl }, '', newurl);
        }
      }
    }
    
    // Gérer la soumission du formulaire
    contactForm.addEventListener('submit', function(e) {
      // Ne pas arrêter la soumission - FormSubmit traitera le formulaire
      
      // Afficher l'indicateur de chargement
      if (spinner && buttonText) {
        spinner.classList.remove('d-none');
        buttonText.textContent = 'Envoi en cours...';
        submitButton.disabled = true;
      }
    });
  }
  /**
   * Initialise le défilement fluide pour les liens d'ancrage
   */
  function initializeScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
          });
        }
      });
    });
  }
  
  /**
   * Initialise le bouton retour en haut
   */
  function initializeBackToTop() {
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
      window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
          backToTop.classList.add('active');
        } else {
          backToTop.classList.remove('active');
        }
      });
      
      backToTop.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  
  /**
   * Initialise la bibliothèque AOS pour les animations au défilement
   */
  function initializeAOS() {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  
  /**
   * Initialise l'effet de texte tapé pour la section hero
   */
  function initializeTyped() {
    const typedElement = document.querySelector('.typed-text');
    
    if (typedElement) {
      // Assurez-vous que l'élément a une position relative ou absolue
      typedElement.style.position = 'relative';
      
      // Textes à afficher
      const typedStrings = ['Consultant Digital', 'Data Analyst', 'Data-Sciencist', 'Analytics Engineer'];
      
      // Options personnalisées pour Typed.js
      const options = {
        strings: typedStrings,
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 2000,
        loop: true,
        cursorChar: '|',  // Caractère du curseur
        // Styles CSS pour le curseur
        cursorStyles: {
          'color': 'var(--primary-color)',
          'font-weight': 'bold'
        }
      };
      
      // Créer l'instance Typed
      const typed = new Typed('.typed-text', options);
      
      // Correction du style du curseur après l'initialisation
      setTimeout(() => {
        const cursor = document.querySelector('.typed-cursor');
        if (cursor) {
          cursor.style.position = 'relative';
          cursor.style.bottom = '0';
          cursor.style.color = 'var(--primary-color)';
          cursor.style.fontWeight = 'bold';
          cursor.style.fontSize = '1em';
          cursor.style.lineHeight = 'inherit';
        }
      }, 100);
    }
  }
  
  /**
   * Initialise les barres de progression pour les compétences
   */
  function initializeSkillBars() {
    // On cible spécifiquement les éléments avec les deux classes
    const progressBars = document.querySelectorAll('.bar.progress-line');
    
    // Si aucune barre de progression n'est trouvée, sortir de la fonction
    if (!progressBars.length) {
        console.log('Aucune barre de progression trouvée');
        return;
    }
    
    // Fonction pour animer une barre spécifique
    function animateBar(bar) {
        const width = bar.getAttribute('data-width');
        
        // Réinitialiser d'abord à 0
        bar.style.width = '0%';
        
        // Utiliser un délai pour s'assurer que la transition fonctionne
        setTimeout(() => {
            // Définir la largeur finale avec la transition CSS
            bar.style.width = width + '%';
        }, 100);
    }
    
    // Fonction pour animer toutes les barres
    function animateAllBars() {
        progressBars.forEach(bar => {
            animateBar(bar);
        });
    }
    
    // Utiliser IntersectionObserver pour détecter quand la section est visible
    const skillsSection = document.querySelector('.skills-section');
    
    if (skillsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Si la section est visible
                if (entry.isIntersecting) {
                    animateAllBars();
                    // Arrêter d'observer une fois que l'animation est déclenchée
                    observer.unobserve(entry.target);
                }
            });
        }, {
            // Déclencher quand au moins 10% de la section est visible
            threshold: 0.1
        });
        
        // Commencer à observer la section
        observer.observe(skillsSection);
    } else {
        console.log('Section de compétences non trouvée');
    }
    
    // // Ajouter également un déclencheur au défilement pour la compatibilité
    // window.addEventListener('scroll', function() {
    //     if (!skillsSection) return;
        
    //     const sectionPos = skillsSection.getBoundingClientRect().top;
    //     const screenPos = window.innerHeight / 1.3;
        
    //     if (sectionPos < screenPos) {
    //         animateAllBars();
    //     }
    // });
    
    // Ajouter les styles CSS nécessaires directement
    const style = document.createElement('style');
    style.textContent = `
        .bar.progress-line {
            transition: width 1.5s ease-in-out;
            width: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Déclencher l'animation immédiatement au chargement
    // Cela garantira que l'animation s'exécute au moins une fois
    setTimeout(animateAllBars, 500);
}

  /**
   * Initialise l'année courante dans le footer
   */
  function initializeYearUpdate() {
    const yearElement = document.getElementById('currentYear');
    
    if (yearElement) {
      const currentYear = new Date().getFullYear();
      yearElement.textContent = currentYear;
    }
  }
  
  /**
   * Initialise l'effet particules dans la section hero
   */
  function initializeParticles() {
    const particlesContainer = document.getElementById('particles-js');
    
    if (particlesContainer) {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 100, // Augmentation du nombre de particules
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: '#EF233C' // Couleur primaire pour plus de visibilité
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000'
            }
          },
          opacity: {
            value: 0.9, // Opacité augmentée
            random: false,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.4,
              sync: false
            }
          },
          size: {
            value: 6, // Taille augmentée
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#2B2D42', // Couleur secondaire
            opacity: 0.6, // Opacité augmentée
            width: 1.5 // Largeur augmentée
          },
          move: {
            enable: true,
            speed: 5, // Vitesse augmentée
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'grab' // Mode attrayant pour l'interaction
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 180, // Distance d'interaction augmentée
              line_linked: {
                opacity: 0.8 // Lignes plus visibles à l'interaction
              }
            },
            push: {
              particles_nb: 6 // Plus de particules ajoutées au clic
            }
          }
        },
        retina_detect: true
      });
    }
  }
  
/**
 * Initialise le formulaire de contact avec FormSubmit
 */
function initializeContactForm() {
  const contactForm = document.getElementById('contactForm');
  
  if (!contactForm) {
    console.error("Formulaire de contact non trouvé");
    return;
  }
  
  // ⚠️ IMPORTANT: Remplacez cette URL par votre adresse email
  contactForm.setAttribute('action', 'https://formsubmit.co/joris.salmon53290@gmail.com');
  contactForm.setAttribute('method', 'POST');
  
  // Ajouter des champs cachés pour FormSubmit
  const hiddenFields = [
    { name: '_captcha', value: 'false' },         // Désactiver le captcha (optionnel)
    { name: '_next', value: window.location.href + '?submitted=true' }, // URL de redirection
    { name: '_subject', value: 'Nouveau message de contact du site web' }  // Sujet de l'email
  ];
  
  hiddenFields.forEach(field => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = field.name;
    input.value = field.value;
    contactForm.appendChild(input);
  });
  
  // Validation avant soumission
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Empêcher la soumission pour valider d'abord
    
    // Récupération des valeurs du formulaire
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validation des champs
    let isValid = true;
    let errorMessage = '';
    
    if (!name) {
      isValid = false;
      errorMessage = 'Veuillez entrer votre nom';
      document.getElementById('name').classList.add('is-invalid');
    } else {
      document.getElementById('name').classList.remove('is-invalid');
    }
    
    if (!email) {
      isValid = false;
      errorMessage = errorMessage || 'Veuillez entrer votre email';
      document.getElementById('email').classList.add('is-invalid');
    } else if (!isValidEmail(email)) {
      isValid = false;
      errorMessage = 'Veuillez entrer un email valide';
      document.getElementById('email').classList.add('is-invalid');
    } else {
      document.getElementById('email').classList.remove('is-invalid');
    }
    
    if (!subject) {
      isValid = false;
      errorMessage = errorMessage || 'Veuillez entrer un sujet';
      document.getElementById('subject').classList.add('is-invalid');
    } else {
      document.getElementById('subject').classList.remove('is-invalid');
    }
    
    if (!message) {
      isValid = false;
      errorMessage = errorMessage || 'Veuillez entrer votre message';
      document.getElementById('message').classList.add('is-invalid');
    } else {
      document.getElementById('message').classList.remove('is-invalid');
    }
    
    if (!isValid) {
      showFormMessage(errorMessage, 'error');
      return;
    }
    
    // Désactiver le bouton d'envoi pendant la soumission
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    // Soumettre le formulaire
    contactForm.submit();
  });
  
  // Réinitialiser les classes d'invalidation lors de la saisie
  const formInputs = contactForm.querySelectorAll('input, textarea');
  formInputs.forEach(input => {
    input.addEventListener('input', function() {
      this.classList.remove('is-invalid');
    });
  });
}

/**
 * Valide un email avec une expression régulière
 * @param {string} email - Email à valider
 * @returns {boolean} - true si l'email est valide
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Affiche un message de succès ou d'erreur pour le formulaire
 * @param {string} message - Message à afficher
 * @param {string} type - Type de message ('success' ou 'error')
 */
function showFormMessage(message, type) {
  if (!message) return;
  
  // Récupérer ou créer le conteneur de message
  let messageContainer = document.getElementById('formMessageContainer');
  
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.id = 'formMessageContainer';
    
    // Insérer après le formulaire
    const contactForm = document.getElementById('contactForm');
    if (contactForm && contactForm.parentNode) {
      contactForm.parentNode.insertBefore(messageContainer, contactForm.nextSibling);
    } else {
      document.body.appendChild(messageContainer);
      console.warn('Le formulaire parent n\'a pas été trouvé. Le message a été ajouté au body.');
    }
  }
  
  // Vider les messages précédents
  messageContainer.innerHTML = '';
  
  // Créer le nouveau message
  const messageElement = document.createElement('div');
  messageElement.className = 'form-message alert';
  messageElement.classList.add(type === 'success' ? 'alert-success' : 'alert-danger');
  messageElement.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Ajouter le message au conteneur
  messageContainer.appendChild(messageElement);
  
  // Animation d'entrée
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(-10px)';
  messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  }, 10);
  
  // Faire disparaître le message après un délai (sauf pour les erreurs)
  if (type === 'success') {
    setTimeout(() => {
      // Animation de sortie
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        messageContainer.innerHTML = '';
      }, 300);
    }, 5000);
  } else {
    // Pour les erreurs, ajouter un bouton de fermeture
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'btn-close btn-sm';
    closeButton.setAttribute('aria-label', 'Fermer');
    closeButton.style.marginLeft = 'auto';
    
    // Ajouter le bouton au message
    messageElement.querySelector('.d-flex').appendChild(closeButton);
    
    // Gérer l'événement de clic sur le bouton de fermeture
    closeButton.addEventListener('click', () => {
      messageElement.style.opacity = '0';
      messageElement.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        messageContainer.removeChild(messageElement);
      }, 300);
    });
  }
}