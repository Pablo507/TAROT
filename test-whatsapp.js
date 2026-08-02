import fetch from 'node-fetch';

const TOKEN = "EAAPCsv7n6zEBSNLzrQkhIV1yyfRtm01rAXx7BcEXiWkOQ50MDp64ZCnwVi4PwOZBTZBbNJSmBhXyGXUqMw133ssMYu6IYZAZCeo2029N0NS1ktBRNCOHS6BfYGu968HLlGtlNfcf6seCmoxUoaRcZBM9rsD1ZCF6A2XgJ6tGewfxzcz3arRoPd0V2wPmPQ7vVxlcwZDZD";
const PHONE_NUMBER_ID = "1259472747245176";
const RECIPIENT_PHONE = "59894326501";

async function sendTestMessage() {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: RECIPIENT_PHONE,
      type: "template",
      template: {
        name: "carta_diaria",
        language: { code: "es_URY" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: "Pablo" },
              { type: "text", text: "El Mago" },
              { type: "text", text: "Hoy es un gran día para manifestar tus proyectos y usar todo tu potencial creativo." }
            ]
          }
        ]
      }
    })
  });

  const data = await response.json();
  console.log("Respuesta de Meta:", JSON.stringify(data, null, 2));
}

sendTestMessage();
