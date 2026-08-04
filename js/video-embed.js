/**
 * video-embed.js — Utilitaire partagé pour intégrer des vidéos.
 *
 * Transforme un lien (YouTube, Vimeo, ou fichier .mp4/.webm/.ogg) en lecteur
 * intégré lisible directement sur le site. Utilisé pour :
 *  - la vidéo de présentation (accueil),
 *  - les liens vidéo dans le contenu des projets et des articles.
 */
window.VideoEmbed = {
    /**
     * Analyse une URL et retourne le type + l'URL d'embed, ou null.
     */
    parse: function (url) {
        if (!url || typeof url !== 'string') return null;
        url = url.trim();

        // YouTube (watch, youtu.be, embed, shorts)
        let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
        if (m) return { type: 'youtube', embed: 'https://www.youtube.com/embed/' + m[1] };

        // Vimeo
        m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (m) return { type: 'vimeo', embed: 'https://player.vimeo.com/video/' + m[1] };

        // Fichier vidéo direct
        if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { type: 'file', src: url };

        return null;
    },

    /**
     * Construit le HTML d'un lecteur responsive à partir d'une URL.
     * @returns {string} HTML, ou '' si l'URL n'est pas une vidéo reconnue.
     */
    build: function (url) {
        const v = this.parse(url);
        if (!v) return '';
        if (v.type === 'file') {
            return '<div class="video-embed"><video controls preload="metadata" playsinline>' +
                '<source src="' + v.src + '">Votre navigateur ne supporte pas la lecture vidéo.</video></div>';
        }
        return '<div class="video-embed"><iframe src="' + v.embed + '" title="Vidéo" ' +
            'frameborder="0" loading="lazy" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ' +
            'allowfullscreen></iframe></div>';
    },

    /**
     * Remplace, dans un conteneur, tout lien pointant vers une vidéo par un
     * lecteur intégré. Les autres liens restent intacts.
     */
    embedLinks: function (container) {
        if (!container) return;
        const links = container.querySelectorAll('a[href]');
        links.forEach(function (a) {
            const html = window.VideoEmbed.build(a.getAttribute('href'));
            if (!html) return;
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            const player = wrapper.firstElementChild;
            if (player) a.replaceWith(player);
        });
    },

    /**
     * Rend une vidéo dans un conteneur donné (par son URL).
     * @returns {boolean} true si une vidéo a été rendue.
     */
    renderInto: function (container, url) {
        if (!container) return false;
        const html = this.build(url);
        if (!html) return false;
        container.innerHTML = html;
        return true;
    }
};
