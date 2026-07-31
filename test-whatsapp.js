import fetch from 'node-fetch';

const TOKEN = "EAAPCsv7n6zEBSNLzrQkhIV1yyfRtm01rAXx7BcEXiWkOQ50MDp64ZCnwVi4PwOZBTZBbNJSmBhXyGXUqMw133ssMYu6IYZAZCeo2029N0NS1ktBRNCOHS6BfYGu968HLlGtlNfcf6seCmoxUoaRcZBM9rsD1ZCF6A2XgJ6tGewfxzcz3arRoPd0V2wPmPQ7vVxlcwZDZD";
const PHONE_NUMBER_ID = "1259472747245176";
const RECIPIENT_PHONE = "59894326501"; // El número que tienes en Supabase

async function sendTestMessage() {
  const url = `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: RECIPIENT_PHONE,
      type: "template",
      template: {
        name: "3p_direct_integration_test_template",
        language: { code: "en_US" }
      }
    })
  });

  const data = await response.json();
  console.log("Respuesta de Meta:", JSON.stringify(data, null, 2));
}

sendTestMessage();