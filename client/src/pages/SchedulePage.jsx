import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
  PenTool,
  BookOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
  Download
} from "lucide-react";

/**
 * Format Russian date: "16 окт"
 */
const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
      const m = parseInt(parts[1], 10) - 1;
      return `${day} ${months[m] || ""}`;
    }
    return dateStr;
  } catch (e) {
    return dateStr;
  }
};

/**
 * Type badge styling helper
 */
const getTypeBadgeClass = (type = "") => {
  const t = type.toLowerCase();
  if (t.includes("лабораторн")) return "bg-accent text-white border-ink";
  if (t.includes("практик")) return "bg-highlight text-ink border-ink";
  if (t.includes("проект") || t.includes("хакатон")) return "bg-success text-white border-ink";
  if (t.includes("семинар")) return "bg-surface-2 text-ink border-ink";
  return "bg-surface-2 text-ink border-ink";
};

export const SchedulePage = ({ setActiveTab, onSelectRoom }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState("day"); // 'day' | 'week'
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'practice' | 'lecture'

  useEffect(() => {
    fetch("/api/journal/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.schedule) {
          setScheduleData(data.schedule);
          const todayIdx = data.schedule.findIndex((s) => s.isToday);
          if (todayIdx !== -1) {
            setSelectedDayIndex(todayIdx);
          }
        }
      })
      .catch((err) => console.error("Failed to load schedule:", err));
  }, []);

  const currentDay = scheduleData[selectedDayIndex] || scheduleData[0];

  // Filter pairs
  const filterPairs = (pairs = []) => {
    if (typeFilter === "all") return pairs;
    if (typeFilter === "practice") {
      return pairs.filter(
        (p) =>
          p.type?.toLowerCase().includes("лабораторн") ||
          p.type?.toLowerCase().includes("практик") ||
          p.type?.toLowerCase().includes("проект")
      );
    }
    if (typeFilter === "lecture") {
      return pairs.filter(
        (p) =>
          p.type?.toLowerCase().includes("лекци") ||
          p.type?.toLowerCase().includes("семинар") ||
          p.type?.toLowerCase().includes("консультац") ||
          p.type?.toLowerCase().includes("факультатив")
      );
    }
    return pairs;
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* 1. Header with Academic Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-ink">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-highlight border-2 border-ink text-xs font-mono font-bold text-ink mb-2 shadow-hard-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Семестр 2026/2027 · Группа ВЕБ-22/3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-accent" strokeWidth={2.5} />
            <span>Расписание занятий</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            Компьютерная Академия ТОП · Факультет разработки программного обеспечения
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface-2 border-2 border-ink text-xs font-mono font-bold text-ink shadow-hard-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span>Числитель (Неделя 7 из 16)</span>
          </div>

          {/* View Mode Toggle: Day vs Week */}
          <div className="inline-flex p-1 rounded-[6px] bg-surface-2 border-2 border-ink gap-1 shadow-hard-xs">
            <button
              type="button"
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 rounded-[4px] text-xs font-bold cursor-pointer transition-all border-2 ${
                viewMode === "day"
                  ? "bg-accent text-white border-ink shadow-hard-xs"
                  : "border-transparent text-ink hover:bg-surface/60"
              }`}
            >
              По дням
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-[4px] text-xs font-bold cursor-pointer transition-all border-2 ${
                viewMode === "week"
                  ? "bg-accent text-white border-ink shadow-hard-xs"
                  : "border-transparent text-ink hover:bg-surface/60"
              }`}
            >
              Вся неделя
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border-2 border-ink rounded-[10px] p-3 shadow-hard-xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink font-mono">
          <Filter className="w-3.5 h-3.5 text-accent" />
          <span>Тип занятий:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1 rounded-[6px] text-xs font-bold cursor-pointer transition-all border-2 ${
              typeFilter === "all"
                ? "bg-ink text-paper border-ink shadow-hard-xs"
                : "bg-surface-2 text-ink border-ink hover:bg-surface"
            }`}
          >
            Все пары
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("practice")}
            className={`px-3 py-1 rounded-[6px] text-xs font-bold cursor-pointer transition-all border-2 ${
              typeFilter === "practice"
                ? "bg-ink text-paper border-ink shadow-hard-xs"
                : "bg-surface-2 text-ink border-ink hover:bg-surface"
            }`}
          >
            Лабораторные & Практикумы
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("lecture")}
            className={`px-3 py-1 rounded-[6px] text-xs font-bold cursor-pointer transition-all border-2 ${
              typeFilter === "lecture"
                ? "bg-ink text-paper border-ink shadow-hard-xs"
                : "bg-surface-2 text-ink border-ink hover:bg-surface"
            }`}
          >
            Лекции & Семинары
          </button>
        </div>
      </div>

      {/* 3. Day Selector Pills (Visible in 'day' view) */}
      {viewMode === "day" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {scheduleData.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const pairsCount = day.pairs.length;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-[8px] border-2 border-ink text-xs transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-accent text-white font-bold shadow-hard border-ink"
                    : "bg-surface text-ink hover:bg-surface-2 shadow-hard-xs"
                }`}
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{day.dayOfWeek}</span>
                    {day.isToday && (
                      <span className="px-1.5 py-0.2 rounded-[4px] bg-highlight text-ink border border-ink text-[10px] font-mono font-bold">
                        Сегодня
                      </span>
                    )}
                  </div>
                  <span className={`font-mono text-[11px] ${isSelected ? "text-white/90" : "text-ink-muted"}`}>
                    {formatShortDate(day.date)} • {pairsCount === 0 ? "Выходной" : `${pairsCount} ${pairsCount === 1 ? "пара" : pairsCount < 5 ? "пары" : "пар"}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 4. Day View: Detailed List of Pairs */}
      {viewMode === "day" && currentDay && (
        <div className="space-y-4">
          {/* Day Status Header */}
          <div className="win bg-surface border-2 border-ink rounded-[10px] p-4 shadow-hard-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-ink">
                  {currentDay.dayOfWeek}, {formatShortDate(currentDay.date)}
                </h2>
                {currentDay.isToday && (
                  <span className="px-2 py-0.5 rounded-[4px] bg-highlight border border-ink text-xs font-mono font-bold text-ink">
                    Сегодня
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted mt-0.5 font-mono">
                Учебный день • {currentDay.pairs.length} занятий по расписанию
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-ink">
              <span className="px-2.5 py-1 rounded-[6px] bg-surface-2 border border-ink">
                Числитель
              </span>
              <span className="px-2.5 py-1 rounded-[6px] bg-surface-2 border border-ink">
                Аудитории: 402, 308, 301
              </span>
            </div>
          </div>

          {/* Pairs List */}
          <div className="space-y-4">
            {filterPairs(currentDay.pairs).length === 0 ? (
              <div className="win bg-surface border-2 border-ink rounded-[10px] p-10 text-center space-y-2 shadow-hard">
                <div className="w-12 h-12 rounded-[6px] bg-surface-2 border-2 border-ink mx-auto flex items-center justify-center text-ink mb-2">
                  <Calendar className="w-6 h-6 text-ink-muted" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  {currentDay.pairs.length === 0 ? "Выходной день" : "Нет занятий по выбранному фильтру"}
                </h3>
                <p className="text-xs text-ink-muted max-w-sm mx-auto">
                  {currentDay.pairs.length === 0
                    ? "В этот день пар нет. Можно отдохнуть, повторить конспекты или доделать домашние задания к следующей неделе!"
                    : "Попробуйте выбрать другой фильтр, например «Все пары»."}
                </p>
              </div>
            ) : (
              filterPairs(currentDay.pairs).map((pair) => {
                const isActive = pair.status === "active";
                const isFinished = pair.status === "finished";

                return (
                  <div
                    key={pair.id}
                    className={`win bg-surface border-2 border-ink rounded-[10px] shadow-hard overflow-hidden transition-all ${
                      isActive ? "ring-2 ring-accent !bg-highlight/15" : ""
                    }`}
                  >
                    {/* Header Strip of the Pair Window */}
                    <div className="bg-surface-2 border-b-2 border-ink px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold uppercase text-ink bg-surface px-2 py-0.5 rounded-[4px] border border-ink shadow-hard-xs">
                          Пара #{pair.number}
                        </span>
                        <span className="font-mono text-xs font-bold text-ink flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <span>{pair.time}</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[11px] font-bold border ${getTypeBadgeClass(pair.type)} shadow-hard-xs`}>
                          {pair.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-highlight text-ink border-2 border-ink animate-pulse shadow-hard-xs">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            <span>Идёт сейчас</span>
                          </span>
                        )}
                        {isFinished && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono text-ink-muted bg-surface border border-ink/40">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            <span>Завершена</span>
                          </span>
                        )}
                        {pair.attendance === "present" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-bold bg-success/15 text-success border border-success">
                            ✓ Был на паре
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pair Body */}
                    <div className="p-5 space-y-4">
                      {/* Title & Location Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight">
                            {pair.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted mt-1">
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-ink" />
                              <span className="font-medium text-ink">{pair.teacher}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-accent" />
                              <span className="font-semibold text-ink">{pair.room}</span>
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const rId = pair.onlineCallRoom || ("aud-" + (pair.room?.match(/\d+/)?.[0] || "402"));
                              if (onSelectRoom) onSelectRoom(rId);
                              setActiveTab("call");
                            }}
                            className="btn pri h-9 text-xs font-bold flex items-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            <span>Войти в аудиторию</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const rId = pair.onlineCallRoom || ("aud-" + (pair.room?.match(/\d+/)?.[0] || "402"));
                              if (onSelectRoom) onSelectRoom(rId);
                              setActiveTab("whiteboard");
                            }}
                            className="btn sec h-9 text-xs font-bold flex items-center gap-1.5"
                          >
                            <PenTool className="w-4 h-4 text-ink" />
                            <span>Доска</span>
                          </button>
                        </div>
                      </div>

                      {/* Topic Block */}
                      {pair.topic && (
                        <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-ink flex items-start gap-2.5">
                          <BookOpen className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div className="text-xs text-ink leading-relaxed">
                            <span className="font-bold uppercase tracking-wider text-[11px] text-ink font-mono mr-1.5">
                              Тема занятия:
                            </span>
                            <span>{pair.topic}</span>
                          </div>
                        </div>
                      )}

                      {/* Homework & Materials Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {/* Homework Box */}
                        {pair.homeworkDue ? (
                          <div className="p-3 rounded-[6px] bg-highlight/25 border-2 border-ink flex flex-col justify-between gap-2 shadow-hard-xs">
                            <div className="flex items-start gap-2">
                              <FileText className="w-4 h-4 text-ink shrink-0 mt-0.5" />
                              <div className="text-xs">
                                <span className="font-bold uppercase tracking-wider text-[11px] text-ink font-mono block">
                                  Выданное домашнее задание:
                                </span>
                                <span className="font-medium text-ink mt-0.5 block">
                                  {pair.homeworkDue}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab("homework")}
                              className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 self-start font-mono cursor-pointer"
                            >
                              <span>Перейти к сдаче ДЗ</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-[6px] bg-surface-2/60 border border-ink/30 text-xs text-ink-muted flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                            <span>Домашнего задания к этой паре не задано</span>
                          </div>
                        )}

                        {/* Materials Box */}
                        {pair.materials && pair.materials.length > 0 ? (
                          <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-ink space-y-1.5 shadow-hard-xs">
                            <span className="font-bold uppercase tracking-wider text-[11px] text-ink font-mono block">
                              Учебные материалы к паре:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {pair.materials.map((mat, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-surface border border-ink text-[11px] font-mono text-ink shadow-hard-xs"
                                >
                                  {mat.isLink ? (
                                    <ExternalLink className="w-3 h-3 text-accent" />
                                  ) : (
                                    <Download className="w-3 h-3 text-ink-muted" />
                                  )}
                                  <span className="font-medium">{mat.name}</span>
                                  {mat.size && (
                                    <span className="text-ink-muted text-[10px]">({mat.size})</span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-[6px] bg-surface-2/60 border border-ink/30 text-xs text-ink-muted flex items-center gap-2">
                            <span>Дополнительных файлов к паре нет</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 5. Week View: Full 7-Day Academic Grid */}
      {viewMode === "week" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scheduleData.map((day) => {
            const pairs = filterPairs(day.pairs);
            return (
              <div
                key={day.date}
                className={`win bg-surface border-2 border-ink rounded-[10px] shadow-hard flex flex-col overflow-hidden ${
                  day.isToday ? "ring-2 ring-accent" : ""
                }`}
              >
                {/* Day Header */}
                <div className={`px-4 py-2.5 border-b-2 border-ink flex items-center justify-between ${
                  day.isToday ? "bg-highlight" : "bg-surface-2"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{day.dayOfWeek}</span>
                    <span className="font-mono text-xs text-ink-muted">
                      {formatShortDate(day.date)}
                    </span>
                  </div>
                  {day.isToday && (
                    <span className="px-1.5 py-0.5 rounded-[4px] bg-accent text-white font-mono text-[10px] font-bold">
                      Сегодня
                    </span>
                  )}
                </div>

                {/* Day Pairs List */}
                <div className="p-3 space-y-2.5 flex-1">
                  {pairs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-ink-muted italic">
                      Выходной день
                    </div>
                  ) : (
                    pairs.map((p) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-[6px] border-2 border-ink text-xs transition-all ${
                          p.status === "active"
                            ? "bg-highlight/30 border-accent font-bold"
                            : "bg-surface-2/60"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[11px] font-bold text-accent">
                            #{p.number} • {p.time}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${getTypeBadgeClass(p.type)}`}>
                            {p.type}
                          </span>
                        </div>
                        <div className="font-bold text-ink leading-tight text-xs">
                          {p.subject}
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-1 text-[11px] text-ink-muted">
                          <span>{p.teacher?.split(" ")[0]}</span>
                          <span className="font-mono font-medium text-ink">{p.room?.split(" ")[0]} {p.room?.split(" ")[1]}</span>
                        </div>
                        {p.topic && (
                          <p className="text-[11px] text-ink-muted line-clamp-1 mt-1 italic border-t border-ink/20 pt-1">
                            {p.topic}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
