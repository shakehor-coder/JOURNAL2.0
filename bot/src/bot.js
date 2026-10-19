import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import {
  magic8BallAnswers,
  excuses,
  jokes,
  dailyMotivations,
  randomFacts,
  quizQuestions,
  getRandomItem
} from "./funFeatures.js";
import { generateChatResponse } from "./conversational.js";

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error("❌ ОШИБКА: Токен Telegram-бота не найден в .env!");
  process.exit(1);
}

// Создаем экземпляр бота с long-polling
const bot = new TelegramBot(TOKEN, { polling: true });

// Хранилище сессий пользователей: Map<chatId, SessionState>
const userSessions = new Map();

function getSession(chatId) {
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      gameState: null
    });
  }
  return userSessions.get(chatId);
}

// Главная клавиатура бота (Reply Keyboard)
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "💬 Поболтать" }, { text: "🎲 Игры и развлечения" }],
      [{ text: "🔮 Шар судьбы" }, { text: "💡 Интересный факт" }],
      [{ text: "😂 Шутка / Анекдот" }, { text: "🎭 Генератор отмазок" }],
      [{ text: "🌟 Мотивация" }, { text: "🪙 Орёл или Решка" }]
    ],
    resize_keyboard: true,
    persistent: true
  }
};

console.log("==========================================");
console.log("🚀 Telegram-бот успешно запускается...");
console.log("==========================================");

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "друг";

  const welcomeText = 
    `👋 **Привет, ${firstName}!**\n\n` +
    `Я — твой умный, веселый разговорный бот! 🤖\n\n` +
    `✨ **Что я умею делать:**\n` +
    `• 💬 **Живое общение** — напиши мне любую мысль или вопрос в чат, я поддержу диалог, отвечу или пошучу!\n` +
    `• 🎲 **Интерактивные мини-игры** — Камень-Ножницы-Бумага, Угадай число, Викторины, Кости, Казино, Дартс, Баскетбол!\n` +
    `• 🔮 **Магический шар предсказаний** — ответит на любой твой вопрос (или просто начни сообщение с «Шар ...?»).\n` +
    `• 💡 **Удивительные факты и мотивация** — поделюсь интересными знаниями и подниму настрой.\n` +
    `• 🎭 **Генератор отмазок** — на случай, если нужно оправдание на все случаи жизни.\n` +
    `• 🪙 **Орёл или Решка** — помогу принять быстрое решение!\n\n` +
    `Выбирай действие на клавиатуре внизу или просто пиши мне в чат, как живому собеседнику! 🚀`;

  await bot.sendMessage(chatId, welcomeText, {
    parse_mode: "Markdown",
    ...mainKeyboard
  });
});

// Команда /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpText =
    `📖 **Справка по командам бота:**\n\n` +
    `🎮 **Игры и развлечения:**\n` +
    `• \`/game\` — меню всех мини-игр\n` +
    `• \`/rps\` — Камень-Ножницы-Бумага\n` +
    `• \`/guess\` — игра «Угадай число»\n` +
    `• \`/quiz\` — интересная викторина\n` +
    `• \`/dice\` — бросить игральный кубик\n` +
    `• \`/coin\` — подбросить монетку (Орёл/Решка)\n\n` +
    `🔮 **Фишки и приколы:**\n` +
    `• \`/ball вопрос\` — магический шар судьбы\n` +
    `• \`/joke\` — смешной анекдот или шутка\n` +
    `• \`/fact\` — необычный познавательный факт\n` +
    `• \`/excuse\` — эпичная отмазка\n` +
    `• \`/motivation\` — порция мотивации\n\n` +
    `💬 **Общение:**\n` +
    `Просто напиши мне любой текст, задай вопрос или спроси «Что лучше: чай или кофе?» — я с радостью отвечу!`;

  await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
});

// Меню мини-игр
async function sendGamesMenu(chatId) {
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✊✌️✋ Камень-Ножницы-Бумага", callback_data: "game_rps" }
        ],
        [
          { text: "🔢 Угадай число (1-100)", callback_data: "game_guess" },
          { text: "🧠 Интеллект-Викторина", callback_data: "game_quiz" }
        ],
        [
          { text: "🎲 Бросить кубик", callback_data: "game_dice" },
          { text: "🎰 Игровой автомат", callback_data: "game_slot" }
        ],
        [
          { text: "🎯 Дартс", callback_data: "game_darts" },
          { text: "🏀 Баскетбол", callback_data: "game_basket" }
        ],
        [
          { text: "⚽ Футбол", callback_data: "game_football" }
        ]
      ]
    }
  };

  await bot.sendMessage(
    chatId,
    `🎮 **Игровой зал!**\nВыбирай игру и проверь свою удачу:`,
    { parse_mode: "Markdown", ...inlineKeyboard }
  );
}

