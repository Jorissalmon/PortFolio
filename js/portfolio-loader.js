/**
 * portfolio-loader.js - Chargement dynamique du contenu depuis Contentful
 * 
 * Ce fichier gère le chargement de toutes les sections dynamiques du portfolio
 * depuis Contentful CMS.
 */

// Configuration globale
let profileData = null;

/**
 * Initialise le portfolio en chargeant tout le contenu Contentful
 */
async function initializePortfolio() {
    console.log('🚀 Initialisation du portfolio...');

    try {
        // Charger les données du profil
        await loadProfileSettings();

        // Vidéo de présentation (accueil)
        loadIntroVideo();

        // Charger toutes les sections en parallèle
        await Promise.all([
            loadJobTitles(),
            loadAboutSection(),
            loadSkills(),
            loadEducation(),
            loadExperiences(),
            loadPassions()
        ]);

        console.log('✅ Portfolio initialisé avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du portfolio:', error);
    }
}

/**
 * Charge la configuration du profil depuis Contentful
 */
async function loadProfileSettings() {
    try {
        console.log('📥 Chargement de la configuration du profil...');

        const data = await window.contentfulService.getProfileSettings();

        if (data && data.items && data.items.length > 0) {
            profileData = data.items[0].fields;
            console.log('✅ Configuration du profil chargée:', profileData);

            // Mettre à jour les informations de contact
            updateContactInfo();
        } else {
            console.warn('⚠️ Aucune configuration de profil trouvée');
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la configuration:', error);
    }
}

/**
 * Met à jour les informations de contact dans le footer
 */
function updateContactInfo() {
    if (!profileData) return;

    // Mettre à jour la localisation
    if (profileData.location) {
        const locationElement = document.querySelector('.contact-item .content p');
        if (locationElement && locationElement.textContent.includes('Aix-en-Provence')) {
            locationElement.textContent = profileData.location;
        }
    }

    // Mettre à jour le téléphone
    if (profileData.phone) {
        const phoneElements = document.querySelectorAll('.contact-item .content p');
        phoneElements.forEach(el => {
            if (el.textContent.includes('+33')) {
                el.textContent = profileData.phone;
            }
        });
    }

    // Mettre à jour l'email
    if (profileData.email) {
        const emailElements = document.querySelectorAll('.contact-item .content p');
        emailElements.forEach(el => {
            if (el.textContent.includes('@')) {
                el.textContent = profileData.email;
            }
        });
    }
}

/**
 * Charge la vidéo de présentation (accueil).
 * Source (par ordre de priorité) :
 *  1. l'attribut data-video-url du conteneur (#introVideoContainer),
 *  2. un champ Contentful du profil : presentationVideo / presentationVideoUrl
 *     / videoPresentation / videoUrl.
 * La section reste masquée si aucune vidéo valide n'est trouvée.
 */
function loadIntroVideo() {
    try {
        const container = document.getElementById('introVideoContainer');
        const section = document.getElementById('intro-video');
        if (!container || !section || !window.VideoEmbed) return;

        let url = (container.getAttribute('data-video-url') || '').trim();

        if (!url && profileData) {
            url = profileData.presentationVideo
                || profileData.presentationVideoUrl
                || profileData.videoPresentation
                || profileData.videoUrl
                || '';
        }

        if (url && window.VideoEmbed.renderInto(container, url)) {
            section.style.display = '';
            console.log('✅ Vidéo de présentation chargée');
        } else {
            section.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la vidéo de présentation:', error);
    }
}

/**
 * Charge et affiche dynamiquement les job titles
 */
async function loadJobTitles() {
    if (!profileData || !profileData.jobTitles) {
        console.warn('⚠️ Pas de job titles à charger');
        return;
    }

    try {
        console.log('📥 Chargement des job titles...');

        const skillsContainer = document.querySelector('.hero-content .skills');
        if (!skillsContainer) return;

        // Vider le conteneur
        skillsContainer.innerHTML = '';

        // Ajouter chaque job title
        profileData.jobTitles.forEach(title => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = title;
            skillsContainer.appendChild(tag);
        });

        console.log('✅ Job titles chargés');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des job titles:', error);
    }
}

/**
 * Charge et affiche la section À propos
 */
async function loadAboutSection() {
    if (!profileData || !profileData.aboutDescription) {
        console.warn('⚠️ Pas de description à charger');
        return;
    }

    try {
        console.log('📥 Chargement de la section À propos...');

        const aboutTextContainer = document.querySelector('.about-text');
        if (!aboutTextContainer) return;

        // Rendre le Rich Text
        let htmlContent = '';
        if (typeof profileData.aboutDescription === 'string') {
            htmlContent = profileData.aboutDescription;
        } else if (profileData.aboutDescription.nodeType === 'document') {
            htmlContent = window.contentfulService.renderRichTextWithIds(profileData.aboutDescription);
        }

        aboutTextContainer.innerHTML = htmlContent;

        // Mettre à jour le lien du CV
        if (profileData.cvLink) {
            const cvButton = document.querySelector('a[href*="drive.google.com"]');
            if (cvButton) {
                cvButton.href = profileData.cvLink;
            }
        }

        console.log('✅ Section À propos chargée');
    } catch (error) {
        console.error('❌ Erreur lors du chargement de la section À propos:', error);
    }
}

/**
 * Charge et affiche les compétences
 */
async function loadSkills() {
    try {
        console.log('📥 Chargement des compétences...');

        const data = await window.contentfulService.getSkills();

        if (!data || !data.items || data.items.length === 0) {
            console.warn('⚠️ Aucune compétence trouvée');
            return;
        }

        const skillsContainer = document.querySelector('.skills-section');
        if (!skillsContainer) return;

        // Trier par ordre
        const skills = data.items
            .map(item => item.fields)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Générer le HTML pour chaque compétence
        let skillsHTML = '<h3>Mes domaines</h3>';

        skills.forEach(skill => {
            skillsHTML += `
                <div class="skill-item">
                    <div class="skill-header">
                        <h6 class="skill-title">${skill.title}</h6>
                        <div class="skill-percentage">
                            <div class="count-box">
                                <span class="count-text" data-speed="2000" data-stop="${skill.percentage}">${skill.level}</span>
                            </div>
                        </div>
                    </div>
                    <div class="skill-bar">
                        <div class="bar-inner">
                            <div class="bar progress-line" data-width="${skill.percentage}"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        skillsContainer.innerHTML = skillsHTML;

        // Réinitialiser les animations des barres de progression
        setTimeout(() => {
            document.querySelectorAll('.progress-line').forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width + '%';
            });
        }, 100);

        console.log('✅ Compétences chargées');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des compétences:', error);
    }
}

/**
 * Charge et affiche les formations
 */
async function loadEducation() {
    try {
        console.log('📥 Chargement des formations...');

        const data = await window.contentfulService.getEducation();

        if (!data || !data.items || data.items.length === 0) {
            console.warn('⚠️ Aucune formation trouvée');
            return;
        }

        const educationContainer = document.querySelector('.education-carousel .row');
        if (!educationContainer) return;

        // Trier par ordre (plus récent en premier)
        const educations = data.items
            .map(item => ({ ...item.fields, id: item.sys.id }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Vider le conteneur
        educationContainer.innerHTML = '';

        // Générer les cartes d'éducation
        educations.forEach((edu, index) => {
            const logoUrl = edu.logo || 'img/placeholder1.jpg';
            const delay = (index % 2) * 300;

            const eduCard = `
                <div class="col-md-6" data-aos="fade-${index % 2 === 0 ? 'right' : 'left'}" data-aos-delay="${delay}">
                    <div class="education-item">
                        <div class="education-icon">
                            <img src="${logoUrl}" alt="${edu.institution}">
                        </div>
                        <div class="education-content">
                            <h3>${edu.institution}</h3>
                            <p class="period">${edu.startYear} - ${edu.endYear}</p>
                            <p class="degree">${edu.degree}</p>
                            ${edu.location ? `<p class="location">${edu.location}</p>` : ''}
                        </div>
                    </div>
                </div>
            `;

            educationContainer.insertAdjacentHTML('beforeend', eduCard);
        });

        console.log('✅ Formations chargées');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des formations:', error);
    }
}

/**
 * Charge et affiche les expériences professionnelles
 */
async function loadExperiences() {
    try {
        console.log('📥 Chargement des expériences...');

        const data = await window.contentfulService.getExperiences();

        if (!data || !data.items || data.items.length === 0) {
            console.warn('⚠️ Aucune expérience trouvée');
            return;
        }

        const timelineContainer = document.querySelector('.timeline');
        if (!timelineContainer) return;

        // Trier par ordre (plus récent en premier)
        const experiences = data.items
            .map(item => ({ ...item.fields, id: item.sys.id }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Vider le conteneur
        timelineContainer.innerHTML = '';

        // Générer les items de timeline
        experiences.forEach((exp, index) => {
            const side = index % 2 === 0 ? 'right' : 'left';
            const fadeDirection = index % 2 === 0 ? 'fade-left' : 'fade-right';
            const logoUrl = exp.logo || '';

            // Calculer la durée
            const startDate = new Date(exp.startDate);
            const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
            const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));

            // Formater les dates
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            };

            const dateString = exp.endDate
                ? `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`
                : `${formatDate(exp.startDate)} - Présent`;

            // Rendre la description (Rich Text ou String)
            let descriptionHTML = '';
            if (typeof exp.description === 'string') {
                descriptionHTML = exp.description;
            } else if (exp.description && exp.description.nodeType === 'document') {
                descriptionHTML = window.contentfulService.renderRichTextWithIds(exp.description);
            }

            const expCard = `
                <div class="timeline-item ${side}" data-aos="${fadeDirection}">
                    <div class="timeline-content">
                        <div class="date">${dateString} <span>(${months} mois)</span></div>
                        <div class="content-header">
                            <h3>${exp.company}</h3>
                            ${logoUrl ? `<div class="company-logo"><img src="${logoUrl}" alt="${exp.company}"></div>` : ''}
                        </div>
                        <h4>${exp.position}</h4>
                        ${exp.location ? `<p class="location">${exp.location}</p>` : ''}
                        ${descriptionHTML}
                    </div>
                </div>
            `;

            timelineContainer.insertAdjacentHTML('beforeend', expCard);
        });

        console.log('✅ Expériences chargées');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des expériences:', error);
    }
}

/**
 * Charge et affiche les passions
 */
async function loadPassions() {
    try {
        console.log('📥 Chargement des passions...');

        const data = await window.contentfulService.getPassions();

        if (!data || !data.items || data.items.length === 0) {
            console.warn('⚠️ Aucune passion trouvée');
            return;
        }

        const passionsContainer = document.querySelector('#passions .row');
        if (!passionsContainer) return;

        // Trier par ordre
        const passions = data.items
            .map(item => ({ ...item.fields, id: item.sys.id }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        // Vider le conteneur
        passionsContainer.innerHTML = '';

        // Générer les cartes de passion
        passions.forEach((passion, index) => {
            const imageUrl = passion.image || 'img/placeholder1.jpg';
            const delay = index * 100;

            const passionCard = `
                <div class="col-lg-6 col-md-6" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="passion-card">
                        <div class="passion-img">
                            <img src="${imageUrl}" alt="${passion.title}" class="img-fluid">
                        </div>
                        <div class="passion-content">
                            <h3>${passion.title}</h3>
                            <p class="passion-category">${passion.category}</p>
                            <p>${passion.description}</p>
                        </div>
                    </div>
                </div>
            `;

            passionsContainer.insertAdjacentHTML('beforeend', passionCard);
        });

        console.log('✅ Passions chargées');
    } catch (error) {
        console.error('❌ Erreur lors du chargement des passions:', error);
    }
}

// Initialiser le portfolio au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que contentfulService soit disponible
    if (window.contentfulService) {
        initializePortfolio();
    } else {
        console.warn('⚠️ ContentfulService non disponible, retry dans 500ms...');
        setTimeout(() => {
            if (window.contentfulService) {
                initializePortfolio();
            } else {
                console.error('❌ ContentfulService toujours non disponible');
            }
        }, 500);
    }
});
