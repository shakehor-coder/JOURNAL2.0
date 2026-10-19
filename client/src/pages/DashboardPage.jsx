import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Video, PenTool } from "lucide-react";

/**
 * Format Russian date: "пт, 16 октября"
 */
const formatRuDate = () => {
  try {
    const now = new Date();
    const weekday = new Intl.DateTimeFormat("ru-RU", { weekday: "short" }).format(now);
    const day = now.getDate();
    const month = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(now);
    return `${weekday.toLowerCase()}, ${day} ${month}`;
  } catch (e) {
    return "пт, 16 октября";
  }
};

/**
 * Format compact date: "14 окт"
 */
const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const clean = dateStr.split(" ")[0];
    const parts = clean.split("-");
    if (parts.length === 3) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const day = date.getDate();
      const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
      return `${day} ${months[date.getMonth()] || ""}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Determine deadline status: 'over' (overdue), 'soon' (due within 2 days), ''
 */
const getDeadlineStatus = (dateStr) => {
  if (!dateStr) return "";
  try {
    const clean = dateStr.split(" ")[0];
    const target = new Date(clean).getTime();
    const now = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "over";
    if (diffDays <= 2) return "soon";
    return "";
  } catch (e) {
    return "";
  }
};

export const DashboardPage = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [homeworks, setHomeworks] = useState([]);

  useEffect(() => {
    fetch("/api/journal/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schedule && data.schedule.length > 0) {
          const today = data.schedule.find((s) => s.isToday) || data.schedule[0];
          if (today && today.pairs && today.pairs.length > 0) {
            setSchedule(today.pairs);
          }
        }
      })
      .catch(() => {});

    fetch("/api/journal/homework")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.homeworks && data.homeworks.length > 0) {
          setHomeworks(data.homeworks);
        }
      })
      .catch(() => {});
  }, []);

  // Realistic mock data fallback from attached design prototype
  const displaySchedule =
    schedule.length > 0
      ? schedule.map((p, idx) => ({
          time: (p.time || "09:00–10:20").replace(/\s*-\s*/, "–"),
          subject: p.subject,
          meta: `${p.teacher} · ${p.room}`,
          status: p.status === "active" ? "now" : idx === 0 ? "done" : ""
        }))
      : [
          {
            time: "09:00–10:20",
            subject: "Разработка веб-приложений (React / Node.js)",
            meta: "Соколов Дмитрий Викторович · ауд. 402",
            status: "done"
          },
          {
            time: "10:35–11:55",
            subject: "Проектирование баз данных (PostgreSQL / Prisma)",
            meta: "Морозова Елена Сергеевна · ауд. 308 (Серверная)",
            status: "now"
          },
          {
            time: "12:25–13:45",
            subject: "Алгоритмы и структуры данных",
            meta: "Кузнецов Артём Павлович · онлайн",
            status: ""
          },
          {
            time: "14:00–15:20",
            subject: "Информационная безопасность веб-систем",
            meta: "Иванов Сергей Васильевич · онлайн",
            status: ""
          }
        ];

  const currentPair =
    displaySchedule.find((p) => p.status === "now") || displaySchedule[0];

  const displayHomework =
    homeworks.length > 0
      ? homeworks.slice(0, 3).map((h) => ({
          title: h.title,
          subject: h.subject,
          meta: `${h.maxScore || 12} б. · ${formatShortDate(h.deadline)}`,
          status: getDeadlineStatus(h.deadline)
        }))
      : [
          {
            title: "Реализация WebSocket-сервера и WebRTC сигналинга",
            subject: "Разработка веб-приложений",
            meta: "12 б. · 14 окт",
            status: "over"
          },
          {
            title: "Нормализация схемы данных и миграции Prisma",
            subject: "Проектирование баз данных",
            meta: "12 б. · 13 окт",
            status: "over"
          },
          {
            title: "Анализ уязвимостей JWT и CSRF защиты",
            subject: "Информационная безопасность",
            meta: "12 б. · 16 окт",
            status: "soon"
          }
        ];

  const firstName = user?.fullName ? user.fullName.split(" ")[0] : "Алексей";

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* 1. Greeting in one clean line */}
      <h1 className="m-0 text-[24px] font-bold text-ink">
        Добрый день, {firstName}{" "}
        <span className="text-ink-muted font-medium">· {formatRuDate()}</span>
      </h1>

      {/* 2. Section 'Сейчас' */}
      <section className="now" aria-label="Сейчас">
        <div>
          <div className="lbl">
            <i className="live" />
            Идёт сейчас · {currentPair?.time || "10:35–11:55"}
          </div>
          <h3>{currentPair?.subject || "Проектирование баз данных (PostgreSQL / Prisma)"}</h3>
          <p>{currentPair?.meta || "Морозова Елена Сергеевна · ауд. 308 (Серверная)"}</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("call")}
            className="btn pri"
          >
            <Video className="w-[18px] h-[18px]" strokeWidth={2} />
            <span>Войти в аудиторию</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("whiteboard")}
            className="btn sec"
          >
            <PenTool className="w-[18px] h-[18px]" strokeWidth={2} />
            <span>Электронная доска</span>
          </button>
        </div>
      </section>

      {/* 3. Two columns: Schedule & Homeworks */}
      <div className="cols grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left window: Расписание на сегодня */}
        <section className="win">
          <header>
            <h2>Расписание на сегодня</h2>
            <button
              type="button"
              onClick={() => setActiveTab("schedule")}
            >
              Вся неделя →
            </button>
          </header>

          <div>
            {displaySchedule.map((s, idx) => (
              <div
                key={idx}
                className={`row ${s.status === "done" ? "done" : ""}`}
                style={{ gridTemplateColumns: "112px 1fr" }}
              >
                <span className="tm">{s.time}</span>
                <div>
                  <b>
                    {s.subject}
                    {s.status === "now" && (
                      <i className="here" title="Идёт сейчас" />
                    )}
                  </b>
                  <small>
                    {s.meta}
                    {s.status === "done" && " · завершена"}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right window: Домашние задания */}
        <section className="win">
          <header>
            <h2>Домашние задания</h2>
            <button
              type="button"
              onClick={() => setActiveTab("homework")}
            >
              Все задания →
            </button>
          </header>

          <div>
            {displayHomework.map((h, idx) => (
              <div key={idx} className="row hw">
                <div>
                  <b>{h.title}</b>
                  <small>{h.subject}</small>
                </div>
                <span className={`meta ${h.status}`}>
                  {h.meta}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 4. Compact metrics row */}
      <div className="stats">
        <div className="stat">
          <b>{user?.averageGrade || "11.8"}</b>
          <span>Средний балл</span>
        </div>
        <div className="stat">
          <b>{user?.attendancePercentage || 96.4}%</b>
          <span>Посещаемость</span>
        </div>
        <div className="stat">
          <b>
            {user?.completedHomeworks || 48} / {user?.totalHomeworks || 52}
          </b>
          <span>Сдано заданий</span>
        </div>
      </div>
    </div>
  );
};
