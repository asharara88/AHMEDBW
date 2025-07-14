const axios = require('axios');
const { logInfo, logError } = require('../utils/logger');

async function placeCareemOrder(supplierId, cartItems, user) {
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing Careem API credentials');
  }

  try {
    // Fetch OAuth token
    const tokenRes = await axios.post(
      'https://api.careem.com/v1/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const payload = {
      supplierId,
      items: cartItems,
      delivery: { address: user.address, timeSlot: 'ASAP' },
      payment: { method: 'card', cardId: user.defaultCardId },
    };

    const makeRequest = async () => {
      return axios.post(
        'https://api.careem.com/v1/partner/orders',
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    };

    try {
      const res = await makeRequest();
      logInfo('Careem order placed', res.data);
      return { orderId: res.data.orderId, status: res.data.status };
    } catch (err) {
      if (err.response && err.response.status === 429) {
        logInfo('Careem rate limited, retrying once');
        await new Promise((r) => setTimeout(r, 1000));
        const res = await makeRequest();
        logInfo('Careem order placed after retry', res.data);
        return { orderId: res.data.orderId, status: res.data.status };
      }
      throw err;
    }
  } catch (error) {
    logError('Failed to place Careem order', error.response ? error.response.data : error);
    throw new Error('Careem order failed');
  }
}

async function placeTalabatOrder(supplierId, cartItems, user) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('Missing Talabat API key');
  }

  const instance = axios.create({
    baseURL: 'https://api.talabat.com',
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  try {
    await instance.post('/v2/cart/add', { supplierId, items: cartItems });

    const res = await instance.post('/v2/cart/checkout', {
      payment: { method: 'card', token: user.paymentToken },
      delivery: { address: user.address },
    });

    logInfo('Talabat order placed', res.data);
    return { orderReference: res.data.orderReference, status: res.data.status };
  } catch (error) {
    logError('Talabat order failed', error.response ? error.response.data : error);
    throw new Error(
      `Talabat order error: ${
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : error.message
      }`
    );
  }
}

module.exports = { placeCareemOrder, placeTalabatOrder };
