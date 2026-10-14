// Vercel Function — приём заявки и отправка в Telegram
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, phone, dates, guests, comment } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Имя и телефон обязательны' });
    }

    // ↓↓↓ ТОКЕН БОТА И CHAT_ID СВЕТЛАНЫ ↓↓↓
    const TOKEN = '8903861291:AAE7TcM5t7JTiXa_NCUa5pDa6imaqwC8BgE';
    const CHAT_ID = '5295893096';

    const message = [
      '🏡 НОВАЯ ЗАЯВКА — svalex house',
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
      return res.status(500).json({ error: result.description });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}