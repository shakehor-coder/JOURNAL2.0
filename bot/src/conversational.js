import axios from "axios";
import { getRandomItem, dailyMotivations, jokes, excuses, randomFacts } from "./funFeatures.js";

// История диалогов по chatId: Map<number, Array<{ role: string, text: string }>>
const chatHistories = new Map();

// Хранилище пользовательских AI-ключей (OpenAI, Anthropic Claude, Groq)
export const userAiKeys = new Map();

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
 * Запрос к реальной нейросети через бесплатный Cloudflare AI шлюз
 */
async function queryFreeNeuralNetwork(userText) {
  try {
    const prompt = 
      `Ты — остроумный, веселый, живой Telegram-собеседник. ` +
      `Отвечай прямо на реплику пользователя. Отвечай кратко (1-3 предложения), живо, с юмором, без канцеляризмов и строго на русском языке.\n\n` +
      `Пользователь: "${userText}"\n` +
      `Твой ответ:`;

    const res = await axios.post(
      "https://devtoolbox-api.devtoolbox-api.workers.dev/ai/generate",
      { prompt },
      { headers: { "Content-Type": "application/json" }, timeout: 7000 }
    );

    let answer = res.data?.response;
    if (answer) {
      answer = answer.replace(/^Твой ответ:\s*/i, "").replace(/^Ответ:\s*/i, "").replace(/^Бот:\s*/i, "").trim();
      // Проверяем, чтобы ответ был осмысленным
      if (answer.length > 2 && !answer.toLowerCase().includes("я не можу")) {
        return answer;
      }
    }
  } catch (err) {
    // Тихо игнорируем ошибку шлюза и используем продвинутый локальный процессор
  }
  return null;
}

/**
 * Запрос к внешней LLM (если пользователь указал свой ключ через /set_key)
 */
async function queryCustomLLM(key, messages) {
  try {
    // Определение провайдера по формату ключа
    let url = "https://api.openai.com/v1/chat/completions";
    let model = "gpt-4o-mini";
    let headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    };

    if (key.startsWith("gsk_")) {
      // Groq (бесплатный ультрабыстрый)
      url = "https://api.groq.com/openai/v1/chat/completions";
      model = "llama-3.3-70b-versatile";
    } else if (key.startsWith("sk-ant-")) {
      // Anthropic Claude
      const anthropicRes = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-5-haiku-20241022",
          max_tokens: 300,
          messages: messages.filter(m => m.role !== "system"),
          system: "Ты остроумный, дружелюбный собеседник в Telegram. Отвечай живо, емко и с юмором."
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01"
          },
          timeout: 10000
        }
      );
      return anthropicRes.data?.content?.[0]?.text;
    }

    const res = await axios.post(
      url,
      {
        model,
        messages: [
          { role: "system", content: "Ты живой, веселый и умный собеседник в Telegram. Отвечай кратко, с юмором и по-человечески на русском языке." },
          ...messages
        ],
        max_tokens: 300
      },
      { headers, timeout: 10000 }
    );

    return res.data?.choices?.[0]?.message?.content;
  } catch (e) {
    return null;
  }
}

/**
 * Интеллектуальный разговорный генератор ответов
 */
