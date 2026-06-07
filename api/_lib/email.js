const { Resend } = require('resend');

const FROM = 'Emicils <noreply@emicil.fr>';

function base(content) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Emicils</title></head>
<body style="margin:0;padding:0;background:#f4ede2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#34302a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4ede2;padding:40px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr><td align="center" style="padding-bottom:32px;">
    <div style="letter-spacing:.42em;font-size:22px;font-weight:300;text-transform:uppercase;color:#1d1a16;">Emicils</div>
    <div style="letter-spacing:.5em;font-size:8px;text-transform:uppercase;color:#b08d57;margin-top:4px;">Lash Artist</div>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#fbf8f2;border-radius:12px;border:1px solid #e3d8c5;padding:40px 36px;">
    ${content}
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding-top:28px;font-size:11px;color:#8c8175;letter-spacing:.05em;">
    © 2026 Emicils · Institut de beauté · Les Pennes-Mirabeau<br/>
    <span style="color:#b08d57;">14 avenue de la Pinède, 13170 Les Pennes-Mirabeau</span>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

function gold(text) {
  return `<span style="color:#b08d57;">${text}</span>`;
}

function h1(text) {
  return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:300;letter-spacing:.04em;color:#1d1a16;">${text}</h1>`;
}

function p(text) {
  return `<p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#8c8175;">${text}</p>`;
}

function divider() {
  return `<hr style="border:none;border-top:1px solid #e3d8c5;margin:24px 0;"/>`;
}

function row(label, value) {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#8c8175;">${label}</td>
    <td style="padding:6px 0;font-size:13px;color:#34302a;text-align:right;"><strong>${value}</strong></td>
  </tr>`;
}

function badge(text) {
  return `<span style="background:#b08d57;color:#fbf8f2;font-size:11px;padding:4px 12px;border-radius:999px;letter-spacing:.1em;text-transform:uppercase;">${text}</span>`;
}

// ---- Templates ----

function orderConfirmation({ ref, items, total, shipping, mode, ptsGagnes, prenom }) {
  const modeLabel = { collect: "Retrait à l'institut", relais: 'Point relais', domicile: 'Livraison à domicile' }[mode] || mode;
  const rows = (items || []).map(i =>
    row(`${i.name} × ${i.qty}`, `${(i.price * i.qty).toFixed(2)} €`)
  ).join('');

  return base(`
    ${h1('Merci pour votre commande !')}
    ${p(`Bonjour${prenom ? ' ' + prenom : ''}, votre commande a bien été reçue et est en cours de préparation.`)}
    ${badge('Commande confirmée')}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows}
      ${row('Livraison', shipping === 0 ? 'Offerte' : shipping.toFixed(2) + ' €')}
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:15px;font-weight:500;color:#1d1a16;">Total</td>
        <td style="font-size:18px;font-weight:500;color:#1d1a16;text-align:right;">${Number(total).toFixed(2)} €</td>
      </tr>
    </table>
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Référence', ref)}
      ${row('Mode de récupération', modeLabel)}
      ${row('Points fidélité gagnés', `+${ptsGagnes} pts`)}
    </table>
    ${divider()}
    ${p(`Les points seront crédités sur votre compte fidélité après validation de votre commande par notre équipe.<br/>Vous recevrez une notification dès qu'elle sera prête.`)}
  `);
}

function bookingConfirmation({ formationTitre, niveau, prix, prenom, email }) {
  return base(`
    ${h1('Demande d\'inscription reçue !')}
    ${p(`Bonjour${prenom ? ' ' + prenom : ''}, nous avons bien reçu votre demande d'inscription.`)}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('Formation', formationTitre)}
      ${niveau ? row('Niveau', niveau) : ''}
      ${prix ? row('Tarif', Number(prix).toFixed(2) + ' €') : ''}
      ${email ? row('Email de contact', email) : ''}
    </table>
    ${divider()}
    ${p('Notre équipe vous contactera sous <strong>24 h</strong> pour confirmer votre inscription et convenir des modalités de paiement.')}
    ${p('En cas de question, appelez-nous au <strong>06 69 25 62 12</strong> ou répondez directement à cet email.')}
  `);
}

function welcomeEmail({ prenom }) {
  return base(`
    ${h1(`Bienvenue${prenom ? ', ' + prenom : ''} !`)}
    ${p('Votre compte Emicils est maintenant actif. Nous sommes ravis de vous compter parmi nos membres.')}
    ${divider()}
    <p style="margin:0 0 12px;font-size:13px;color:#8c8175;text-transform:uppercase;letter-spacing:.1em;">Programme fidélité</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${row('1 € dépensé', '1 point gagné')}
      ${row('100 pts', '5 € de réduction')}
      ${row('Statut Or', 'À partir de 500 pts')}
    </table>
    ${divider()}
    ${p('Retrouvez vos points, vos commandes et votre historique directement depuis votre espace membre sur le site.')}
  `);
}

// ---- Sender ----

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (e) {
    console.error('Email error:', e.message);
  }
}

module.exports = { sendEmail, orderConfirmation, bookingConfirmation, welcomeEmail };
