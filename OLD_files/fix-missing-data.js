import dotenv from 'dotenv';
import contentful from 'contentful-management';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

// Fonction pour convertir HTML en Rich Text Contentful
function htmlToRichText(html) {
    // Pour simplifier, on va juste envoyer du texte brut sans le HTML
    // Contentful attend un format Rich Text complexe, pour l'instant on simplifie
    const text = html
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '')
        .replace(/<li>/g, '• ')
        .replace(/<\/li>/g, '\n')
        .replace(/<strong>/g, '')
        .replace(/<\/strong>/g, '')
        .replace(/\n\n/g, '\n')
        .trim();

    return text;
}

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

        const upload = await environment.createUpload({
            file: fileBuffer,
            fileName: fileName,
            contentType: contentType
        });

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

        const processedAsset = await asset.processForAllLocales();
        const publishedAsset = await processedAsset.publish();

        console.log(`✅ Asset uploadé: ${fileName}`);
        return publishedAsset;
    } catch (error) {
        console.error(`❌ Erreur upload asset ${filePath}:`, error.message);
        return null;
    }
}

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
        return null;
    }
}

async function addMissingData() {
    console.log('🔧 Ajout des données manquantes dans Contentful...\n');

    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // 1. Education (avec années en string)
        console.log('🎓 Ajout des Education manquantes...');

        const educationData = [
            {
                institution: 'Université Panthéon Sorbonne',
                degree: 'DU Data Analytics',
                startYear: '2024',  // Converti en string
                endYear: '2025',    // Converti en string
                location: 'Paris, France',
                logoPath: 'img/sorbonne-paris.png',
                order: 1
            },
            {
                institution: 'Université de Toulon',
                degree: 'Master Data Analytics',
                startYear: '2023',
                endYear: '2025',
                location: 'Toulon, France',
                logoPath: 'img/univ-tln.png',
                order: 2
            },
            {
                institution: 'Université de Rennes 1',
                degree: 'Licence 3 MIASHS',
                startYear: '2023',
                endYear: '2024',
                location: 'Rennes, France',
                logoPath: 'img/univ-rennes.jpg',
                order: 3
            },
            {
                institution: 'IUT de Vannes',
                degree: 'DUT Statistique et Informatique Décisionnelle (STID)',
                startYear: '2020',
                endYear: '2022',
                location: 'Vannes, France',
                logoPath: 'img/iut-vannes.jpg',
                order: 4
            }
        ];

        for (const edu of educationData) {
            const logo = await uploadAsset(environment, edu.logoPath, `Logo ${edu.institution}`);

            const fields = {
                institution: { 'en-US': edu.institution },
                degree: { 'en-US': edu.degree },
                startYear: { 'en-US': edu.startYear },  // Maintenant c'est une string
                endYear: { 'en-US': edu.endYear },      // Maintenant c'est une string
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

        // 2. Experience (avec description en texte simple)
        console.log('\n💼 Ajout des Experience manquantes...');

        const experienceData = [
            {
                company: 'Micropole',
                position: 'Consultant BI',
                startDate: '2025-02-01',
                endDate: '2025-06-30',
                location: 'Aix-en-Provence, France',
                description: `• Missions pour différents clients au sein du service Data Expérience : Reporting, modélisation, ETL, Cloud
• Client Région Ile de France : migration de reporting de Oracle BI sur PowerBI`,
                logoPath: 'img/micropole.png',
                order: 1
            },
            {
                company: 'ArianeGroup',
                position: 'Ingénieur Business Intelligence',
                startDate: '2024-03-01',
                endDate: '2024-07-31',
                location: 'Bordeaux, France',
                description: `• Au sein du service BI, j'ai défini les besoins avec les clients et rédigé des cahiers des charges techniques.
• Exécution des cahiers des charges par la création de rapports sur Cognos Analytics.
• L'ensemble des travaux et réunions ont été effectués en anglais.
• Objectif : Amélioration de la cadence de production de la fusée Ariane 6.`,
                logoPath: 'img/ariane-logo.png',
                order: 2
            },
            {
                company: 'Crédit Agricole La Réunion - Mayotte',
                position: 'Data Manager',
                startDate: '2023-06-01',
                endDate: '2023-07-31',
                location: 'Saint-Denis, Réunion',
                description: `• Objectif : Rendre les données plus accessibles pour créer de la valeur.
• Construction et mise en œuvre d'un système automatisé avec ACCESS, permettant la redirection de données existantes sur des fichiers EXCEL dans une BDD interne MS-SQL.
• Élaboration de solutions via VBA, Access, MS SQL, Python et JS.`,
                logoPath: 'img/credit-agricole-logo.jpg',
                order: 3
            },
            {
                company: 'Météo France',
                position: 'Data Analyst',
                startDate: '2023-04-01',
                endDate: '2023-06-30',
                location: 'Rennes, France',
                description: `• Sujet de recherche : Analyse de l'impact du réchauffement climatique sur les phénomènes de fortes précipitations en Bretagne.
• Modélisation et tests sur des séries temporelles pour observer et analyser les impacts du réchauffement climatique sur la pluviométrie (analyses sur R).
• Présentation du travail de recherche au niveau national.`,
                logoPath: 'img/meteo-france-logo.jpg',
                order: 4
            },
            {
                company: 'Les Sables d\'Olonne Agglomération',
                position: 'Data Analyst',
                startDate: '2022-04-01',
                endDate: '2022-06-30',
                location: 'Les Sables-d\'Olonne, France',
                description: `• Conseils sur l'élaboration d'une solution data au sein de l'agglomération.
• Création d'une solution automatisée avec VBA et Python pour la récolte et l'analyse de données pour le territoire.
• Utilisation de Web Scraping et construction d'une BDD avec MS SQL.`,
                logoPath: 'img/sables-olonne-logo.jpg',
                order: 5
            }
        ];

        for (const exp of experienceData) {
            const logo = await uploadAsset(environment, exp.logoPath, `Logo ${exp.company}`);

            const fields = {
                company: { 'en-US': exp.company },
                position: { 'en-US': exp.position },
                startDate: { 'en-US': exp.startDate },
                endDate: { 'en-US': exp.endDate },
                location: { 'en-US': exp.location },
                description: { 'en-US': exp.description },  // Texte simple au lieu de HTML
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

        // 3. Profile Settings (sans jobTitles pour l'instant)
        console.log('\n👤 Ajout du Profile Settings...');
        console.log('⚠️  Note: Le champ jobTitles sera à ajouter manuellement dans Contentful\n');

        console.log('\n✨ Données manquantes ajoutées avec succès!');
        console.log('🌐 Vérifiez vos données sur https://app.contentful.com\n');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

addMissingData();
