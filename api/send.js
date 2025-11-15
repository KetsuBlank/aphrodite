const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, error: 'Telegram bot не налаштований' });
  }

  const { name, email, phone, service, budget, deadline, message } = req.body;

  // УБРАНА ПРОВЕРКА НА ОБЯЗАТЕЛЬНЫЕ ПОЛЯ КАК В РАБОЧЕМ ВАРИАНТЕ
  const text = `
🎬 Нова заявка з ВЕТРИНА COSMETICS!

Ім'я: ${name}
Email: ${email || 'не вказано'}
Телефон: ${phone || 'не вказано'}
Товар: ${service}
Кількість: ${budget || 'не вказано'}
Повідомлення:
${message}
  `.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Заявку успішно відправлено!' });
    } else {
      return res.status(500).json({ success: false, error: 'Помилка відправки в Telegram' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Помилка сервера' });
  }
};