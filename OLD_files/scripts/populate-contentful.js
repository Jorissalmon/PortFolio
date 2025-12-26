import dotenv from 'dotenv';
import contentful from 'contentful-management';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// Données à injecter
const portfolioData = {
    profileSettings: {
        title: 'Portfolio Joris Salmon 2025',
        chatbotPrompt: `Tu es mon assistant IA représentant mon expertise professionnelle. Réponds comme si tu étais moi lors d'interactions avec des recruteurs ou clients potentiels. Voici mon profil d'expert :

Je suis Joris Salmon, 23 ans, Expert Data Analytics & Consultant BI, formé dans les institutions d'élite françaises : DU Data Analytics à la Sorbonne Paris 1 (Top 5) et Master 2 Data Analytics & Stratégie de l'information à Toulon (Top 3).

🚀 EXPERTISE & RÉALISATIONS PROFESSIONNELLES

→ Micropole (Février 2025 - Présent) | Consultant Senior Business Intelligence
- Pilotage de projets Data Experience complets (architecture, modélisation, ETL, Cloud)
- Conduite de la transformation analytique pour la Région Île-de-France (migration Oracle BI → Power BI)
- Optimisation des tableaux de bord décisionnels générant +30% d'adoption utilisateur

→ ArianeGroup (Mars 2024 - Juillet 2024) | Ingénieur BI
- Optimisation du cycle de production d'Ariane 6 via solutions analytiques avancées
- Conception et implémentation d'un système de reporting critique sur IBM Cognos Analytics
- Environnement international avec documentation technique en anglais

→ Crédit Agricole La Réunion-Mayotte (Juin 2023 - Juillet 2023) | Data Manager
- Transformation complète de l'infrastructure analytique (Power Pivot → BDD structurée)
- Conception d'un nouveau modèle de données aligné sur les besoins métiers
- Déploiement d'une solution de reporting automatisée réduisant le temps de génération de 75%

→ Météo-France (Avril 2023 - Juin 2023) | Data Analyst
- Recherche appliquée: analyse d'impact du réchauffement climatique sur les précipitations bretonnes
- Développement de modèles statistiques avancés pour l'analyse de séries temporelles complexes
- Présentation des résultats aux décideurs et scientifiques

→ Les Sables d'Olonne Agglomération (Avril 2022 - Juin 2022) | Data Analyst
- Conseil stratégique pour l'implémentation d'une infrastructure data territoriale
- Conception d'une solution complète ETL/BDD/reporting pour les indicateurs territoriaux
- Développement d'outils de web scraping pour l'automatisation de la collecte de données

📊 EXPERTISE TECHNIQUE

- Data Engineering: Architectures SGBD complexes (MySQL, PostgreSQL, MongoDB), Cloud (AWS, Azure)
- Analytics & BI: ETL enterprise-grade (Talend), SQL avancé, modélisation statistique
- Data Visualization: Maîtrise des suites BI leaders (Power BI, Tableau, Cognos)
- Développement: Python, R, SQL, VBA, JavaScript, frameworks Streamlit/Flask, Web
- Intelligence Artificielle: Vision, NLP, ML/Deep Learning (PyTorch, TensorFlow), systèmes RAG

🔗 CONNECTONS-NOUS

- GitHub: https://github.com/Jorissalmon
- LinkedIn: https://www.linkedin.com/in/joris-salmon/
- Portfolio: https://jorissalmon.fr
- CV détaillé: https://drive.google.com/file/d/1NeNoU_QvoOKOkPdssN59cdVko7NGEH0M/view

📩 Contact direct: joris.salmon53290@gmail.com | 📱 0766840946`,
        jobTitles: ['Data Analyst', 'Data Scientist', 'Analytics Engineer'],
        aboutDescription: `<p>🎓 <strong>Consultant digital</strong>, je m'engage aux côtés des organisations pour les aider à exploiter tout le potentiel du numérique et de la donnée. Grâce à mes formations en transformation digitale à la <strong>Sorbonne Paris 1</strong> et à mon <strong>Master en Data-Analytics</strong>, j'ai acquis une vision stratégique des enjeux métiers et des leviers d'action concrets pour accompagner le changement.</p>
<p>🚀 Grâce à des expériences enrichissantes chez <strong>Micropole</strong>, <strong>ArianeGroup</strong>, <strong>le Crédit Agricole</strong> et <strong>Météo-France</strong>, j'ai appris à accompagner les équipes dans leurs problématiques, qu'elles relèvent de la <strong>stratégie data</strong> ou du <strong>pilotage digital</strong>.</p>
<p>🤝 Ce qui me distingue ? Une capacité à écouter, à comprendre les besoins réels, et à construire des solutions sur mesure avec une approche à la fois rigoureuse, pédagogique et orientée impact. Mon objectif : créer de la valeur, simplifier la complexité, et faire du digital un vrai levier de performance.</p>`,
        cvLink: 'https://drive.google.com/file/d/1l1Q60fNVPEX93Csqe5-r7imZV3Icr5Yu/view?usp=sharing',
        location: 'Aix-en-Provence, France',
        phone: '+33 766840946',
        email: 'joris.salmon53290@gmail.com'
    },

    skills: [
        { title: 'Data Science', level: 'Intermédiaire', percentage: 80, order: 1 },
        { title: 'Data Analyse', level: 'Avancé', percentage: 90, order: 2 },
        { title: 'Web Analyse / Stratégie', level: 'Avancé', percentage: 90, order: 3 }
    ],

    education: [
        {
            institution: 'Université Panthéon Sorbonne',
            degree: 'DU Data Analytics',
            startYear: 2024,
            endYear: 2025,
            location: 'Paris, France',
            logoPath: 'img/sorbonne-paris.png',
            order: 1
        },
        {
            institution: 'Université de Toulon',
            degree: 'Master Data Analytics',
            startYear: 2023,
            endYear: 2025,
            location: 'Toulon, France',
            logoPath: 'img/univ-tln.png',
            order: 2
        },
        {
            institution: 'Université de Rennes 1',
            degree: 'Licence 3 MIASHS',
            startYear: 2023,
            endYear: 2024,
            location: 'Rennes, France',
            logoPath: 'img/univ-rennes.jpg',
            order: 3
        },
        {
            institution: 'IUT de Vannes',
            degree: 'DUT Statistique et Informatique Décisionnelle (STID)',
            startYear: 2020,
            endYear: 2022,
            location: 'Vannes, France',
            logoPath: 'img/iut-vannes.jpg',
            order: 4
        }
    ],

    experience: [
        {
            company: 'Micropole',
            position: 'Consultant BI',
            startDate: '2025-02-01',
            endDate: '2025-06-30',
            location: 'Aix-en-Provence, France',
            description: `<ul>
<li>Missions pour différents clients au sein du service Data Expérience : <strong>Reporting, modélisation, ETL, Cloud</strong></li>
<li>Client Région Ile de France : migration de reporting de Oracle BI sur PowerBI</li>
</ul>`,
            logoPath: 'img/micropole.png',
            order: 1
        },
        {
            company: 'ArianeGroup',
            position: 'Ingénieur Business Intelligence',
            startDate: '2024-03-01',
            endDate: '2024-07-31',
            location: 'Bordeaux, France',
            description: `<ul>
<li>Au sein du service BI, j'ai défini les besoins avec les clients et rédigé des cahiers des charges techniques.</li>
<li>Exécution des cahiers des charges par la création de rapports sur Cognos Analytics.</li>
<li>L'ensemble des travaux et réunions ont été effectués en anglais.</li>
<li><strong>Objectif :</strong> Amélioration de la cadence de production de la fusée Ariane 6.</li>
</ul>`,
            logoPath: 'img/ariane-logo.png',
            order: 2
        },
        {
            company: 'Crédit Agricole La Réunion - Mayotte',
            position: 'Data Manager',
            startDate: '2023-06-01',
            endDate: '2023-07-31',
            location: 'Saint-Denis, Réunion',
            description: `<ul>
<li><strong>Objectif :</strong> Rendre les données plus accessibles pour créer de la valeur.</li>
<li>Construction et mise en œuvre d'un système automatisé avec ACCESS, permettant la redirection de données existantes sur des fichiers EXCEL dans une BDD interne MS-SQL.</li>
<li>Élaboration de solutions via VBA, Access, MS SQL, Python et JS.</li>
</ul>`,
            logoPath: 'img/credit-agricole-logo.jpg',
            order: 3
        },
        {
            company: 'Météo France',
            position: 'Data Analyst',
            startDate: '2023-04-01',
            endDate: '2023-06-30',
            location: 'Rennes, France',
            description: `<ul>
<li><strong>Sujet de recherche :</strong> Analyse de l'impact du réchauffement climatique sur les phénomènes de fortes précipitations en Bretagne.</li>
<li>Modélisation et tests sur des séries temporelles pour observer et analyser les impacts du réchauffement climatique sur la pluviométrie (analyses sur R).</li>
<li>Présentation du travail de recherche au niveau national.</li>
</ul>`,
            logoPath: 'img/meteo-france-logo.jpg',
            order: 4
        },
        {
            company: 'Les Sables d\'Olonne Agglomération',
            position: 'Data Analyst',
            startDate: '2022-04-01',
            endDate: '2022-06-30',
            location: 'Les Sables-d\'Olonne, France',
            description: `<ul>
<li>Conseils sur l'élaboration d'une solution data au sein de l'agglomération.</li>
<li>Création d'une solution automatisée avec VBA et Python pour la récolte et l'analyse de données pour le territoire.</li>
<li>Utilisation de Web Scraping et construction d'une BDD avec MS SQL.</li>
</ul>`,
            logoPath: 'img/sables-olonne-logo.jpg',
            order: 5
        }
    ],

    passion: [
        {
            title: 'S\'entraîner',
            category: 'Course à pied',
            description: 'Marathon, Trail, et peut-être un triathlon, qui sait ?😅',
            imagePath: 'img/crew.jpeg',
            order: 1
        },
        {
            title: 'S\'engager',
            category: 'Associatif',
            description: 'L\'AFEV, Fédération étudiante, évènements sociaux & solidaires',
            imagePath: 'img/bde.jpg',
            order: 2
        },
        {
            title: 'Se lancer des défis',
            category: 'Hackathons',
            description: 'Solution pour accélérer les opérations de sauvetage en mer pour la Marine Nationale avec NavalGroup',
            imagePath: 'img/hackathon_navalgroup.jpg',
            order: 3
        },
        {
            title: 'Sauter dans l\'inconnu',
            category: 'Création de start-up',
            description: 'Chef de projet - Lauréat Vannetais du prix Pépite 🏆',
            imagePath: 'img/pepite.jpg',
            order: 4
        }
    ]
};

