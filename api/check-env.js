// api/check-env.js
module.exports = async function handler(req, res) {
  // Простая CORS — если нужно, дополни origin конкретным доменом
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  const ready = !!token && !!chatId;

  return res.status(200).json({
    telegram_token: token ? `SET (${String(token).substring(0, 10)}...)` : 'MISSING',
    chat_id: chatId || 'MISSING',
    status: ready ? 'READY' : 'MISSING_VARS',
    message: ready ? 'Telegram налаштовано' : 'Telegram bot token або chat_id відсутні. Форма бронювання буде недоступна.'
  });
};
