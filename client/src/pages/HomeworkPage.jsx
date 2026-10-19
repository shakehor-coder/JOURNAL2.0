import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  X,
  Paperclip,
  Send
} from "lucide-react";
import confetti from "canvas-confetti";

export const HomeworkPage = () => {
  const [homeworks, setHomeworks] = useState([]);
  const [selectedHw, setSelectedHw] = useState(null);
  const [submissionComment, setSubmissionComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHomeworks = () => {
    fetch("/api/journal/homework")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.homeworks) setHomeworks(data.homeworks);
      });
  };

  useEffect(() => {
    fetchHomeworks();
  }, []);

  const handleOpenModal = (hw) => {
    setSelectedHw(hw);
    setSubmissionComment(hw.submission?.comment || "");
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!selectedHw) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/journal/homework/${selectedHw.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: submissionComment,
          files: [{ name: "solution.js", size: "3.2 KB" }]
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 50,
          spread: 45,
          origin: { y: 0.6 }
        });
        fetchHomeworks();
        setSelectedHw(data.homework);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingList = homeworks.filter((h) => h.status === "pending");
  const inProgressList = homeworks.filter((h) => h.status === "in_progress");
  const reviewedList = homeworks.filter((h) => h.status === "reviewed");

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-accent" strokeWidth={2} />
            <span>Домашние задания</span>
          </h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Практические и лабораторные работы · Синхронизация с Академией ТОП
          </p>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono">
          <span className="px-3 py-1.5 rounded-[6px] bg-surface border-2 border-ink text-ink font-bold">
            Всего: {homeworks.length}
          </span>
          <span className="px-3 py-1.5 rounded-[6px] bg-highlight border-2 border-ink text-on-highlight font-bold">
            К сдаче: {pendingList.length}
          </span>
          <span className="px-3 py-1.5 rounded-[6px] bg-surface-2 border-2 border-ink text-success font-bold">
            Проверено: {reviewedList.length}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* PENDING COLUMN */}
        <section className="win">
          <header>
            <h2 className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>К выполнению</span>
            </h2>
            <span className="font-mono text-[12px] bg-highlight text-on-highlight border border-ink px-2 py-0.5 rounded-full font-bold">
              {pendingList.length}
            </span>
          </header>

          <div className="p-3 space-y-3">
            {pendingList.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-ink-muted">Нет заданий к выполнению</div>
            ) : (
              pendingList.map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => handleOpenModal(hw)}
                  className="bg-surface hover:bg-surface-2 p-3.5 rounded-[6px] border-2 border-ink cursor-pointer transition-all space-y-2 shadow-hard-xs group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-[4px] bg-highlight text-on-highlight border border-ink font-bold">
                      Дедлайн: {hw.deadline ? hw.deadline.split(" ")[0] : "Скоро"}
                    </span>
                    <span className="text-ink font-bold">до {hw.maxScore} б.</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                    {hw.title}
                  </h4>
                  <div className="text-[12px] text-ink-muted">{hw.subject}</div>
                  <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-ink-muted">
                    <span>{hw.teacher}</span>
                    <span className="text-accent font-bold">Сдать решение →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* IN PROGRESS COLUMN */}
        <section className="win">
          <header>
            <h2 className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span>На проверке</span>
            </h2>
            <span className="font-mono text-[12px] bg-surface-2 border border-ink px-2 py-0.5 rounded-full font-bold">
              {inProgressList.length}
            </span>
          </header>

          <div className="p-3 space-y-3">
            {inProgressList.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-ink-muted">Нет работ на проверке</div>
            ) : (
              inProgressList.map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => handleOpenModal(hw)}
                  className="bg-surface hover:bg-surface-2 p-3.5 rounded-[6px] border-2 border-ink cursor-pointer transition-all space-y-2 shadow-hard-xs group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-[4px] bg-surface-2 border border-ink text-ink font-bold">
                      Ожидает оценки
                    </span>
                    <span className="text-ink font-bold">{hw.maxScore} б.</span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                    {hw.title}
                  </h4>
                  <div className="text-[12px] text-ink-muted">{hw.subject}</div>
                  <div className="pt-2 border-t border-line flex items-center justify-between text-[11px] text-ink-muted">
                    <span>Сдано преподавателю</span>
                    <span className="font-medium text-ink">{hw.teacher}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* REVIEWED COLUMN */}
        <section className="win">
          <header>
            <h2 className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>Проверено</span>
            </h2>
            <span className="font-mono text-[12px] bg-surface-2 border border-ink px-2 py-0.5 rounded-full font-bold">
              {reviewedList.length}
            </span>
          </header>

          <div className="p-3 space-y-3">
            {reviewedList.length === 0 ? (
              <div className="text-center py-8 text-[13px] text-ink-muted">Пока нет проверенных заданий</div>
            ) : (
              reviewedList.map((hw) => (
                <div
                  key={hw.id}
                  onClick={() => handleOpenModal(hw)}
                  className="bg-surface hover:bg-surface-2 p-3.5 rounded-[6px] border-2 border-ink cursor-pointer transition-all space-y-2 shadow-hard-xs group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-[4px] bg-success text-white border border-ink font-bold">
                      Оценка: {hw.earnedScore} / {hw.maxScore}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                    {hw.title}
                  </h4>
                  <div className="text-[12px] text-ink-muted">{hw.subject}</div>
                  {hw.teacherFeedback && (
                    <p className="text-[12px] text-ink bg-surface-2 p-2 rounded-[6px] border border-line italic line-clamp-2">
                      «{hw.teacherFeedback}»
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Retro Modal for Submission */}
      {selectedHw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-2xl bg-surface border-2 border-ink rounded-[10px] shadow-hard overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 p-4 bg-surface-2 border-b-2 border-ink">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-bold bg-highlight text-on-highlight border border-ink">
                  {selectedHw.subject}
                </span>
                <h3 className="text-[16px] font-bold text-ink">{selectedHw.title}</h3>
                <div className="text-[12px] text-ink-muted flex flex-wrap items-center gap-3 pt-0.5">
                  <span>Преподаватель: <strong className="text-ink">{selectedHw.teacher}</strong></span>
                  <span>·</span>
                  <span>Дедлайн: <strong className="text-accent font-mono">{selectedHw.deadline}</strong></span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHw(null)}
                className="ib w-8 h-8 rounded-[6px]"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <h4 className="text-[13px] font-bold text-ink">Описание задания:</h4>
                <p className="text-[13px] text-ink leading-relaxed bg-paper p-3.5 rounded-[6px] border-2 border-ink">
                  {selectedHw.description}
                </p>
              </div>

              {selectedHw.earnedScore !== null && selectedHw.earnedScore !== undefined && (
                <div className="p-3.5 rounded-[6px] bg-surface-2 border-2 border-ink space-y-1">
                  <div className="flex items-center justify-between text-[13px] font-bold text-ink">
                    <span>Оценка преподавателя: {selectedHw.earnedScore} из {selectedHw.maxScore} баллов</span>
                  </div>
                  {selectedHw.teacherFeedback && (
                    <p className="text-[12px] text-ink-muted italic pt-1">
                      «{selectedHw.teacherFeedback}»
                    </p>
                  )}
                </div>
              )}

              {selectedHw.status !== "reviewed" ? (
                <form onSubmit={handleSubmitHomework} className="space-y-3 pt-1">
                  <label className="block text-[13px] font-bold text-ink">
                    Ваш ответ или комментарий к решению:
                  </label>
                  <textarea
                    rows={4}
                    value={submissionComment}
                    onChange={(e) => setSubmissionComment(e.target.value)}
                    placeholder="Вставьте ссылку на GitHub или опишите ход выполнения работы..."
                    className="w-full p-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent font-mono"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[12px] text-ink-muted font-mono">
                      <Paperclip className="w-3.5 h-3.5 text-ink" />
                      <span>Файл: solution.js (3.2 KB)</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn pri text-[13px] h-9"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Отправка..." : "Отправить на проверку"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 text-[13px] text-ink flex items-center justify-center gap-2 bg-surface-2 rounded-[6px] border-2 border-ink font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Задание проверено преподавателем и закрыто.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
