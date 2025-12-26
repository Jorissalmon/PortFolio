import dotenv from 'dotenv';
import contentful from 'contentful-management';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

/**
 * Crée ou met à jour un Content Model
 */
async function createContentModel(environment, contentTypeId, name, fields) {
    try {
        // Vérifier si le content type existe déjà
        let contentType;
        try {
            contentType = await environment.getContentType(contentTypeId);
            console.log(`⚠️  Content Type "${name}" existe déjà, mise à jour...`);

            // Mettre à jour les champs
            contentType.fields = fields;
            contentType = await contentType.update();

        } catch (error) {
            if (error.status === 404) {
                // Créer le nouveau content type
                contentType = await environment.createContentTypeWithId(contentTypeId, {
                    name: name,
                    fields: fields,
                    displayField: fields[0].id // Premier champ comme displayField
                });
                console.log(`✅ Content Type "${name}" créé`);
            } else {
                throw error;
            }
        }

        // Publier le content type
        await contentType.publish();
        console.log(`✅ Content Type "${name}" publié\n`);

    } catch (error) {
        console.error(`❌ Erreur avec "${name}":`, error.message);
        throw error;
    }
}

/**
 * Crée tous les Content Models nécessaires
 */
async function createAllContentModels() {
    console.log('🚀 Création des Content Models dans Contentful...\n');

    if (!MANAGEMENT_TOKEN) {
        console.error('❌ CONTENTFUL_MANAGEMENT_TOKEN manquant dans .env');
        process.exit(1);
    }

    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // 1. Profile Settings
        await createContentModel(environment, 'profileSettings', 'Profile Settings', [
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
                required: false
            },
            {
                id: 'jobTitles',
                name: 'Job Titles',
                type: 'Array',
                required: false,
                items: {
                    type: 'Symbol'
                }
            },
            {
                id: 'aboutDescription',
                name: 'About Description',
                type: 'Text',
                required: false
            },
            {
                id: 'cvLink',
                name: 'CV Link',
                type: 'Symbol',
                required: false
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
        ]);

        // 2. Skill
        await createContentModel(environment, 'skill', 'Skill', [
            {
                id: 'title',
                name: 'Title',
                type: 'Symbol',
                required: true
            },
            {
                id: 'level',
                name: 'Level',
                type: 'Symbol',
                required: false
            },
            {
                id: 'percentage',
                name: 'Percentage',
                type: 'Integer',
                required: false
            },
            {
                id: 'order',
                name: 'Order',
                type: 'Integer',
                required: false
            }
        ]);

        // 3. Education
        await createContentModel(environment, 'education', 'Education', [
            {
                id: 'institution',
                name: 'Institution',
                type: 'Symbol',
                required: true
            },
            {
                id: 'degree',
                name: 'Degree',
                type: 'Symbol',
                required: false
            },
            {
                id: 'startYear',
                name: 'Start Year',
                type: 'Integer',
                required: false
            },
            {
                id: 'endYear',
                name: 'End Year',
                type: 'Integer',
                required: false
            },
            {
                id: 'location',
                name: 'Location',
                type: 'Symbol',
                required: false
            },
            {
                id: 'logo',
                name: 'Logo',
                type: 'Link',
                required: false,
                linkType: 'Asset'
            },
            {
                id: 'order',
                name: 'Order',
                type: 'Integer',
                required: false
            }
        ]);

        // 4. Experience
        await createContentModel(environment, 'experience', 'Experience', [
            {
                id: 'company',
                name: 'Company',
                type: 'Symbol',
                required: true
            },
            {
                id: 'position',
                name: 'Position',
                type: 'Symbol',
                required: false
            },
            {
                id: 'startDate',
                name: 'Start Date',
                type: 'Date',
                required: false
            },
            {
                id: 'endDate',
                name: 'End Date',
                type: 'Date',
                required: false
            },
            {
                id: 'location',
                name: 'Location',
                type: 'Symbol',
                required: false
            },
            {
                id: 'description',
                name: 'Description',
                type: 'Text',
                required: false
            },
            {
                id: 'logo',
                name: 'Logo',
                type: 'Link',
                required: false,
                linkType: 'Asset'
            },
            {
                id: 'order',
                name: 'Order',
                type: 'Integer',
                required: false
            }
        ]);

        // 5. Passion
        await createContentModel(environment, 'passion', 'Passion', [
            {
                id: 'title',
                name: 'Title',
                type: 'Symbol',
                required: true
            },
            {
                id: 'category',
                name: 'Category',
                type: 'Symbol',
                required: false
            },
            {
                id: 'description',
                name: 'Description',
                type: 'Text',
                required: false
            },
            {
                id: 'image',
                name: 'Image',
                type: 'Link',
                required: false,
                linkType: 'Asset'
            },
            {
                id: 'order',
                name: 'Order',
                type: 'Integer',
                required: false
            }
        ]);

        console.log('✨ Tous les Content Models ont été créés avec succès!');
        console.log('🌐 Vous pouvez maintenant exécuter: npm run populate-contentful\n');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        process.exit(1);
    }
}

// Exécuter
createAllContentModels();
