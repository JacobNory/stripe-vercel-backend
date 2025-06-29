const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // ✅ Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { amount } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        // 🔥 Removed automatic_payment_methods for test mode Card Element
      });

      // ✅ DOM visibility check (for reference – not usually added in backend but clarifying your request)
      const paymentContainer = document.getElementById('payment-element');
      if (!paymentContainer) {
        console.error("Payment element container not found in DOM.");
        return;
      }
      if (!paymentContainer.offsetParent) {
        console.warn("Payment element container is hidden when initializing Stripe.");
      }

      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
