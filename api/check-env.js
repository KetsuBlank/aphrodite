// api/check-env.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;
  
  console.log('Token exists:', !!token);
  console.log('Chat ID exists:', !!chatId);
  
  // Проверим формат токена (первые 10 символов)
  console.log('Token preview:', token ? token.substring(0, 10) + '...' : 'MISSING');
  
  return res.status(200).json({ 
    telegram_token: token ? 'SET (' + token.substring(0, 10) + '...)' : 'MISSING',
    chat_id: chatId || 'MISSING',
    status: token && chatId ? 'READY' : 'MISSING_VARS'
  });
};