// api/suscribe.js
// Inscription à la newsletter + emails transactionnels via Resend.
//
// Variables d'environnement (à définir dans Vercel) :
//   RESEND_API_KEY   -> clé API Resend (re_...). NE JAMAIS la mettre en dur.
//   NEWSLETTER_FROM  -> expéditeur vérifié, ex: "Joris Salmon <newsletter@jorissalmon.com>"
//                       (par défaut onboarding@resend.dev : utile pour tester, mais
//                        Resend n'enverra alors qu'à votre propre adresse tant que
//                        votre domaine n'est pas vérifié dans le dashboard Resend).
//   ADMIN_EMAIL      -> adresse qui reçoit la notification de nouvel abonné.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export default async function handler(req, res) {
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

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY manquante');
      return res.status(500).json({ error: 'Configuration serveur incomplète (RESEND_API_KEY)' });
    }

    const from = process.env.NEWSLETTER_FROM || 'Joris Salmon <onboarding@resend.dev>';
    const adminEmail = process.env.ADMIN_EMAIL || 'joris.salmon53290@gmail.com';

    // 1. Email de bienvenue à l'abonné (non bloquant si erreur secondaire)
    await sendEmail(apiKey, {
      from,
      to: email,
      subject: 'Bienvenue dans la newsletter de Joris Salmon 🚀',
      html: welcomeEmailHtml(),
    });

    // 2. Notification à l'administrateur (best-effort : on n'échoue pas l'inscription si elle rate)
    try {
      await sendEmail(apiKey, {
        from,
        to: adminEmail,
        subject: 'Nouvel abonné à la newsletter',
        html: adminNotificationHtml(email),
      });
    } catch (adminErr) {
      console.warn('Notification admin non envoyée:', adminErr.message);
    }

    return res.status(200).json({ success: true, message: 'Inscription réussie !' });
  } catch (error) {
    console.error("Erreur d'abonnement:", error);
    return res.status(500).json({
      error: "Erreur lors du traitement de l'abonnement",
      message: error.message,
    });
  }
}

/**
 * Envoie un email via l'API Resend.
 */
async function sendEmail(apiKey, { from, to, subject, html }) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail}`);
  }
  return response.json();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Email de bienvenue — design clair et lisible dans tous les clients mail,
 * avec les accents violet/cyan de la marque.
 */
function welcomeEmailHtml() {
  return `
  <div style="margin:0;padding:0;background:#f4f4f8;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);font-family:Arial,Helvetica,sans-serif;">
          <tr>
            <td style="background:linear-gradient(135deg,#6e00ff,#bc13fe);padding:36px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:-0.02em;">Joris Salmon</h1>
              <p style="margin:8px 0 0;color:#e0d4ff;font-size:13px;letter-spacing:2px;text-transform:uppercase;">Data Analyst &amp; Consultant BI</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;color:#333333;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;">Merci pour votre inscription ! 🎉</h2>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555;">
                Vous recevrez désormais mes derniers <strong>articles</strong>, <strong>projets</strong> et retours
                d'expérience autour de la data, de la Business Intelligence et de l'intelligence artificielle.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#555;">
                En attendant, vous pouvez explorer mon portfolio et mes projets récents :
              </p>
              <p style="text-align:center;margin:0 0 8px;">
                <a href="https://www.jorissalmon.com/#portfolio"
                   style="display:inline-block;background:linear-gradient(135deg,#6e00ff,#bc13fe);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:bold;font-size:14px;">
                  Découvrir mes projets
                </a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px;border-top:1px solid #eee;text-align:center;color:#999;font-size:12px;">
              <p style="margin:0 0 8px;">
                <a href="https://github.com/Jorissalmon" style="color:#bc13fe;text-decoration:none;margin:0 8px;">GitHub</a> ·
                <a href="https://www.linkedin.com/in/joris-salmon/" style="color:#bc13fe;text-decoration:none;margin:0 8px;">LinkedIn</a>
              </p>
              <p style="margin:0;">© ${new Date().getFullYear()} Joris Salmon — Vous recevez cet email suite à votre inscription sur jorissalmon.com</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </div>`;
}

function adminNotificationHtml(email) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#333;">
    <h2 style="color:#6e00ff;">Nouvel abonné 🎯</h2>
    <p>Un nouvel utilisateur s'est abonné à la newsletter :</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
  </div>`;
}
