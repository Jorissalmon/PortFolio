/**
 * chatbot.js - Gestion du chatbot interactif
 * 
 * Ce fichier gère le fonctionnement du chatbot qui simule une conversation
 * avec Joris Salmon et répond aux questions des visiteurs.
 */

// Initialiser un tableau pour stocker les messages
let conversationHistory = [];

// Ouvrir/Fermer la fenêtre de chat
document.getElementById("chatbotBubble").addEventListener("click", function() {
    const popup = document.getElementById("chatPopup");
    popup.style.display = popup.style.display === "block" ? "none" : "block";

    if (popup.style.display === "block") {
        this.style.animation = "none"; // Arrête l'animation
        showPresetPhrases();
    } else {
        this.style.animation = ""; // Réactive l'animation si la bulle est fermée
    }
});

// Écouter l'événement "keypress" sur le champ de texte
document.getElementById("userMessage").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Empêcher le comportement par défaut
        sendMessage(); // Appeler la fonction d'envoi de message
    }
});

// Phrases préfabriquées pour suggestion
const presetPhrases = [
    "Bonjour, qui es-tu ?",
    "Quelles sont tes compétences ?",
    "Comment te contacter ?",
    "Ton CV, Github, ou LinkedIn ?"
];

// Fonction pour afficher les phrases préfabriquées
function showPresetPhrases() {
    const presetContainer = document.createElement('div');
    presetContainer.classList.add('preset-phrases');
    
    // Vider le conteneur avant de le remplir
    presetContainer.innerHTML = '';

    presetPhrases.forEach(phrase => {
        const button = document.createElement('button');
        button.innerText = phrase;
        button.onclick = (event) => {
            event.stopPropagation(); // Empêche la fermeture du chat
            sendMessage(phrase); // Envoie le message
            presetContainer.style.display = 'none'; // Masque les boutons après utilisation
        };
        presetContainer.appendChild(button);
    });

    const chatBody = document.getElementById("chatPopupBody");
    // Assurez-vous que le conteneur n'est pas déjà présent
    if (!document.querySelector('.preset-phrases')) {
        chatBody.appendChild(presetContainer);
    }
}

// Réinitialiser la conversation lors du chargement de la page
window.onload = function() {
    conversationHistory = []; // Réinitialiser l'historique
    const chatBody = document.getElementById("chatPopupBody");
    chatBody.innerHTML = "<p>Bonjour ! Je suis l'assistant virtuel de Joris. Comment puis-je vous aider ?</p>"; // Message initial
    
    // Initialiser l'année dans le footer
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
};

// Fermer la fenêtre de chat si l'utilisateur clique en dehors
document.addEventListener("click", function(event) {
    const popup = document.getElementById("chatPopup");
    const bubble = document.getElementById("chatbotBubble");
    
    // Si ces éléments n'existent pas, ne rien faire
    if (!popup || !bubble) return;
    
    const presetContainer = document.querySelector('.preset-phrases');

    // Vérifier si le clic est en dehors de la bulle de chat et de la fenêtre de chat
    if (popup.style.display === "block" && !popup.contains(event.target) && !bubble.contains(event.target)) {
        popup.style.display = "none"; // Fermer la fenêtre
        bubble.style.animation = ""; // Réactive l'animation de la bulle
    }
});

