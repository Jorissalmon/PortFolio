import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

async function inspectProfileSettings() {
    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);

        const contentType = await environment.getContentType('profileSettings');

        console.log('📋 Content Type: profileSettings\n');
        console.log('Champs disponibles:\n');

        contentType.fields.forEach((field, index) => {
            console.log(`${index + 1}. ID: "${field.id}"`);
            console.log(`   Nom: "${field.name}"`);
            console.log(`   Type: ${field.type}`);
            if (field.items) {
                console.log(`   Items Type: ${field.items.type}`);
            }
            console.log(`   Required: ${field.required || false}`);
            console.log(`   Localized: ${field.localized || false}\n`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

inspectProfileSettings();
