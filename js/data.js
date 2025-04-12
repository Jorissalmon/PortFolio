/**
 * data.js - Gestion des données du portfolio avec JSON local
 * 
 * Ce fichier remplace l'utilisation de Supabase par une solution locale.
 * Les données sont stockées dans des objets JSON et peuvent être facilement mises à jour.
 */

// Configuration pour une éventuelle API future
const API_CONFIG = {
    // Si vous déployez une API plus tard, modifiez cette URL
    baseUrl: './data',
    endpoints: {
      projects: '/projects.json',
      articles: '/articles.json'
    }
  };
  
  // Données des projets
  const projectsData = [
    {
      id: 1,
      name: "Dashboard Power BI",
      category: "filter-2",
      image_url: "img/portfolio/dashboard-bi.jpg",
      link: "https://github.com/Jorissalmon/PowerBI-Dashboard",
      description: "Dashboard interactif réalisé avec Power BI pour l'analyse de données commerciales."
    },
    {
      id: 2,
      name: "Analyse de données météo",
      category: "filter-3",
      image_url: "img/portfolio/meteo-analysis.jpg",
      link: "https://github.com/Jorissalmon/meteo-analysis",
      description: "Étude de l'impact du réchauffement climatique sur les précipitations en Bretagne."
    },
    {
      id: 3,
      name: "Application de visualisation",
      category: "filter-1",
      image_url: "img/portfolio/data-viz-app.jpg",
      link: "https://github.com/Jorissalmon/data-visualization",
      description: "Interface de visualisation de données développée avec Python et Streamlit."
    },
    {
      id: 4,
      name: "Prédiction de ventes",
      category: "filter-3",
      image_url: "img/portfolio/sales-prediction.jpg",
      link: "https://github.com/Jorissalmon/sales-prediction",
      description: "Modèle de machine learning pour la prédiction des ventes d'une entreprise."
    },
    {
      id: 5,
      name: "ETL Data Pipeline",
      category: "filter-2",
      image_url: "img/portfolio/etl-pipeline.jpg",
      link: "https://github.com/Jorissalmon/etl-pipeline",
      description: "Pipeline d'extraction, transformation et chargement de données avec Python."
    },
    {
      id: 6,
      name: "Interface analytique",
      category: "filter-1",
      image_url: "img/portfolio/analytical-interface.jpg",
      link: "https://github.com/Jorissalmon/analytical-interface",
      description: "Interface utilisateur pour l'analyse de données financières."
    }
  ];
  
  // Données des articles de blog
  const articlesData = [
    {
      id: 1,
      title: "L'importance de la visualisation des données",
      category: "filter-data",
      image_url: "img/blog/data-viz.jpg",
      link: "articles/importance_visualisation_donnees.html",
      author: "Joris Salmon",
      date: "12 avril 2023",
      summary: "Découvrez pourquoi la visualisation des données est cruciale dans l'analyse et la prise de décision."
    },
    {
      id: 2,
      title: "Power BI vs Tableau : Quelle solution choisir ?",
      category: "filter-bi",
      image_url: "img/blog/powerbi-vs-tableau.jpg",
      link: "articles/powerbi_vs_tableau.html",
      author: "Joris Salmon",
      date: "25 juin 2023",
      summary: "Comparaison des deux plateformes leaders de Business Intelligence pour vous aider à faire le bon choix."
    },
    {
      id: 3,
      title: "Comment devenir Data Analyst en 2023",
      category: "filter-career",
      image_url: "img/blog/become-data-analyst.jpg",
      link: "articles/devenir_data_analyst.html",
      author: "Joris Salmon",
      date: "10 septembre 2023",
      summary: "Guide complet pour lancer votre carrière dans le domaine de l'analyse de données."
    },
    {
      id: 4,
      title: "Les bases du SQL pour l'analyse de données",
      category: "filter-data",
      image_url: "img/blog/sql-basics.jpg",
      link: "articles/bases_sql.html",
      author: "Joris Salmon",
      date: "5 novembre 2023",
      summary: "Maîtrisez les fondamentaux du SQL pour améliorer vos compétences d'analyse."
    },
    {
      id: 5,
      title: "5 KPIs essentiels pour votre dashboard",
      category: "filter-bi",
      image_url: "img/blog/kpi-dashboard.jpg",
      link: "articles/kpis_essentiels_dashboard.html",
      author: "Joris Salmon",
      date: "18 janvier 2024",
      summary: "Les indicateurs clés de performance que tout dashboard d'entreprise devrait inclure."
    },
    {
      id: 6,
      title: "Python vs R pour la data science",
      category: "filter-data",
      image_url: "img/blog/python-vs-r.jpg",
      link: "articles/python_vs_r.html",
      author: "Joris Salmon",
      date: "22 mars 2024",
      summary: "Analyse comparative des deux langages les plus populaires en data science."
    }
  ];
  
  /**
   * Récupère les projets du portfolio
   * @returns {Promise} Promesse contenant les données des projets
   */
  async function getProjects() {
    // Simuler une requête API avec un léger délai
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(projectsData);
      }, 300);
    });
  }
  
  /**
   * Récupère les articles du blog
   * @returns {Promise} Promesse contenant les données des articles
   */
  async function getArticles() {
    // Simuler une requête API avec un léger délai
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(articlesData);
      }, 300);
    });
  }
  
  /**
   * Vérifie si un article HTML existe
   * Cette fonction simule la vérification précédemment faite avec Supabase
   * @param {number} articleId - ID de l'article à vérifier
   * @returns {Promise} Promesse contenant l'état d'existence de l'article
   */
  async function checkArticleHtmlExists(articleId) {
    return new Promise((resolve) => {
      // Simuler une vérification. Dans une vraie implémentation,
      // vous pourriez vérifier l'existence du fichier avec fetch
      const article = articlesData.find(a => a.id === articleId);
      resolve({
        exists: article ? true : false,
        articleId: articleId
      });
    });
  }
  
  /**
   * Pour une future intégration avec une API réelle
   * @param {string} endpoint - Point d'accès de l'API
   * @returns {Promise} Promesse contenant les données
   */
  async function fetchFromAPI(endpoint) {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      // En cas d'erreur, utiliser les données locales comme fallback
      if (endpoint === API_CONFIG.endpoints.projects) {
        return projectsData;
      } else if (endpoint === API_CONFIG.endpoints.articles) {
        return articlesData;
      }
      return [];
    }
  }
  
  // Exporter les fonctions pour les utiliser dans d'autres fichiers
  window.dataService = {
    getProjects,
    getArticles,
    checkArticleHtmlExists
  };