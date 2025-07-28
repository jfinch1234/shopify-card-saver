exports.handler = async (event) => {
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

  try {
    const response = await fetch(`https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/metafields.json?owner_id=${pageId}&owner_resource=page`, {
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
