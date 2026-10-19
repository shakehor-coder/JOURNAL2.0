export const mockStudentProfile = {
  id: "std-78291",
  fullName: "Алексей Смирнов",
  username: "alex_dev",
  email: "a.smirnov@student.top-academy.ru",
  phone: "+7 (999) 123-45-67",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  avatarFrame: "crimson-fire",
  banner: "crimson-nebula",
  bannerUrl: "",
  statusEmoji: "💻",
  statusText: "Пишу код на React & пью кофе",
  bio: "Студент Академии ТОП. Увлекаюсь frontend-разработкой, созданием веб-сервисов и алгоритмическими задачами. Открыт к командным проектам и хакатонам!",
  skills: ["React", "JavaScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Docker", "Git"],
  socialLinks: {
    github: "https://github.com",
    telegram: "@alex_smirnov",
    discord: "alex_dev#1337",
    website: "https://alex-portfolio.dev"
  },
  auraEffect: "crimson-aura",
  group: "ВЕБ-22/3 (Программирование)",
  faculty: "Разработка программного обеспечения",
  formOfStudy: "Очная",
  studentIdCard: "СТ-2024-8841",
  coins: 1420,
  gems: 385,
  level: 14,
  levelTitle: "Архитектор кода",
  xpCurrent: 740,
  xpNextLevel: 1000,
  averageGrade: 11.8,
  attendancePercentage: 96.4,
  completedHomeworks: 48,
  totalHomeworks: 52,
  rank: 1,
  respectsCount: 34,
  guestbook: [
    { id: "gb-1", author: "София Михайлова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", text: "Спасибо за помощь с кастомными хуками в React! 🔥", time: "Вчера, 18:42" },
    { id: "gb-2", author: "Даниил Кузнецов", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120", text: "Красава, лучший средний балл в группе! Респект 🚀", time: "3 дня назад" }
  ],
  badges: [
    { id: "b1", title: "Мастер алгоритмов", icon: "Code2", desc: "Решено 50+ задач без ошибок", color: "from-red-500 to-rose-600" },
    { id: "b2", title: "100% Пунктуальность", icon: "Clock", desc: "Ни одного опоздания за месяц", color: "from-amber-500 to-orange-600" },
    { id: "b3", title: "Душа группы", icon: "Sparkles", desc: "Активность на онлайн-парах", color: "from-purple-500 to-indigo-600" },
    { id: "b4", title: "Лидер группы", icon: "Crown", desc: "1 место в рейтинге MyStat", color: "from-yellow-400 to-amber-600" }
  ]
};

const rawMockSchedule = [
  {
    date: "2026-10-12",
    dayOfWeek: "Понедельник",
    isToday: false,
    pairs: [
      {
        id: "p1",
        number: 1,
        time: "09:00 - 10:20",
        subject: "Разработка веб-приложений (React / Node.js)",
        teacher: "Соколов Дмитрий Викторович",
        room: "Ауд. 402 (Лаборатория Web, 4 этаж)",
        type: "Лабораторная работа",
        status: "finished",
        attendance: "present",
        topic: "Жизненный цикл React компонентов, кастомные хуки и производительность",
        homeworkDue: null,
        materials: [
          { name: "Методичка_React_Hooks.pdf", size: "1.4 MB" },
          { name: "github.com/top-web-22/react-lab-3", isLink: true }
        ],
        onlineCallRoom: "web-dev-room-402",
        hasWhiteboard: true
      },
      {
        id: "p2",
        number: 2,
        time: "10:35 - 11:55",
        subject: "Проектирование баз данных (PostgreSQL / Prisma)",
        teacher: "Морозова Елена Сергеевна",
        room: "Ауд. 308 (Серверная лаборатория)",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "Нормализация отношений (3NF / BCNF) и индексы B-Tree в PostgreSQL",
        homeworkDue: "Практическая работа №4: Проектирование схемы БД",
        materials: [
          { name: "ER_Diagrams_Reference.pdf", size: "850 KB" }
        ],
        onlineCallRoom: "db-room-308",
        hasWhiteboard: true
      },
      {
        id: "p3",
        number: 3,
        time: "12:25 - 13:45",
        subject: "Алгоритмы и структуры данных",
        teacher: "Кузнецов Артем Павлович",
        room: "Ауд. 501 (Большая лекционная)",
        type: "Лекция",
        status: "finished",
        attendance: "present",
        topic: "Теория графов: поиск в ширину (BFS), поиск в глубину (DFS), Дейкстра",
        homeworkDue: null,
        materials: [
          { name: "Лекция_Графы_Алгоритмы.pdf", size: "2.1 MB" }
        ],
        onlineCallRoom: "algo-room-live",
        hasWhiteboard: true
      },
      {
        id: "p4",
        number: 4,
        time: "14:00 - 15:20",
        subject: "Информационная безопасность веб-систем",
        teacher: "Иванов Сергей Васильевич",
        room: "Ауд. 310 (Лаборатория ИБ)",
        type: "Семинар",
        status: "finished",
        attendance: "present",
        topic: "Анализ уязвимостей OWASP Top 10: XSS, CSRF, SQL-инъекции и защита сессий",
        homeworkDue: null,
        materials: [
          { name: "OWASP_Security_CheatSheet_2026.pdf", size: "1.1 MB" }
        ],
        onlineCallRoom: "security-room-live",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-13",
    dayOfWeek: "Вторник",
    isToday: false,
    pairs: [
      {
        id: "p5",
        number: 1,
        time: "09:00 - 10:20",
        subject: "Архитектура клиент-серверных систем",
        teacher: "Соколов Дмитрий Викторович",
        room: "Ауд. 402",
        type: "Лекция",
        status: "finished",
        attendance: "present",
        topic: "Сравнение REST API, GraphQL и gRPC: выбор архитектурного паттерна",
        materials: [
          { name: "Слайды_REST_vs_gRPC.pdf", size: "1.8 MB" }
        ],
        onlineCallRoom: "arch-room-402",
        hasWhiteboard: true
      },
      {
        id: "p6",
        number: 2,
        time: "10:35 - 11:55",
        subject: "Английский язык в сфере IT",
        teacher: "Вилсон Сара Робертовна",
        room: "Ауд. 204 (Лингафонный класс)",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "Communication during Technical Interviews & Pull Request Code Review",
        homeworkDue: "Essay: My Architecture Decisions in English",
        materials: [
          { name: "IT_Interview_Vocabulary.docx", size: "320 KB" }
        ],
        onlineCallRoom: "english-room-live",
        hasWhiteboard: false
      },
      {
        id: "p7",
        number: 3,
        time: "12:25 - 13:45",
        subject: "UI/UX Проектирование веб-интерфейсов",
        teacher: "Белова Анна Владимировна",
        room: "Ауд. 405 (Дизайн-студия)",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "Дизайн-системы в Figma: Auto-layout, компоненты и токены переменных",
        homeworkDue: "Макет интерфейса личного кабинета студента",
        materials: [
          { name: "Figma_DesignSystem_Kit.fig", size: "4.5 MB" }
        ],
        onlineCallRoom: "design-room-405",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-14",
    dayOfWeek: "Среда",
    isToday: false,
    pairs: [
      {
        id: "p8",
        number: 1,
        time: "09:00 - 10:20",
        subject: "Мобильная разработка и PWA",
        teacher: "Громов Денис Игоревич",
        room: "Ауд. 215 (Лаборатория Mobile)",
        type: "Лабораторная работа",
        status: "finished",
        attendance: "present",
        topic: "Service Workers: стратегии кэширования CacheFirst / NetworkFirst и манифест",
        homeworkDue: "Создать офлайн-манифест для PWA приложения",
        materials: [
          { name: "PWA_Service_Workers_Guide.pdf", size: "1.6 MB" }
        ],
        onlineCallRoom: "mobile-room-215",
        hasWhiteboard: true
      },
      {
        id: "p9",
        number: 2,
        time: "10:35 - 11:55",
        subject: "Разработка веб-приложений (React / Node.js)",
        teacher: "Соколов Дмитрий Викторович",
        room: "Ауд. 402",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "Реализация WebSockets на Node.js (Socket.io) и передача WebRTC сигналов",
        homeworkDue: "ДЗ №7: WebSocket чат и статус участников",
        materials: [
          { name: "Socket_WebRTC_Boilerplate.zip", size: "890 KB" }
        ],
        onlineCallRoom: "web-dev-room-402",
        hasWhiteboard: true
      },
      {
        id: "p10",
        number: 3,
        time: "12:25 - 13:45",
        subject: "Компьютерные сети и сетевые протоколы",
        teacher: "Ковалев Михаил Юрьевич",
        room: "Ауд. 308",
        type: "Лекция",
        status: "finished",
        attendance: "present",
        topic: "Модель OSI, транспортные протоколы TCP / UDP и рукопожатие TLS 1.3",
        materials: [
          { name: "Сетевые_Протоколы_Лекция4.pdf", size: "3.2 MB" }
        ],
        onlineCallRoom: "networks-room-live",
        hasWhiteboard: true
      },
      {
        id: "p11",
        number: 4,
        time: "14:00 - 15:20",
        subject: "Фреймворк Next.js и Server-Side Rendering",
        teacher: "Соколов Дмитрий Викторович",
        room: "Ауд. 402",
        type: "Семинар",
        status: "finished",
        attendance: "present",
        topic: "Next.js App Router, Server Components vs Client Components, оптимизация SEO",
        materials: [
          { name: "NextJS_App_Router_Handbook.pdf", size: "2.0 MB" }
        ],
        onlineCallRoom: "nextjs-room-live",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-15",
    dayOfWeek: "Четверг",
    isToday: false,
    pairs: [
      {
        id: "p12",
        number: 1,
        time: "09:00 - 10:20",
        subject: "Разработка бэкенда на Node.js & NestJS",
        teacher: "Кузнецов Артем Павлович",
        room: "Ауд. 402",
        type: "Лабораторная работа",
        status: "finished",
        attendance: "present",
        topic: "Архитектура NestJS: контроллеры, провайдеры сервисов, модули и Pipes",
        homeworkDue: "Лабораторная №5: Разработка REST API на NestJS",
        materials: [
          { name: "NestJS_CheatSheet.pdf", size: "900 KB" }
        ],
        onlineCallRoom: "nestjs-room-402",
        hasWhiteboard: true
      },
      {
        id: "p13",
        number: 2,
        time: "10:35 - 11:55",
        subject: "Базы данных NoSQL (MongoDB / Redis)",
        teacher: "Морозова Елена Сергеевна",
        room: "Ауд. 308",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "In-memory хранилище Redis: кэширование запросов, TTL и очереди BullMQ",
        materials: [
          { name: "Redis_DataStructures.pdf", size: "1.2 MB" }
        ],
        onlineCallRoom: "redis-room-308",
        hasWhiteboard: true
      },
      {
        id: "p14",
        number: 3,
        time: "12:25 - 13:45",
        subject: "Автоматизированное тестирование ПО",
        teacher: "Смирнова Ольга Андреевна",
        room: "Ауд. 312",
        type: "Практикум",
        status: "finished",
        attendance: "present",
        topic: "Unit-тестирование модулей на Jest, мокирование сервисов и покрытие кода (Coverage)",
        homeworkDue: "Покрыть тестами аутентификационный сервис",
        materials: [
          { name: "Jest_Testing_Guide.pdf", size: "1.5 MB" }
        ],
        onlineCallRoom: "qa-testing-room",
        hasWhiteboard: true
      },
      {
        id: "p15",
        number: 4,
        time: "14:00 - 15:20",
        subject: "DevOps и контейнеризация (Docker / CI/CD)",
        teacher: "Ковалев Михаил Юрьевич",
        room: "Ауд. 308",
        type: "Семинар",
        status: "finished",
        attendance: "present",
        topic: "Сборка Docker-образов (Multi-stage build), Docker Compose и GitHub Actions CI",
        materials: [
          { name: "Docker_Production_Guide.pdf", size: "2.4 MB" }
        ],
        onlineCallRoom: "devops-room-live",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-16",
    dayOfWeek: "Пятница",
    isToday: true,
    pairs: [
      {
        id: "p16",
        number: 1,
        time: "09:00 - 10:20",
        subject: "Проектный практикум и Хакатон",
        teacher: "Соколов Д. В. & Морозова Е. С.",
        room: "Ауд. 402 (Web-лаборатория)",
        type: "Командный проект",
        status: "finished",
        attendance: "present",
        topic: "Защита промежуточных результатов проекта «Journal 2.0»: ретро-дизайн и WebRTC",
        homeworkDue: null,
        materials: [
          { name: "Критерии_Оценки_Хакатона.pdf", size: "750 KB" }
        ],
        onlineCallRoom: "hackathon-room-402",
        hasWhiteboard: true
      },
      {
        id: "p17",
        number: 2,
        time: "10:35 - 11:55",
        subject: "Анализ данных и язык Python",
        teacher: "Тарасов Игорь Николаевич",
        room: "Ауд. 301 (Лаборатория Data Science)",
        type: "Практикум",
        status: "active",
        attendance: "present",
        topic: "Обработка табличных данных в Pandas: группировки, фильтрация и расчёт KPI успеваемости",
        homeworkDue: "Практическая работа №5: Датасет успеваемости студентов в Pandas",
        materials: [
          { name: "Pandas_Practical_Jupyter.ipynb", size: "3.1 MB" },
          { name: "students_dataset.csv", size: "450 KB" }
        ],
        onlineCallRoom: "python-datascience-room",
        hasWhiteboard: true
      },
      {
        id: "p18",
        number: 3,
        time: "12:25 - 13:45",
        subject: "Гибкие методологии разработки (Scrum / Agile)",
        teacher: "Белова Анна Владимировна",
        room: "Ауд. 405 (Коворкинг)",
        type: "Семинар",
        status: "upcoming",
        attendance: "future",
        topic: "Планирование спринта, оценка трудоёмкости Story Points и ведение канбан-доски в Linear",
        homeworkDue: null,
        materials: [
          { name: "Agile_Scrum_Guide_2026.pdf", size: "1.9 MB" }
        ],
        onlineCallRoom: "agile-room-405",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-17",
    dayOfWeek: "Суббота",
    isToday: false,
    pairs: [
      {
        id: "p19",
        number: 1,
        time: "10:00 - 11:20",
        subject: "Консультации по курсовым проектам",
        teacher: "Соколов Дмитрий Викторович",
        room: "Онлайн-аудитория ТОП",
        type: "Консультация",
        status: "upcoming",
        attendance: "future",
        topic: "Индивидуальный разбор архитектуры курсовых проектов и код-ревью студентов",
        homeworkDue: null,
        materials: [
          { name: "Требования_к_курсовой_работе.pdf", size: "1.3 MB" }
        ],
        onlineCallRoom: "coursework-room-live",
        hasWhiteboard: true
      },
      {
        id: "p20",
        number: 2,
        time: "11:35 - 12:55",
        subject: "Факультатив: Web3 & Смарт-контракты",
        teacher: "Кузнецов Артем Павлович",
        room: "Онлайн-аудитория ТОП",
        type: "Факультатив",
        status: "upcoming",
        attendance: "future",
        topic: "Введение в блокчейн Ethereum: виртуальная машина EVM, синтаксис языка Solidity",
        homeworkDue: null,
        materials: [
          { name: "Web3_Solidity_Basics.pdf", size: "2.8 MB" }
        ],
        onlineCallRoom: "web3-room-live",
        hasWhiteboard: true
      }
    ]
  },
  {
    date: "2026-10-18",
    dayOfWeek: "Воскресенье",
    isToday: false,
    pairs: []
  }
];

const rawMockHomeworks = [
  {
    id: "hw-1",
    subject: "Разработка веб-приложений (React / Node.js)",
    title: "Реализация WebSocket-сервера и WebRTC сигналинга",
    description: "Разработать модуль сокетов на Node.js для обмена SDP-офферами и текстовыми сообщениями между клиентами. Добавить валидацию токенов.",
    deadline: "2026-10-14 23:59",
    status: "in_progress",
    priority: "high",
    maxScore: 12,
    earnedScore: null,
    teacher: "Соколов Д. В.",
    attachments: [
      { name: "ТЗ_WebSockets.pdf", size: "1.2 MB", url: "#" },
      { name: "starter-template.zip", size: "340 KB", url: "#" }
    ],
    submission: {
      submittedAt: null,
      comment: "",
      files: []
    }
  },
  {
    id: "hw-2",
    subject: "Проектирование баз данных (PostgreSQL / Prisma)",
    title: "Нормализация схемы данных и миграции Prisma",
    description: "Спроектировать 3NF схему для электронного журнала (Users, Groups, Lessons, Marks, Homeworks). Написать скрипт сидирования начальных данных.",
    deadline: "2026-10-13 18:00",
    status: "pending",
    priority: "high",
    maxScore: 12,
    earnedScore: null,
    teacher: "Морозова Е. С.",
    attachments: [
      { name: "DB_Requirements.docx", size: "890 KB", url: "#" }
    ],
    submission: null
  },
  {
    id: "hw-3",
    subject: "Алгоритмы и структуры данных",
    title: "Реализация алгоритма Дейкстры и поиска кратчайшего пути",
    description: "Написать класс графа и реализовать поиск кратчайшего пути с приоритетной очередью. Покрыть тестами 5 краевых случаев.",
    deadline: "2026-10-10 23:59",
    status: "reviewed",
    priority: "medium",
    maxScore: 12,
    earnedScore: 12,
    teacher: "Кузнецов А. П.",
    teacherFeedback: "Отличное решение! Код чистый, сложность O(E + V log V) соблюдена, все тесты пройдены. +20 коинов за скорость.",
    attachments: [],
    submission: {
      submittedAt: "2026-10-09 21:14",
      comment: "Решение отправлено на проверку в репозитории GitHub.",
      files: [{ name: "dijkstra.js", size: "4.1 KB" }]
    }
  },
  {
    id: "hw-4",
    subject: "Информационная безопасность веб-систем",
    title: "Анализ уязвимостей JWT и CSRF защиты",
    description: "Провести аудит безопасности тестового приложения. Настроить HttpOnly Cookie и токены ротации.",
    deadline: "2026-10-16 23:59",
    status: "pending",
    priority: "medium",
    maxScore: 12,
    earnedScore: null,
    teacher: "Иванов С. В.",
    attachments: [],
    submission: null
  },
  {
    id: "hw-5",
    subject: "Английский язык в сфере IT",
    title: "Подготовка питча проекта (Technical Pitch Deck)",
    description: "Подготовить презентацию на английском языке из 5 слайдов о своем курсовом проекте и записать аудио-саммари на 2 минуты.",
    deadline: "2026-10-08 20:00",
    status: "reviewed",
    priority: "low",
    maxScore: 12,
    earnedScore: 11,
    teacher: "Вилсон С. Р.",
    teacherFeedback: "Well done! Good technical vocabulary. Just watch pronunciation of 'hierarchy' and 'variable'.",
    attachments: [],
    submission: {
      submittedAt: "2026-10-08 17:30",
      comment: "Presentation attached.",
      files: [{ name: "Pitch_Alexey.pdf", size: "2.4 MB" }]
    }
  }
];

function getCurrentWeekSchedule(baseScheduleTemplate) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const todayStr = now.toISOString().split("T")[0];

  return baseScheduleTemplate.map((day, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dateStr = dayDate.toISOString().split("T")[0];
    return {
      ...day,
      date: dateStr,
      isToday: dateStr === todayStr
    };
  });
}

function getCurrentHomeworks(baseHomeworks) {
  const now = new Date();
  return baseHomeworks.map((hw, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() + (idx * 2 - 1));
    const deadlineStr = `${d.toISOString().split("T")[0]} 23:59`;
    return {
      ...hw,
      deadline: deadlineStr
    };
  });
}

export const mockSchedule = getCurrentWeekSchedule(rawMockSchedule);
export const mockHomeworks = getCurrentHomeworks(rawMockHomeworks);

export const mockMarks = [
  {
    subject: "Разработка веб-приложений (React / Node.js)",
    teacher: "Соколов Д. В.",
    average: 4.95,
    attendanceRate: 98,
    marksList: [
      { date: "02.10", mark: 12, type: "Практика", topic: "React Hooks & Virtual DOM" },
      { date: "05.10", mark: 12, type: "ДЗ", topic: "Кастомные хуки useFetch" },
      { date: "07.10", mark: 11, type: "Тест", topic: "Архитектура Redux / Zustand" },
      { date: "09.10", mark: 12, type: "Лабораторная", topic: "Node.js REST API & Middlewares" }
    ]
  },
  {
    subject: "Проектирование баз данных (PostgreSQL / Prisma)",
    teacher: "Морозова Е. С.",
    average: 4.80,
    attendanceRate: 95,
    marksList: [
      { date: "01.10", mark: 11, type: "Практика", topic: "Сложные JOIN и подзапросы" },
      { date: "04.10", mark: 12, type: "ДЗ", topic: "Индексация и Explain Analyze" },
      { date: "08.10", mark: 11, type: "Контрольная", topic: "Транзакции и ACID" }
    ]
  },
  {
    subject: "Алгоритмы и структуры данных",
    teacher: "Кузнецов А. П.",
    average: 5.0,
    attendanceRate: 100,
    marksList: [
      { date: "28.09", mark: 12, type: "Практика", topic: "Бинарные деревья поиска" },
      { date: "03.10", mark: 12, type: "ДЗ", topic: "Хеш-таблицы и коллизии" },
      { date: "09.10", mark: 12, type: "ДЗ", topic: "Алгоритм Дейкстры" }
    ]
  },
  {
    subject: "Информационная безопасность веб-систем",
    teacher: "Иванов С. В.",
    average: 4.70,
    attendanceRate: 92,
    marksList: [
      { date: "30.09", mark: 11, type: "Семинар", topic: "SQL Injection и защита через ORM" },
      { date: "06.10", mark: 10, type: "Тест", topic: "OWASP Top 10" }
    ]
  }
];

export const mockLeaderboard = [
  { rank: 1, name: "Алексей Смирнов (Вы)", group: "ВЕБ-22/3", coins: 1420, gems: 385, ratingScore: 980, isMe: true },
  { rank: 2, name: "София Михайлова", group: "ВЕБ-22/3", coins: 1380, gems: 360, ratingScore: 955, isMe: false },
  { rank: 3, name: "Даниил Кузнецов", group: "ВЕБ-22/3", coins: 1290, gems: 340, ratingScore: 920, isMe: false },
  { rank: 4, name: "Мария Ковалева", group: "ВЕБ-22/3", coins: 1210, gems: 310, ratingScore: 890, isMe: false },
  { rank: 5, name: "Максим Орлов", group: "ВЕБ-22/3", coins: 1150, gems: 295, ratingScore: 865, isMe: false },
  { rank: 6, name: "Екатерина Волкова", group: "ВЕБ-22/3", coins: 1090, gems: 270, ratingScore: 830, isMe: false },
  { rank: 7, name: "Артем Белов", group: "ВЕБ-22/3", coins: 980, gems: 250, ratingScore: 800, isMe: false }
];

export const mockCodeTasks = [
  {
    id: "task-1",
    title: "Задача 1: Сумма элементов четных индексов",
    difficulty: "Легкая",
    subject: "Алгоритмы и структуры данных",
    language: "javascript",
    description: "Напишите функцию `sumEvenIndices(arr)`, которая принимает массив чисел и возвращает сумму элементов, находящихся на чётных индексах (0, 2, 4, ...).",
    initialCode: `function sumEvenIndices(arr) {
  // Напишите ваше решение здесь
  let sum = 0;
  for (let i = 0; i < arr.length; i += 2) {
    sum += arr[i];
  }
  return sum;
}

// Пример вызова:
// sumEvenIndices([1, 2, 3, 4, 5]) -> 9 (1 + 3 + 5)
`,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expected: "9" },
      { input: "[10, 20, 30]", expected: "40" },
      { input: "[7]", expected: "7" },
      { input: "[]", expected: "0" }
    ]
  },
  {
    id: "task-2",
    title: "Задача 2: Проверка палиндрома",
    difficulty: "Средняя",
    subject: "Алгоритмы и структуры данных",
    language: "javascript",
    description: "Напишите функцию `isPalindrome(str)`, которая проверяет, является ли строка палиндромом, игнорируя пробелы и регистр букв.",
    initialCode: `function isPalindrome(str) {
  // Напишите решение
  const clean = str.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '');
  return clean === clean.split('').reverse().join('');
}
`,
    testCases: [
      { input: "'А роза упала на лапу Азора'", expected: "true" },
      { input: "'racecar'", expected: "true" },
      { input: "'hello world'", expected: "false" }
    ]
  }
];

export const mockStudentsList = [
  {
    id: "std-78291",
    fullName: "Алексей Смирнов",
    username: "alex_dev",
    email: "a.smirnov@student.top-academy.ru",
    phone: "+7 (999) 123-45-67",
    group: "ВЕБ-22/3",
    faculty: "Разработка ПО",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    avatarFrame: "crimson-fire",
    banner: "crimson-nebula",
    bannerUrl: "",
    statusEmoji: "💻",
    statusText: "Пишу код на React & пью кофе",
    bio: "Студент Академии ТОП. Увлекаюсь frontend-разработкой, созданием веб-сервисов и алгоритмическими задачами. Открыт к командным проектам и хакатонам!",
    skills: ["React", "JavaScript", "Node.js", "Tailwind CSS", "PostgreSQL", "Docker", "Git"],
    socialLinks: {
      github: "https://github.com",
      telegram: "@alex_smirnov",
      discord: "alex_dev#1337",
      website: "https://alex-portfolio.dev"
    },
    auraEffect: "crimson-aura",
    coins: 1420,
    gems: 385,
    level: 14,
    levelTitle: "Архитектор кода",
    averageGrade: 11.8,
    attendancePercentage: 96.4,
    completedHomeworks: 48,
    rank: 1,
    respectsCount: 34,
    guestbook: [
      { id: "gb-1", author: "София Михайлова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", text: "Спасибо за помощь с кастомными хуками в React! 🔥", time: "Вчера, 18:42" },
      { id: "gb-2", author: "Даниил Кузнецов", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120", text: "Красава, лучший средний балл в группе! Респект 🚀", time: "3 дня назад" }
    ],
    badges: [
      { id: "b1", title: "Мастер алгоритмов", icon: "Code2", desc: "Решено 50+ задач без ошибок", color: "from-red-500 to-rose-600" },
      { id: "b2", title: "100% Пунктуальность", icon: "Clock", desc: "Ни одного опоздания за месяц", color: "from-amber-500 to-orange-600" },
      { id: "b3", title: "Душа группы", icon: "Sparkles", desc: "Активность на онлайн-парах", color: "from-purple-500 to-indigo-600" },
      { id: "b4", title: "Лидер группы", icon: "Crown", desc: "1 место в рейтинге MyStat", color: "from-yellow-400 to-amber-600" }
    ],
    isMe: true
  },
  {
    id: "std-78292",
    fullName: "София Михайлова",
    username: "sofia_ui",
    email: "s.mikhailova@student.top-academy.ru",
    phone: "+7 (999) 234-56-78",
    group: "ВЕБ-22/3",
    faculty: "Разработка ПО",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    avatarFrame: "cyber-neon",
    banner: "cyber-matrix",
    bannerUrl: "",
    statusEmoji: "🎨",
    statusText: "UI/UX дизайн & Frontend Magic ✨",
    bio: "Люблю чистую типографику, Tailwind и интерактивные анимации. Проектирую дизайн веб-сервисов и верстаю сложные интерфейсы.",
    skills: ["Figma", "UI/UX", "React", "TypeScript", "Tailwind CSS", "CSS3 Animation"],
    socialLinks: {
      github: "https://github.com",
      telegram: "@sofia_web"
    },
    auraEffect: "stardust",
    coins: 1380,
    gems: 360,
    level: 13,
    levelTitle: "UI Инженер",
    averageGrade: 11.6,
    attendancePercentage: 98.2,
    completedHomeworks: 47,
    rank: 2,
    respectsCount: 29,
    guestbook: [
      { id: "gb-3", author: "Алексей Смирнов", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120", text: "Твои макеты для лабы по базам данных были на высоте!", time: "2 дня назад" }
    ],
    badges: [
      { id: "b5", title: "Пиксельный эстет", icon: "Palette", desc: "Лучший дизайн проектов", color: "from-cyan-500 to-blue-600" },
      { id: "b2", title: "100% Пунктуальность", icon: "Clock", desc: "Ни одного пропуска за семестр", color: "from-amber-500 to-orange-600" }
    ],
    isMe: false
  },
  {
    id: "std-78293",
    fullName: "Даниил Кузнецов",
    username: "daniil_sql",
    email: "d.kuznetsov@student.top-academy.ru",
    phone: "+7 (999) 345-67-89",
    group: "ВЕБ-22/3",
    faculty: "Разработка ПО",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    avatarFrame: "void-purple",
    banner: "neon-synthwave",
    bannerUrl: "",
    statusEmoji: "⚡",
    statusText: "Backend & Databases architect ⚙️",
    bio: "Пишу серверную логику на Node.js и Go. Люблю сложные SQL-запросы, нормализацию данных и микросервисы.",
    skills: ["Node.js", "Express", "PostgreSQL", "Docker", "Go", "Prisma ORM"],
    socialLinks: {
      github: "https://github.com",
      telegram: "@daniil_backend"
    },
    auraEffect: "fire-sparks",
    coins: 1290,
    gems: 340,
    level: 12,
    levelTitle: "Архитектор данных",
    averageGrade: 11.2,
    attendancePercentage: 94.0,
    completedHomeworks: 45,
    rank: 3,
    respectsCount: 22,
    guestbook: [
      { id: "gb-4", author: "София Михайлова", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120", text: "Оптимизация базы данных просто топ! Запросы летают 🚀", time: "Позавчера" }
    ],
    badges: [
      { id: "b6", title: "Серверный гуру", icon: "Database", desc: "Высокая производительность бэкенда", color: "from-purple-500 to-indigo-600" }
    ],
    isMe: false
  },
  {
    id: "std-78294",
    fullName: "Мария Ковалева",
    username: "mary_ai",
    email: "m.kovaleva@student.top-academy.ru",
    phone: "+7 (999) 456-78-90",
    group: "ВЕБ-22/3",
    faculty: "Разработка ПО",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
    avatarFrame: "golden-crown",
    banner: "ruby-sunset",
    bannerUrl: "",
    statusEmoji: "🚀",
    statusText: "Python & Machine Learning 🧠",
    bio: "Интересуюсь анализом данных, нейросетями и автоматизацией. Люблю Python, Pandas и компьютерное зрение.",
    skills: ["Python", "FastAPI", "Pandas", "PyTorch", "SQL", "Git"],
    socialLinks: {
      github: "https://github.com",
      telegram: "@mary_ai"
    },
    auraEffect: "stardust",
    coins: 1210,
    gems: 310,
    level: 12,
    levelTitle: "AI Researcher",
    averageGrade: 11.1,
    attendancePercentage: 95.5,
    completedHomeworks: 44,
    rank: 4,
    respectsCount: 18,
    guestbook: [],
    badges: [
      { id: "b7", title: "Data Explorer", icon: "Cpu", desc: "Решение задач по нейросетям", color: "from-pink-500 to-rose-600" }
    ],
    isMe: false
  },
  {
    id: "std-78295",
    fullName: "Максим Орлов",
    username: "max_sec",
    email: "m.orlov@student.top-academy.ru",
    phone: "+7 (999) 567-89-01",
    group: "ВЕБ-22/3",
    faculty: "Разработка ПО",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    avatarFrame: "emerald-matrix",
    banner: "code-glitch",
    bannerUrl: "",
    statusEmoji: "🛡️",
    statusText: "Кибербезопасность & Pentest 🔒",
    bio: "Увлекаюсь вопросами информационной безопасности веб-приложений, CTF-соревнованиями и Linux.",
    skills: ["Linux", "Bash", "Cybersecurity", "Network Protocols", "Python", "Docker"],
    socialLinks: {
      telegram: "@max_sec"
    },
    auraEffect: "matrix-rain",
    coins: 1150,
    gems: 295,
    level: 11,
    levelTitle: "White Hat Hacker",
    averageGrade: 10.9,
    attendancePercentage: 91.2,
    completedHomeworks: 42,
    rank: 5,
    respectsCount: 15,
    guestbook: [],
    badges: [
      { id: "b8", title: "Страж безопасности", icon: "Shield", desc: "Успешный аудит уязвимостей", color: "from-emerald-500 to-teal-600" }
    ],
    isMe: false
  }
];
