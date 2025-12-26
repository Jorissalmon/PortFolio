import dotenv from 'dotenv';
import contentful from 'contentful-management';

dotenv.config();

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT_ID = process.env.CONTENTFUL_ENVIRONMENT || 'master';

async function listContentTypes() {
    try {
        const client = contentful.createClient({
            accessToken: MANAGEMENT_TOKEN
        });

        const space = await client.getSpace(SPACE_ID);
        const environment = await space.getEnvironment(ENVIRONMENT_ID);

        console.log(`✅ Connecté à l'espace: ${space.name}\n`);
        console.log('📋 Content Types disponibles:\n');

        const contentTypes = await environment.getContentTypes();

        contentTypes.items.forEach((ct, index) => {
            console.log(`${index + 1}. ID: "${ct.sys.id}" - Nom: "${ct.name}"`);
            console.log(`   Champs: ${ct.fields.map(f => f.id).join(', ')}\n`);
        });

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

listContentTypes();
