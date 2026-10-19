import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import {
  APPLICATION_KEY,
  loginToCloud,
  getUserProfile,
  getSchedule,
  getHomeworks,
  getMarks,
  demoData
} from "./cloudApi.js";
import {
  magic8BallAnswers,
  excuses,
  itJokes,
  dailyMotivations,
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
// { token, profile, isDemo, waitingForLogin, gameState: { type, target, attempts, score } }
const userSessions = new Map();

function getSession(chatId) {
  if (!userSessions.has(chatId)) {
    userSessions.set(chatId, {
      token: null,
      profile: null,
      isDemo: true, // По умолчанию включен демо-режим, пока студент не залогинился
      waitingForLogin: false,
      gameState: null
    });
  }
  return userSessions.get(chatId);
}

// Главная клавиатура бота (Reply Keyboard)
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: "📅 Расписание" }, { text: "📚 Домашка" }],
      [{ text: "🏆 Оценки" }, { text: "💰 Баланс коинов" }],
      [{ text: "🎲 Игры и развлечения" }, { text: "🔮 Шар судьбы" }],
      [{ text: "🎭 Отмазка для препода" }, { text: "💡 Мотивация / Шутка" }],
      [{ text: "👤 Мой профиль" }, { text: "🔑 Войти в Клауд" }]
    ],
    resize_keyboard: true,
    persistent: true
  }
};

console.log("==========================================");
console.log("🚀 FlipClip Telegram Bot запускается...");
console.log(`🔑 Application Key Клауда: ${APPLICATION_KEY.slice(0, 10)}...`);
console.log("==========================================");

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || "друг";
  const session = getSession(chatId);

  const welcomeText = 
    `👋 **Привет, ${firstName}!**\n\n` +
    `Я — **FlipClip** 🤖, твой разговорный бот и умный спутник студента Компьютерной Академии ТОП!\n\n` +
    `✨ **Что я умею:**\n` +
    `• 💬 **Обычное живое общение** — напиши мне любую мысль, вопрос, шутку, и я поддержу диалог!\n` +
    `• 🎓 **Связь с «Клаудом» (MyStat)** по ключу приложения \`${APPLICATION_KEY.slice(0, 12)}...\` — расписание, домашки, оценки и баланс StepCoins!\n` +
    `• 🎲 **Прикольные возможности** — игры (камень-ножницы-бумага, угадай число, викторины, дайс), шар предсказаний и генератор отмазок от пар!\n\n` +
    `⚡ Сейчас активен **Демо-режим Клауда** (ты уже можешь протестировать кнопки расписания и оценок). Чтобы подключить свой реальный дневник, нажми **«🔑 Войти в Клауд»**.\n\n` +
    `Выбирай действие на клавиатуре внизу или просто пиши мне в чат! 🚀`;

  await bot.sendMessage(chatId, welcomeText, {
    parse_mode: "Markdown",
    ...mainKeyboard
  });
});

// Команда /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpText =
    `📖 **Справка по командам FlipClip:**\n\n` +
    `🎓 **Клауд (Дневник Академии ТОП):**\n` +
    `• \`/schedule\` — пары на сегодня\n` +
    `• \`/hw\` — текущие домашние задания\n` +
    `• \`/marks\` — успеваемость и оценки\n` +
    `• \`/coins\` — баланс коинов и кристаллов\n` +
    `• \`/profile\` — профиль студента\n` +
    `• \`/login логин пароль\` — вход в свой реальный Клауд\n` +
    `• \`/demo\` — переключиться в демо-режим\n` +
    `• \`/logout\` — выйти из аккаунта\n\n` +
    `🎲 **Приколы и игры:**\n` +
    `• \`/game\` — меню мини-игр\n` +
    `• \`/ball вопрос\` — магический шар предсказаний\n` +
    `• \`/excuse\` — эпичная отмазка перед преподавателем\n` +
    `• \`/joke\` — IT-анекдот\n` +
    `• \`/quiz\` — IT-викторина\n` +
    `• \`/dice\` — бросить интерактивный кубик\n\n` +
    `💬 Или просто напиши мне любой текст, я отвечу как живой собеседник!`;

  await bot.sendMessage(chatId, helpText, { parse_mode: "Markdown" });
});

