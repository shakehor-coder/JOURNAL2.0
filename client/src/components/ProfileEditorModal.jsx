import React, { useState } from "react";
import {
  X,
  Palette,
  Check,
  Save,
  Globe,
  Github,
  Send,
  MessageSquare,
  Zap,
  Tag,
  Camera
} from "lucide-react";
import confetti from "canvas-confetti";

export const ProfileEditorModal = ({ isOpen, onClose, profile, onSave }) => {
  if (!isOpen || !profile) return null;

  const availableSkills = [
    "React", "JavaScript", "TypeScript", "Node.js", "Python",
    "Tailwind CSS", "PostgreSQL", "Docker", "Git", "Figma",
    "C++", "Linux", "FastAPI", "Go", "Prisma ORM", "UI/UX"
  ];

  const emojiPresets = ["💻", "☕", "🔥", "🚀", "🎨", "⚡", "🧠", "🛡️", "✨", "🎧", "👾", "🎯"];

  // Form states
  const [statusEmoji, setStatusEmoji] = useState(profile.statusEmoji || "💻");
  const [statusText, setStatusText] = useState(profile.statusText || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [skills, setSkills] = useState(profile.skills || []);
  const [customSkill, setCustomSkill] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    github: profile.socialLinks?.github || "",
    telegram: profile.socialLinks?.telegram || "",
    discord: profile.socialLinks?.discord || "",
    website: profile.socialLinks?.website || ""
  });
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      statusEmoji,
      statusText,
      bio,
      skills,
      socialLinks
    };

    await onSave(updates);
    setSaving(false);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface border-2 border-ink rounded-[10px] shadow-hard overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-surface-2 border-b-2 border-ink flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-highlight border-2 border-ink flex items-center justify-center text-on-highlight font-bold">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-ink">
                Настройка профиля студента
              </h2>
              <p className="text-[12px] text-ink-muted">
                Укажите статус, навыки, информацию о себе и контакты
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ib w-8 h-8 rounded-[6px]"
          >
            <X className="w-4 h-4 text-ink" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* 1. Status Emoji & Status Message */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-accent" />
              <span>Девиз и статус профиля:</span>
            </label>

            {/* Emoji picker */}
            <div className="flex flex-wrap gap-1 pb-1">
              {emojiPresets.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setStatusEmoji(em)}
                  className={`w-9 h-9 rounded-[6px] border-2 border-ink text-base flex items-center justify-center cursor-pointer transition-transform ${
                    statusEmoji === em
                      ? "bg-highlight shadow-hard-xs scale-105"
                      : "bg-paper hover:bg-surface-2"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="Например: Изучаю PostgreSQL & пишу диплом ☕"
              className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
            />
          </div>

          {/* 2. Bio */}
          <div className="space-y-1.5 pt-2 border-t-2 border-line">
            <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-ink-muted" />
              <span>О себе (Bio):</span>
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Расскажите о своих проектах, интересах и курсах..."
              className="w-full p-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent leading-relaxed"
            />
          </div>

          {/* 3. Skills */}
          <div className="space-y-2.5 pt-2 border-t-2 border-line">
            <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-accent" />
              <span>Стек технологий & Навыки:</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {availableSkills.map((sk) => {
                const isSelected = skills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-[6px] border-2 border-ink text-[12px] font-mono cursor-pointer flex items-center gap-1 transition-transform ${
                      isSelected
                        ? "bg-accent text-white font-bold"
                        : "bg-surface-2 text-ink hover:bg-paper"
                    }`}
                  >
                    <span>{sk}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={addCustomSkill} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Добавить свой навык..."
                className="flex-1 h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
              />
              <button
                type="submit"
                className="btn sec h-9 text-[13px]"
              >
                + Добавить
              </button>
            </form>
          </div>

          {/* 4. Social Links */}
          <div className="space-y-2.5 pt-2 border-t-2 border-line">
            <label className="text-[13px] font-bold text-ink flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-accent" />
              <span>Социальные сети и контакты:</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-mono text-ink-muted block mb-1">GitHub:</span>
                <input
                  type="text"
                  value={socialLinks.github}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted font-mono focus:outline-accent"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-ink-muted block mb-1">Telegram:</span>
                <input
                  type="text"
                  value={socialLinks.telegram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, telegram: e.target.value })}
                  placeholder="@username"
                  className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted font-mono focus:outline-accent"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-ink-muted block mb-1">Discord:</span>
                <input
                  type="text"
                  value={socialLinks.discord}
                  onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                  placeholder="username#0000"
                  className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted font-mono focus:outline-accent"
                />
              </div>

              <div>
                <span className="text-[11px] font-mono text-ink-muted block mb-1">Сайт:</span>
                <input
                  type="text"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  placeholder="https://myportfolio.dev"
                  className="w-full h-9 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted font-mono focus:outline-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t-2 border-ink bg-surface-2 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn sec h-9 text-[13px]"
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn pri h-9 text-[13px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Сохранение..." : "Сохранить профиль"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
