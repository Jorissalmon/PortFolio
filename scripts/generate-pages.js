import dotenv from 'dotenv';
import contentful from 'contentful';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS } from '@contentful/rich-text-types';

dotenv.config();

const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
});

const ARTICLE_TEMPLATE_PATH = path.resolve('article.html');
const PROJECT_TEMPLATE_PATH = path.resolve('project.html');

/**
 * Configure rich text renderer to handle images
 */
const renderOptions = {
    renderNode: {
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
            const fields = node.data.target.fields;
            if (!fields || !fields.file) return '';
            const url = fields.file.url.startsWith('//') ? `https:${fields.file.url}` : fields.file.url;
            return `<img src="${url}" alt="${fields.title || 'Image'}" class="content-image img-fluid my-4">`;
        }
    }
};

/**
 * Generate a URL-friendly slug from a title
 */
function slugify(text) {
    return text.toString().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[''\u2018\u2019]/g, '-') // apostrophes → hyphens (L'IA → l-ia)
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') // trim leading/trailing hyphens
        .slice(0, 80);
}

function generateUniqueSlug(title, existingSlugs) {
    let slug = slugify(title) || 'page';
    let unique = slug;
    let n = 1;
    while (existingSlugs.has(unique)) { unique = `${slug}-${n++}`; }
    existingSlugs.add(unique);
    return unique;
}

/**
 * Inject canonical, JSON-LD and geo tags into a document head
 */
function injectSEOMeta(doc, { canonicalUrl, jsonLdData }) {
    // Canonical
    let canonical = doc.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = doc.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        doc.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // JSON-LD
    if (jsonLdData) {
        const s = doc.createElement('script');
        s.setAttribute('type', 'application/ld+json');
        s.textContent = JSON.stringify(jsonLdData, null, 2);
        doc.head.appendChild(s);
    }

    // Geo (Aix-en-Provence)
    [['geo.region','FR-PAC'],['geo.placename','Aix-en-Provence'],
     ['geo.position','43.529742;5.447427'],['ICBM','43.529742, 5.447427']]
    .forEach(([name, content]) => {
        let el = doc.querySelector(`meta[name="${name}"]`);
        if (!el) { el = doc.createElement('meta'); el.setAttribute('name', name); doc.head.appendChild(el); }
        el.setAttribute('content', content);
    });
}

/**
 * Replace generic anchor text ("ici", "here") with descriptive text
 */
function improveAnchorText(html) {
    return html.replace(/<a([^>]*)>\s*(ici|here|lien|link)\s*<\/a>/gi, (m, attrs) => {
        const href = (attrs.match(/href="([^"]+)"/) || [])[1] || '';
        if (href.includes('github')) return `<a${attrs}>Voir le code source sur GitHub</a>`;
        if (href.includes('drive.google') && href.toLowerCase().includes('pdf')) return `<a${attrs}>Télécharger le rapport du projet</a>`;
        if (href.includes('drive.google')) return `<a${attrs}>Voir la présentation du projet</a>`;
        if (href.includes('youtube') || href.includes('youtu.be')) return `<a${attrs}>Voir la démonstration vidéo</a>`;
        return `<a${attrs}>Voir la ressource</a>`;
    });
}

/**
 * Update all relative links in the HTML to point one level up
 * and remove dynamic loading scripts to prevent errors.
 */
function updateRelativePaths(dom) {
    const document = dom.window.document;

    // Remove dynamic loading scripts (since content is now static)
    const scriptsToRemove = [
        'js/article.js',
        'js/project.js',
        'js/portfolio-loader.js',
        'js/portfolio.js',
        'js/blog.js'
    ];

    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (scriptsToRemove.some(s => src.includes(s))) {
            script.remove();
        }
    });

    // Update href (links, css)
    document.querySelectorAll('[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('//') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            el.setAttribute('href', '../' + href);
        }
    });

    // Update src (scripts, images)
    document.querySelectorAll('[src]').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('//')) {
            el.setAttribute('src', '../' + src);
        }
    });

    // Handle background images in style attributes if any
    document.querySelectorAll('[style*="background-image"]').forEach(el => {
        let style = el.getAttribute('style');
        if (style.includes('url(') && !style.includes('http') && !style.includes('data:')) {
            el.setAttribute('style', style.replace(/url\(['"]?(.*?)['"]?\)/g, (match, p1) => {
                return `url('../${p1}')`;
            }));
        }
    });

    // Add defer to non-async scripts (Core Web Vitals improvement)
    document.querySelectorAll('script[src]:not([async])').forEach(script => {
        script.setAttribute('defer', '');
    });
}

