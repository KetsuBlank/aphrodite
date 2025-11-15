// api/check-env.js
module.exports = async (req, res) => {
  // CORS — можно сузить origin по необходимости
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Поддерживаем оба варианта имён env (на случай, если раньше добавил другое имя)
  const token = process.env.TELEGRAM_TOKEN || process.env.TELEGRAM_BOT_TOKEN || null;
  const chatId = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID || null;

  console.log('Token exists:', !!token);
  console.log('Chat ID exists:', !!chatId);
  console.log('Token preview:', token ? String(token).substring(0, 10) + '...' : 'MISSING');

  const ready = !!token && !!chatId;

  return res.status(200).json({
    telegram_token: token ? `SET (${String(token).substring(0, 10)}...)` : 'MISSING',
    chat_id: chatId || 'MISSING',
    status: ready ? 'READY' : 'MISSING_VARS',
    message: ready ? 'Telegram налаштовано' : 'Telegram bot token або chat_id відсутні. Форма бронювання буде недоступна.'
  });
};
