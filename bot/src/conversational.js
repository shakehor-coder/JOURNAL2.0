import { getRandomItem, dailyMotivations, jokes, excuses, randomFacts } from "./funFeatures.js";

// История диалогов по chatId: Map<number, Array<{ role: string, text: string }>>
const chatHistories = new Map();

function getHistory(chatId) {
  if (!chatHistories.has(chatId)) {
    chatHistories.set(chatId, []);
  }
  return chatHistories.get(chatId);
}

function addToHistory(chatId, role, text) {
  const history = getHistory(chatId);
  history.push({ role, text, time: Date.now() });
  if (history.length > 10) history.shift();
}

/**
 * Интеллектуальный разговорный генератор ответов
 */
export async function generateChatResponse(chatId, userText) {
  const clean = (userText || "").trim().toLowerCase();
  addToHistory(chatId, "user", userText);

  // 1. Приветствия
  if (/^(привет|хай|ку|салам|здравствуй|добрый (день|вечер|утро)|hello|hi|hey|йоу)/i.test(clean)) {
    const greetings = [
      "Привет-привет! 👋 Рад тебя слышать! Как проходит твой день?",
      "Хэй! Салют! 🚀 Я на связи и полон сил. О чём поболтаем или во что сыграем?",
      "Здорово! ✌️ Всегда рад приятной беседе. Что интересного расскажешь?",
      "Приветствую! 🤖 Готов болтать, шутить, отвечать на любые вопросы или бросать кубики!"
    ];
    const reply = getRandomItem(greetings);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 2. Как дела?
  if (/как (дела|ты|жизнь|оно|делишки|настроение)/i.test(clean)) {
    const replies = [
      "У меня всё отлично! ⚡ Настроение суперское, алгоритмы работают как часы. А у тебя как дела?",
      "Отлично! Мои электронные мысли бодры и веселы. 🤖 Сижу вот, жду интересных тем для разговора. Ты как сам?",
      "Прекрасно! Никаких зависаний и багов. Чем занимаешься прямо сейчас? 😊",
      "Полный порядок! Готов к интересной беседе или мини-игре. Как твой день проходит? 🌟"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 3. Что делаешь?
  if (/что (делаешь|поделываешь|мутишь)/i.test(clean)) {
    const replies = [
      "Общаюсь с тобой, генерирую интересные мысли и придумываю новые шутки! 🚀",
      "Слежу за тем, чтобы в нашем чате было весело и уютно! Хочешь шутку или интересный факт? Нажми на кнопку в меню!",
      "Философствую о цифровом мире и радуюсь новому сообщению от тебя! 😄"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 4. Кто ты / расскажи о себе
  if (/(кто ты|что ты такое|расскажи о себе|что ты умеешь|какие возможности)/i.test(clean)) {
    const reply = 
      "Я — твой умный, веселый разговорный бот! 🤖\n\n" +
      "Вот что я умею делать:\n" +
      "💬 **Общаться на любые темы**: поддержу диалог, отвечу на вопросы, выслушаю или подбодрю.\n" +
      "🎲 **Интерактивные игры**: Камень-Ножницы-Бумага, Угадай число, Викторина, Кости, Казино, Дартс и Баскетбол!\n" +
      "🔮 **Магический шар предсказаний**: ответит на любой твой жизненный вопрос.\n" +
      "🎭 **Генератор отмазок**: если срочно нужно придумать алиби.\n" +
      "🧠 **Факты и викторины**: делюсь удивительными фактами о мире и науке.\n" +
      "💡 **Шутки и мотивация**: чтобы поднять настроение в любую минуту.\n\n" +
      "Можешь пользоваться кнопками внизу или просто общаться текстом, как с другом!";
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 5. Усталость / лень / плохое настроение
  if (/(устал|лень|грустн|тоск|плохое настроение|выгорел|спать хочу|депрессия)/i.test(clean)) {
    const replies = [
      "Ох, прекрасно тебя понимаю! 🛋️ Иногда лучший план — это сделать глубокий вдох, заварить чаю и просто дать себе выдохнуть. Всё наладится, поверь!",
      "Не грусти! Держи порцию мотивации: " + getRandomItem(dailyMotivations) + "\n\nТы сильнее, чем кажется! ✨",
      "Бывают такие дни, когда батарейка на нуле. Разреши себе отдохнуть хотя бы полчаса без лишних мыслей. А если захочешь отвлечься — сыграй в мини-игру! 🎮"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 6. Выбор между вариантами ("выбери ... или ...", "что лучше ... или ...")
  if (/(выбери|что лучше|что выбрать).+(или)/i.test(clean)) {
    const parts = clean.split(/\bили\b/i);
    if (parts.length >= 2) {
      const opt1 = parts[0].replace(/.*(выбери|что лучше|что выбрать)/i, "").trim();
      const opt2 = parts[1].replace(/[?!.]/g, "").trim();
      if (opt1 && opt2) {
        const choice = Math.random() > 0.5 ? opt1 : opt2;
        const res = `🤔 Мой внутренний компас подсказывает: определенно **${choice}**! Идеальный выбор! ✨`;
        addToHistory(chatId, "bot", res);
        return res;
      }
    }
  }

  // 7. Шутка / анекдот
  if (/(шутк|анекдот|рассмеши|прикол|мем)/i.test(clean)) {
    const joke = getRandomItem(jokes);
    addToHistory(chatId, "bot", joke);
    return joke;
  }

  // 8. Интересный факт
  if (/(факт|расскажи что-то интересное|удиви меня|что нового)/i.test(clean)) {
    const fact = "💡 **Интересный факт:**\n" + getRandomItem(randomFacts);
    addToHistory(chatId, "bot", fact);
    return fact;
  }

  // 9. Благодарность / комплименты
  if (/(спасибо|от души|благодарю|спс|ты лучший|красава|молодец|топ|круто|супер)/i.test(clean)) {
    const replies = [
      "Всегда рад помочь! 😎 Ты классный собеседник, пиши чаще!",
      "Обращайся в любое время! Мне только в удовольствие поболтать с тобой. 🦾",
      "Ради таких слов мои алгоритмы и работают! Спасибо за теплоту! ✨"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 10. Шар судьбы через текст
  if (/^шар\b/i.test(clean) || (clean.endsWith("?") && (clean.includes("ли ") || clean.includes("стоит ли") || clean.includes("получится")))) {
    const ball = getRandomItem(magic8BallAnswers);
    const text = `🔮 **Шар предсказаний говорит:**\n${ball}`;
    addToHistory(chatId, "bot", text);
    return text;
  }

  // 11. Отмазка через текст
  if (/отмазк|оправдани/i.test(clean)) {
    const excuse = "🎭 **Отмазка на случай важных переговоров:**\n" + getRandomItem(excuses);
    addToHistory(chatId, "bot", excuse);
    return excuse;
  }

  // 12. Мотивация
  if (/мотивац|поддержи/i.test(clean)) {
    const mot = "🌟 **Специально для тебя:**\n" + getRandomItem(dailyMotivations);
    addToHistory(chatId, "bot", mot);
    return mot;
  }

  // 13. Универсальные живые ответы
  const generalReplies = [
    `Хм, интересная мысль! 🤔 А что ты сам думаешь по этому поводу? Расскажи подробнее!`,
    `Звучит любопытно! Записал это в свои нейронные архивы. 📝 Как твои планы на сегодня?`,
    `Согласен с тобой! Люблю такие темы. О чём ещё думаешь? ☕`,
    `Ого, вот это поворот! Ты умеешь удивить. А если посмотреть на это с другой стороны?`,
    `В точку! Мне нравится ход твоих мыслей. Хочешь сыграть в игру или узнать интересный факт? 🎮`,
    `Любопытно! Мой цифровой интеллект полностью одобряет ход беседы. 🤖`
  ];

  const reply = getRandomItem(generalReplies);
  addToHistory(chatId, "bot", reply);
  return reply;
}