// Меню игр и развлечений
async function sendGamesMenu(chatId) {
  const inlineKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "✊✌️✋ Камень-Ножницы-Бумага", callback_data: "game_rps" }
        ],
        [
          { text: "🔢 Угадай число (1-100)", callback_data: "game_guess" },
          { text: "🧠 IT-Викторина", callback_data: "game_quiz" }
        ],
        [
          { text: "🎲 Бросить кубик", callback_data: "game_dice" },
          { text: "🎰 Игровой автомат", callback_data: "game_slot" }
        ],
        [
          { text: "🎯 Дартс", callback_data: "game_darts" },
          { text: "🏀 Баскетбол", callback_data: "game_basket" }
        ]
      ]
    }
  };

  await bot.sendMessage(
    chatId,
    `🎮 **Игровой зал FlipClip!**\nВыбирай игру по вкусу и проверь свою удачу:`,
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

// Запуск Угадай число
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
    `🔢 **Я загадал число от 1 до 100!**\nПопробуй угадать его за наименьшее число попыток. Просто пиши числа прямо сюда в чат:`
  );
}

// Запуск IT-викторины
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

  await bot.sendMessage(chatId, `🧠 **IT-Викторина:**\n\n${q.question}`, {
    reply_markup: { inline_keyboard: buttons }
  });
}

