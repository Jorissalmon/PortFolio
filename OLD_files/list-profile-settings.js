import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

async function listProfileSettings() {
    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        // Lister toutes les entrées profileSettings
        const entries = await environment.getEntries({
            content_type: 'profileSettings'
        });

        console.log(`📋 Nombre d'entrées profileSettings trouvées: ${entries.total}\n`);

        if (entries.total > 0) {
            entries.items.forEach((entry, index) => {
                console.log(`${index + 1}. ID: ${entry.sys.id}`);
                console.log(`   Status: ${entry.sys.publishedVersion ? 'Publié' : 'Brouillon'}`);
                console.log(`   Title: ${entry.fields.title?.['en-US'] || 'N/A'}`);
                console.log(`   Created: ${entry.sys.createdAt}`);
                console.log('');
            });
        } else {
            console.log('Aucune entrée trouvée.');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

listProfileSettings();
