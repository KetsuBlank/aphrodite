// api/send.js
const https = require('https');

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    // Если Vercel уже распарсил body (например, когда используется bodyParser),
    // то req.body будет объектом — используем его.
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
      return resolve(req.body);
    }

    let data = '';
    req.on('data', chunk => data += chunk);
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

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  // Парсим тело
  let body;
  try {
    body = await parseJsonBody(req);
  } catch (err) {
    console.error('parse body error:', err);
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }

  const {
    name,
    phone,
    // фронт у тебя использует service/budget/deadline/message/email — подхватим их
    email = '',
    service,
    budget = '',
    deadline = '',
    message = ''
  } = body || {};

  if (!name || !service || !message) {
    return res.status(400).json({ success: false, error: 'Заповніть обовʼязкові поля: імʼя, послуга та опис проекту' });
  }

  // Поддерживаем оба варианта имён env (на случай несовпадения)
  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN || null;
  const CHAT_ID = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID || null;

  if (!TELEGRAM_TOKEN || !CHAT_ID) {
    console.error('Telegram env missing. TELEGRAM_TOKEN:', !!TELEGRAM_TOKEN, 'CHAT_ID:', !!CHAT_ID);
    return res.status(500).json({ success: false, error: 'Telegram бот не налаштований на сервері' });
  }

  // Формируем текст сообщения — аккуратно с пустыми полями
  const lines = [
    '📌 Нова заявка з сайту',
    `*Імʼя:* ${String(name)}`,
    phone ? `*Телефон:* ${String(phone)}` : '',
    email ? `*Email:* ${String(email)}` : '',
    service ? `*Послуга:* ${String(service)}` : '',
    budget ? `*Бюджет:* ${String(budget)}` : '',
    deadline ? `*Терміни:* ${String(deadline)}` : '',
    message ? `*Опис проекту:* ${String(message)}` : ''
  ].filter(Boolean).join('\n');

  const payload = JSON.stringify({
    chat_id: CHAT_ID,
    text: lines,
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
    timeout: 10000
  };

  try {
    const tgResp = await new Promise((resolve, reject) => {
      const r = https.request(options, (tgRes) => {
        let resp = '';
        tgRes.on('data', chunk => resp += chunk);
        tgRes.on('end', () => {
          if (!resp) return resolve({});
          try {
            return resolve(JSON.parse(resp));
          } catch (err) {
            return reject(new Error('Invalid JSON from Telegram'));
          }
        });
      });

      r.on('error', err => reject(err));
      r.on('timeout', () => {
        r.destroy();
        reject(new Error('Telegram request timed out'));
      });

      r.write(payload);
      r.end();
    });

    if (tgResp && tgResp.ok) {
      return res.status(200).json({ success: true, message: '✅ Заявку успішно відправлено!' });
    } else {
      const descr = (tgResp && tgResp.description) || 'Telegram API error';
      console.error('Telegram error:', descr, tgResp);
      return res.status(500).json({ success: false, error: descr });
    }
  } catch (err) {
    console.error('send handler error:', err);
    return res.status(500).json({ success: false, error: 'Помилка при відправці заявки. Спробуйте пізніше.' });
  }
};
