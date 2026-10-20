import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Bell, Moon, Sun, User, LogOut, ChevronDown } from "lucide-react";

export const Header = ({ onOpenProfile, pageTitle = "Главная" }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme");
    if (currentTheme === "dark") {
      setIsDark(true);
    } else if (currentTheme === "light") {
      setIsDark(false);
    } else {
      setIsDark(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const nextDark = !isDark;
    setIsDark(nextDark);
    const themeName = nextDark ? "dark" : "light";
    root.setAttribute("data-theme", themeName);
    localStorage.setItem("journal-theme", themeName);
  };

  if (!user) return null;

  const initials = (user.fullName || user.username || "Студент")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-paper border-b-2 border-ink px-4 md:px-6 flex items-center justify-between select-none">
      {/* Left: Mobile Brand & Desktop Title */}
      <div className="flex items-center gap-3">
        {/* On mobile screens when sidebar is hidden */}
        <div className="flex md:hidden items-center gap-2 font-bold text-base text-ink">
          <span className="bg-accent text-white border-2 border-ink rounded-[6px] px-2 py-0.5 text-xs font-mono font-bold">
            ТОП
          </span>
          <span>Journal</span>
        </div>

        {/* On desktop: current page title */}
        <span className="hidden md:inline-block font-bold text-base text-ink">
          {pageTitle}
        </span>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 1. Theme toggle button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="ib"
          aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
          title={isDark ? "Светлая тема" : "Тёмная тема"}
        >
          {isDark ? (
            <Sun className="w-[18px] h-[18px] text-ink" strokeWidth={2} />
          ) : (
            <Moon className="w-[18px] h-[18px] text-ink" strokeWidth={2} />
          )}
        </button>

        {/* 2. Notifications button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
            className="ib"
            aria-label="Уведомления"
            title="Уведомления"
          >
            <Bell className="w-[18px] h-[18px] text-ink" strokeWidth={2} />
            <span className="pip" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-surface border-2 border-ink rounded-[10px] shadow-hard z-50 overflow-hidden">
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-2 border-b-2 border-ink">
                <span className="text-[13px] font-bold text-ink">Уведомления</span>
                <span className="font-mono text-[11px] bg-highlight text-on-highlight px-2 py-0.5 rounded-full border border-ink font-semibold">
                  2 новых
                </span>
              </div>
              <div className="p-2 space-y-1.5 text-xs">
                <div className="p-2.5 bg-surface rounded-[6px] border border-line">
                  <div className="font-bold text-ink">Оценка 12 / 12</div>
                  <div className="text-ink-muted text-[12px]">Проектирование баз данных · Практика</div>
                </div>
                <div className="p-2.5 bg-highlight/30 rounded-[6px] border border-ink">
                  <div className="font-bold text-ink">Пара в 10:35</div>
                  <div className="text-ink text-[12px]">Базы данных (PostgreSQL) · Ауд. 308</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. User profile avatar & dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-[6px] hover:bg-surface-2 transition-colors cursor-pointer text-left"
          >
            <div className="hidden sm:block text-right leading-tight">
              <div className="text-[14px] font-bold text-ink truncate max-w-[140px]">
                {user.fullName || user.username || "Студент"}
              </div>
              <small className="block font-mono text-[12px] text-ink-muted">
                {user.group || "ВЕБ-22/3"}
              </small>
            </div>

            <div className="w-9 h-9 rounded-full bg-highlight text-on-highlight border-2 border-ink flex items-center justify-center font-bold text-[14px] shrink-0">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:block" strokeWidth={2} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-surface border-2 border-ink rounded-[10px] shadow-hard z-50 overflow-hidden">
              <div className="p-3 bg-surface-2 border-b-2 border-ink">
                <div className="font-bold text-[14px] text-ink">{user.fullName || user.username || "Студент"}</div>
                <div className="font-mono text-[12px] text-ink-muted">{user.group || "ВЕБ-22/3"} · 4 курс</div>
              </div>

              <div className="p-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-[13px] font-medium text-ink hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-ink-muted" strokeWidth={2} />
                    <span>Профиль студента</span>
                  </span>
                  <span className="text-[12px] text-accent font-mono font-bold">→</span>
                </button>

                <div className="border-t border-line my-1" />

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-danger" strokeWidth={2} />
                  <span>Выйти из аккаунта</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
