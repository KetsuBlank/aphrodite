module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;
  
  return res.status(200).json({ 
    telegram_token: token ? 'SET' : 'MISSING',
    chat_id: chatId ? 'SET' : 'MISSING',
    status: token && chatId ? 'READY' : 'MISSING_VARS'
  });
};