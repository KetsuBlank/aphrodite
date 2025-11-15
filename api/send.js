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
    let body = '';
    
    // Собираем тело запроса
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { name, email, phone, product, quantity, message } = data;

        // Валидация
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
          console.error('Missing environment variables');
          return res.status(500).json({ 
            success: false, 
            error: 'Бот не настроен' 
          });
        }

        // Формируем сообщение
        const telegramMessage = `
🎯 НОВА ЗАЯВКА НА БРОНЮВАННЯ

👤 Ім'я: ${name}
📞 Телефон: ${phone}
📧 Email: ${email || 'Не вказано'}

🛍 Товар: ${product}
📦 Кількість: ${quantity || '1'}

💬 Повідомлення: ${message || 'Не вказано'}

⏰ Час: ${new Date().toLocaleString('uk-UA')}
        `.trim();

        console.log('Sending to Telegram:', telegramMessage);

        // Отправка в Telegram
        const telegramResponse = await sendToTelegram(TELEGRAM_TOKEN, CHAT_ID, telegramMessage);

        if (telegramResponse.ok) {
          console.log('✅ Booking sent successfully');
          return res.status(200).json({ 
            success: true,
            message: 'Заявку успішно відправлено! Ми звʼяжемося з вами найближчим часом.'
          });
        } else {
          console.error('❌ Telegram error:', telegramResponse);
          return res.status(500).json({ 
            success: false, 
            error: 'Помилка відправки повідомлення' 
          });
        }

      } catch (parseError) {
        console.error('Parse error:', parseError);
        return res.status(400).json({ 
          success: false, 
          error: 'Неверный формат данных' 
        });
      }
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
      parse_mode: 'HTML'
    });
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
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