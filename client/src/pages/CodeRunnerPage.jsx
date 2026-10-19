import React, { useState, useEffect } from "react";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

export const CodeRunnerPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [runReport, setRunReport] = useState(null);

  useEffect(() => {
    fetch("/api/code/tasks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tasks.length > 0) {
          setTasks(data.tasks);
          setSelectedTask(data.tasks[0]);
          setCode(data.tasks[0].initialCode);
        }
      });
  }, []);

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setCode(task.initialCode);
    setRunReport(null);
  };

  const handleResetCode = () => {
    if (selectedTask) {
      setCode(selectedTask.initialCode);
      setRunReport(null);
    }
  };

  const handleRunCode = async () => {
    if (!selectedTask) return;
    setIsRunning(true);

    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: selectedTask.language,
          testCases: selectedTask.testCases
        })
      });
      const data = await res.json();
      setRunReport(data);

      if (data.allPassed) {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Execution error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-accent" strokeWidth={2} />
            <span>Песочница кода & Автопроверка</span>
          </h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Практические алгоритмические задачи с автоматической валидацией
          </p>
        </div>

        {/* Task Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tasks.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTask(t)}
              className={`h-9 px-3 rounded-[6px] border-2 border-ink text-[12px] font-mono cursor-pointer transition-transform ${
                selectedTask?.id === t.id
                  ? "bg-accent text-white font-bold shadow-hard-xs"
                  : "bg-surface text-ink hover:bg-surface-2"
              }`}
            >
              {t.title.split(":")[0]}
            </button>
          ))}
        </div>
      </div>

      {selectedTask && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Description & Test Verdicts */}
          <div className="lg:col-span-5 space-y-4">
            <section className="win shadow-hard">
              <header>
                <h2>{selectedTask.title}</h2>
                <span className="font-mono text-[11px] bg-highlight border border-ink text-on-highlight px-2 py-0.5 rounded-[4px] font-bold">
                  {selectedTask.difficulty}
                </span>
              </header>

              <div className="p-4 space-y-3 text-[13px]">
                <p className="p-3 bg-paper rounded-[6px] border-2 border-ink leading-relaxed text-ink">
                  {selectedTask.description}
                </p>

                <div>
                  <span className="text-[11px] font-mono font-bold text-ink-muted block mb-1.5 uppercase">
                    Тестовые наборы ({selectedTask.testCases.length}):
                  </span>
                  <div className="space-y-1.5 font-mono text-[12px]">
                    {selectedTask.testCases.map((tc, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-[6px] bg-surface-2 border border-line flex justify-between"
                      >
                        <span className="text-ink">Вход: {tc.input}</span>
                        <span className="text-accent font-bold">Ожидается: {tc.expected}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Test Results Output */}
            {runReport && (
              <section className="win shadow-hard">
                <header>
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accent" />
                    <h2>Результаты проверки</h2>
                  </div>
                  <span className="font-mono text-[11px] text-ink-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {runReport.durationMs} мс
                  </span>
                </header>

                <div className="p-4 space-y-3">
                  {runReport.allPassed ? (
                    <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-success text-success text-[13px] font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Все тесты пройдены! Решение зачтено.</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-danger text-danger text-[13px] font-bold flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>
                        Пройдено {runReport.passedCount} из {runReport.totalCount} тестов.
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 pt-1 font-mono text-[12px]">
                    {runReport.testResults?.map((res) => (
                      <div
                        key={res.testIndex}
                        className={`p-2.5 rounded-[6px] border-2 space-y-1 ${
                          res.passed
                            ? "border-success bg-surface-2 text-success"
                            : "border-danger bg-surface-2 text-danger"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Тест #{res.testIndex}: {res.passed ? "✓ ПРОЙДЕН" : "✕ ОШИБКА"}</span>
                          <span>Вход: {res.input}</span>
                        </div>
                        <div className="text-[11px] flex justify-between text-ink">
                          <span>Ожидалось: <strong>{res.expected}</strong></span>
                          <span>Получено: <strong>{res.actual}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Code Editor */}
          <div className="lg:col-span-7 win shadow-hard flex flex-col">
            <header className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-bold text-ink flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span>solution.js</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetCode}
                  title="Сбросить код"
                  className="ib w-8 h-8 rounded-[4px]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="btn pri h-8 text-[12px] px-3"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isRunning ? "Тестирование..." : "Проверить решение"}</span>
                </button>
              </div>
            </header>

            <div className="relative flex-1 min-h-[440px] bg-paper">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck="false"
                className="w-full h-full min-h-[440px] p-4 bg-paper text-ink font-mono text-[13px] leading-relaxed resize-none focus:outline-none"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
