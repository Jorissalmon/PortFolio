/**
 * generate-sitemap.js
 * 
 * Ce script génère automatiquement le sitemap.xml en récupérant
 * tous les contenus depuis Contentful (articles de blog et projets)
 */

import dotenv from 'dotenv';
import contentful from 'contentful';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Pour obtenir __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configuration
const SITE_URL = process.env.SITE_URL || 'https://www.jorissalmon.com';
const OUTPUT_FILE = path.join(__dirname, '..', 'sitemap.xml');

// Client Contentful
const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
    environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
});

/**
 * Formate une date au format YYYY-MM-DD
 */
function formatDate(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * Génère le sitemap XML
 */
async function generateSitemap() {
    console.log('🚀 Génération du sitemap...\n');

    try {
        // Récupérer les articles de blog
        console.log('📰 Récupération des articles de blog...');
        const blogEntries = await client.getEntries({
            content_type: 'blogPortfolio',
            order: '-sys.createdAt'
        });
        console.log(`✅ ${blogEntries.items.length} articles trouvés\n`);

        // Récupérer les projets
        console.log('💼 Récupération des projets...');
        const projectEntries = await client.getEntries({
            content_type: 'projectPortfolio',
            order: '-sys.createdAt'
        });
        console.log(`✅ ${projectEntries.items.length} projets trouvés\n`);

        // Construire le XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
        xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
        xml += '    \n';

        // Page d'accueil
        xml += '    <!-- Page d\'accueil -->\n';
        xml += '    <url>\n';
        xml += `        <loc>${SITE_URL}/</loc>\n`;
        xml += `        <lastmod>${formatDate(new Date())}</lastmod>\n`;
        xml += '        <changefreq>weekly</changefreq>\n';
        xml += '        <priority>1.0</priority>\n';
        xml += '    </url>\n';
        xml += '    \n';

        // Sections principales
        xml += '    <!-- Sections principales (avec ancres) -->\n';
        const sections = [
            { anchor: 'about', priority: '0.9', changefreq: 'monthly' },
            { anchor: 'portfolio', priority: '0.9', changefreq: 'weekly' },
            { anchor: 'blog', priority: '0.9', changefreq: 'weekly' },
            { anchor: 'education', priority: '0.8', changefreq: 'monthly' },
            { anchor: 'experience', priority: '0.8', changefreq: 'monthly' },
            { anchor: 'contact', priority: '0.7', changefreq: 'yearly' }
        ];

        sections.forEach(section => {
            xml += '    <url>\n';
            xml += `        <loc>${SITE_URL}/#${section.anchor}</loc>\n`;
            xml += `        <lastmod>${formatDate(new Date())}</lastmod>\n`;
            xml += `        <changefreq>${section.changefreq}</changefreq>\n`;
            xml += `        <priority>${section.priority}</priority>\n`;
            xml += '    </url>\n';
            xml += '    \n';
        });

        // Articles de blog
        if (blogEntries.items.length > 0) {
            xml += '    <!-- Articles de blog -->\n';
            blogEntries.items.forEach(entry => {
                const id = entry.sys.id;
                const updatedAt = entry.sys.updatedAt;

                xml += '    <url>\n';
                xml += `        <loc>${SITE_URL}/articles/${id}.html</loc>\n`;
                xml += `        <lastmod>${formatDate(updatedAt)}</lastmod>\n`;
                xml += '        <changefreq>monthly</changefreq>\n';
                xml += '        <priority>0.8</priority>\n';
                xml += '    </url>\n';
                xml += '\n';
            });
        }

        // Projets
        if (projectEntries.items.length > 0) {
            xml += '    <!-- Projets portfolio -->\n';
            projectEntries.items.forEach(entry => {
                const id = entry.sys.id;
                const updatedAt = entry.sys.updatedAt;

                xml += '    <url>\n';
                xml += `        <loc>${SITE_URL}/projets/${id}.html</loc>\n`;
                xml += `        <lastmod>${formatDate(updatedAt)}</lastmod>\n`;
                xml += '        <changefreq>monthly</changefreq>\n';
                xml += '        <priority>0.8</priority>\n';
                xml += '    </url>\n';
                xml += '\n';
            });
        }

        xml += '</urlset>\n';

        // Écrire le fichier
        fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

        console.log('✨ Sitemap généré avec succès!\n');
        console.log(`📍 Fichier: ${OUTPUT_FILE}`);
        console.log(`📊 Statistiques:`);
        console.log(`   - 1 page d'accueil`);
        console.log(`   - ${sections.length} sections principales`);
        console.log(`   - ${blogEntries.items.length} articles de blog`);
        console.log(`   - ${projectEntries.items.length} projets`);
        console.log(`   - Total: ${1 + sections.length + blogEntries.items.length + projectEntries.items.length} URLs\n`);
        console.log('🚀 Vous pouvez maintenant soumettre le sitemap à Google Search Console!');

    } catch (error) {
        console.error('❌ Erreur lors de la génération du sitemap:', error.message);

        if (error.message.includes('401')) {
            console.error('\n⚠️  Erreur d\'authentification Contentful.');
            console.error('Vérifiez vos clés dans le fichier .env:');
            console.error('  - CONTENTFUL_SPACE_ID');
            console.error('  - CONTENTFUL_ACCESS_TOKEN');
            console.error('  - CONTENTFUL_ENVIRONMENT');
        }

        process.exit(1);
    }
}

// Exécuter
generateSitemap();
