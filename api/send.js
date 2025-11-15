// api/send.js
const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { name, phone, product, email = '', quantity = '1', message = '' } = JSON.parse(body);
        
        if (!name || !phone || !product) {
          return res.json({ success: false, error: 'Заповніть обовʼязкові поля' });
        }

        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        const CHAT_ID = process.env.CHAT_ID;

        if (!TELEGRAM_TOKEN || !CHAT_ID) {
          return res.json({ success: false, error: 'Bot not configured' });
        }

        const telegramMessage = `
НОВА ЗАЯВКА
Ім'я: ${name}
Телефон: ${phone}
Email: ${email}
Товар: ${product}
Кількість: ${quantity}
Повідомлення: ${message}
        `.trim();

        const data = JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMessage
        });

        const options = {
          hostname: 'api.telegram.org',
          port: 443,
          path: `/bot${TELEGRAM_TOKEN}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          }
        };

        const req = https.request(options, (tgRes) => {
          let response = '';
          tgRes.on('data', chunk => response += chunk);
          tgRes.on('end', () => {
            const result = JSON.parse(response);
            if (result.ok) {
              res.json({ success: true, message: 'Заявку успішно відправлено!' });
            } else {
              res.json({ success: false, error: 'Помилка відправки' });
            }
          });
        });

        req.on('error', () => res.json({ success: false, error: 'Помилка сервера' }));
        req.write(data);
        req.end();

      } catch (e) {
        res.json({ success: false, error: 'Невірний формат даних' });
      }
    });
  } catch (error) {
    res.json({ success: false, error: 'Помилка сервера' });
  }
};