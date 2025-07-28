const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log("🔔 Function called:", event.httpMethod);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com',
        'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Storefront-Access-Token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'Preflight OK',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { pageId, cards } = body;

    console.log("📦 Received pageId:", pageId);
    console.log("🧾 Cards:", cards);

    if (!pageId || !Array.isArray(cards)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
        },
        body: JSON.stringify({ error: 'Missing pageId or cards array' })
      };
    }

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
    console.log("✅ Shopify response:", data);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("❌ Function error:", error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://mindandsoulshop.com'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