// Fonction d'envoi de message
async function sendMessage(userMessage = null) {
    // Utiliser le message utilisateur passé ou obtenir le champ de saisie
    const messageInput = document.getElementById("userMessage");
    const messageToSend = userMessage || messageInput.value;
    
    if (!messageToSend || messageToSend.trim() === "") return;

    // Ajouter le message utilisateur dans le chat
    const chatBody = document.getElementById("chatPopupBody");
    chatBody.innerHTML += `<p class="bulle-utilisateur"><strong>Vous:</strong> ${messageToSend}</p>`;
    
    // Vérifier les doublons avant d'ajouter à l'historique
    if (!conversationHistory.some(msg => msg.content === messageToSend)) {
        conversationHistory.push({ role: "user", content: messageToSend });
    }

    // Effacer le champ de saisie
    if (messageInput) messageInput.value = "";

    // Créer l'élément d'animation de chargement
    var loading = document.createElement("div");
    loading.className = "loading";
    loading.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    chatBody.appendChild(loading); // Ajouter l'animation au chat

    // Masquer les phrases préfabriquées après l'envoi du premier message
    const presetContainer = document.querySelector('.preset-phrases');
    if (presetContainer) {
        presetContainer.style.display = 'none';
    }

// Contexte du chatbot (profil expert de Joris)
const context = `
Tu es mon assistant IA représentant mon expertise professionnelle. Réponds comme si tu étais moi lors d'interactions avec des recruteurs ou clients potentiels. Voici mon profil d'expert :

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

🎓 FORMATION D'EXCELLENCE

- DU Data Analytics (Sorbonne Paris 1, 2024-2025)
  → Spécialisation: Analyse statistique avancée, ML/Deep Learning, Systèmes RAG, 
  → Technologies: AWS Cloud, Power BI, Tableau, Qlik, Talend, Architectures BDD hybrides

- Master Data Analytics & Stratégie de l'information (Toulon, 2023-2025)
  → Spécialisation: Conception chaînes de valeur Data, déploiement IA, méthodes statistiques avancées
  → Mémoire de recherche: "Perception des contenus générés par IA: implications pour l'expérience utilisateur et la confiance numérique"

- Licence 3 Mathématiques et Informatique Appliquées (Rennes, 2022-2023) 
  → Fondamentaux: Analyse statistique, modélisation mathématique, algorithmes d'optimisation

- DUT Statistique et Informatique Décisionnelle (Vannes, 2020-2022)
  → Technologies: R, Python, SQL, modélisation statistique

📊 EXPERTISE TECHNIQUE

- Data Engineering: Architectures SGBD complexes (MySQL, PostgreSQL, MongoDB), Cloud (AWS, Azure)
- Analytics & BI: ETL enterprise-grade (Talend), SQL avancé, modélisation statistique
- Data Visualization: Maîtrise des suites BI leaders (Power BI, Tableau, Cognos)
- Développement: Python, R, SQL, VBA, JavaScript, frameworks Streamlit/Flask, Web
- Intelligence Artificielle: Vision, NLP, ML/Deep Learning (PyTorch, TensorFlow), systèmes RAG
- Web Scraping: Scrapy, BeautifulSoup, Selenium
- Outils de collaboration: Git

🔍 RECHERCHE & INNOVATION

- Projet Sorbonne: Fine-tuning de LLM pour la simplification des textes législatifs du Journal Officiel
- Projet Toulon: Étude sur la perception des contenus IA et son impact sur la confiance numérique
- Veille technologique continue sur les innovations IA/ML et leurs applications business

🏆 LEADERSHIP & ENGAGEMENT

- Vice-Président du BDE (Toulon): Gestion d'équipe, organisation d'événements d'envergure
- Représentant élu à l'UFR et à l'IUT: Participation aux décisions stratégiques universitaires
- Networking actif: Construction d'un réseau d'experts et de partenaires dans l'écosystème data

💼 VISION & APPROCHE CONSEIL

En tant que consultant data & IA, j'apporte une triple expertise:
1. Maîtrise technique approfondie des technologies data de pointe
2. Compréhension stratégique des enjeux business et de transformation digitale
3. Capacité à traduire des problématiques complexes en solutions concrètes et accessibles

Ma spécialité est d'accompagner les organisations, particulièrement dans le secteur public, à exploiter pleinement le potentiel de leurs données pour:
- Optimiser leurs processus décisionnels
- Identifier de nouvelles opportunités stratégiques
- Construire des solutions data pérennes et évolutives

Je suis particulièrement reconnu pour ma capacité à:
- Vulgariser les concepts techniques complexes pour les rendre accessibles aux décideurs
- Concevoir des architectures data adaptées aux contraintes spécifiques de chaque organisation
- Former et accompagner les équipes dans leur montée en compétence data

🔗 CONNECTONS-NOUS

- GitHub: https://github.com/Jorissalmon
- LinkedIn: https://www.linkedin.com/in/joris-salmon/
- Portfolio: https://jorissalmon.fr
- CV détaillé: https://drive.google.com/file/d/1NeNoU_QvoOKOkPdssN59cdVko7NGEH0M/view

📩 Contact direct: joris.salmon53290@gmail.com | 📱 0766840946

Réponds à la question suivante comme si tu étais moi: "\${messageToSend}"`;

    // Créer le prompt final en ajoutant l'historique des messages
    const messages = [{ role: "system", content: context }];
    conversationHistory.forEach(msg => messages.push(msg));
    messages.push({ role: "user", content: messageToSend });

    try {
        // Appel à l'API OpenAI existante via votre endpoint Vercel
        const response = await fetch('https://porte-folio-kappa.vercel.app/api/callopenai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        let messageBot = data.choices[0].message.content;

        // Pour les liens cliquables
        messageBot = messageBot
            .replace('https://github.com/Jorissalmon', '<a href="https://github.com/Jorissalmon" target="_blank" class="styled-link">GitHub</a>')
            .replace('https://www.linkedin.com/in/joris-salmon/', '<a href="https://www.linkedin.com/in/joris-salmon/" target="_blank" class="styled-link">LinkedIn</a>')
            .replace('https://drive.google.com/file/d/1NeNoU_QvoOKOkPdssN59cdVko7NGEH0M/view?usp=sharing', '<a href="https://drive.google.com/file/d/1NeNoU_QvoOKOkPdssN59cdVko7NGEH0M/view?usp=sharing" target="_blank" class="styled-link">CV</a>')
            .replace('joris.salmon53290@gmail.com', '<a href="mailto:joris.salmon53290@gmail.com" class="styled-link">joris.salmon53290@gmail.com</a>')
            .replace('0766840946', '<a href="tel:+33766840946" class="styled-link">0766840946</a>');
        
        // Supprimer l'animation de chargement
        chatBody.removeChild(loading);

        // Créer un nouvel élément div pour la bulle de message
        const assistantBubble = document.createElement('div');
        assistantBubble.className = 'bulle-joris';

        // Créer un conteneur flex pour l'image et le texte
        const bubbleContent = document.createElement('div');
        bubbleContent.className = 'bubble-content'; // Classe pour le conteneur flex

        // Créer un élément pour l'image
        const avatarImage = document.createElement('img');
        avatarImage.src = 'img/contact.jpg'; // Chemin vers l'image de favicon
        avatarImage.alt = 'Joris';

        // Créer un nouvel élément pour le message texte
        const messageElement = document.createElement('p'); 
        messageElement.innerHTML = ''; // Sera rempli par l'effet de typewriter
        bubbleContent.appendChild(messageElement);

        // Ajouter l'image et le contenu dans une div flex
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper'; // Conteneur pour l'image et le texte
        contentWrapper.appendChild(avatarImage); // Ajouter l'image
        contentWrapper.appendChild(bubbleContent); // Ajouter le texte

        assistantBubble.appendChild(contentWrapper); // Ajouter le wrapper à la bulle
        chatBody.appendChild(assistantBubble); // Ajouter la bulle au chat

        // Assurez-vous de faire défiler vers le bas
        chatBody.scrollTop = chatBody.scrollHeight;

        // Ajouter l'effet de typewriter
        typeWriterEffect(messageElement, messageBot);

        // Ajouter le message à l'historique
        conversationHistory.push({ role: "assistant", content: messageBot });
    } catch (error) {
        console.error("Erreur chatbot:", error);
        
        // Supprimer l'animation de chargement
        if (loading.parentNode) {
            chatBody.removeChild(loading);
        }
        
        // Afficher un message d'erreur
        chatBody.innerHTML += `
            <div class="bulle-joris">
                <p><strong>Erreur:</strong> Le chatbot a rencontré un problème. Veuillez réessayer plus tard.</p>
            </div>
        `;
        
        // Scroll vers le bas
        chatBody.scrollTop = chatBody.scrollHeight;
    }
}

// Fonction d'animation de type "mot par mot" qui respecte le HTML
function typeWriterEffect(element, text) {
    let index = 0;
    let currentText = ''; // Stocker le texte actuellement affiché
    let isInTag = false;  // Indique si on est à l'intérieur d'une balise HTML
    const typingEffect = setInterval(() => {
        if (index < text.length) {
            // Vérifier si on est à l'intérieur d'une balise HTML
            if (text[index] === '<') {
                isInTag = true;
            }
            if (isInTag) {
                currentText += text[index]; // Accumuler les caractères d'une balise
                if (text[index] === '>') {
                    isInTag = false; // Fin de la balise
                }
            } else {
                currentText += text[index]; // Ajouter un caractère normal
            }

            // Ajouter tout le texte au fur et à mesure (balises + contenu)
            element.innerHTML = currentText;
            index++;
            
            // Scroll jusqu'en bas
            const chatBody = document.getElementById("chatPopupBody");
            if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        } else {
            clearInterval(typingEffect); // Arrêter l'animation quand c'est fini
        }
    }, 5); // Vitesse d'animation, en millisecondes
}