# Portfolio - Joris Salmon

## 🚀 Développement Local

### Prérequis
- Node.js installé
- Fichier `.env` configuré avec vos clés Contentful

### Démarrage rapide

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur **http://localhost:3000**

### Mode Production (Python server - sans Contentful)
```bash
python -m http.server 8000
```
⚠️ Ce mode ne permet pas de charger les données Contentful.

## 📝 Configuration

Assurez-vous que votre `.env` contient:
```
CONTENTFUL_SPACE_ID=votre_space_id
CONTENTFUL_ACCESS_TOKEN=votre_token
CONTENTFUL_ENVIRONMENT=master
```

## 🛠️ Scripts disponibles

- `npm run dev` - Serveur de développement avec API Contentful
- `npm start` - Alias pour `npm run dev`
- `npm run generate-sitemap` - Génération du sitemap