// Запуск Камень-Ножницы-Бумага
async function startRPS(chatId) {
  const inline = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✊ Камень", callback_data: "rps_rock" },
          { text: "✌️ Ножницы", callback_data: "rps_scissors" },
          { text: "✋ Бумага", callback_data: "rps_paper" }
        ]
      ]
    }
  };
  await bot.sendMessage(chatId, "✊✌️✋ **Камень, Ножницы, Бумага!**\nДелай свой ход:", {
    parse_mode: "Markdown",
    ...inline
  });
}

// Запуск игры "Угадай число"
function startGuessNumber(chatId) {
  const session = getSession(chatId);
  const target = Math.floor(Math.random() * 100) + 1;
  session.gameState = {
    type: "guess_number",
    target,
    attempts: 0
  };

  bot.sendMessage(
    chatId,
    `🔢 **Я загадал число от 1 до 100!**\nПопробуй угадать его. Просто пиши числа прямо сюда в чат!`
  );
}

// Запуск Викторины
async function startQuiz(chatId) {
  const q = getRandomItem(quizQuestions);
  const session = getSession(chatId);
  session.gameState = {
    type: "quiz",
    correctIndex: q.correctIndex,
    explanation: q.explanation
  };

  const buttons = q.options.map((opt, idx) => [{
    text: opt,
    callback_data: `quiz_${idx}`
  }]);

  await bot.sendMessage(chatId, `🧠 **Вопрос викторины:**\n\n${q.question}`, {
    reply_markup: { inline_keyboard: buttons }
  });
}

// Подбросить монетку
async function flipCoin(chatId) {
  const isHeads = Math.random() > 0.5;
  const result = isHeads ? "🦅 **ОРЁЛ!**" : "🪙 **РЕШКА!**";
  bot.sendChatAction(chatId, "typing");
  await bot.sendMessage(chatId, "🪙 Монетка крутится в воздухе...");
  setTimeout(() => {
    bot.sendMessage(chatId, `Выпало: ${result}`, { parse_mode: "Markdown" });
  }, 1000);
}

// Обработка inline кнопок (Callback Queries)
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = getSession(chatId);

  await bot.answerCallbackQuery(query.id);

  // Меню игр
  if (data === "game_rps") {
    return startRPS(chatId);
  }
  if (data === "game_guess") {
    return startGuessNumber(chatId);
  }
  if (data === "game_quiz") {
    return startQuiz(chatId);
  }
  if (data === "game_dice") {
    const diceMsg = await bot.sendDice(chatId, { emoji: "🎲" });
    const val = diceMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val >= 4 ? `🎉 Выпало **${val}**! Отличный бросок, удача на твоей стороне!` : `🎲 Выпало **${val}**. В следующий раз повезёт больше!`, { parse_mode: "Markdown" });
    }, 1500);
    return;
  }
  if (data === "game_slot") {
    const slotMsg = await bot.sendDice(chatId, { emoji: "🎰" });
    const val = slotMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val === 64 ? `💥 ДЖЕКПОТ 777! ТЫ СОРВАЛ БАНК! 💰💰💰` : `🎰 Неплохая попытка! Крутани ещё разок!`, { parse_mode: "Markdown" });
    }, 1500);
    return;
  }
  if (data === "game_darts") {
    const dartMsg = await bot.sendDice(chatId, { emoji: "🎯" });
    const val = dartMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val === 6 ? `🎯 ТОЧНО В ЯБЛОЧКО! 100 баллов из 100!` : `🎯 Очков выбито: ${val}. Отличная попытка!`);
    }, 1500);
    return;
  }
  if (data === "game_basket") {
    const bMsg = await bot.sendDice(chatId, { emoji: "🏀" });
    const val = bMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val >= 4 ? `🏀 ТОЧНОЕ ПОПАДАНИЕ В КОРЗИНУ! Красивый бросок!` : `🏀 Мимо кольца! Попробуй еще!`);
    }, 1500);
    return;
  }
  if (data === "game_football") {
    const fMsg = await bot.sendDice(chatId, { emoji: "⚽" });
    const val = fMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val >= 3 ? `⚽ ГООООООЛ! Мяч прямо в девятку! 🥅🔥` : `⚽ Вратарь отбил мяч! Ударь еще раз!`);
    }, 1500);
    return;
  }

  // Камень-ножницы-бумага
  if (data.startsWith("rps_")) {
    const userChoice = data.replace("rps_", "");
    const choices = ["rock", "scissors", "paper"];
    const botChoice = getRandomItem(choices);

    const names = { rock: "✊ Камень", scissors: "✌️ Ножницы", paper: "✋ Бумага" };
    let result = "";

    if (userChoice === botChoice) {
      result = "🤝 **Ничья!** Мы выбрали одинаково!";
    } else if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "scissors" && botChoice === "paper") ||
      (userChoice === "paper" && botChoice === "rock")
    ) {
      result = "🎉 **ТЫ ПОБЕДИЛ!** Отличная интуиция!";
    } else {
      result = "🤖 **Я победил!** Мой алгоритм прочитал твой ход!";
    }

    return bot.sendMessage(
      chatId,
      `Ты выбрал: ${names[userChoice]}\nЯ выбрал: ${names[botChoice]}\n\n${result}`,
      { parse_mode: "Markdown" }
    );
  }

  // Викторина
  if (data.startsWith("quiz_")) {
    const chosenIndex = parseInt(data.replace("quiz_", ""), 10);
    if (!session.gameState || session.gameState.type !== "quiz") {
      return bot.sendMessage(chatId, "Этот вопрос уже неактивен. Начни новый через команду /quiz!");
    }

    const { correctIndex, explanation } = session.gameState;
    session.gameState = null;

    if (chosenIndex === correctIndex) {
      return bot.sendMessage(
        chatId,
        `🎉 **Абсолютно верно!**\n\n💡 *Пояснение:* ${explanation}`,
        { parse_mode: "Markdown" }
      );
    } else {
      return bot.sendMessage(
        chatId,
        `❌ **Не совсем так!**\n\n💡 *Правильный ответ:* ${explanation}`,
        { parse_mode: "Markdown" }
      );
    }
  }
});