async function generatePages() {
    console.log('🚀 Démarrage de la génération statique...');

    // Ensure directories exist
    if (!fs.existsSync('articles')) fs.mkdirSync('articles');
    if (!fs.existsSync('projets')) fs.mkdirSync('projets');

    // Read templates
    const articleTemplate = fs.readFileSync(ARTICLE_TEMPLATE_PATH, 'utf8');
    const projectTemplate = fs.readFileSync(PROJECT_TEMPLATE_PATH, 'utf8');

    // Fetch All Data at once
    console.log('📡 Récupération de toutes les données Contentful...');
    const blogEntries = await client.getEntries({ content_type: 'blogPortfolio', include: 10 });
    const projectEntries = await client.getEntries({ content_type: 'projectPortfolio', include: 10 });
    const educationEntries = await client.getEntries({ content_type: 'education', order: 'fields.order', include: 10 });
    const experienceEntries = await client.getEntries({ content_type: 'experience', order: 'fields.order', include: 10 });
    const skillEntries = await client.getEntries({ content_type: 'skills', order: 'fields.order' });
    const passionEntries = await client.getEntries({ content_type: 'passion', order: 'fields.order' });
    const profileEntries = await client.getEntries({ content_type: 'profileSettings', include: 10 });

    // Build slug maps (id → slug) for all entries
    const articleSlugMap = new Map();
    const articleSlugsUsed = new Set();
    blogEntries.items.forEach(e => {
        const t = e.fields.Titre || e.fields.title || e.sys.id;
        articleSlugMap.set(e.sys.id, generateUniqueSlug(t, articleSlugsUsed));
    });

    const projectSlugMap = new Map();
    const projectSlugsUsed = new Set();
    projectEntries.items.forEach(e => {
        // Strip "Mon projet de/d'" before slugifying
        const rawTitle = e.fields.title || e.sys.id;
        const t = rawTitle.replace(/^mon projet (d[e']\s*)?/i, '');
        projectSlugMap.set(e.sys.id, generateUniqueSlug(t, projectSlugsUsed));
    });

    // 1. Generate Blog Articles
    console.log('📰 Génération des articles individuels...');
    for (const entry of blogEntries.items) {
        const { Titre, contenu, dateDePublication, rsum } = entry.fields;
        const id = entry.sys.id;
        const articleSlug = articleSlugMap.get(id);
        console.log(`- Article: ${Titre} → ${articleSlug}.html`);

        const dom = new JSDOM(articleTemplate);
        const doc = dom.window.document;

        const titleText = `${Titre} | Joris Salmon`;
        doc.querySelector('title').textContent = titleText;
        doc.querySelector('meta[name="description"]')?.setAttribute('content', rsum || `Article: ${Titre}`);

        // SEO: canonical + JSON-LD + geo
        injectSEOMeta(doc, {
            canonicalUrl: `https://www.jorissalmon.com/articles/${articleSlug}.html`,
            jsonLdData: {
                '@context': 'https://schema.org',
                '@type': 'Article',
                'headline': Titre,
                'description': rsum || `Article: ${Titre}`,
                'datePublished': new Date(dateDePublication).toISOString(),
                'url': `https://www.jorissalmon.com/articles/${articleSlug}.html`,
                'author': { '@type': 'Person', 'name': 'Joris Salmon', 'url': 'https://www.jorissalmon.com' },
                'publisher': { '@type': 'Person', 'name': 'Joris Salmon' }
            }
        });

        // Open Graph / Twitter
        const setMeta = (query, val, nameAttr = 'property') => {
            let el = doc.querySelector(query);
            if (!el) { el = doc.createElement('meta'); const n = query.match(/"([^"]+)"/)[1]; el.setAttribute(nameAttr, n); doc.head.appendChild(el); }
            el.setAttribute('content', val);
        };
        setMeta('meta[property="og:title"]', titleText, 'property');
        setMeta('meta[name="twitter:title"]', titleText, 'name');
        setMeta('meta[property="og:description"]', rsum || `Article de blog: ${Titre}`, 'property');
        setMeta('meta[name="twitter:description"]', rsum || `Article de blog: ${Titre}`, 'name');
        setMeta('meta[property="og:url"]', `https://www.jorissalmon.com/articles/${articleSlug}.html`, 'property');
        const mainImg = entry.fields.imagePrincipale || entry.fields.image;
        if (mainImg?.fields?.file?.url) {
            const imgUrl = mainImg.fields.file.url.startsWith('//') ? `https:${mainImg.fields.file.url}` : mainImg.fields.file.url;
            setMeta('meta[property="og:image"]', imgUrl, 'property');
            setMeta('meta[name="twitter:image"]', imgUrl, 'name');
        }

        doc.querySelector('.article-header h1').textContent = Titre;
        doc.querySelector('.article-meta .date').innerHTML = `<i class="fas fa-calendar-alt me-2"></i>${new Date(dateDePublication).toLocaleDateString('fr-FR')}`;

        // Social sharing
        const articleFullUrl = `https://www.jorissalmon.com/articles/${articleSlug}.html`;
        const encodedUrl = encodeURIComponent(articleFullUrl);
        const encodedTitle = encodeURIComponent(Titre);
        const twShare = doc.querySelector('.share-twitter');
        if (twShare) { twShare.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`; twShare.target = '_blank'; }
        const fbShare = doc.querySelector('.share-facebook');
        if (fbShare) { fbShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`; fbShare.target = '_blank'; }
        const liShare = doc.querySelector('.share-linkedin');
        if (liShare) { liShare.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`; liShare.target = '_blank'; }

        const contentArea = doc.querySelector('.article-content .content');
        if (contenu) {
            contentArea.innerHTML = improveAnchorText(documentToHtmlString(contenu, renderOptions));
        }

        // Related articles
        const otherArticles = blogEntries.items.filter(a => a.sys.id !== id);
        const randomArticles = otherArticles.sort(() => 0.5 - Math.random()).slice(0, 2);
        const recoHtml = randomArticles.map(a => {
            const aTitle = a.fields.Titre || a.fields.title || 'Sans titre';
            const img = a.fields.imagePrincipale || a.fields.image || a.fields.photo;
            const imgUrl = img?.fields?.file?.url ? (img.fields.file.url.startsWith('//') ? `https:${img.fields.file.url}` : img.fields.file.url) : `https://via.placeholder.com/600x400/1a1a2e/ef233c?text=${encodeURIComponent(aTitle)}`;
            const relSlug = articleSlugMap.get(a.sys.id);
            return `<div class="col-md-6 mb-4"><div class="blog-card" style="height:100%;"><div class="blog-img"><img src="${imgUrl}" class="img-fluid" alt="${aTitle}" onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400/1a1a2e/ef233c?text=Article'"></div><div class="blog-content"><h3>${aTitle}</h3><a href="${relSlug}.html" class="read-more">Lire l'article</a></div></div></div>`;
        }).join('');

        updateRelativePaths(dom);
        let finalHtml = dom.serialize();
        finalHtml = finalHtml.replace('[[RECOMMENDATIONS]]', recoHtml);
        fs.writeFileSync(path.join('articles', `${articleSlug}.html`), finalHtml);
    }

    // 2. Generate Portfolio Projects
    console.log('💼 Génération des projets individuels...');
    for (const entry of projectEntries.items) {
        const { title, description, detailedDescription, category, date, tools, client: clientName, url, image, galleryImages, videoUrl } = entry.fields;
        const id = entry.sys.id;
        const projectSlug = projectSlugMap.get(id);
        console.log(`- Projet: ${title} → ${projectSlug}.html`);

        const dom = new JSDOM(projectTemplate);
        const doc = dom.window.document;

        // Clean title for HTML <title>: remove "Mon projet de/d'" prefix
        const cleanTitle = title.replace(/^mon projet (d[e']\s*)?/i, '');
        const htmlTitle = `${cleanTitle} | Joris Salmon`;
        const elTitle = doc.querySelector('title');
        if (elTitle) elTitle.textContent = htmlTitle;

        doc.querySelector('meta[name="description"]')?.setAttribute('content', description || `Projet: ${title}`);

        // SEO: canonical + Schema.org JSON-LD + geo tags
        const toolsList = Array.isArray(tools) ? tools : (tools ? [tools] : []);
        injectSEOMeta(doc, {
            canonicalUrl: `https://www.jorissalmon.com/projets/${projectSlug}.html`,
            jsonLdData: {
                '@context': 'https://schema.org',
                '@type': 'SoftwareSourceCode',
                'name': title,
                'description': description || `Projet data: ${title}`,
                'url': `https://www.jorissalmon.com/projets/${projectSlug}.html`,
                'author': { '@type': 'Person', 'name': 'Joris Salmon', 'url': 'https://www.jorissalmon.com' },
                ...(toolsList.length ? { 'programmingLanguage': toolsList.join(', ') } : {}),
                ...(date ? { 'dateCreated': new Date(date).toISOString().split('T')[0] } : {}),
                ...(url ? { 'codeRepository': url } : {})
            }
        });

        // Open Graph / Twitter
        const setMeta = (query, val, nameAttr = 'property') => {
            let el = doc.querySelector(query);
            if (!el) { el = doc.createElement('meta'); const n = query.match(/"([^"]+)"/)[1]; el.setAttribute(nameAttr, n); doc.head.appendChild(el); }
            el.setAttribute('content', val);
        };
        setMeta('meta[property="og:title"]', htmlTitle, 'property');
        setMeta('meta[name="twitter:title"]', htmlTitle, 'name');
        setMeta('meta[property="og:description"]', description || `Découvrez ce projet de Joris Salmon.`, 'property');
        setMeta('meta[name="twitter:description"]', description || `Découvrez ce projet de Joris Salmon.`, 'name');
        setMeta('meta[property="og:url"]', `https://www.jorissalmon.com/projets/${projectSlug}.html`, 'property');
        if (image?.fields?.file?.url) {
            const imgUrl = image.fields.file.url.startsWith('//') ? `https:${image.fields.file.url}` : image.fields.file.url;
            setMeta('meta[property="og:image"]', imgUrl, 'property');
            setMeta('meta[name="twitter:image"]', imgUrl, 'name');
        }
        const elProjTitle = doc.querySelector('#projectTitle');
        if (elProjTitle) elProjTitle.textContent = title;

        const elShortDesc = doc.querySelector('#projectShortDescription');
        if (elShortDesc) elShortDesc.textContent = description || 'Découvrez les détails de ce projet.';

        const elCatBadge = doc.querySelector('#projectCategoryBadge');
        if (elCatBadge) elCatBadge.textContent = category || 'Portfolio';

        const elDate = doc.querySelector('#projectDate');
        if (elDate) elDate.textContent = date ? new Date(date).toLocaleDateString('fr-FR') : '--';

        // Handle tools (could be string or array)
        let toolsText = '--';
        if (Array.isArray(tools)) {
            toolsText = tools.join(', ');
        } else if (tools) {
            toolsText = tools;
        }
        const elTech = doc.querySelector('#projectTechnologies');
        if (elTech) elTech.textContent = toolsText;

        const elClient = doc.querySelector('#projectClient');
        if (elClient) elClient.textContent = clientName || 'Personnel';

        const externalLink = doc.querySelector('#projectExternalLink');
        if (url && externalLink) {
            externalLink.setAttribute('href', url);
        } else if (externalLink) {
            externalLink.remove();
        }

        // Update Detailed Description (with improved anchor text)
        const summaryArea = doc.querySelector('#projectSummary');
        if (detailedDescription) {
            summaryArea.innerHTML = improveAnchorText(documentToHtmlString(detailedDescription, renderOptions));
        }

        // Update Gallery
        const galleryContainer = doc.querySelector('#projectGallery');
        if (galleryImages && Array.isArray(galleryImages) && galleryContainer) {
            galleryContainer.innerHTML = galleryImages.map(img => {
                if (!img.fields || !img.fields.file) return '';
                const imgUrl = img.fields.file.url.startsWith('//') ? `https:${img.fields.file.url}` : img.fields.file.url;
                return `
                    <div class="col-md-4 gallery-item">
                        <img src="${imgUrl}" alt="${img.fields.title || 'Illustration'}" class="img-fluid">
                    </div>
                `;
            }).join('');
        } else if (galleryContainer) {
            doc.querySelector('#gallery-tab').parentElement.remove();
            doc.querySelector('#gallery-pane').remove();
        }

        // Update Video
        const videoContainer = doc.querySelector('#projectVideo');
        const videoTabItem = doc.querySelector('#videoTabItem');
        if (videoUrl && videoContainer && videoTabItem) {
            videoTabItem.style.display = 'block';
            // Simple embed for YouTube/Vimeo if detected
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                const videoId = videoUrl.includes('v=') ? videoUrl.split('v=')[1].split('&')[0] : videoUrl.split('/').pop();
                videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                videoContainer.innerHTML = `<video src="${videoUrl}" controls class="w-100"></video>`;
            }
        } else if (videoContainer) {
            doc.querySelector('#video-tab')?.parentElement.remove();
            doc.querySelector('#video-pane')?.remove();
        }

        // Remouver la section entière si aucun media n'est présent
        const mediaSection = doc.querySelector('#mediaSection');
        if ((!galleryImages || !galleryImages.length) && !videoUrl && mediaSection) {
            mediaSection.remove();
        }

        // Update background image (Hero)
        if (image && image.fields && image.fields.file) {
            const imageUrl = image.fields.file.url.startsWith('//') ? `https:${image.fields.file.url}` : image.fields.file.url;
            const hero = doc.querySelector('#projectHeroSection');
            if (hero) {
                // Keep it light but present
                hero.style.backgroundImage = `linear-gradient(rgba(10, 10, 26, 0.8), rgba(10, 10, 26, 0.9)), url('${imageUrl}')`;
                hero.style.backgroundSize = 'cover';
                hero.style.backgroundPosition = 'center';
            }
        }

        // Related projects
        const otherProjects = projectEntries.items.filter(p => p.sys.id !== id);
        const randomProjects = otherProjects.sort(() => 0.5 - Math.random()).slice(0, 2);
        const recoHtml = randomProjects.map(p => {
            const pTitle = p.fields.title || 'Projet Portfolio';
            const cat = p.fields.category || 'PROJET';
            const imageUrl = p.fields.image?.fields?.file?.url
                ? (p.fields.image.fields.file.url.startsWith('//') ? `https:${p.fields.image.fields.file.url}` : p.fields.image.fields.file.url)
                : `https://via.placeholder.com/600x400/1a1a2e/ef233c?text=${encodeURIComponent(pTitle)}`;
            const relSlug = projectSlugMap.get(p.sys.id);
            // Alt text: remove "Mon projet de" prefix
            const cleanAlt = pTitle.replace(/^mon projet (d[e']\s*)?/i, '');
            return `<div class="col-md-6 mb-4"><div class="blog-card" style="height:100%;"><div class="blog-img"><img src="${imageUrl}" class="img-fluid" alt="${cleanAlt}" onerror="this.onerror=null;this.src='https://via.placeholder.com/600x400/1a1a2e/ef233c?text=Projet'"></div><div class="blog-content"><span class="portfolio-category" style="color:var(--accent-cyan);font-size:.8rem;text-transform:uppercase">${cat}</span><h3 class="mt-2">${pTitle}</h3><a href="${relSlug}.html" class="read-more mt-3">Voir ce projet</a></div></div></div>`;
        }).join('');

        updateRelativePaths(dom);
        let finalHtml = dom.serialize();
        finalHtml = finalHtml.replace('[[RECOMMENDATIONS]]', recoHtml);
        fs.writeFileSync(path.join('projets', `${projectSlug}.html`), finalHtml);
    }

    // 3. Generate Homepage (index.html)
    console.log('🏠 Génération de la page d\'accueil...');
    let indexTemplate = fs.readFileSync(path.resolve('index.template.html'), 'utf8');

    // Gathering PortFolio Categories (from homepage portfolio content type)
    const portfolioCategories = new Set();
    projectEntries.items.forEach(p => {
        let cat = p.fields.category || p.fields.Categorie || p.fields.categorie;
        if (cat) {
            if (Array.isArray(cat)) cat = cat[0];
            else if (typeof cat === 'object' && cat[0]) cat = cat[0];
            if (typeof cat === 'object' && cat.fields) cat = cat.fields.title || cat.fields.name || cat.fields.slug;
            if (typeof cat === 'string') portfolioCategories.add(cat);
        }
    });

    const portfolioFiltersHtml = '<li class="filter-active" data-filter="*">Tous</li>' + 
        Array.from(portfolioCategories).map(cat => {
            const label = String(cat).replace('filter-', '').replace(/-/g, ' ').toUpperCase();
            return `<li data-filter=".${cat}">${label}</li>`;
        }).join('');

    // Gathering Blog Categories
    const blogCategories = new Set();
    blogEntries.items.forEach(b => {
        let cat = b.fields.categorie || b.fields.category || b.fields.Categorie;
        if (cat) {
            if (Array.isArray(cat)) cat = cat[0];
            else if (typeof cat === 'object' && cat[0]) cat = cat[0];
            if (typeof cat === 'object' && cat.fields) cat = cat.fields.title || cat.fields.name || cat.fields.slug;
            if (typeof cat === 'string') blogCategories.add(cat);
        }
    });
    const blogFiltersHtml = '<li class="filter-active" data-filter="*">Tous</li>' + 
        Array.from(blogCategories).map(cat => {
            const label = String(cat).replace('filter-', '').replace(/-/g, ' ').toUpperCase();
            return `<li data-filter=".${cat}">${label}</li>`;
        }).join('');

    // Gathering Education Categories (Slicer)
    const educationCategories = new Set();
    educationEntries.items.forEach(edu => {
        const degree = edu.fields.degree || "";
        const inst = edu.fields.institution || "";
        let cat = "formations";
        if (degree.match(/master|licence|bac|doctorat|diplôme|graduate/i)) {
            cat = "diplomes";
        } else if (inst.match(/udemy|coursera|openclassrooms|edx|certification/i) || degree.match(/certification|certificat/i)) {
            cat = "certifications";
        }
        edu.fields._categoryClass = cat; // Temporary field for class injection
        educationCategories.add(cat);
    });

    // We will do all replacements in one go later

    // Fetch profile settings
    fs.writeFileSync('profile_debug_full.json', JSON.stringify(profileEntries.items.map(i => ({ id: i.sys.id, fields: Object.keys(i.fields) })), null, 2));

    // Merge all profile entries (if multiple exist) to get all fields (some have bio, some have picture)
    let profile = {};
    profileEntries.items.forEach(item => {
        profile = { ...profile, ...item.fields };
    });

    console.log('MERGED PROFILE FIELDS:', Object.keys(profile));
    const profilePic = profile.profilePicture || profile.profilePictureHero || profile.profilePictureAbout || profile.photo || profile.image;
    console.log('Profile Pic Object found:', profilePic ? 'Yes' : 'No');
    if (profilePic) console.log('Profile Pic Fields:', Object.keys(profilePic.fields || {}));

    // Remove redundant fetches since we moved them to the top

    // Global placeholder replacements
    const name = profile.name || 'Joris Salmon';
    const profilePicUrl = profilePic?.fields?.file?.url ? (profilePic.fields.file.url.startsWith('//') ? `https:${profilePic.fields.file.url}` : profilePic.fields.file.url) : 'img/contact.jpg';

    // CV URL
    const cv = profile.cv || profile.cvLink;
    let cvUrl = '#';
    if (typeof cv === 'string') {
        cvUrl = cv;
    } else if (cv?.fields?.file?.url) {
        cvUrl = cv.fields.file.url.startsWith('//') ? `https:${cv.fields.file.url}` : cv.fields.file.url;
    }

    let aboutHtml = '';
    const bio = profile.aboutDescription || profile.shortBio || '';
    if (bio) {
        if (typeof bio === 'string') {
            aboutHtml = bio.includes('<p>') ? bio : bio.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
        } else {
            aboutHtml = documentToHtmlString(bio, renderOptions);
        }
    }

    console.log(`- Portfolio Filters: ${portfolioCategories.size}`);
    console.log(`- Blog Filters: ${blogCategories.size}`);

    indexTemplate = indexTemplate
        .split('[[HERO_NAME]]').join(name)
        .split('[[HERO_GREETING]]').join(profile.greeting || 'Bonjour, je suis')
        .split('[[ABOUT_DESCRIPTION]]').join(aboutHtml)
        .split('[[HERO_IMAGE_URL]]').join(profilePicUrl)
        .split('[[ABOUT_IMAGE_URL]]').join(profilePicUrl)
        .split('[[CV_URL]]').join(cvUrl)
        .split('[[PORTFOLIO_FILTERS]]').join(portfolioFiltersHtml)
        .split('[[BLOG_FILTERS]]').join(blogFiltersHtml)
        .split('[[TYPED_STRINGS]]').join(skillEntries.items.map(s => s.fields.title).join(','));

    const indexDom = new JSDOM(indexTemplate);
    const indexDoc = indexDom.window.document;

    // Meta & Title
    indexDoc.querySelector('title').textContent = `${name} | Data Analyst & Consultant BI`;



    // 4. Projects (Homepage) — uses projectEntries (content type: projectPortfolio)
    const projectsContainer = indexDoc.querySelector('#projectsContainer');
    if (projectsContainer) {
        projectsContainer.classList.add('modern-scroll-container');
        projectsContainer.innerHTML = projectEntries.items.map((project, index) => {
            const { title, description, category, image } = project.fields;
            const imageUrl = image?.fields?.file?.url ? (image.fields.file.url.startsWith('//') ? `https:${image.fields.file.url}` : image.fields.file.url) : 'img/portfolio/placeholder1.jpg';
            const delay = (index % 3) * 100;
            const categoryClass = Array.isArray(category) ? category.join(' ') : (category || 'filter-data');
            const categoryLabel = (typeof categoryClass === 'string') ? categoryClass.replace('filter-', '').replace(/-/g, ' ').toUpperCase() : 'PROJET';
            const itemId = project.sys.id;

            return `
                <div class="modern-scroll-item portfolio-item ${categoryClass}" data-aos="zoom-in" data-aos-delay="${delay}">
                    <div class="blog-card">
                        <div class="blog-img">
                            <img src="${imageUrl}" class="img-fluid" alt="${title}" onerror="this.onerror=null; this.src='img/portfolio/placeholder1.jpg'">
                        </div>
                        <div class="blog-content">
                            <span class="portfolio-category" style="color: var(--accent-cyan); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${categoryLabel}</span>
                            <h3 class="mt-2">${title}</h3>
                            <p>${description || 'Aucune description disponible.'}</p>
                            <a href="projets/${projectSlugMap.get(itemId)}.html" class="read-more">Voir le projet</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 5. Blog (Homepage) — uses blogEntries (content type: blogPortfolio)
    const blogContainer = indexDoc.querySelector('#blogjorisContainer');
    if (blogContainer) {
        blogContainer.classList.add('modern-scroll-container');
        blogContainer.innerHTML = blogEntries.items.map((article, index) => {
            const f = article.fields;
            const Titre = f.Titre || f.title || "Sans titre";
            const rsum = f.rsum || f.summary || f.description || "";
            const dateDePublication = f.dateDePublication || f.date || new Date();
            const img = f.imagePrincipale || f.image || f.photo;
            const imageUrl = img?.fields?.file?.url ? (img.fields.file.url.startsWith('//') ? `https:${img.fields.file.url}` : img.fields.file.url) : 'img/blog/placeholder1.jpg';
            const cat = f.categorie || f.category || f.Categorie || 'filter-data';
            const auteur = f.auteur || f.auteurProp || f.author || 'Joris Salmon';
            
            const delay = (index % 3) * 100;
            const id = article.sys.id;
            const dateStr = new Date(dateDePublication).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            return `
                <div class="modern-scroll-item blog-item ${cat}" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="blog-card">
                        <div class="blog-img">
                            <img src="${imageUrl}" class="img-fluid" alt="${Titre}" onerror="this.onerror=null; this.src='img/blog/placeholder1.jpg'">
                        </div>
                        <div class="blog-content">
                            <h3>${Titre}</h3>
                            <p class="author">${auteur} | ${dateStr}</p>
                            <p>${rsum}</p>
                            <a href="articles/${articleSlugMap.get(id)}.html" class="read-more">Lire plus</a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 6. Education
    const educationContainer = indexDoc.querySelector('#educationContainer');
    if (educationContainer) {
        educationContainer.classList.add('modern-scroll-container');
        educationContainer.innerHTML = educationEntries.items.map((edu, index) => {
            const { institution, degree, startYear, endYear, location, logo, _categoryClass } = edu.fields;
            const period = `${startYear || ''} - ${endYear || 'Présent'}`;
            const logoUrl = logo?.fields?.file?.url ? (logo.fields.file.url.startsWith('//') ? `https:${logo.fields.file.url}` : logo.fields.file.url) : 'img/default-edu.png';
            const aosType = index % 2 === 0 ? 'fade-right' : 'fade-left';
            return `
                <div class="modern-scroll-item-2 education-item-wrap ${_categoryClass}" data-aos="${aosType}" data-aos-delay="${index * 100}">
                    <div class="education-item">
                        <div class="education-icon">
                            <img src="${logoUrl}" alt="${institution}">
                        </div>
                        <div class="education-content">
                            <h3>${institution}</h3>
                            <p class="period">${period}</p>
                            <p class="degree">${degree}</p>
                            <p class="location">${location}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Experience
    const experienceTimeline = indexDoc.querySelector('#experienceTimeline');
    if (experienceTimeline) {
        experienceTimeline.innerHTML = experienceEntries.items.map((exp, index) => {
            const { company, position, startDate, endDate, description, logo, location } = exp.fields;
            const logoUrl = logo?.fields?.file?.url ? (logo.fields.file.url.startsWith('//') ? `https:${logo.fields.file.url}` : logo.fields.file.url) : 'img/default-job.png';
            const sideClass = index % 2 === 0 ? 'right' : 'left';
            const aosType = index % 2 === 0 ? 'fade-left' : 'fade-right';

            // Calcul précis de la durée en années et mois
            const start = new Date(startDate);
            const end = endDate ? new Date(endDate) : new Date();
            let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            if (totalMonths < 0) totalMonths = 0;
            
            const years = Math.floor(totalMonths / 12);
            const remainingMonths = totalMonths % 12;
            
            let duration = "";
            if (years > 0) {
                duration += `${years} an${years > 1 ? 's' : ''}`;
                if (remainingMonths > 0) duration += ` et ${remainingMonths} mois`;
            } else {
                duration = `${remainingMonths} mois`;
            }

            const formatOptions = { month: 'long', year: 'numeric' };
            const startDateStr = start.toLocaleDateString('fr-FR', formatOptions);
            const endDateStr = endDate ? end.toLocaleDateString('fr-FR', formatOptions) : 'Présent';

            return `
                <div class="timeline-item ${sideClass}" data-aos="${aosType}">
                    <div class="timeline-content">
                        <div class="date">${startDateStr} - ${endDateStr} <span>(${duration})</span></div>
                        <div class="content-header">
                            <h3>${company}</h3>
                            <div class="company-logo">
                                <img src="${logoUrl}" alt="${company}">
                            </div>
                        </div>
                        <h4>${position}</h4>
                        <p class="location">${location}</p>
                        ${description ? documentToHtmlString(description, renderOptions) : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Passions
    const passionsContainer = indexDoc.querySelector('#passionsContainer');
    if (passionsContainer) {
        passionsContainer.innerHTML = passionEntries.items.map((passion, index) => {
            const { title, category, description, image } = passion.fields;
            const imageUrl = image?.fields?.file?.url ? (image.fields.file.url.startsWith('//') ? `https:${image.fields.file.url}` : image.fields.file.url) : 'img/placeholder1.jpg';
            const delay = (index + 1) * 100;
            return `
                <div class="col-lg-6 col-md-6 mb-4" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="passion-card">
                        <div class="passion-img">
                            <img src="${imageUrl}" alt="${title}" class="img-fluid">
                        </div>
                        <div class="passion-content">
                            <h3>${title}</h3>
                            <p class="passion-category">${category}</p>
                            <p>${description}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Final clean up and save
    fs.writeFileSync(path.resolve('index.html'), indexDom.serialize());

    console.log('✨ Génération terminée avec succès !');
}

generatePages().catch(err => {
    console.error('❌ Erreur lors de la génération:', err);
    process.exit(1);
});
