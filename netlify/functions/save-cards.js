const fetch = require('node-fetch');

exports.handler = async (event) => {
  const { pageId, cards } = JSON.parse(event.body || '{}');

  if (!pageId || !Array.isArray(cards)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing or invalid 'pageId' or 'cards'" })
    };
  }

  const accessToken = process.env.ADMIN_API_TOKEN;

  const numericId = pageId.split('/').pop();

  const metafieldQuery = `
    query {
      page(id: "${pageId}") {
        metafields(first: 10, namespace: "cards") {
          edges {
            node {
              id
              key
              namespace
              value
              type
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({ query: metafieldQuery })
  });

  const result = await response.json();
  const edges = result?.data?.page?.metafields?.edges || [];

  const existing = edges.find(edge => edge.node.key === 'innovations');
  const metafieldId = existing?.node?.id;

  const mutation = `
    mutation metafieldUpsert($input: MetafieldInput!) {
      metafieldUpsert(input: $input) {
        metafield {
          id
          key
          value
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    input: {
      ...(metafieldId ? { id: metafieldId } : { ownerId: pageId }),
      namespace: "cards",
      key: "innovations",
      type: "json",
      value: JSON.stringify(cards)
    }
  };

  const saveResponse = await fetch('https://mind-and-soul-shop.myshopify.com/admin/api/2023-01/graphql.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const saveResult = await saveResponse.json();

  if (saveResult.errors || saveResult.data?.metafieldUpsert?.userErrors?.length) {
    console.error("Metafield save failed:", saveResult);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Metafield update failed", details: saveResult })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Saved successfully" })
  };
};