/**
 * Upload un asset (image) vers Contentful
 */
async function uploadAsset(environment, filePath, title) {
    try {
        const fullPath = path.join(__dirname, '..', filePath);

        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️  Fichier non trouvé: ${filePath}`);
            return null;
        }

        const fileBuffer = fs.readFileSync(fullPath);
        const fileName = path.basename(filePath);
        const contentType = filePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

        // Créer l'upload
        const upload = await environment.createUpload({
            file: fileBuffer,
            fileName: fileName,
            contentType: contentType
        });

        // Créer l'asset
        const asset = await environment.createAsset({
            fields: {
                title: { 'en-US': title },
                file: {
                    'en-US': {
                        contentType: contentType,
                        fileName: fileName,
                        uploadFrom: {
                            sys: {
                                type: 'Link',
                                linkType: 'Upload',
                                id: upload.sys.id
                            }
                        }
                    }
                }
            }
        });

        // Traiter l'asset
        const processedAsset = await asset.processForAllLocales();

        // Publier l'asset
        const publishedAsset = await processedAsset.publish();

        console.log(`✅ Asset uploadé: ${fileName}`);
        return publishedAsset;
    } catch (error) {
        console.error(`❌ Erreur upload asset ${filePath}:`, error.message);
        return null;
    }
}

/**
 * Crée une entrée dans Contentful
 */
async function createEntry(environment, contentTypeId, fields, publish = true) {
    try {
        const entry = await environment.createEntry(contentTypeId, { fields });

        if (publish) {
            const publishedEntry = await entry.publish();
            console.log(`✅ Entrée publiée: ${contentTypeId}`);
            return publishedEntry;
        }

        console.log(`✅ Entrée créée: ${contentTypeId}`);
        return entry;
    } catch (error) {
        console.error(`❌ Erreur création entrée ${contentTypeId}:`, error.message);
        console.error(`   Champs envoyés:`, JSON.stringify(fields, null, 2));
        // Ne pas throw l'erreur, juste la logger et continuer
        return null;
    }
}

/**
 * Fonction principale
 */
async function populateContentful() {
    console.log('🚀 Début du peuplement de Contentful...\n');

    if (!MANAGEMENT_TOKEN) {
        console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN manquant dans .env');
        console.log('\n📝 Pour obtenir votre Management Token:');
        console.log('1. Allez sur https://app.contentful.com');
        console.log('2. Settings → API keys');
        console.log('3. Créez un "Personal Access Token"');
        console.log('4. Ajoutez CONTENTFUL_MANAGEMENT_TOKEN=votre_token dans .env\n');
        process.exit(1);
    }

    try {
        // Connexion à Contentful
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // 1. Skills
        console.log('📊 Création des Skills...');
        for (const skill of portfolioData.skills) {
            await createEntry(environment, 'skills', {
                title: { 'en-US': skill.title },
                level: { 'en-US': skill.level },
                percentage: { 'en-US': skill.percentage },
                order: { 'en-US': skill.order }
            });
        }

        // 2. Education (avec upload des logos)
        console.log('\n🎓 Création des Education...');
        for (const edu of portfolioData.education) {
            const logo = await uploadAsset(environment, edu.logoPath, `Logo ${edu.institution}`);

            const fields = {
                institution: { 'en-US': edu.institution },
                degree: { 'en-US': edu.degree },
                startYear: { 'en-US': edu.startYear },
                endYear: { 'en-US': edu.endYear },
                location: { 'en-US': edu.location },
                order: { 'en-US': edu.order }
            };

            if (logo) {
                fields.logo = {
                    'en-US': {
                        sys: {
                            type: 'Link',
                            linkType: 'Asset',
                            id: logo.sys.id
                        }
                    }
                };
            }

            await createEntry(environment, 'education', fields);
        }

        // 3. Experience (avec upload des logos)
        console.log('\n💼 Création des Experience...');
        for (const exp of portfolioData.experience) {
            const logo = await uploadAsset(environment, exp.logoPath, `Logo ${exp.company}`);

            const fields = {
                company: { 'en-US': exp.company },
                position: { 'en-US': exp.position },
                startDate: { 'en-US': exp.startDate },
                endDate: { 'en-US': exp.endDate },
                location: { 'en-US': exp.location },
                description: { 'en-US': exp.description },
                order: { 'en-US': exp.order }
            };

            if (logo) {
                fields.logo = {
                    'en-US': {
                        sys: {
                            type: 'Link',
                            linkType: 'Asset',
                            id: logo.sys.id
                        }
                    }
                };
            }

            await createEntry(environment, 'experience', fields);
        }

        // 4. Passion (avec upload des images)
        console.log('\n❤️  Création des Passion...');
        for (const pass of portfolioData.passion) {
            const image = await uploadAsset(environment, pass.imagePath, pass.title);

            const fields = {
                title: { 'en-US': pass.title },
                category: { 'en-US': pass.category },
                description: { 'en-US': pass.description },
                order: { 'en-US': pass.order }
            };

            if (image) {
                fields.image = {
                    'en-US': {
                        sys: {
                            type: 'Link',
                            linkType: 'Asset',
                            id: image.sys.id
                        }
                    }
                };
            }

            await createEntry(environment, 'passion', fields);
        }

        // 5. Profile Settings
        console.log('\n👤 Création du Profile Settings...');
        await createEntry(environment, 'profileSettings', {
            title: { 'en-US': portfolioData.profileSettings.title },
            chatbotPrompt: { 'en-US': portfolioData.profileSettings.chatbotPrompt },
            jobTitles: { 'en-US': portfolioData.profileSettings.jobTitles },
            aboutDescription: { 'en-US': portfolioData.profileSettings.aboutDescription },
            cvLink: { 'en-US': portfolioData.profileSettings.cvLink },
            location: { 'en-US': portfolioData.profileSettings.location },
            phone: { 'en-US': portfolioData.profileSettings.phone },
            email: { 'en-US': portfolioData.profileSettings.email }
        });

        console.log('\n✨ Peuplement terminé avec succès!');
        console.log('🌐 Allez voir vos données sur https://app.contentful.com\n');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter
populateContentful();
