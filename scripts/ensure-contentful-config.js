import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

async function ensureSchema() {
    console.log('🔍 Vérification du schéma Contentful...');

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

        console.log(`✅ Connecté à l'espace: ${space.name} (${ENVIRONMENT_ID})`);

        // 1. Check/Update profileSettings
        console.log('📝 Vérification du type de contenu: profileSettings...');
        let profileSettings;
        try {
            profileSettings = await environment.getContentType('profileSettings');
            console.log('✅ Type de contenu "profileSettings" déjà présent.');
        } catch (e) {
            console.log('➕ Création du type de contenu "profileSettings"...');
            profileSettings = await environment.createContentTypeWithId('profileSettings', {
                name: 'Profile Settings',
                displayField: 'title',
                fields: []
            });
        }

        const requiredFields = [
            { id: 'title', name: 'Titre de configuration', type: 'Symbol', required: true },
            { id: 'name', name: 'Nom complet', type: 'Symbol' },
            { id: 'greeting', name: 'Salutation (Hero)', type: 'Symbol' },
            { id: 'jobTitles', name: 'Titres de poste', type: 'Array', items: { type: 'Symbol' } },
            { id: 'aboutDescription', name: 'Description À propos', type: 'Text' },
            { id: 'shortBio', name: 'Bio courte (Fallback)', type: 'Text' },
            { id: 'profilePicture', name: 'Photo de profil', type: 'Link', linkType: 'Asset' },
            { id: 'cv', name: 'CV (Fichier)', type: 'Link', linkType: 'Asset' },
            { id: 'cvLink', name: 'Lien CV (URL)', type: 'Symbol' },
            { id: 'email', name: 'Email', type: 'Symbol' },
            { id: 'phone', name: 'Téléphone', type: 'Symbol' },
            { id: 'location', name: 'Localisation', type: 'Symbol' },
            { id: 'chatbotPrompt', name: 'Prompt Chatbot IA', type: 'Text' }
        ];

        let updated = false;
        for (const field of requiredFields) {
            const existingField = profileSettings.fields.find(f => f.id === field.id);
            if (!existingField) {
                console.log(`   ➕ Ajout du champ: ${field.id} (${field.name})`);
                profileSettings.fields.push(field);
                updated = true;
            }
        }

        if (updated) {
            profileSettings = await profileSettings.update();
            console.log('🚀 Schéma mis à jour.');
            await profileSettings.publish();
            console.log('✅ Schéma publié.');
        } else {
            console.log('✨ Schéma déjà complet.');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification du schéma:', error.message);
        process.exit(1);
    }
}

ensureSchema();
