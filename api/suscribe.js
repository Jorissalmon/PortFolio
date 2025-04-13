// /api/subscribe.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Configurer CORS si nécessaire
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    // 1. Enregistrer l'email (plusieurs options)
    await saveEmailToDatabase(email);

    // 2. Envoyer l'email de confirmation
    await sendConfirmationEmail(email);

    // 3. Envoyer une notification à votre adresse
    await sendNotificationToAdmin(email);

    return res.status(200).json({ success: true, message: 'Inscription réussie!' });
  } catch (error) {
    console.error('Erreur d\'abonnement:', error);
    return res.status(500).json({ 
      error: 'Erreur lors du traitement de l\'abonnement',
      message: error.message
    });
  }
}

// Fonction de validation d'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Fonction pour enregistrer l'email
async function saveEmailToDatabase(email) {
  // Option 1: Enregistrer dans un service comme Airtable
  // const Airtable = require('airtable');
  // const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);
  // await base('Subscribers').create([{fields: {Email: email, Date: new Date().toISOString()}}]);

  // Option 2: Enregistrer dans une base de données (ex: MongoDB)
  // const { MongoClient } = require('mongodb');
  // const client = new MongoClient(process.env.MONGODB_URI);
  // await client.connect();
  // await client.db('newsletter').collection('subscribers').insertOne({email, date: new Date()});
  // await client.close();

  // Option 3: Envoyer l'email à votre propre adresse (le plus simple)
  // Déjà géré par sendNotificationToAdmin()

  // Pour cet exemple, nous simulerons l'enregistrement
  console.log(`Email enregistré: ${email}`);
}

// Fonction pour envoyer l'email de confirmation
async function sendConfirmationEmail(email) {
  // Configurer le transporteur d'email
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // ou autre service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Options d'email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmation d\'abonnement à la newsletter',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Merci pour votre abonnement!</h2>
        <p>Vous recevrez désormais les dernières actualités.</p>
        <p>Si vous n'avez pas demandé cet abonnement, vous pouvez l'ignorer ou <a href="#">vous désabonner</a>.</p>
      </div>
    `
  };

  // Envoyer l'email
  await transporter.sendMail(mailOptions);
}

// Fonction pour vous notifier
async function sendNotificationToAdmin(email) {
  // Configurer le transporteur d'email (même que précédemment)
  const transporter = nodemailer.createTransport({
    service: 'gmail',  // ou autre service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Options d'email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,  // Votre adresse email
    subject: 'Nouvel abonnement à la newsletter',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nouvel abonnement</h2>
        <p>Un nouvel utilisateur s'est abonné à la newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  };

  // Envoyer l'email
  await transporter.sendMail(mailOptions);
}