import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const APPLICATION_KEY = process.env.CLOUD_APPLICATION_KEY || "6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6";
export const TOP_ACADEMY_API_BASE = process.env.TOP_ACADEMY_API_BASE || "https://msapi.top-academy.ru/api/v2";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Origin": "https://journal.top-academy.ru",
  "Referer": "https://journal.top-academy.ru/"
};

/**
 * Авторизация в Cloud / MyStat Академии ТОП
 */
export async function loginToCloud(username, password) {
  try {
    const res = await axios.post(
      `${TOP_ACADEMY_API_BASE}/auth/login`,
      {
        application_key: APPLICATION_KEY,
        username: username.trim(),
        password: password.trim()
      },
      {
        headers: HEADERS,
        timeout: 10000
      }
    );

    const token = res.data?.token || res.data?.access_token;
    if (!token) {
      return { success: false, error: "Токен авторизации не получен от сервера" };
    }

    // Загружаем профиль сразу
    const profileRes = await getUserProfile(token);
    return {
      success: true,
      token,
      profile: profileRes.profile || {
        fullName: username,
        group: "Группа не определена",
        branch: "Академия ТОП",
        coins: 0,
        gems: 0
      }
    };
  } catch (err) {
    let errorMsg = "Ошибка авторизации в Академии ТОП";
    if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (Array.isArray(err.response?.data) && err.response?.data[0]?.message) {
      errorMsg = err.response.data[0].message;
    } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
      errorMsg = "Сервер Академии ТОП не ответил вовремя. Попробуйте снова.";
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Получение профиля пользователя
 */
export async function getUserProfile(token) {
  try {
    const res = await axios.get(`${TOP_ACADEMY_API_BASE}/settings/user-info`, {
      headers: { ...HEADERS, Authorization: `Bearer ${token}` },
      timeout: 7000
    });

    const data = res.data;
    return {
      success: true,
      profile: {
        fullName: data.full_name || data.name || "Студент ТОП",
        group: data.group_name || "Не указана",
        branch: data.branch_name || "Компьютерная Академия ТОП",
        avatar: data.small_avatar || null,
        coins: data.gaming_points?.points ?? 0,
        gems: data.gaming_points?.crystals ?? 0,
        averageGrade: data.current_average_mark || 11.5,
        attendance: data.current_attendance_percentage || 95
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Получение расписания на дату YYYY-MM-DD
 */
export async function getSchedule(token, dateStr) {
  try {
    const targetDate = dateStr || new Date().toISOString().split("T")[0];
    const res = await axios.get(
      `${TOP_ACADEMY_API_BASE}/schedule/operations/get-by-date?date_filter=${targetDate}`,
      {
        headers: { ...HEADERS, Authorization: `Bearer ${token}` },
        timeout: 7000
      }
    );

    return {
      success: true,
      date: targetDate,
      pairs: Array.isArray(res.data) ? res.data : []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Получение домашних заданий
 */
export async function getHomeworks(token) {
  try {
    const res = await axios.get(`${TOP_ACADEMY_API_BASE}/homework/operations/list`, {
      headers: { ...HEADERS, Authorization: `Bearer ${token}` },
      timeout: 7000
    });

    return {
      success: true,
      homeworks: Array.isArray(res.data) ? res.data : []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Получение оценок и посещений
 */
export async function getMarks(token) {
  try {
    const res = await axios.get(`${TOP_ACADEMY_API_BASE}/progress/operations/student-visits`, {
      headers: { ...HEADERS, Authorization: `Bearer ${token}` },
      timeout: 7000
    });

    return {
      success: true,
      marks: Array.isArray(res.data) ? res.data : []
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Демо-данные на случай, если пользователь пока не ввел логин/пароль
 */
export const demoData = {
  profile: {
    fullName: "Алексей Смирнов",
    group: "ВЕБ-22/3 (Программирование)",
    branch: "Компьютерная Академия ТОП (Москва)",
    coins: 1420,
    gems: 385,
    level: 14,
    levelTitle: "Архитектор кода",
    averageGrade: 11.8,
    attendance: 96.4,
    rank: 1
  },
  scheduleToday: [
    {
      number: 1,
      time: "09:00 - 10:20",
      subject: "Разработка веб-приложений (React / Node.js)",
      teacher: "Соколов Дмитрий Викторович",
      room: "Ауд. 402 (Web-лаб)",
      type: "Лабораторная работа",
      status: "finished"
    },
    {
      number: 2,
      time: "10:30 - 11:50",
      subject: "Проектирование баз данных (PostgreSQL)",
      teacher: "Белова Елена Сергеевна",
      room: "Ауд. 310 (SQL-лаб)",
      type: "Практическое занятие",
      status: "current"
    },
    {
      number: 3,
      time: "12:20 - 13:40",
      subject: "Алгоритмы и структуры данных",
      teacher: "Морозов Игорь Анатольевич",
      room: "Конференц-зал 1",
      type: "Лекция",
      status: "upcoming"
    }
  ],
  homeworks: [
    {
      id: "hw-1",
      subject: "Разработка веб-приложений (React / Node.js)",
      theme: "Реализация Telegram WebApp с авторизацией и кастомными хуками",
      deadline: "Завтра, 23:59",
      status: "pending",
      maxMark: 12
    },
    {
      id: "hw-2",
      subject: "Проектирование баз данных",
      theme: "Написание сложных JOIN запросов и оптимизация индексов",
      deadline: "Через 3 дня",
      status: "pending",
      maxMark: 12
    },
    {
      id: "hw-3",
      subject: "Алгоритмы и структуры данных",
      theme: "Балансировка АВЛ-дерева и поиск кратчайшего пути Дейкстры",
      deadline: "Сдано на проверку",
      status: "submitted",
      maxMark: 12
    }
  ],
  marks: [
    { subject: "Разработка веб-приложений", mark: 12, type: "Лабораторная", date: "Сегодня" },
    { subject: "Проектирование баз данных", mark: 11, type: "Практика", date: "Вчера" },
    { subject: "Алгоритмы и структуры данных", mark: 12, type: "Контрольная", date: "15.10" },
    { subject: "Архитектура ПО", mark: 11, type: "Зачет", date: "12.10" },
    { subject: "Английский для IT", mark: 12, type: "Тест", date: "10.10" }
  ]
};
