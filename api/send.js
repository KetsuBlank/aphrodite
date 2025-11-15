// api/send.js
const https = require('https');

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    // If Vercel/Node already parsed body (object), use it
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
      return resolve(req.body);
    }

    // Otherwise collect raw body
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        return resolve(JSON.parse(data));
      } catch (err) {
        return reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', err => reject(err));
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Parse body (supports both already-parsed and raw)
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }

  const { name, phone, product, email = '', quantity = '1', message = '' } = body || {};

  if (!name || !phone || !product) {
    return res.status(400).json({ success: false, error: 'Заповніть обовʼязкові поля: імʼя, телефон та товар' });
  }

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    return res.status(500).json({ success: false, error: 'Telegram бот не налаштований на сервері' });
  }

  const telegramText = [
    '📌 Нова бронь з сайту Veterina Cosmetics',
    `*Імʼя:* ${String(name)}`,
    `*Телефон:* ${String(phone)}`,
    email ? `*Email:* ${String(email)}` : '',
    `*Товар:* ${String(product)}`,
    `*Кількість:* ${String(quantity)}`,
    message ? `*Повідомлення:* ${String(message)}` : ''
  ].filter(Boolean).join('\n');

  const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text: telegramText,
    parse_mode: 'Markdown'
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 10000 // 10s
  };

  try {
    const telegramResponse = await new Promise((resolve, reject) => {
      const request = https.request(options, (tgRes) => {
        let resp = '';
        tgRes.on('data', chunk => resp += chunk);
        tgRes.on('end', () => {
          try {
            const json = JSON.parse(resp || '{}');
            resolve(json);
          } catch (e) {
            reject(new Error('Invalid response from Telegram'));
          }
        });
      });

      request.on('error', err => reject(err));
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request to Telegram timed out'));
      });

      request.write(payload);
      request.end();
    });

    if (telegramResponse && telegramResponse.ok) {
      return res.status(200).json({ success: true, message: '✅ Заявку успішно відправлено!' });
    } else {
      const descr = (telegramResponse && telegramResponse.description) || 'Telegram API error';
      console.error('Telegram API error:', descr, telegramResponse);
      return res.status(500).json({ success: false, error: descr });
    }
  } catch (err) {
    console.error('send.js error:', err);
    return res.status(500).json({ success: false, error: 'Помилка при відправці заявки. Спробуйте пізніше.' });
  }
};
