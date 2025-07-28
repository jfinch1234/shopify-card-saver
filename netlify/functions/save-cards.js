const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'Preflight OK',
    };
  }

  try {
    const { pageId, cards } = JSON.parse(event.body);

    const res = await fetch('https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields.json', {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': process.env.ADMIN_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafield: {
          namespace: 'cards',
          key: 'innovation',
          type: 'json',
          value: JSON.stringify(cards),
          owner_resource: 'page',
          owner_id: pageId
        }
      })
    });

    const data = await res.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};


