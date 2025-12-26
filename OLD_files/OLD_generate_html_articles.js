import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
    // Vérification du CORS (si nécessaire)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        try {
            const articleId = req.query.article_id; // Récupère l'article ID dans les paramètres de la requête

            if (!articleId) {
                return res.status(400).json({ error: "L'ID de l'article est requis en tant que paramètre de requête." });
            }

            // Récupération de l'article
            const { data: articleData, error: articleError } = await supabase
                .from('articles')
                .select('*')
                .eq('id', articleId)
                .single();
    
            if (articleError) throw articleError;
            if (!articleData) return res.status(404).json({ error: "Article not found" });
    
            // Récupération des paragraphes associés
            const { data: paragraphsData } = await supabase
                .from('paragraphs')
                .select('*')
                .eq('article_id', articleId)
                .order('position');
    
            // Récupération des informations de l'auteur
            const { data: authorData } = await supabase
                .from('autheur')
                .select('*')
                .eq('id', articleData.author_fk)
                .single();
    
            // Récupération des articles associés
            const { data: relatedArticlesData } = await supabase
                .from('articles')
                .select('*')
                .neq('id', articleId) // Exclure l'article principal
                .limit(2); // Limite de 2 articles associés, ajustable selon vos besoins
    
            // Formatage de la date de mise à jour
            const updatedAt = new Date(articleData.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    
            // Génération du contenu HTML de l'article
            let articleContent = `
                <div class="article">
                    <h1 class='article-title'>${articleData.title}</h1>
                    <div class="article-meta">
                        <div class="author-info">
                            <img src="${authorData.author_image}" alt="Photo de l'auteur" class="author-photo">
                            <div class="author-details">
                                <p class='article-author'><strong>Par ${authorData.author}</strong></p>
                                <p class='publication-date'>· ${articleData.reading_time} min de lecture · ${updatedAt}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
    
            paragraphsData.forEach(paragraph => {
                // Ajout de l'image si elle est présente
                if (paragraph.image_url) {
                    articleContent += `
                    <figure class='article-figure'>
                        <img src="${paragraph.image_url}" alt="" class="article-image" loading="lazy">
                        <figcaption class='article-caption'>${paragraph.caption || ''}</figcaption>
                    </figure>`;
                }
                // Ajout de la source si elle est présente
                if (paragraph.source) {
                    articleContent += `<p class='article-source'><em><a href='${paragraph.source}'>${paragraph.source}</a></em></p>`;
                }
                // Ajout du titre de paragraphe
                if (paragraph.titre_paragraphe) {
                    articleContent += `<h2 class='paragraph-title'>${paragraph.titre_paragraphe}</h2>`;
                }
                // Ajout du contenu du paragraphe
                articleContent += `<p class='article-paragraph'>${paragraph.content}</p><br>`;
            });
    
                    // Génération des liens HTML pour les articles associés
            let relatedArticlesHtml = "";
            if (relatedArticlesData.length > 0) {
                relatedArticlesHtml = `<div class="fixed-related-articles"><h4>Vous pourriez aussi lire...</h4><ul>`;
                relatedArticlesData.forEach(relatedArticle => {
                    relatedArticlesHtml += `<li><a href='./${relatedArticle.id}.html' class='related-article'>${relatedArticle.title}</a></li>`;
                });
                relatedArticlesHtml += `</ul></div>`;
            }
                
            // Modèle HTML complet avec la structure Medium
           const htmlContent = `<!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="utf-8">
                    <meta content="width=device-width, initial-scale=1.0" name="viewport">
                    <meta content=""${articleData.title}}" name="keywords">
                    <meta content=""${articleData.meta_description}" name="description">
                
                    <!-- Favicon -->
                    <link rel="icon" href="../meta/favicon.ico" type="image/x-icon">
                
                    <!-- Google Font -->
                    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                
                    <!-- CSS Libraries -->
                    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet">
                    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css" rel="stylesheet">
                    <link href="../lib/animate/animate.min.css" rel="stylesheet">
                    <link href="../lib/owlcarousel/assets/owl.carousel.min.css" rel="stylesheet">
                    <link href="../lib/lightbox/css/lightbox.min.css" rel="stylesheet">
                
                    <!-- Template Stylesheet -->
                    <link href="../css/style.css" rel="stylesheet">
                </head>
                    
                    
                    <title>"${articleData.title}</title>
                </head>
                
                <body data-spy="scroll" data-target=".navbar" data-offset="51">
                    <!-- Nav Bar Start -->
                    <div class="navbar navbar-expand-lg bg-light navbar-light">
                        <div class="container-fluid">
                            <a href="../index.html" class="navbar-brand-article">Portfolio</a>
                            <button type="button" class="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                        </div>
                    </div>
                    <!-- Nav Bar End -->
                
                    <!-- Bulle de chat -->
                    <div class="chatbot-bubble" id="chatbotBubble">💬</div>
                
                    <!-- Fenêtre de chat -->
                    <div class="chat-popup" id="chatPopup">
                        <div class="chat-popup-header">Poses moi tes questions</div>
                        <div class="chat-popup-body" id="chatPopupBody">
                            <p>Ecris ton message ici</p>
                        </div>
                        <div class="chat-popup-footer">
                            <input type="text" id="userMessage" placeholder="Écrivez votre message...">
                            <button onclick="sendMessage()">Envoyer</button>
                        </div>
                    </div>
                    <!-- Bulle de chat End -->
                
                    <!-- Article Start -->
                    <div class="container article" id="article">
                        <div class="text-center wow zoomIn" data-wow-delay="0.1s">
                            ${articleContent}
                        </div>
                    </div>
                
                    ${relatedArticlesHtml}
                
                    <!-- Article End -->
                
                    <!-- Footer Start -->
                    <div class="contact" id="contact">
                        <div class="footer wow fadeIn" data-wow-delay="0.3s" id="isfooter">
                            <div class="container-fluid">
                                <div class="container">
                                    <div class="footer-info">
                                        <h2>Envoyez moi un message !</h2>
                                        <h3>Joris Salmon</h3>
                                        <div class="footer-menu">
                                            <p>+33 766840946</p>
                                            <p>Joris.salmon53290@gmail.com</p>
                                        </div>
                                        <h3>Toulon, France</h3>
                                        <div class="footer-social">
                                            <a href="https://github.com/Jorissalmon" target="_blank"><i class="fab fa-github"></i></a>
                                            <a href="https://www.linkedin.com/in/joris-salmon/" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                                        </div>
                                    </div>
                                </div>
                                <div class="container copyright">
                                    <p>&copy; <a href="#">Joris Salmon</a>, Tous droits réservés | Conçu par <a href="https://htmlcodex.com">HTML Codex</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Footer End -->
                
                    <!-- JavaScript Libraries -->
                    <script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js"></script>
                    <script src="../lib/easing/easing.min.js"></script>
                    <script src="../lib/wow/wow.min.js"></script>
                    <script src="../lib/waypoints/waypoints.min.js"></script>
                    <script src="../lib/typed/typed.min.js"></script>
                    <script src="../lib/owlcarousel/owl.carousel.min.js"></script>
                    <script src="../lib/isotope/isotope.pkgd.min.js"></script>
                    <script src="../lib/lightbox/js/lightbox.min.js"></script>
                
                    <!-- Contact Javascript File -->
                    <script src="../mail/jqBootstrapValidation.min.js"></script>
                    <script src="../mail/contact.js"></script>
                    <script src="../js/chatbot.js"></script>
                    <script src="../js/supabase.js"></script>
                
                    <!-- Template Javascript -->
                    <script src="../js/main.js"></script>
                </body>
                </html>`;  
    
            // Enregistrement du fichier HTML
            const filePath = path.join(process.cwd(), 'articles', `${articleId}.html`);
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }
            fs.writeFileSync(filePath, htmlContent, 'utf8');
    
            res.json({ message: "HTML generated successfully", file_path: filePath });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }};