import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// Données Profile Settings
const profileSettingsData = {
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
    aboutDescription: [
        "🎓 Consultant digital, je m'engage aux côtés des organisations pour les aider à exploiter tout le potentiel du numérique et de la donnée. Grâce à mes formations en transformation digitale à la Sorbonne Paris 1 et à mon Master en Data-Analytics, j'ai acquis une vision stratégique des enjeux métiers et des leviers d'action concrets pour accompagner le changement.",
        "🚀 Grâce à des expériences enrichissantes chez Micropole, ArianeGroup, le Crédit Agricole et Météo-France, j'ai appris à accompagner les équipes dans leurs problématiques, qu'elles relèvent de la stratégie data ou du pilotage digital.",
        "🤝 Ce qui me distingue ? Une capacité à écouter, à comprendre les besoins réels, et à construire des solutions sur mesure avec une approche à la fois rigoureuse, pédagogique et orientée impact. Mon objectif : créer de la valeur, simplifier la complexité, et faire du digital un vrai levier de performance."
    ],
    cvLink: 'https://drive.google.com/file/d/1l1Q60fNVPEX93Csqe5-r7imZV3Icr5Yu/view?usp=sharing',
    location: 'Aix-en-Provence, France',
    phone: '+33 766840946',
    email: 'joris.salmon53290@gmail.com'
};

async function recreateProfileSettings() {
    console.log('🚀 Recréation du Content Model et insertion des données...\n');

    if (!MANAGEMENT_TOKEN || !SPACE_ID) {
        console.error('❌ Variables d\'environnement manquantes');
        process.exit(1);
    }

    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // ÉTAPE 1: Créer le Content Model
        console.log('📐 Création du Content Model profileSettings...');

        const contentType = await environment.createContentType({
            sys: {
                id: 'profileSettings'
            },
            name: 'Profile Settings',
            displayField: 'title',
            fields: [
                {
                    id: 'title',
                    name: 'Title',
                    type: 'Symbol',
                    required: true
                },
                {
                    id: 'chatbotPrompt',
                    name: 'Chatbot Prompt',
                    type: 'Text',
                    required: true
                },
                {
                    id: 'aboutDescription',
                    name: 'About Description',
                    type: 'Array',
                    required: false,
                    items: {
                        type: 'Symbol'
                    }
                },
                {
                    id: 'cvLink',
                    name: 'CV Link',
                    type: 'Symbol',
                    required: true
                },
                {
                    id: 'location',
                    name: 'Location',
                    type: 'Symbol',
                    required: false
                },
                {
                    id: 'phone',
                    name: 'Phone',
                    type: 'Symbol',
                    required: false
                },
                {
                    id: 'email',
                    name: 'Email',
                    type: 'Symbol',
                    required: false
                }
            ]
        });

        // Publier le content type
        await contentType.publish();
        console.log('✅ Content Model créé et publié\n');

        // ÉTAPE 2: Insérer les données
        console.log('📝 Création de l\'entrée profileSettings...');

        const fields = {
            title: { 'en-US': profileSettingsData.title },
            chatbotPrompt: { 'en-US': profileSettingsData.chatbotPrompt },
            aboutDescription: { 'en-US': profileSettingsData.aboutDescription },
            cvLink: { 'en-US': profileSettingsData.cvLink },
            location: { 'en-US': profileSettingsData.location },
            phone: { 'en-US': profileSettingsData.phone },
            email: { 'en-US': profileSettingsData.email }
        };

        const entry = await environment.createEntry('profileSettings', { fields });
        const publishedEntry = await entry.publish();

        console.log('✅ Entrée créée et publiée avec succès!');
        console.log(`   ID de l'entrée: ${publishedEntry.sys.id}\n`);

        console.log('🎉 Tout est terminé avec succès!');
        console.log('🌐 Vérifiez sur https://app.contentful.com\n');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        if (error.details) {
            console.error('   Détails:', JSON.stringify(error.details, null, 2));
        }
        console.error('\nSi le Content Model existe déjà, supprimez-le d\'abord dans Contentful.');
        process.exit(1);
    }
}

recreateProfileSettings();
