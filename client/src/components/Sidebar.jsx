import React, { useState } from "react";
import {
  Home,
  User,
  Calendar,
  BookOpen,
  BarChart2,
  Video,
  PenTool,
  Code2,
  Trophy,
  Sliders,
  MoreHorizontal,
  X
} from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Главная", icon: Home },
    { id: "profile", label: "Профиль студента", icon: User },
    { id: "schedule", label: "Расписание", icon: Calendar },
    { id: "homework", label: "Домашние задания", icon: BookOpen, count: 2 },
    { id: "marks", label: "Успеваемость", icon: BarChart2 },
    { id: "call", label: "Аудитория (Звонок)", icon: Video, isLive: true },
    { id: "whiteboard", label: "Электронная доска", icon: PenTool },
    { id: "code", label: "Песочница кода", icon: Code2 },
    { id: "leaderboard", label: "Рейтинг", icon: Trophy },
    { id: "settings", label: "Интеграция с API", icon: Sliders }
  ];

  // Mobile bottom tabbar: 4 primary items + "Ещё"
  const mobilePrimaryIds = ["dashboard", "profile", "schedule", "homework"];
  const mobilePrimaryItems = menuItems.filter((item) =>
    mobilePrimaryIds.includes(item.id)
  );
  const mobileDrawerItems = menuItems.filter(
    (item) => !mobilePrimaryIds.includes(item.id)
  );

  const handleSelectTab = (id) => {
    setActiveTab(id);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* ========================================================
          1. Desktop Sidebar (md:flex, hidden < 800px)
          ======================================================== */}
      <aside className="hidden md:flex w-[248px] shrink-0 bg-[var(--side-bg)] text-[var(--side-text)] p-5 px-3 sticky top-0 h-screen flex-col border-r-2 border-[var(--ink)] select-none z-20">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 px-2 pb-4 font-bold text-lg text-[var(--side-text)]">
          <span className="bg-[var(--accent)] text-white border-2 border-[var(--side-text)] rounded-[6px] px-2 py-0.5 text-xs font-mono font-bold tracking-wide">
            ТОП
          </span>
          <span className="tracking-tight text-white font-bold">Journal</span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-0.5 mt-1" aria-label="Разделы дневника">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-3 min-h-[40px] px-3 rounded-[6px] text-[14px] cursor-pointer text-left transition-colors duration-120 ${
                  isActive
                    ? "bg-[var(--accent)] text-white font-medium"
                    : "text-[var(--side-text)] hover:bg-white/10"
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                <span className="truncate">{item.label}</span>

                {/* Badge count (only for homework) */}
                {item.count && (
                  <span className="ml-auto font-mono text-[12px] font-semibold bg-[var(--highlight)] text-[#1a1917] rounded-full px-2 py-0.5 shrink-0">
                    {item.count}
                  </span>
                )}

                {/* Live dot for Auditorium */}
                {item.isLive && (
                  <span
                    className="ml-auto w-2 h-2 rounded-full bg-[var(--success)] shrink-0"
                    title="Идёт сейчас"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-3 px-3 border-t border-[#3a3732] font-mono text-[13px] text-[#a8a296]">
          ВЕБ-22/3 · 4 курс
        </div>
      </aside>

      {/* ========================================================
          2. Mobile Bottom Tab Bar (visible < 800px)
          ======================================================== */}
      <nav
        aria-label="Нижнее мобильное меню"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--side-bg)] border-t-2 border-[var(--ink)] flex items-center justify-around px-1 py-1.5 select-none"
      >
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] px-1.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--side-text)] hover:text-white"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
                {item.count && (
                  <span className="absolute -top-1 -right-2 font-mono text-[9px] font-bold bg-[var(--highlight)] text-[#1a1917] rounded-full px-1 py-0.2">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="mt-0.5 truncate max-w-[62px]">
                {item.label.split(" ")[0]}
              </span>
            </button>
          );
        })}

        {/* 5th button: "Ещё" */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[46px] px-1.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors cursor-pointer ${
            mobileDrawerItems.some((i) => i.id === activeTab)
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--side-text)] hover:text-white"
          }`}
        >
          <MoreHorizontal className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span className="mt-0.5">Ещё</span>
        </button>
      </nav>

      {/* ========================================================
          3. Mobile Bottom Sheet Drawer for "Ещё"
          ======================================================== */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="bg-[var(--surface)] border-t-2 border-[var(--ink)] rounded-t-[12px] p-4 space-y-2 max-h-[75vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-[var(--ink)]">
              <span className="font-bold text-[14px] text-[var(--ink)]">
                Все разделы
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="ib w-8 h-8 rounded-[6px]"
                aria-label="Закрыть меню"
              >
                <X className="w-4 h-4 text-[var(--ink)]" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-1 pt-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between min-h-[42px] px-3 py-2 rounded-[6px] text-[14px] font-medium cursor-pointer text-left transition-colors ${
                      isActive
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--ink)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                      <span>{item.label}</span>
                    </div>

                    {item.isLive && (
                      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    )}

                    {item.count && (
                      <span className="font-mono text-xs font-bold bg-[var(--highlight)] text-[#1a1917] px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
