const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({
      success: false,
      error: '⚠️ Telegram bot не налаштований. Будь ласка, перевірте TELEGRAM_TOKEN та CHAT_ID.'
    });
  }

  const { name, email, phone, service, budget, deadline, message } = req.body;

  if (!name || !phone || !service) {
    return res.status(400).json({
      success: false,
      error: 'Будь ласка, заповніть обовʼязкові поля: імʼя, телефон та послуга.'
    });
  }

  const text = `
Нова заявка на послугу:
Імʼя: ${name}
Email: ${email || 'не вказано'}
Телефон: ${phone}
Послуга: ${service}
Бюджет: ${budget || 'не вказано'}
Терміни: ${deadline || 'не вказано'}
Повідомлення: ${message || 'немає'}
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });

    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: '✅ Заявку успішно відправлено!' });
    } else {
      return res.status(500).json({ success: false, error: data.description || 'Помилка відправки в Telegram.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Помилка сервера. Спробуйте пізніше.' });
  }
};
