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

    // ✅ Fix 1: Convert GID to numeric ID
    const numericId = pageId.replace('gid://shopify/Page/', '');

    // 🧠 Fix 2: Check if metafield already exists safely
    const lookupRes = await fetch(`https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields.json?owner_id=${numericId}&owner_resource=page`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': process.env.ADMIN_API_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    const lookupData = await lookupRes.json();

    // ✅ Safely check if metafields array exists
    const metafields = Array.isArray(lookupData.metafields) ? lookupData.metafields : [];
    const existing = metafields.find(mf =>
      mf.namespace === 'cards' && mf.key === 'innovations'
    );

    const url = existing
      ? `https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields/${existing.id}.json`
      : `https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields.json`;

    const method = existing ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': process.env.ADMIN_API_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafield: {
          ...(existing ? {} : { owner_id: numericId, owner_resource: 'page' }),
          namespace: 'cards',
          key: 'innovations',
          type: 'json',
          value: JSON.stringify(cards),
        }
      })
    });

    const data = await res.json();
    console.log("✅ Shopify save response:", data);

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