// Обработка inline кнопок (Callback Queries)
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = getSession(chatId);

  await bot.answerCallbackQuery(query.id);

  // 1. Меню игр
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
      bot.sendMessage(chatId, val >= 4 ? `🎉 Выпало **${val}**! Отличный бросок, удача с тобой!` : `🎲 Выпало **${val}**. В следующий раз повезёт больше!`, { parse_mode: "Markdown" });
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
      bot.sendMessage(chatId, val === 6 ? `🎯 ТОЧНО В ЯБЛОЧКО! 100 баллов из 100!` : `🎯 Очков выбито: ${val}. Меткость тренируется практикой!`);
    }, 1500);
    return;
  }
  if (data === "game_basket") {
    const bMsg = await bot.sendDice(chatId, { emoji: "🏀" });
    const val = bMsg.dice.value;
    setTimeout(() => {
      bot.sendMessage(chatId, val >= 4 ? `🏀 ЧИСТЫЙ ТРЁХОЧКОВЫЙ! Красивый бросок!` : `🏀 Мимо кольца! Попробуй еще!`);
    }, 1500);
    return;
  }

  // 2. Камень-ножницы-бумага
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
      result = "🤖 **Я победил!** Мой искусственный интеллект просчитал твой ход!";
    }

    return bot.sendMessage(
      chatId,
      `Ты выбрал: ${names[userChoice]}\nЯ выбрал: ${names[botChoice]}\n\n${result}`,
      { parse_mode: "Markdown" }
    );
  }

  // 3. Ответ на викторину
  if (data.startsWith("quiz_")) {
    const chosenIndex = parseInt(data.replace("quiz_", ""), 10);
    if (!session.gameState || session.gameState.type !== "quiz") {
      return bot.sendMessage(chatId, "Этот вопрос уже неактивен. Запусти новый через /quiz!");
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

// Команда /schedule или кнопка "📅 Расписание"
async function handleSchedule(chatId) {
  const session = getSession(chatId);

  if (!session.token) {
    // Показываем демо-расписание
    const schedule = demoData.scheduleToday;
    let text = `📅 **Расписание занятий на сегодня (Демо):**\n\n`;
    schedule.forEach((p) => {
      text += `⏱ **${p.number} пара (${p.time})**\n`;
      text += `📖 **${p.subject}**\n`;
      text += `👨‍🏫 Преподаватель: ${p.teacher}\n`;
      text += `🚪 ${p.room} • ${p.type}\n\n`;
    });
    text += `💡 *Чтобы видеть ваши личные пары, авторизуйтесь через «🔑 Войти в Клауд»!*`;
    return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  // Запрос в реальный API Клауда
  bot.sendChatAction(chatId, "typing");
  const res = await getSchedule(session.token);
  if (!res.success || !res.pairs.length) {
    return bot.sendMessage(
      chatId,
      `📅 **На сегодня занятий нет!** Можно отдохнуть или дописать домашку. 🎉`
    );
  }

  let text = `📅 **Ваше расписание на сегодня:**\n\n`;
  res.pairs.forEach((p, idx) => {
    const num = p.lesson || p.number || (idx + 1);
    const time = (p.started_at && p.finished_at) ? `${p.started_at} - ${p.finished_at}` : (p.time || "");
    text += `⏱ **${num} пара ${time ? `(${time})` : ""}**\n`;
    text += `📖 **${p.subject_name || p.subject || "Предмет"}**\n`;
    if (p.teacher_name || p.teacher) text += `👨‍🏫 Преподаватель: ${p.teacher_name || p.teacher}\n`;
    if (p.room_name || p.room) text += `🚪 ${p.room_name || p.room}\n`;
    text += `\n`;
  });

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

// Команда /hw или кнопка "📚 Домашка"
async function handleHomework(chatId) {
  const session = getSession(chatId);

  if (!session.token) {
    const hwList = demoData.homeworks;
    let text = `📚 **Домашние задания (Демо-режим):**\n\n`;
    hwList.forEach((hw, i) => {
      const statusIcon = hw.status === "submitted" ? "✅" : "⏳";
      text += `${statusIcon} **${i + 1}. ${hw.subject}**\n`;
      text += `📝 Тема: ${hw.theme}\n`;
      text += `⏰ Дедлайн: ${hw.deadline}\n\n`;
    });
    text += `💡 *Авторизуйтесь через «🔑 Войти в Клауд», чтобы видеть ваши реальные ДЗ из MyStat!*`;
    return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  bot.sendChatAction(chatId, "typing");
  const res = await getHomeworks(session.token);
  if (!res.success || !res.homeworks.length) {
    return bot.sendMessage(chatId, `📚 **Все домашние задания выполнены!** Красава! 🥳`);
  }

  let text = `📚 **Ваши домашние задания из Клауда:**\n\n`;
  res.homeworks.slice(0, 5).forEach((hw, i) => {
    text += `📌 **${i + 1}. ${hw.subject_name || "Предмет"}**\n`;
    text += `📝 ${hw.theme || hw.comment || "Без описания"}\n`;
    if (hw.completion_date) text += `⏰ Срок: ${hw.completion_date}\n`;
    text += `\n`;
  });

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

// Команда /marks или кнопка "🏆 Оценки"
async function handleMarks(chatId) {
  const session = getSession(chatId);

  if (!session.token) {
    const marks = demoData.marks;
    let text = `🏆 **Успеваемость и оценки (Демо):**\n\n`;
    marks.forEach((m) => {
      text += `⭐️ **${m.mark}/12** — ${m.subject} (${m.type}, ${m.date})\n`;
    });
    text += `\n📊 **Средний балл:** 11.8 / 12 (Отличник) 🥇\n`;
    text += `💡 *Для реальных оценок выполните «🔑 Войти в Клауд».*`;
    return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  bot.sendChatAction(chatId, "typing");
  const res = await getMarks(session.token);
  if (!res.success || !res.marks.length) {
    return bot.sendMessage(chatId, `🏆 Оценок пока не найдено.`);
  }

  let text = `🏆 **Последние оценки из Клауда:**\n\n`;
  res.marks.slice(0, 8).forEach((m) => {
    const val = m.mark || m.value || "—";
    text += `⭐️ **${val}/12** — ${m.subject_name || m.lesson_name || "Дисциплина"}\n`;
  });

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

// Команда /coins или кнопка "💰 Баланс коинов"
async function handleCoins(chatId) {
  const session = getSession(chatId);

  if (!session.token) {
    const p = demoData.profile;
    const text = 
      `💰 **Баланс MyStat / Cloud (Демо):**\n\n` +
      `🪙 **StepCoins:** ${p.coins} коинов\n` +
      `💎 **Кристаллы:** ${p.gems} кристаллов\n` +
      `🎖 **Уровень:** ${p.level} (${p.levelTitle})\n` +
      `🥇 **Место в группе:** #${p.rank}\n\n` +
      `💡 *Войдите в свой аккаунт, чтобы проверить актуальный баланс!*`;
    return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  bot.sendChatAction(chatId, "typing");
  const res = await getUserProfile(session.token);
  if (!res.success) {
    return bot.sendMessage(chatId, `Не удалось получить данные о коинах: ${res.error}`);
  }

  const p = res.profile;
  const text = 
    `💰 **Твой баланс в Академии ТОП:**\n\n` +
    `🪙 **StepCoins:** ${p.coins} коинов\n` +
    `💎 **Кристаллы:** ${p.gems} кристаллов\n` +
    `📊 **Средний балл:** ${p.averageGrade}\n` +
    `📈 **Посещаемость:** ${p.attendance}%\n\n` +
    `Продолжай в том же духе! 🚀`;

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

// Профиль студента
async function handleProfile(chatId) {
  const session = getSession(chatId);
  const p = session.profile || demoData.profile;
  const isDemo = !session.token;

  const text =
    `👤 **Профиль студента ${isDemo ? "(Демо)" : ""}:**\n\n` +
    `📛 **ФИО:** ${p.fullName}\n` +
    `👥 **Группа:** ${p.group}\n` +
    `🏢 **Филиал:** ${p.branch}\n` +
    `🪙 **StepCoins:** ${p.coins} | 💎 **Кристаллы:** ${p.gems}\n` +
    `📊 **Средний балл:** ${p.averageGrade || 11.5} / 12\n` +
    `🔑 **Статус:** ${isDemo ? "Демо-режим" : "✅ Подключен к Клауду"}\n\n` +
    (isDemo ? "💡 *Нажми «🔑 Войти в Клауд», чтобы подключить свой личный аккаунт!*" : "");

  return bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
}

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

  // 2. Проверяем режим ожидания логина
  if (session.waitingForLogin) {
    session.waitingForLogin = false;
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) {
      const username = parts[0];
      const password = parts.slice(1).join(" ");
      bot.sendChatAction(chatId, "typing");
      bot.sendMessage(chatId, "⏳ Подключаюсь к Клауду Академии ТОП...");

      const loginRes = await loginToCloud(username, password);
      if (loginRes.success) {
        session.token = loginRes.token;
        session.profile = loginRes.profile;
        session.isDemo = false;

        return bot.sendMessage(
          chatId,
          `✅ **Успешный вход в Клауд!**\n\nДобро пожаловать, **${loginRes.profile.fullName}**!\nГруппа: **${loginRes.profile.group}**\nФилиал: **${loginRes.profile.branch}**\n\nТеперь ты можешь смотреть свои реальные пары, оценки и домашки через кнопки меню! 🚀`,
          { parse_mode: "Markdown", ...mainKeyboard }
        );
      } else {
        return bot.sendMessage(
          chatId,
          `❌ **Ошибка авторизации:** ${loginRes.error}\n\nПроверь логин и пароль от MyStat / Cloud и попробуй снова через команду:\n\`/login логин пароль\`\n(Или продолжай пользоваться Демо-режимом)`,
          { parse_mode: "Markdown" }
        );
      }
    } else {
      return bot.sendMessage(
        chatId,
        `⚠️ Нужно указать логин и пароль через пробел, например:\n\`ivanov_i 123456\`\nЛибо отправь команду:\n\`/login ivanov_i 123456\``,
        { parse_mode: "Markdown" }
      );
    }
  }

  // 3. Обработка кнопок главного меню
  if (text === "📅 Расписание" || text === "/schedule") {
    return handleSchedule(chatId);
  }

  if (text === "📚 Домашка" || text === "/hw") {
    return handleHomework(chatId);
  }

  if (text === "🏆 Оценки" || text === "/marks") {
    return handleMarks(chatId);
  }

  if (text === "💰 Баланс коинов" || text === "/coins") {
    return handleCoins(chatId);
  }

  if (text === "👤 Мой профиль" || text === "/profile") {
    return handleProfile(chatId);
  }

  if (text === "🎲 Игры и развлечения" || text === "/game") {
    return sendGamesMenu(chatId);
  }

  if (text === "🔮 Шар судьбы" || text.startsWith("/ball")) {
    const question = text.replace("/ball", "").replace("🔮 Шар судьбы", "").trim();
    const answer = getRandomItem(magic8BallAnswers);
    if (question) {
      return bot.sendMessage(chatId, `🔮 **Вопрос:** «${question}»\n\n${answer}`, { parse_mode: "Markdown" });
    }
    return bot.sendMessage(
      chatId,
      `🔮 **Шар судьбы ждёт твоего вопроса!**\nСпроси о чём угодно в чате, например:\n«*Шар, сдам ли я экзамен?*» или нажми на шар снова!\n\n${answer}`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "🎭 Отмазка для препода" || text === "/excuse") {
    const excuse = getRandomItem(excuses);
    return bot.sendMessage(
      chatId,
      `🎭 **Отмазка от FlipClip:**\n\n«${excuse}»\n\n*Используй с уверенным лицом!* 😎`,
      { parse_mode: "Markdown" }
    );
  }

  if (text === "💡 Мотивация / Шутка" || text === "/joke") {
    const item = Math.random() > 0.5 ? getRandomItem(dailyMotivations) : getRandomItem(itJokes);
    return bot.sendMessage(chatId, item, { parse_mode: "Markdown" });
  }

  if (text === "🔑 Войти в Клауд") {
    session.waitingForLogin = true;
    return bot.sendMessage(
      chatId,
      `🔑 **Вход в Cloud / MyStat Академии ТОП**\n\nПришли свой **логин** и **пароль** одним сообщением через пробел:\nПример: \`ivanov_i MySecretPass123\`\n\n🔒 *Бот безопасно авторизуется через официальный шлюз по ключу приложения*\n\nДля отмены напиши «отмена».`,
      { parse_mode: "Markdown" }
    );
  }

  if (text.startsWith("/login")) {
    const parts = text.replace("/login", "").trim().split(/\s+/);
    if (parts.length >= 2) {
      const [username, password] = parts;
      bot.sendChatAction(chatId, "typing");
      bot.sendMessage(chatId, "⏳ Авторизуюсь в Клауде...");

      const loginRes = await loginToCloud(username, password);
      if (loginRes.success) {
        session.token = loginRes.token;
        session.profile = loginRes.profile;
        session.isDemo = false;
        return bot.sendMessage(
          chatId,
          `✅ **Авторизация успешна!** Привет, ${loginRes.profile.fullName}!`,
          { parse_mode: "Markdown", ...mainKeyboard }
        );
      } else {
        return bot.sendMessage(chatId, `❌ ${loginRes.error}`);
      }
    } else {
      return bot.sendMessage(chatId, `Использование: \`/login логин пароль\``, { parse_mode: "Markdown" });
    }
  }

  if (text === "/demo") {
    session.token = null;
    session.isDemo = true;
    return bot.sendMessage(chatId, "✨ Включен демонстрационный режим Клауда!", mainKeyboard);
  }

  if (text === "/logout") {
    session.token = null;
    session.profile = null;
    session.isDemo = true;
    return bot.sendMessage(chatId, "🚪 Вы вышли из аккаунта. Включен Демо-режим.", mainKeyboard);
  }

  // 4. Обычный разговорный диалог с ботом
  bot.sendChatAction(chatId, "typing");
  const response = await generateChatResponse(chatId, text);
  return bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
});

// Обработка ошибок polling
bot.on("polling_error", (error) => {
  console.error("[Polling Error]:", error.code, error.message);
});

console.log("✅ FlipClip Telegram Bot успешно запущен и ожидает сообщений!");