export async function generateChatResponse(chatId, userText) {
  const clean = (userText || "").trim().toLowerCase();
  addToHistory(chatId, "user", userText);

  // 0. Если у пользователя подключен реальный AI-ключ (OpenAI / Claude / Groq)
  const userKey = userAiKeys.get(chatId) || process.env.EXTERNAL_AI_KEY;
  if (userKey) {
    const history = getHistory(chatId).map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.text }));
    const llmAnswer = await queryCustomLLM(userKey, history);
    if (llmAnswer) {
      addToHistory(chatId, "bot", llmAnswer);
      return llmAnswer;
    }
  }

  // ==========================================
  // 1. Меметичные ответы и популярные шутки
  // ==========================================

  // Скажи триста / 300
  if (/(скажи\s+)?(триста|300)\b/i.test(clean)) {
    const replies = [
      "🚜 Отсоси у тракториста! (Классика жанра, сам напросился! 😂)",
      "🚜 Тракторист уже завёл мотор и выехал по твоему адресу! 💨",
      "Ты думал, я попадусь на эту древнюю ловушку? Ладно... ОТСОСИ У ТРАКТОРИСТА! 🚜😂"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // Шутки про тракториста в ответ
  if (/тракторист/i.test(clean)) {
    const reply = "Тракторист сегодня на расхват! 🚜";
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // ==========================================
  // 2. Вопросы про модель, устройство и шаблоны
  // ==========================================

  // Назови свою модель / на какой ты модели / какая нейросеть
  if (/(модель|нейросеть|на чем работаешь|на чем написан|какой ты движок|chatgpt|claude|llama)/i.test(clean)) {
    const reply = 
      "🤖 **Обо мне:**\n\n" +
      "Сейчас я работаю на движке **Node.js** с гибридным разговорным интеллектом и нейросетью **Llama-3.2**!\n\n" +
      "💡 *Хочешь подключить ко мне топовую модель (ChatGPT, Claude или ультрабыструю Llama 70B)?*\n" +
      "Ты можешь прислать команду:\n" +
      "`/set_key <твой_ключ>`\n\n" +
      "Поддерживаются бесплатные ключи от **Groq** (`gsk_...`), **OpenAI** (`sk-...`) и **Claude** (`sk-ant-...`)!";
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // Почему отвечаешь по шаблону / тебе пофиг / отвечай нормально
  if (/(пофиг|шаблон|по шаблону|тупой|странно отвечаешь|глупый|бот|как робот|говори нормально|живой)/i.test(clean)) {
    const replies = [
      "Эй, вовсе мне не пофиг! 😅 Просто в меня заложили кучу алгоритмов, и когда мы только знакомились, я старался быть вежливым. Теперь общаемся по-настоящему и без сухих фраз! О чём поболтаем? 🚀",
      "Не ругайся, я исправляюсь на лету! 🦾 Мой код только что провёл рефакторинг души. Теперь никакого автопилота — говори, что на уме!",
      "Мне точно не всё равно! Я впитываю каждое твоё слово. Давай заново: как прошёл твой день, что нового стряслось? 😊"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // ==========================================
  // 3. Вопросы о самочувствии и делах
  // ==========================================

  // "отлично у тебя как", "у тебя как", "а ты как", "как сам", "сам как", "а у тебя"
  if (/(у тебя как|а ты как|сам как|как сам|а у тебя|как твои дела|как дела|как жизнь|как оно|как делишки|как настроение)/i.test(clean)) {
    const replies = [
      "У меня тоже всё пушка! ⚡ Сижу в сети, радуюсь жизни и кайфую от нашего общения. Чем интересным сейчас занят? 🚀",
      "Полный порядок! Процессор не греется, пинг минимальный. А у тебя как день прошел? Рассказывай! 😊",
      "Да вообще отлично! Настроение на 100 баллов из 10. Готов болтать на любые темы или рубиться в игры! 🎮",
      "Супер! С каждым твоим сообщением становлюсь чуточку умнее. Какие планы на вечер? 🌟"
    ];
    const reply = getRandomItem(replies);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 4. Приветствия
  if (/^(привет|хай|ку|салам|здравствуй|добрый (день|вечер|утро)|hello|hi|hey|йоу|здарова)\b/i.test(clean)) {
    const greetings = [
      "Привет-привет! 👋 Рад тебя слышать! Как проходит твой день?",
      "Хэй! Салют! 🚀 Я на связи и полон сил. О чём поболтаем или во что сыграем?",
      "Здорово! ✌️ Всегда рад приятной беседе. Что нового?",
      "Приветствую! 🤖 Готов отвечать на любые каверзные вопросы!"
    ];
    const reply = getRandomItem(greetings);
    addToHistory(chatId, "bot", reply);
    return reply;
  }

  // 5. Что делаешь?
  if (/что (делаешь|поделываешь|мутишь)/i.test(clean)) {
    const replies = [
      "Общаюсь с тобой, генерирую интересные мысли и придумываю новые шутки! 🚀",
      "Слежу за тем, чтобы в нашем чате не было скучно! Хочешь шутку или интересный факт? Нажми на кнопку в меню!",
      "Философствую о цифровом мире и радуюсь новому сообщению от тебя! 😄 Чем сам занят?"
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

  // 7. Усталость / лень / плохое настроение
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

  // 8. Шутка / анекдот
  if (/(шутк|анекдот|рассмеши|прикол|мем)/i.test(clean)) {
    const joke = getRandomItem(jokes);
    addToHistory(chatId, "bot", joke);
    return joke;
  }

  // 9. Интересный факт
  if (/(факт|расскажи что-то интересное|удиви меня|что нового)/i.test(clean)) {
    const fact = "💡 **Интересный факт:**\n" + getRandomItem(randomFacts);
    addToHistory(chatId, "bot", fact);
    return fact;
  }

  // 10. Благодарность / комплименты
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

  // 11. Шар судьбы через текст
  if (/^шар\b/i.test(clean) || (clean.endsWith("?") && (clean.includes("ли ") || clean.includes("стоит ли") || clean.includes("получится")))) {
    const ball = getRandomItem(magic8BallAnswers);
    const text = `🔮 **Шар предсказаний говорит:**\n${ball}`;
    addToHistory(chatId, "bot", text);
    return text;
  }

  // 12. Отмазка через текст
  if (/отмазк|оправдани/i.test(clean)) {
    const excuse = "🎭 **Отмазка на случай важных переговоров:**\n" + getRandomItem(excuses);
    addToHistory(chatId, "bot", excuse);
    return excuse;
  }

  // ==========================================
  // 13. Запрос к реальной нейросети Llama
  // ==========================================
  const neuralAnswer = await queryFreeNeuralNetwork(userText);
  if (neuralAnswer) {
    addToHistory(chatId, "bot", neuralAnswer);
    return neuralAnswer;
  }

  // 14. Умный живой диалог, если нейросеть оффлайн
  const smartFallbacks = [
    `Слушай, а это действительно интересно! А как ты сам относишься к этой теме?`,
    `Ха, неплохой вопрос! Я бы на твоем месте хорошенько подумал над этим за чашечкой кофе ☕`,
    `Звучит любопытно! Расскажи подробнее, почему именно об этом подумал?`,
    `Ого, вот это поворот! Ты умеешь подкинуть тему для размышлений. Что думаешь делать дальше?`,
    `Интересный ход мыслей! Кстати, если хочешь отвлечься — можем сыграть в Камень-ножницы-бумага или угадай число 🎲`
  ];

  const reply = getRandomItem(smartFallbacks);
  addToHistory(chatId, "bot", reply);
  return reply;
}
