const fetch = require('node-fetch');

exports.handler = async (event) => {
  // ✅ Handle CORS preflight
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

  // ✅ Parse body safely
  let pageId;
  try {
    const parsed = JSON.parse(event.body || '{}');
    pageId = parsed.pageId;
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com',
      },
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

  if (!pageId || !pageId.includes('gid://shopify/Page/')) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com',
      },
      body: JSON.stringify({ error: "Missing or invalid pageId" })
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
    const metafield = Array.isArray(data.metafields)
      ? data.metafields.find(mf => mf.namespace === 'cards' && mf.key === 'innovations')
      : null;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify({ cards: JSON.parse(metafield?.value || '[]') })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
