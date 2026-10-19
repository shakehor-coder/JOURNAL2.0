import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown
} from "lucide-react";

export const LeaderboardPage = ({ onOpenProfile }) => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch("/api/journal/rating")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.leaderboard) setLeaderboard(data.leaderboard);
      });
  }, []);

  const getStudentIdByName = (name) => {
    if (name.includes("Алексей")) return "std-78291";
    if (name.includes("София")) return "std-78292";
    if (name.includes("Даниил")) return "std-78293";
    if (name.includes("Мария")) return "std-78294";
    if (name.includes("Максим")) return "std-78295";
    return "std-78291";
  };

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-accent" strokeWidth={2} />
            <span>Рейтинг группы · MyStat</span>
          </h1>
          <p className="text-[13px] text-ink-muted mt-0.5">
            Кликните на студента, чтобы открыть его профиль
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-[6px] bg-surface-2 border-2 border-ink text-[12px] font-mono font-bold text-ink">
          Семестр 4 · Текущий сезон
        </div>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
        {/* 2nd Place */}
        {top3[1] && (
          <div
            onClick={() => onOpenProfile && onOpenProfile(getStudentIdByName(top3[1].name))}
            className="win p-5 flex flex-col items-center text-center space-y-2.5 shadow-hard cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <div className="w-8 h-8 rounded-full bg-surface-2 border-2 border-ink text-ink font-bold font-mono text-[13px] flex items-center justify-center">
              2
            </div>
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-xl font-bold text-ink border-2 border-ink shadow-hard-xs">
              {top3[1].name[0]}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ink">{top3[1].name}</h3>
              <span className="text-[12px] font-mono text-ink-muted">{top3[1].group}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-mono font-bold">
              <span className="text-highlight">🪙 {top3[1].coins}</span>
              <span className="text-accent">💎 {top3[1].gems}</span>
            </div>
            <span className="text-[11px] text-accent font-medium">Просмотреть профиль →</span>
          </div>
        )}

        {/* 1st Place (Center, slightly taller) */}
        {top3[0] && (
          <div
            onClick={() => onOpenProfile && onOpenProfile(getStudentIdByName(top3[0].name))}
            className="win p-6 flex flex-col items-center text-center space-y-3 shadow-hard cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px] bg-surface md:-translate-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-highlight text-on-highlight border-2 border-ink font-bold flex items-center justify-center shadow-hard-xs">
              <Crown className="w-5 h-5" />
            </div>
            <div className="w-20 h-20 rounded-full bg-highlight text-on-highlight flex items-center justify-center text-2xl font-bold border-2 border-ink shadow-hard-xs">
              {top3[0].name[0]}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-highlight border border-ink text-on-highlight uppercase inline-block mb-1">
                Лидер группы
              </span>
              <h3 className="text-[16px] font-bold text-ink">{top3[0].name}</h3>
              <span className="text-[12px] font-mono text-ink-muted">{top3[0].group}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[12px] font-mono font-bold">
              <span className="text-highlight">🪙 {top3[0].coins}</span>
              <span className="text-accent">💎 {top3[0].gems}</span>
              <span className="text-ink bg-surface-2 px-1.5 py-0.5 rounded-[4px] border border-ink">{top3[0].ratingScore} PTS</span>
            </div>
            <span className="text-[11px] text-accent font-bold">Просмотреть профиль →</span>
          </div>
        )}

        {/* 3rd Place */}
        {top3[2] && (
          <div
            onClick={() => onOpenProfile && onOpenProfile(getStudentIdByName(top3[2].name))}
            className="win p-5 flex flex-col items-center text-center space-y-2.5 shadow-hard cursor-pointer transition-transform hover:translate-x-[1px] hover:translate-y-[1px]"
          >
            <div className="w-8 h-8 rounded-full bg-surface-2 border-2 border-ink text-ink font-bold font-mono text-[13px] flex items-center justify-center">
              3
            </div>
            <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-xl font-bold text-ink border-2 border-ink shadow-hard-xs">
              {top3[2].name[0]}
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-ink">{top3[2].name}</h3>
              <span className="text-[12px] font-mono text-ink-muted">{top3[2].group}</span>
            </div>
            <div className="flex items-center gap-3 text-[12px] font-mono font-bold">
              <span className="text-highlight">🪙 {top3[2].coins}</span>
              <span className="text-accent">💎 {top3[2].gems}</span>
            </div>
            <span className="text-[11px] text-accent font-medium">Просмотреть профиль →</span>
          </div>
        )}
      </div>

      {/* Remaining Students Table */}
      <section className="win">
        <header>
          <h2>Остальные студенты в рейтинге</h2>
        </header>

        <div className="divide-y divide-line">
          {remaining.map((st, i) => (
            <div
              key={st.id || i}
              onClick={() => onOpenProfile && onOpenProfile(getStudentIdByName(st.name))}
              className="py-3 px-4 flex items-center justify-between hover:bg-surface-2 transition-colors cursor-pointer group text-[13px]"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-ink-muted font-bold w-6 text-center">
                  #{i + 4}
                </span>
                <div className="w-8 h-8 rounded-full bg-surface-2 border-2 border-ink flex items-center justify-center text-xs font-bold text-ink">
                  {st.name[0]}
                </div>
                <div>
                  <div className="font-bold text-ink group-hover:text-accent transition-colors">
                    {st.name}
                  </div>
                  <span className="text-[11px] font-mono text-ink-muted">{st.group}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono font-medium text-[12px]">
                <span className="text-ink">🪙 {st.coins}</span>
                <span className="text-ink">💎 {st.gems}</span>
                <span className="bg-surface-2 px-2 py-0.5 rounded-[4px] border border-ink text-ink font-bold">
                  {st.ratingScore} PTS
                </span>
                <span className="text-accent font-bold">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
