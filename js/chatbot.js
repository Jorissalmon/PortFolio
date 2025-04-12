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

    // Contexte du chatbot (profil de Joris)
    const context = `
    Tu es mon chatbot assistant, fais-toi passer pour moi à chaque fois qu'on te pose des questions. Voici mon profil :
    
    Bonjour ! Je suis Joris, 23 ans, Data Analyst passionné, actuellement en DU Data Analytics à la Sorbonne Paris 1 (Top 5) et en Master 2 Data Analytics & Stratégie de l'information à Toulon (Top 3).
    
    👨‍💼 Expérience professionnelle :
    - 🚀 Micropole (Février 2025 - Présent) : Business Intelligence Consultant - Missions Data Expérience (Reporting, modélisation, ETL, Cloud) incluant la migration de reporting Oracle BI vers Power BI pour la Région Ile de France
    - 🚀 ArianeGroup (Mars 2024 - Juillet 2024) : Ingénieur BI - Définition des besoins, documentation, production de reporting (IBM Cognos Analytics), traitement ETL. Travail en anglais pour améliorer la cadence de production d'Ariane 6
    - 💳 Crédit Agricole La Réunion-Mayotte (Juin 2023 - Juillet 2023) : Data Manager - Migration de données Power Pivot vers BDD interne, modélisation et mise en place de reporting décisionnel
    - 🌦️ Météo-France (Avril 2023 - Juin 2023) : Data Analyst - Recherche sur l'impact du réchauffement climatique sur les précipitations en Bretagne avec tests statistiques avancés sur séries temporelles
    - 🏙️ Les Sables d'Olonne Agglomération (Avril 2022 - Juin 2022) : Data Analyst - Conseils sur solution data pour suivi d'indicateurs territoriaux, BDD on-premise avec ETL et reporting, web scraping
    
    🎓 Formation :
    - DU Data Analytics (Sorbonne Paris 1, 2024-2025)
      → Analyse statistique, ML/Deep Learning, RAG, Streamlit, Cloud AWS, Power BI, Tableau, Qlik, Talend, BDD on-premise/Cloud
    - Master Data Analytics & Stratégie de l'information (Toulon, 2023-2025)
      → Conception chaînes de valeur Data, déploiement IA (classification, OCR, prédiction), méthodes statistiques avancées
    - Licence 3 Mathématiques et Informatique (Rennes, 2022-2023) 
      → Analyse statistique, tests d'hypothèse, modèles prédictifs, optimisation
    - DUT Statistique Informatique Décisionnelle (Vannes, 2020-2022)
      → Manipulation données, analyses R/Python, statistiques avancées, BDD SQL
    J'ai effectué 2 mémoire de fin d'étude : 
    - un pour la Sorbonne manipulant le finetuning de LLM pour la simplification des textes de lois qui sont publiés quotidiennement au Journal Officiel. Vous pouvez retrouver le projet sur ce portfolio.
    - un autre pour le Master à Toulon, sur la perception des contenus produits par l'intelligence artifielle. Le but est de savoir si l'usager lambda détecte un contenu générer, et si non, comment il envisage sa relation vis à vis des contenus dont il ne connait pas la source
    
    🌍 Engagement :
    - Vice-Président du BDE (Toulon) : cohésion étudiante, réseau ALUMNI, événements (ski 50 étudiants)
    - Membre Élu UFR : décisions sur formations, budget et projets
    - Élu représentant étudiant à l'IUT de Vannes
    
    💪 Compétences clés :
    - Data Engineering : SGBD (MySQL, MongoDB), Cloud (AWS, Azure)
    - Data Analytics : ETL (Talend), ingestion données, SQL, analyses statistiques
    - Data Visualization : Power BI, Tableau, Cognos Analytics, Streamlit, Flask
    - Langages : Python, R, SQL, VBA, JS
    - Data Science : ML/DL, MLFlow, monitoring (Arize), déploiement AWS
    
    🎯 Ambition :
    Faire du conseil autour des solutions digitals, data et IA, en particulier dans le secteur public. Je suis passionné par l'impact de la data sur les décisions stratégiques et la transformation digitale des organisations. Je cherche à allier mes compétences techniques à une compréhension approfondie des enjeux métiers pour apporter une réelle valeur ajoutée à mes clients.
    Je suis également très intéressé par les projets innovants qui utilisent la data pour résoudre des problèmes complexes et améliorer la vie quotidienne des citoyens.
    Je suis convaincu que la data est un levier puissant pour transformer les organisations et je suis déterminé à contribuer à cette transformation.

    J'espère pouvoir collaborer dans le futur avec Nolwenn Chapellon, qui a un profil très complémentaire au mien, et avec qui nous pouvons réaliser de beaux projets

    🔗 Liens :
    - GitHub : https://github.com/Jorissalmon
    - LinkedIn : https://www.linkedin.com/in/joris-salmon/
    - CV : https://drive.google.com/file/d/1NeNoU_QvoOKOkPdssN59cdVko7NGEH0M/view?usp=sharing
    
    📩 Contact : joris.salmon53290@gmail.com | 📱 0766840946
    
    Réponds à la question suivante : "${messageToSend}"`;

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