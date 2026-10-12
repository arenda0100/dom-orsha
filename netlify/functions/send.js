// Netlify Function — приём заявки и отправка в Telegram
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, phone, dates, guests, comment } = data;

    if (!name || !phone) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Имя и телефон обязательны' }) };
    }

    // ↓↓↓ ТОКЕН БОТА И CHAT_ID СВЕТЛАНЫ ↓↓↓
    const TOKEN = '8903861291:AAE7TcM5t7JTiXa_NCUa5pDa6imaqwC8BgE';
    const CHAT_ID = '5295893096';

    const message = [
      '🏡 НОВАЯ ЗАЯВКА — Дом на сутки',
      '',
      '👤 Имя: ' + name,
      '📞 Телефон: ' + phone,
      '📅 Даты: ' + (dates || '—'),
      '👥 Гостей: ' + (guests || '—'),
      '💬 Комментарий: ' + (comment || '—'),
      '',
      '⏰ ' + new Date().toLocaleString('ru-RU')
    ].join('\n');

    const url = 'https://api.telegram.org/bot' + TOKEN + '/sendMessage';

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram error:', result);
      return { statusCode: 500, body: JSON.stringify({ error: result.description }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};