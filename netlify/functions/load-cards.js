const fetch = require('node-fetch');

exports.handler = async (event) => {
  // ✅ Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: 'Preflight OK',
    };
  }

  const { pageId } = JSON.parse(event.body || '{}');

  if (!pageId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing pageId" }),
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      }
    };
  }

  const numericId = pageId.replace('gid://shopify/Page/', '');

  try {
    const response = await fetch(`https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields.json?owner_id=${numericId}&owner_resource=page`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': process.env.ADMIN_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    const metafield = data.metafields.find(mf =>
      mf.namespace === 'cards' && mf.key === 'innovation'
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ cards: JSON.parse(metafield?.value || '[]') }),
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      }
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      }
    };
  }
};
