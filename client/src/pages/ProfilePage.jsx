import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ProfileEditorModal } from "../components/ProfileEditorModal";
import {
  User,
  Award,
  Globe,
  Github,
  Send,
  MessageSquare,
  Flame,
  Crown,
  Code2,
  Palette,
  Camera
} from "lucide-react";
import confetti from "canvas-confetti";

export const ProfilePage = ({ defaultStudentId = null, onSelectClassmate = null }) => {
  const { user, updateUserProfile } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(defaultStudentId || "me");
  const [profileData, setProfileData] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Guestbook note state
  const [guestbookText, setGuestbookText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [respectAnimating, setRespectAnimating] = useState(false);

  // Fetch all students list
  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/journal/students");
      const data = await res.json();
      if (data.success && data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch selected student profile
  const fetchProfile = async (id) => {
    setLoading(true);
    try {
      const fetchId = id === "me" ? (user?.id || "me") : id;
      const res = await fetch(`/api/journal/students/${fetchId}`);
      const data = await res.json();
      if (data.success && data.student) {
        setProfileData(data.student);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchProfile(selectedStudentId);
  }, [selectedStudentId, user]);

  const handleSelectStudent = (id) => {
    setSelectedStudentId(id);
    if (onSelectClassmate) onSelectClassmate(id);
  };

  const handleSaveProfile = async (updates) => {
    const res = await updateUserProfile(updates);
    if (res.success) {
      setProfileData(res.profile);
      fetchStudents();
    }
  };

  const handleSendRespect = async () => {
    if (!profileData) return;
    setRespectAnimating(true);
    try {
      const res = await fetch(`/api/journal/students/${profileData.id}/respect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user?.fullName || user?.username || "Студент"
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
        setProfileData((prev) => ({
          ...prev,
          respectsCount: data.respectsCount
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setRespectAnimating(false), 600);
    }
  };

  const handlePostGuestbook = async (e) => {
    e.preventDefault();
    if (!guestbookText.trim() || !profileData) return;
    setSubmittingNote(true);

    try {
      const res = await fetch(`/api/journal/students/${profileData.id}/respect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: guestbookText.trim(),
          author: user?.fullName || user?.username || "Студент"
        })
      });
      const data = await res.json();
      if (data.success) {
        confetti({
          particleCount: 40,
          spread: 45,
          origin: { y: 0.7 }
        });
        setProfileData((prev) => ({
          ...prev,
          respectsCount: data.respectsCount,
          guestbook: data.guestbook
        }));
        setGuestbookText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingNote(false);
    }
  };

  const isMe = profileData?.id === user?.id || selectedStudentId === "me";

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* 1. Classmates Switcher Bar */}
      <div className="bg-surface border-2 border-ink rounded-[10px] p-3 shadow-hard-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-bold text-ink shrink-0">
          <User className="w-4 h-4 text-accent" />
          <span>Одногруппники (ВЕБ-22/3):</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleSelectStudent("me")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border-2 border-ink text-[12px] font-bold cursor-pointer shrink-0 transition-transform ${
              isMe
                ? "bg-accent text-white shadow-hard-xs"
                : "bg-surface-2 text-ink hover:bg-surface"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-highlight text-on-highlight border border-ink flex items-center justify-center font-bold text-[10px]">
              {user?.fullName ? user.fullName[0] : "А"}
            </div>
            <span>Мой профиль</span>
          </button>

          {students
            .filter((s) => s.id !== user?.id)
            .map((st) => {
              const isSelected = selectedStudentId === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleSelectStudent(st.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[6px] border-2 border-ink text-[12px] font-medium cursor-pointer shrink-0 transition-transform ${
                    isSelected
                      ? "bg-accent text-white font-bold shadow-hard-xs"
                      : "bg-surface-2 text-ink hover:bg-surface"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-highlight text-on-highlight border border-ink flex items-center justify-center font-bold text-[10px]">
                    {st.fullName ? st.fullName[0] : "С"}
                  </div>
                  <span>{st.fullName.split(" ")[0]}</span>
                  {st.rank === 1 && <span className="text-[10px]">👑</span>}
                </button>
              );
            })}
        </div>
      </div>

      {loading || !profileData ? (
        <div className="text-center py-20 bg-surface border-2 border-ink rounded-[10px]">
          <span className="text-[13px] text-ink-muted font-mono">Загрузка профиля студента...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 2. Hero Profile Card with Banner */}
          <div className="bg-surface border-2 border-ink rounded-[10px] shadow-hard overflow-hidden">
            {/* Banner */}
            <div className="h-44 sm:h-52 w-full bg-surface-2 border-b-2 border-ink relative overflow-hidden flex items-end p-4">
              <div className="absolute inset-0 bg-[radial-gradient(#1a1917_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

              <div className="absolute top-4 right-4 flex items-center gap-2 font-mono text-[12px]">
                <span className="px-2.5 py-1 rounded-[6px] bg-surface border-2 border-ink text-ink font-bold flex items-center gap-1.5 shadow-hard-xs">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span>В сети</span>
                </span>
                <span className="px-2.5 py-1 rounded-[6px] bg-highlight border-2 border-ink text-on-highlight font-bold shadow-hard-xs">
                  Ранг #{profileData.rank || 1} в группе
                </span>
              </div>
            </div>

            {/* Profile Info Bar */}
            <div className="px-6 pb-6 pt-0 relative bg-surface">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                {/* Left: Avatar & Details */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                  {/* Avatar overlapping banner cleanly with protective ring */}
                  <div className="relative group shrink-0 -mt-14 sm:-mt-16 z-10">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-highlight text-on-highlight border-4 border-surface ring-2 ring-ink flex items-center justify-center text-3xl font-bold shadow-hard">
                      {profileData.fullName
                        ? profileData.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "АС"}
                    </div>
                    {isMe && (
                      <button
                        type="button"
                        onClick={() => setIsEditorOpen(true)}
                        title="Настроить профиль"
                        className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Изменить</span>
                      </button>
                    )}
                  </div>

                  {/* Details safely positioned BELOW the banner line */}
                  <div className="pt-3 sm:pt-4 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-[22px] sm:text-2xl font-bold text-ink">
                        {profileData.fullName}
                      </h1>
                      {profileData.rank === 1 && (
                        <span className="p-1 rounded-[4px] bg-highlight text-on-highlight border-2 border-ink font-bold text-[12px] inline-flex items-center shadow-hard-xs" title="Лидер группы">
                          <Crown className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1 text-[13px] text-ink-muted">
                      <span className="font-bold text-ink font-mono bg-surface-2 px-2 py-0.5 rounded-[4px] border border-ink">
                        {profileData.group || "ВЕБ-22/3"}
                      </span>
                      <span>·</span>
                      <span>{profileData.faculty || "Разработка ПО"}</span>
                      <span>·</span>
                      <span className="font-mono text-accent font-bold">
                        Уровень {profileData.level || 14} ({profileData.levelTitle || "Архитектор"})
                      </span>
                    </div>

                    {profileData.statusText && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-surface-2 border-2 border-ink text-[12px] text-ink shadow-hard-xs">
                        <span>{profileData.statusEmoji || "💻"}</span>
                        <span className="font-medium italic">«{profileData.statusText}»</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 shrink-0 pt-3 sm:pt-4">
                  {isMe ? (
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(true)}
                      className="btn pri text-[13px] h-9"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Настроить профиль</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendRespect}
                      disabled={respectAnimating}
                      className="btn pri text-[13px] h-9"
                    >
                      <Flame className="w-4 h-4 text-highlight" />
                      <span>Выразить респект ({profileData.respectsCount || 0})</span>
                    </button>
                  )}

                  <div className="px-3 py-2 rounded-[6px] bg-surface-2 border-2 border-ink text-[12px] font-mono font-bold text-ink flex items-center gap-1.5 shadow-hard-xs">
                    <span>🔥 {profileData.respectsCount || 0}</span>
                    <span className="text-ink-muted font-normal">респектов</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Two Columns: Bio/Skills and Stats/Guestbook */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* About Me */}
              <section className="win">
                <header>
                  <h2>О себе</h2>
                </header>
                <div className="p-4 text-[13px] text-ink leading-relaxed">
                  {profileData.bio || "Студент пока не заполнил информацию о себе. Нажмите «Настроить профиль», чтобы добавить описание!"}
                </div>
              </section>

              {/* Skills */}
              <section className="win">
                <header>
                  <h2>Стек технологий & Навыки</h2>
                </header>
                <div className="p-4 flex flex-wrap gap-2">
                  {profileData.skills && profileData.skills.length > 0 ? (
                    profileData.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-[6px] text-[12px] font-mono font-bold bg-surface-2 border-2 border-ink text-ink shadow-hard-xs"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] text-ink-muted italic">Навыки еще не указаны</span>
                  )}
                </div>
              </section>

              {/* Social Links */}
              <section className="win">
                <header>
                  <h2>Контакты и соцсети</h2>
                </header>
                <div className="p-4 space-y-2 text-[13px]">
                  {profileData.socialLinks?.github && (
                    <a
                      href={profileData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-[6px] bg-surface-2 hover:bg-surface border-2 border-ink flex items-center justify-between text-ink"
                    >
                      <span className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        <span>GitHub</span>
                      </span>
                      <span className="text-[12px] text-accent font-mono font-bold">→</span>
                    </a>
                  )}

                  {profileData.socialLinks?.telegram && (
                    <div className="p-2.5 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-between text-ink">
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-accent" />
                        <span>Telegram:</span>
                      </span>
                      <span className="font-mono font-bold">{profileData.socialLinks.telegram}</span>
                    </div>
                  )}

                  {profileData.socialLinks?.discord && (
                    <div className="p-2.5 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-between text-ink">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Discord:</span>
                      </span>
                      <span className="font-mono font-bold">{profileData.socialLinks.discord}</span>
                    </div>
                  )}

                  {profileData.socialLinks?.website && (
                    <a
                      href={profileData.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-[6px] bg-surface-2 hover:bg-surface border-2 border-ink flex items-center justify-between text-ink"
                    >
                      <span className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-success" />
                        <span>Сайт / Портфолио</span>
                      </span>
                      <span className="text-[12px] text-accent font-mono font-bold">→</span>
                    </a>
                  )}

                  {!profileData.socialLinks?.github &&
                    !profileData.socialLinks?.telegram &&
                    !profileData.socialLinks?.discord &&
                    !profileData.socialLinks?.website && (
                      <span className="text-[13px] text-ink-muted italic block">
                        Ссылки на соцсети не добавлены
                      </span>
                    )}
                </div>
              </section>
            </div>

            {/* Right Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="stat">
                  <span className="text-[10px] text-ink-muted font-bold uppercase font-mono block">
                    Средний балл
                  </span>
                  <b className="mt-1 font-mono text-[22px]">{profileData.averageGrade || "11.8"}</b>
                </div>

                <div className="stat">
                  <span className="text-[10px] text-ink-muted font-bold uppercase font-mono block">
                    Посещаемость
                  </span>
                  <b className="mt-1 font-mono text-[22px]">{profileData.attendancePercentage || "96.4"}%</b>
                </div>

                <div className="stat">
                  <span className="text-[10px] text-ink-muted font-bold uppercase font-mono block">
                    StepCoins
                  </span>
                  <b className="mt-1 font-mono text-[22px] text-highlight">{profileData.coins || 1420} 🪙</b>
                </div>

                <div className="stat">
                  <span className="text-[10px] text-ink-muted font-bold uppercase font-mono block">
                    Кристаллы
                  </span>
                  <b className="mt-1 font-mono text-[22px] text-accent">{profileData.gems || 385} 💎</b>
                </div>
              </div>

              {/* Badges Showcase */}
              <section className="win">
                <header>
                  <h2>Витрина наград & Достижений</h2>
                  <span className="font-mono text-[12px] text-ink-muted">
                    {profileData.badges?.length || 0} наград
                  </span>
                </header>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileData.badges?.map((badge) => (
                    <div
                      key={badge.id}
                      className="p-3 rounded-[6px] bg-surface-2 border-2 border-ink flex items-start gap-3 shadow-hard-xs"
                    >
                      <div className="w-8 h-8 rounded-[4px] bg-highlight text-on-highlight border border-ink flex items-center justify-center shrink-0 font-bold">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-ink">{badge.title}</h4>
                        <p className="text-[11px] text-ink-muted leading-tight mt-0.5">{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Wall of Respects / Guestbook */}
              <section className="win">
                <header>
                  <h2>Стена похвалы & Отзывы сокурсников</h2>
                  <span className="font-mono text-[12px] text-ink-muted">
                    {profileData.guestbook?.length || 0} записей
                  </span>
                </header>

                <div className="p-4 space-y-4">
                  <form onSubmit={handlePostGuestbook} className="flex gap-2">
                    <input
                      type="text"
                      value={guestbookText}
                      onChange={(e) => setGuestbookText(e.target.value)}
                      placeholder={
                        isMe
                          ? "Оставить заметку на своей стене..."
                          : `Написать похвалу для ${profileData.fullName.split(" ")[0]}...`
                      }
                      className="flex-1 h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                    />
                    <button
                      type="submit"
                      disabled={submittingNote || !guestbookText.trim()}
                      className="btn pri h-9 text-[13px] px-3.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingNote ? "..." : "Отправить"}</span>
                    </button>
                  </form>

                  <div className="space-y-2.5 pt-1">
                    {profileData.guestbook && profileData.guestbook.length > 0 ? (
                      profileData.guestbook.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-[6px] bg-surface-2 border border-line space-y-1"
                        >
                          <div className="flex items-center justify-between text-[12px]">
                            <strong className="text-ink font-bold">{note.author}</strong>
                            <span className="text-[11px] font-mono text-ink-muted">{note.time}</span>
                          </div>
                          <p className="text-[13px] text-ink">{note.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-[13px] text-ink-muted italic bg-surface-2 rounded-[6px] border border-line">
                        Пока нет отзывов. Будьте первым, кто оставит похвалу! 🔥
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        profile={profileData || user}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
