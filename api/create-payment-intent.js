const Stripe = require('stripe');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe non configuré' });
  }

  const { amount } = req.body || {};
  if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // euros → centimes
      currency: 'eur',
      automatic_payment_methods: { enabled: true },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    return res.status(500).json({ error: 'Erreur Stripe : ' + e.message });
  }
};