// Обработка текстовых сообщений
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Игнорируем не-текстовые сообщения
  if (!text) return;

  const session = getSession(chatId);

  // 1. Проверяем, находится ли пользователь в игре "Угадай число"
  if (session.gameState && session.gameState.type === "guess_number") {
    const num = parseInt(text.trim(), 10);
    if (!isNaN(num)) {
      session.gameState.attempts++;
      const target = session.gameState.target;
      if (num === target) {
        const att = session.gameState.attempts;
        session.gameState = null;
        return bot.sendMessage(
          chatId,
          `🎉 **ПОЗДРАВЛЯЮ! ТЫ УГАДАЛ!** 🥳\nЭто действительно было число **${target}**!\nКоличество попыток: **${att}**. Сыграем еще? 🎲`,
          { parse_mode: "Markdown" }
        );
      } else if (num < target) {
        return bot.sendMessage(chatId, `⬆️ **Моё число БОЛЬШЕ**, чем ${num}! Попробуй ещё:`);
      } else {
        return bot.sendMessage(chatId, `⬇️ **Моё число МЕНЬШЕ**, чем ${num}! Попробуй ещё:`);
      }
    }
  }

  // 2. Обработка кнопок главного меню
  if (text === "💬 Поболтать") {
    return bot.sendMessage(
      chatId,
      "Я всегда готов поболтать! Расскажи, как твои дела, что интересного произошло за сегодня или о чём думаешь? Я внимательно слушаю! 😊"
    );
  }

  if (text === "🎲 Игры и развлечения" || text === "/game") {
    return sendGamesMenu(chatId);
  }

  if (text === "/rps") {
    return startRPS(chatId);
  }

  if (text === "/guess") {
    return startGuessNumber(chatId);
  }

  if (text === "/quiz") {
    return startQuiz(chatId);
  }

  if (text === "🪙 Орёл или Решка" || text === "/coin") {
    return flipCoin(chatId);
  }

  if (text === "🔮 Шар судьбы" || text.startsWith("/ball")) {
    const question = text.replace("/ball", "").replace("🔮 Шар судьбы", "").trim();
    const answer = getRandomItem(magic8BallAnswers);
    if (question) {
      return bot.sendMessage(chatId, `🔮 **Вопрос:** «${question}»\n\n${answer}`, { parse_mode: "Markdown" });
    }
    return bot.sendMessage(
      chatId,
      `🔮 **Магический шар судьбы ждёт твоего вопроса!**\nСпроси о чём угодно в чате, например:\n«*Шар, повезёт ли мне сегодня?*» или нажми на шар ещё раз!\n\n${answer}`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "💡 Интересный факт" || text === "/fact") {
    const fact = getRandomItem(randomFacts);
    return bot.sendMessage(chatId, `💡 **Знаете ли вы?**\n\n${fact}`, { parse_mode: "Markdown" });
  }

  if (text === "🎭 Генератор отмазок" || text === "/excuse") {
    const excuse = getRandomItem(excuses);
    return bot.sendMessage(
      chatId,
      `🎭 **Отмазка от бота:**\n\n«${excuse}»\n\n*Используй с невозмутимым лицом!* 😎`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "😂 Шутка / Анекдот" || text === "/joke") {
    const joke = getRandomItem(jokes);
    return bot.sendMessage(chatId, joke, { parse_mode: "Markdown" });
  }

  if (text === "🌟 Мотивация" || text === "/motivation") {
    const mot = getRandomItem(dailyMotivations);
    return bot.sendMessage(chatId, `🌟 **Мотивация для тебя:**\n\n${mot}`, { parse_mode: "Markdown" });
  }

  // 3. Обычный разговорный диалог с ботом
  bot.sendChatAction(chatId, "typing");
  const response = await generateChatResponse(chatId, text);
  return bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
});

// Обработка ошибок polling
bot.on("polling_error", (error) => {
  console.error("[Polling Error]:", error.code, error.message);
});

console.log("✅ Разговорный Telegram-бот успешно запущен и ожидает сообщений!");
