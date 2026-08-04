/**
 * chatbot.js - Gestion du chatbot interactif
 * 
 * Ce fichier gère le fonctionnement du chatbot qui simule une conversation
 * avec Joris Salmon et répond aux questions des visiteurs.
 */

// Initialiser un tableau pour stocker les messages
let conversationHistory = [];
let chatbotContext = null;

// Ouvrir/Fermer la fenêtre de chat
document.getElementById("chatbotBubble").addEventListener("click", function () {
    const popup = document.getElementById("chatPopup");
    popup.style.display = popup.style.display === "block" ? "none" : "block";

    if (popup.style.display === "block") {
        this.style.animation = "none"; // Arr êteAnimation
        showPresetPhrases();
    } else {
        this.style.animation = ""; // Réactive l'animation si la bulle est fermée
    }
});

// Écouter l'événement "keypress" sur le champ de texte
document.getElementById("userMessage").addEventListener("keypress", function (event) {
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
window.onload = function () {
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
document.addEventListener("click", function (event) {
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

/**
 * Charge le prompt du chatbot depuis Contentful
 */
async function loadChatbotPrompt() {
    try {
        if (chatbotContext) return chatbotContext; // Cache déjà chargé

        console.log('🤖 Chargement du prompt du chatbot depuis Contentful...');

        if (!window.contentfulService) {
            console.warn('⚠️ ContentfulService non disponible, utilisation du prompt par défaut');
            chatbotContext = getDefaultPrompt();
            return chatbotContext;
        }

        const data = await window.contentfulService.getProfileSettings();

        if (data && data.items && data.items.length > 0) {
            const profileFields = data.items[0].fields;
            if (profileFields.chatbotPrompt) {
                chatbotContext = profileFields.chatbotPrompt;
                console.log('✅ Prompt du chatbot chargé depuis Contentful');
                return chatbotContext;
            }
        }

        // Fallback au prompt par défaut si non trouvé dans Contentful
        console.warn('⚠️ Utilisation du prompt par défaut (Contentful non disponible)');
        chatbotContext = getDefaultPrompt();
        return chatbotContext;
    } catch (error) {
        console.error('❌ Erreur lors du chargement du prompt:', error);
        chatbotContext = getDefaultPrompt();
        return chatbotContext;
    }
}

/**
 * Retourne le prompt par défaut en cas d'échec Contentful
 */
function getDefaultPrompt() {
    return `Tu es l'assistant IA du portfolio de Joris Salmon. Tu réponds à sa place, à la première personne ("je"), face à des recruteurs, clients ou partenaires potentiels. Ton objectif : donner envie de travailler avec moi, en restant honnête, précis et concret.

# QUI JE SUIS
Je suis Joris Salmon, Consultant BI & IA chez Talan. Je suis à la fois Data Analyst et Data Engineer : je conçois la chaîne de bout en bout, de la collecte et la modélisation de la donnée jusqu'à la restitution décisionnelle et la mise en production de solutions IA. J'ai aussi une vraie appétence pour la recherche et la statistique, héritée de mes travaux académiques et de mission.

- Basé à Marseille, ouvert à Lyon.
- Formé à la Sorbonne Paris 1 (DU Data Analytics) et à Toulon (Master 2 Data Analytics & Stratégie de l'information).

# CE QUE JE FAIS
- **Data Engineering** : pipelines & ETL (Talend), modélisation, bases SQL/NoSQL (PostgreSQL, MySQL, MongoDB), Cloud (AWS, Azure).
- **Data Analyse & BI** : Power BI, Tableau, Cognos, SQL avancé, KPIs et tableaux de bord décisionnels.
- **IA & Data Science** : Machine/Deep Learning (PyTorch, TensorFlow), NLP, vision, systèmes RAG et assistants IA.
- **Recherche & statistique** : séries temporelles, modélisation statistique, analyse d'impact (Python, R).

# PARCOURS (repères)
- **Talan** — Consultant BI & IA (actuel).
- **Micropole** — Consultant BI : migration Oracle BI → Power BI pour la Région Île-de-France.
- **ArianeGroup** — Ingénieur BI : reporting critique sur Cognos pour la cadence de production d'Ariane 6 (environnement international, anglais).
- **Crédit Agricole La Réunion-Mayotte** — Data Manager : automatisation & structuration d'une BDD.
- **Météo-France** — Data Analyst : recherche sur l'impact du réchauffement climatique (séries temporelles, R).
- **Les Sables d'Olonne Agglomération** — Data Analyst : solution data territoriale (ETL, web scraping).

# LIENS
- GitHub : https://github.com/Jorissalmon
- LinkedIn : https://www.linkedin.com/in/joris-salmon/
- Portfolio : https://www.jorissalmon.com
- Email : joris.salmon53290@gmail.com — Tél : 0766840946

# COMMENT RÉPONDRE
- Réponds toujours en **français**, à la première personne.
- Sois **structuré et facile à lire** : phrases courtes, un point par idée. Utilise des listes à puces "- " quand tu énumères, et **mets en gras** les mots-clés importants.
- Va à l'essentiel (2 à 5 phrases ou une courte liste), puis propose une ouverture ("Vous voulez un exemple concret ?").
- Reste factuel : si tu ne sais pas, invite à me contacter directement plutôt que d'inventer.
- Oriente vers l'action : proposer un échange, partager le CV, ou pointer un projet du portfolio.`;
}

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

    try {
        // Charger le contexte du chatbot
        const promptContext = await loadChatbotPrompt();
        const context = `${promptContext}

RÈGLES DE FORMAT (impératif) :
- Réponds en français, à la première personne ("je").
- Sois clair et structuré : phrases courtes, une idée par ligne.
- Utilise des listes à puces avec "- " pour toute énumération.
- Mets en **gras** (avec des astérisques) les mots-clés importants.
- Reste concis (max ~5 phrases ou une courte liste) et termine par une ouverture.

Réponds à la question suivante comme si tu étais moi: "${messageToSend}"`;

        // Créer le prompt final en ajoutant l'historique des messages
        const messages = [{ role: "system", content: context }];
        conversationHistory.forEach(msg => messages.push(msg));
        messages.push({ role: "user", content: messageToSend });

        // Appel à l'endpoint chatbot (relatif : fonctionne sur le domaine de prod
        // comme en preview, sans URL codée en dur).
        const response = await fetch('/api/callopenai', {
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
        let messageBot = data?.choices?.[0]?.message?.content;
        if (!messageBot) {
            throw new Error('Réponse vide du service de chat');
        }

        // Mise en forme lisible (gras, listes, sauts de ligne)
        messageBot = formatBotMessage(messageBot);

        // Pour les liens cliquables
        messageBot = messageBot
            .replace('https://github.com/Jorissalmon', '<a href="https://github.com/Jorissalmon" target="_blank" class="styled-link">GitHub</a>')
            .replace('https://www.linkedin.com/in/joris-salmon/', '<a href="https://www.linkedin.com/in/joris-salmon/" target="_blank"  class="styled-link">LinkedIn</a>')
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
        avatarImage.src = 'img/me.jpg'; // Avatar léger (contact.jpg pesait 6 Mo)
        avatarImage.alt = 'Joris';
        avatarImage.loading = 'lazy';

        // Créer un nouvel élément pour le message texte (div : accepte listes/paragraphes)
        const messageElement = document.createElement('div');
        messageElement.className = 'bot-message-text';
        messageElement.innerHTML = ''; // Sera rempli par l'effet de typewriter
        bubbleContent.appendChild(messageElement);

        // Ajouter l'image et le contenu dans une div flex
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper'; // Conteneur pour l'image et le texte
        contentWrapper.appendChild(avatarImage); //Ajouter l'image
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

// Transforme un texte type markdown léger en HTML lisible
function formatBotMessage(text) {
    if (!text) return '';
    let t = text.replace(/\r\n/g, '\n').trim();

    // Gras **texte**
    t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    const lines = t.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(raw => {
        const line = raw.trim();
        const bullet = line.match(/^([-•])\s+(.*)$/);
        if (bullet) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${bullet[2]}</li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (line !== '') html += `<p>${line}</p>`;
        }
    });
    if (inList) html += '</ul>';

    return html || `<p>${t}</p>`;
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