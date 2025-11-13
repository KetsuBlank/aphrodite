module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, product, quantity, message } = req.body;
    
    console.log('Received booking:', { name, phone, email, product, quantity });

    // Валидация
    if (!name || !phone || !product) {
      return res.status(400).json({ 
        success: false, 
        error: 'Заповніть обовʼязкові поля: імʼя, телефон та товар' 
      });
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.error('Missing environment variables:', {
        token: !!TELEGRAM_TOKEN,
        chatId: !!CHAT_ID
      });
      return res.status(500).json({ 
        success: false, 
        error: 'Серверна помилка: не налаштовано отримання заявок' 
      });
    }

    // Формируем сообщение для Telegram
    const telegramMessage = `
🎯 *НОВА ЗАЯВКА НА БРОНЮВАННЯ*

👤 *Ім'я:* ${name}
📞 *Телефон:* ${phone}
📧 *Email:* ${email || 'Не вказано'}

🛍 *Товар:* ${product}
📦 *Кількість:* ${quantity || '1'}

💬 *Повідомлення:* ${message || 'Не вказано'}

⏰ *Час:* ${new Date().toLocaleString('uk-UA')}
    `;

    // Отправляем в Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: telegramMessage,
        parse_mode: 'Markdown'
      })
    });

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      console.error('Telegram API error:', telegramData);
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