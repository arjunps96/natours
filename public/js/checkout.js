const stripe = Stripe(
  'pk_test_51IwkPeSCb7t0ilC0iJ4RLkGY45S1IteIFiLRa4HShYbgVjWd6Rw1lLQqEh3Nt6xxALQby87VjkNcpsqZm5Kl2JuE00B8RD1JAh'
);
const axios = require('axios');
const showAlert = require('./alert');

export const createBooking = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
