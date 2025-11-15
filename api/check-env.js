// Проверка наличия переменных окружения для Telegram
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  return res.status(200).json({ 
    telegram_token: token ? 'SET (' + token.substring(0, 10) + '...)' : 'MISSING',
    chat_id: chatId || 'MISSING',
    status: token && chatId ? 'READY' : 'MISSING_VARS'
  });
};
