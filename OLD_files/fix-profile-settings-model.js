import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

async function deleteAndRecreateProfileSettings() {
    console.log('🔄 Suppression et recréation du Content Model profileSettings...\n');

    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // Étape 1: Supprimer l'ancien content type
        try {
            console.log('🗑️  Suppression de l\'ancien content type...');
            const oldContentType = await environment.getContentType('profileSettings');

            // Dépublier d'abord
            if (oldContentType.sys.publishedVersion) {
                await oldContentType.unpublish();
            }

            // Supprimer
            await oldContentType.delete();
            console.log('✅ Ancien content type supprimé\n');
        } catch (error) {
            console.log('ℹ️  Aucun ancien content type à supprimer\n');
        }

        // Étape 2: Créer le nouveau content type avec Text au lieu de Symbol
        console.log('📐 Création du nouveau content type...');

        const contentType = await environment.createContentTypeWithId('profileSettings', {
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
                        type: 'Text'  // CHANGÉ DE Symbol à Text pour accepter plus de 255 caractères
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

        console.log('Publication du content type...');
        await contentType.publish();

        console.log('\n✅ Content Model profileSettings recréé et publié avec succès!');
        console.log('\nChamps créés:');
        console.log('  - title (Short text, required)');
        console.log('  - chatbotPrompt (Long text, required)');
        console.log('  - aboutDescription (Long text list, optional) ← CORRIGÉ');
        console.log('  - cvLink (Short text, required)');
        console.log('  - location (Short text, optional)');
        console.log('  - phone (Short text, optional)');
        console.log('  - email (Short text, optional)');
        console.log('\n🌐 Vérifiez sur https://app.contentful.com\n');

    } catch (error) {
        console.error('\n❌ Erreur:', error.message);
        if (error.details) {
            console.error('Détails:', JSON.stringify(error.details, null, 2));
        }
        process.exit(1);
    }
}

deleteAndRecreateProfileSettings();
