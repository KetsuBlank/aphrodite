const https = require('https');

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  try {
    const { name, email, phone, product, quantity, message } = req.body;

    // Валидация обязательных полей
    if (!name || !phone || !product) {
      return res.status(400).json({ 
        success: false, 
        error: 'Заповніть обовʼязкові поля: імʼя, телефон та товар' 
      });
    }

    // Проверка переменных окружения
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.log('Missing environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Бот не настроен' 
      });
    }

    // Формируем сообщение для Telegram - ИСПРАВЛЕНО!
    const telegramMessage = `
🎯 *НОВА ЗАЯВКА НА БРОНЮВАННЯ*

👤 *Ім'я:* ${name || 'Не вказано'}
📞 *Телефон:* ${phone || 'Не вказано'}
📧 *Email:* ${email || 'Не вказано'}

🛍 *Товар:* ${product || 'Не вказано'}
📦 *Кількість:* ${quantity || '1'}

💬 *Повідомлення:* ${message || 'Не вказано'}

⏰ *Час:* ${new Date().toLocaleString('uk-UA')}
    `;

    // Отправка в Telegram
    const telegramResponse = await sendToTelegram(TELEGRAM_TOKEN, CHAT_ID, telegramMessage);

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResponse);
      return res.status(500).json({ 
        success: false, 
        error: 'Помилка відправки повідомлення' 
      });
    }

    console.log('Booking successfully sent to Telegram');
    
    return res.status(200).json({ 
      success: true,
      message: 'Заявку успішно відправлено! Ми звʼяжемося з вами найближчим часом.'
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Внутрішня помилка сервера' 
    });
  }
};

// Функция отправки в Telegram
function sendToTelegram(token, chatId, message) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}