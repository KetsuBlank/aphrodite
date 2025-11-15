const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, error: 'Telegram bot не налаштований' });
  }

  const { name, email, phone, service, budget, deadline, message } = req.body;

  if (!name || !service || !message) {
    return res.status(400).json({ success: false, error: 'Обовʼязкові поля не заповнені' });
  }

  const text = `
Новий заказ:
Ім'я: ${name}
Email: ${email || 'не вказано'}
Телефон: ${phone || 'не вказано'}
Послуга: ${service}
Бюджет: ${budget || 'не вказано'}
Терміни: ${deadline || 'не вказано'}
Опис проекту:
${message}
`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    });

    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Заявку успішно відправлено!' });
    } else {
      return res.status(500).json({ success: false, error: data.description || 'Помил
