import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  TrendingUp,
  Award,
  Calendar,
  CheckCircle,
  BookOpen,
  Plus,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  Key,
  Lock,
  UserCheck
} from "lucide-react";

export const MarksPage = () => {
  const { user, setUser } = useAuth();
  const [marksData, setMarksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Add Mark Form State
  const [newSubject, setNewSubject] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [newTeacher, setNewTeacher] = useState("");
  const [newMark, setNewMark] = useState(12);
  const [newType, setNewType] = useState("Практика");
  const [newTopic, setNewTopic] = useState("");
  const [newDate, setNewDate] = useState(() =>
    new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
  );
  const [isSubmittingMark, setIsSubmittingMark] = useState(false);

  // Sync Form State
  const [syncLogin, setSyncLogin] = useState("");
  const [syncPassword, setSyncPassword] = useState("");
  const [syncToken, setSyncToken] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const fetchMarks = () => {
    setLoading(true);
    fetch("/api/journal/marks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.marks) {
          setMarksData(data.marks);
          if (data.marks.length > 0 && !newSubject) {
            setNewSubject(data.marks[0].subject);
          }
        }
      })
      .catch((err) => console.error("Error fetching marks:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const showToast = (text) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Stats calculation
  const allRecordedMarks = marksData.flatMap((item) => item.marksList.map((m) => m.mark));
  const overallAverage =
    allRecordedMarks.length > 0
      ? (allRecordedMarks.reduce((a, b) => a + b, 0) / allRecordedMarks.length).toFixed(2)
      : "12.00";

  const totalGradesCount = allRecordedMarks.length;

  const topSubject = marksData.reduce(
    (max, item) => (!max || item.average > max.average ? item : max),
    null
  );

  const handleAddMarkSubmit = async (e) => {
    e.preventDefault();
    const finalSubject = newSubject === "CUSTOM" ? customSubject.trim() : newSubject;
    if (!finalSubject) {
      alert("Пожалуйста, выберите или введите название предмета");
      return;
    }

    setIsSubmittingMark(true);
    try {
      const res = await fetch("/api/journal/marks/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: finalSubject,
          teacher: newTeacher || (user?.fullName ? "Преподаватель Академии" : "Академия ТОП"),
          mark: Number(newMark),
          type: newType,
          topic: newTopic || "Практическое задание",
          date: newDate
        })
      });
      const data = await res.json();
      if (data.success) {
        setMarksData(data.marks);
        setShowAddModal(false);
        setNewTopic("");
        setCustomSubject("");
        showToast(`Оценка ${newMark} успешно добавлена по дисциплине "${finalSubject}"!`);
      } else {
        alert(data.message || "Ошибка при добавлении оценки");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка сетевого запроса к серверу");
    } finally {
      setIsSubmittingMark(false);
    }
  };

  const handleSyncSubmit = async (e) => {
    e.preventDefault();
    setIsSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/journal/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: syncLogin || undefined,
          password: syncPassword || undefined,
          token: syncToken || undefined
        })
      });
      const data = await res.json();

      if (data.success) {
        setSyncResult({
          success: true,
          message: data.message,
          results: data.syncResults
        });
        if (data.profile && setUser) {
          setUser(data.profile);
          localStorage.setItem("top_journal_user", JSON.stringify(data.profile));
        }
        fetchMarks();
        showToast("Дневник успешно синхронизирован с Академией ТОП!");
      } else {
        setSyncResult({
          success: false,
          error: data.error || "Не удалось авторизоваться в Академии ТОП"
        });
      }
    } catch (err) {
      console.error(err);
      setSyncResult({
        success: false,
        error: "Ошибка подключения к шлюзу MyStat"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredMarks = marksData.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-[6px] bg-surface border-2 border-ink shadow-hard flex items-center gap-2.5 text-ink font-bold text-[13px]">
          <CheckCircle className="w-4 h-4 text-success" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-accent" strokeWidth={2} />
            <span>Успеваемость и баллы</span>
          </h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Журнал оценок (12-балльная шкала Компьютерной Академии ТОП)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSyncModal(true)}
            className="btn sec h-9 text-[13px]"
          >
            <RefreshCw className="w-3.5 h-3.5 text-ink" />
            <span>Синхронизация с Академией</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn pri h-9 text-[13px]"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить оценку</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat">
          <span className="text-[11px] font-bold text-ink-muted uppercase font-mono tracking-wider block">
            Общий средний балл
          </span>
          <b className="mt-1 text-accent font-mono text-[28px]">{overallAverage} <span className="text-sm font-normal text-ink-muted font-mono">/ 12.0</span></b>
        </div>

        <div className="stat">
          <span className="text-[11px] font-bold text-ink-muted uppercase font-mono tracking-wider block">
            Всего оценок в журнале
          </span>
          <b className="mt-1 font-mono text-[28px]">{totalGradesCount}</b>
        </div>

        <div className="stat">
          <span className="text-[11px] font-bold text-ink-muted uppercase font-mono tracking-wider block">
            Лучшая дисциплина
          </span>
          <div className="mt-1 font-bold text-[15px] truncate text-ink">
            {topSubject ? topSubject.subject : "—"}
          </div>
          <span className="font-mono text-success font-bold text-[13px]">
            {topSubject ? `${topSubject.average} / 12` : ""}
          </span>
        </div>

        <div className="stat">
          <span className="text-[11px] font-bold text-ink-muted uppercase font-mono tracking-wider block">
            Шкала Академии ТОП
          </span>
          <div className="mt-1 font-bold text-[14px] text-ink">12-балльная система</div>
          <span className="font-mono text-[12px] text-success font-bold flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>Активна</span>
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-surface border-2 border-ink rounded-[10px] shadow-hard-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по предмету или преподавателю..."
            className="w-full pl-9 pr-3 h-9 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
          />
        </div>

        <div className="text-[12px] text-ink-muted font-mono">
          Предметов в списке: <strong className="text-ink">{filteredMarks.length}</strong>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMarks.map((item, idx) => (
          <section key={idx} className="win shadow-hard">
            {/* Subject Window Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 bg-surface-2 border-b-2 border-ink">
              <div>
                <h2 className="text-[15px] font-bold text-ink">{item.subject}</h2>
                <span className="text-[12px] text-ink-muted block">
                  Преподаватель: <strong className="text-ink font-medium">{item.teacher}</strong>
                </span>
              </div>

              <div className="flex items-center gap-4 self-start sm:self-auto font-mono text-[13px]">
                <span className="text-ink-muted">
                  Посещаемость: <strong className="text-ink">{item.attendanceRate ?? 100}%</strong>
                </span>
                <span className="bg-highlight text-on-highlight px-2.5 py-0.5 rounded-[4px] border border-ink font-bold">
                  Ср. балл: {item.average} / 12
                </span>
              </div>
            </header>

            {/* Marks List */}
            <div className="p-4 space-y-3">
              <span className="text-[12px] font-bold text-ink-muted uppercase font-mono tracking-wide block">
                Выставленные оценки:
              </span>

              {item.marksList.length === 0 ? (
                <div className="p-4 rounded-[6px] bg-paper border-2 border-line text-[13px] text-ink-muted italic">
                  Пока нет выставленных оценок по данному предмету.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {item.marksList.map((m, mIdx) => {
                    const isHigh = m.mark >= 10;
                    return (
                      <div
                        key={mIdx}
                        className="p-3 rounded-[6px] bg-paper border-2 border-ink flex items-center justify-between shadow-hard-xs"
                      >
                        <div className="space-y-0.5 truncate mr-2">
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="px-1.5 py-0.2 rounded bg-surface-2 border border-ink text-ink font-bold">
                              {m.type}
                            </span>
                            <span className="text-ink-muted">{m.date}</span>
                          </div>
                          <div className="text-[12px] font-bold text-ink truncate">
                            {m.topic}
                          </div>
                        </div>

                        <div
                          className={`text-[16px] font-mono font-bold px-2 py-0.5 rounded-[4px] border-2 border-ink shrink-0 ${
                            isHigh
                              ? "bg-highlight text-on-highlight"
                              : "bg-surface text-ink"
                          }`}
                        >
                          {m.mark}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Modal: Добавить оценку */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border-2 border-ink rounded-[10px] p-6 space-y-4 shadow-hard relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
              <h3 className="text-[16px] font-bold text-ink flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                <span>Добавить оценку в журнал</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="ib w-8 h-8 rounded-[6px]"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            <form onSubmit={handleAddMarkSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink">Предмет / Дисциплина</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink focus:outline-accent"
                >
                  {marksData.map((s, i) => (
                    <option key={i} value={s.subject}>
                      {s.subject}
                    </option>
                  ))}
                  <option value="CUSTOM">+ Ввести новый предмет...</option>
                </select>
                {newSubject === "CUSTOM" && (
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Название нового предмета..."
                    className="w-full mt-2 h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                    required
                  />
                )}
              </div>

              {/* Mark selector (1-12) */}
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink flex items-center justify-between">
                  <span>Балл (12-балльная шкала)</span>
                  <span className="font-mono text-accent font-bold text-[14px]">{newMark} / 12</span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewMark(num)}
                      className={`h-8 rounded-[4px] border-2 border-ink text-xs font-mono font-bold cursor-pointer transition-all ${
                        newMark === num
                          ? "bg-accent text-white"
                          : "bg-surface-2 text-ink hover:bg-surface"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink">Тип работы</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink focus:outline-accent"
                >
                  <option value="Практика">Практика (Практическое занятие)</option>
                  <option value="Лабораторная">Лабораторная работа</option>
                  <option value="Экзамен">Экзамен / Зачет</option>
                  <option value="Контрольная">Контрольная точка</option>
                  <option value="ДЗ">Домашнее задание</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink">Тема работы</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Например: Архитектура микросервисов..."
                  className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-ink">Преподаватель</label>
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="Соколов Д. В."
                    className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[13px] font-bold text-ink">Дата</label>
                  <input
                    type="text"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    placeholder="16.10"
                    className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn sec h-9 text-[13px]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMark}
                  className="btn pri h-9 text-[13px]"
                >
                  {isSubmittingMark ? "Сохранение..." : "Сохранить в журнал"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Синхронизация с Академией */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-surface border-2 border-ink rounded-[10px] p-6 space-y-4 shadow-hard relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
              <h3 className="text-[16px] font-bold text-ink flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-accent" />
                <span>Синхронизация с Академией ТОП</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSyncModal(false)}
                className="ib w-8 h-8 rounded-[6px]"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            <p className="text-[13px] text-ink leading-relaxed">
              Журнал подключен через шлюз Академии ТОП (<span className="font-mono text-accent font-bold">msapi.top-academy.ru</span>).
              Введите данные студента для получения актуальных оценок и расписания.
            </p>

            {syncResult && (
              <div
                className={`p-3 rounded-[6px] border-2 border-ink text-[12px] font-bold ${
                  syncResult.success
                    ? "bg-surface-2 text-success"
                    : "bg-surface-2 text-danger"
                }`}
              >
                {syncResult.message || syncResult.error}
              </div>
            )}

            <form onSubmit={handleSyncSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-ink-muted" />
                  <span>Логин студента (MyStat / Journal)</span>
                </label>
                <input
                  type="text"
                  value={syncLogin}
                  onChange={(e) => setSyncLogin(e.target.value)}
                  placeholder="Логин студента..."
                  className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-ink-muted" />
                  <span>Пароль студента</span>
                </label>
                <input
                  type="password"
                  value={syncPassword}
                  onChange={(e) => setSyncPassword(e.target.value)}
                  placeholder="Пароль..."
                  className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-ink">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="btn sec h-9 text-[13px]"
                >
                  Закрыть
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="btn pri h-9 text-[13px]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Запрос..." : "Запустить синхронизацию"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
