import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Video,
  Monitor,
  PhoneOff,
  Users,
  PenTool,
  Code2,
  Copy,
  Check,
  AlertCircle,
  School,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Radio
} from "lucide-react";

export const CALL_AUDITORIUMS = [
  {
    id: "group-9-3-rpo",
    name: "Аудитория 9/3-РПО — Разработка программного обеспечения",
    shortName: "9/3-РПО",
    icon: "💻",
    subject: "Разработка ПО",
    desc: "Frontend, Backend, Алгоритмы и Архитектура ПО"
  },
  {
    id: "group-9-1-rpo",
    name: "Аудитория 9/1-РПО — Разработка программного обеспечения",
    shortName: "9/1-РПО",
    icon: "⚡",
    subject: "Разработка ПО",
    desc: "Программирование, ООП, Базы данных и Веб-технологии"
  },
  {
    id: "group-9-2-rpo",
    name: "Аудитория 9/2-РПО — Разработка программного обеспечения",
    shortName: "9/2-РПО",
    icon: "🚀",
    subject: "Разработка ПО",
    desc: "Клиент-серверные приложения, API, Системное ПО"
  },
  {
    id: "group-gd-9-1",
    name: "Аудитория ГД 9/1 — Компьютерная графика и дизайн",
    shortName: "ГД 9/1",
    icon: "🎨",
    subject: "Графический дизайн",
    desc: "UI/UX дизайн, Figma, векторная и растровая графика"
  },
  {
    id: "group-gd-9-2-sub1",
    name: "Аудитория ГД 9/2 (1 группа) — Компьютерная графика и дизайн",
    shortName: "ГД 9/2 (1 группа)",
    icon: "🖌️",
    subject: "Графический дизайн",
    desc: "1-я подгруппа: 3D моделирование, Blender, анимация"
  },
  {
    id: "group-gd-9-2-sub2",
    name: "Аудитория ГД 9/2 (2 группа) — Компьютерная графика и дизайн",
    shortName: "ГД 9/2 (2 группа)",
    icon: "✨",
    subject: "Графический дизайн",
    desc: "2-я подгруппа: Цифровой рисунок, скетчинг, брендинг"
  },
  {
    id: "group-gd-9-3",
    name: "Аудитория ГД 9/3 — Компьютерная графика и дизайн",
    shortName: "ГД 9/3",
    icon: "🎮",
    subject: "Графический дизайн / GameDev",
    desc: "Игровой арт, концепт-арт, дизайн персонажей и интерфейсов"
  },
  {
    id: "global-board",
    name: "Главный зал — Общая студенческая аудитория (Все потоки)",
    shortName: "Главный зал",
    icon: "🌐",
    subject: "Общий поток",
    desc: "Кураторские часы, общее общение студентов"
  }
];

export const AuditoriumCallPage = ({ setActiveTab, roomId: initialRoomId, setRoomId }) => {
  const { user } = useAuth();
  const [roomId, setLocalRoomId] = useState(initialRoomId || "group-9-3-rpo");

  useEffect(() => {
    if (initialRoomId) setLocalRoomId(initialRoomId);
  }, [initialRoomId]);

  const [inCall, setInCall] = useState(false);
  const [isLoadingCall, setIsLoadingCall] = useState(false);
  const [callError, setCallError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotice, setCallNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auditorium selection & modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const userName = user?.fullName || user?.username || "Студент ТОП";

  const currentAuditorium = CALL_AUDITORIUMS.find((a) => a.id === roomId) || {
    id: roomId,
    name: `Аудитория ${roomId}`,
    shortName: roomId,
    icon: "🏫",
    subject: "Специальный класс",
    desc: "Пользовательская комната"
  };

  const handleSelectRoom = (newRoomId) => {
    if (newRoomId === roomId) return;
    if (inCall) {
      handleLeaveCall();
    }
    setLocalRoomId(newRoomId);
    if (setRoomId) setRoomId(newRoomId);
    setShowRoomDropdown(false);
    const found = CALL_AUDITORIUMS.find((a) => a.id === newRoomId);
    showNotice(`Выбрана: ${found ? found.shortName : newRoomId}`);
  };

  const handleCreateCustomRoom = (e) => {
    e.preventDefault();
    const clean = customInput.trim().toLowerCase().replace(/[^a-z0-9а-яё_-]/gi, "-");
    if (!clean) return;
    handleSelectRoom(clean);
    setCustomInput("");
    setShowCustomModal(false);
  };

  // Call duration counter
  useEffect(() => {
    let timer = null;
    if (inCall && !isLoadingCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall, isLoadingCall]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const showNotice = (text) => {
    setCallNotice(text);
    setTimeout(() => setCallNotice(null), 3500);
  };

  const copyRoomLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    showNotice("Ссылка на аудиторию скопирована!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Dynamic Jitsi External API Script Loader
  const loadJitsiScript = () => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve(window.JitsiMeetExternalAPI);
        return;
      }
      const existingScript = document.getElementById("jitsi-external-api-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.JitsiMeetExternalAPI));
        existingScript.addEventListener("error", () => reject(new Error("Не удалось загрузить скрипт Jitsi")));
        return;
      }
      const script = document.createElement("script");
      script.id = "jitsi-external-api-script";
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => resolve(window.JitsiMeetExternalAPI);
      script.onerror = () => reject(new Error("Не удалось загрузить модуль видеоконференций. Проверьте интернет-соединение."));
      document.body.appendChild(script);
    });
  };

  // Initialize and Join Jitsi Call
  const handleJoinCall = async () => {
    setCallError(null);
    setIsLoadingCall(true);
    setInCall(true);

    try {
      const JitsiAPI = await loadJitsiScript();

      if (!jitsiContainerRef.current) {
        // Allow DOM to render container element
        await new Promise((r) => setTimeout(r, 100));
      }

      if (!jitsiContainerRef.current) {
        throw new Error("Контейнер аудитории не готов для подключения.");
      }

      // Dispose any existing Jitsi instance
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      // Clear container DOM
      jitsiContainerRef.current.innerHTML = "";

      // Sanitize room name for Jitsi
      const sanitizedRoomName = `TopAcademy_Journal2_${roomId.replace(/[^a-zA-Z0-9]/g, "_")}`;

      const options = {
        roomName: sanitizedRoomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
          email: user?.email || `${user?.username || "student"}@top-academy.ru`,
          avatarURL: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userName)}`
        },
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          prejoinPageEnabled: false,
          prejoinConfig: { enabled: false },
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          hideConferenceSubject: false,
          subject: `${currentAuditorium.shortName} · ${currentAuditorium.subject}`,
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "tileview",
            "participants-pane",
            "select-background",
            "noisesuppression",
            "fullscreen",
            "settings",
            "videoquality",
            "hangup"
          ]
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: "",
          SHOW_POWERED_BY: false,
          DEFAULT_BACKGROUND: "#0f172a",
          TOOLBAR_ALWAYS_VISIBLE: true
        }
      };

      const api = new JitsiAPI("meet.jit.si", options);
      jitsiApiRef.current = api;

      // Automatically hide loading overlay once iframe is mounted so it doesn't block Jitsi controls
      setTimeout(() => {
        setIsLoadingCall(false);
      }, 1200);

      api.addEventListeners({
        videoConferenceJoined: () => {
          setIsLoadingCall(false);
          showNotice(`Вы успешно вошли в ${currentAuditorium.shortName}!`);
        },
        videoConferenceLeft: () => {
          handleLeaveCall();
        },
        readyToClose: () => {
          handleLeaveCall();
        }
      });
    } catch (err) {
      console.error("Jitsi initialization error:", err);
      setCallError(err.message || "Ошибка подключения к видеоконференции");
      setIsLoadingCall(false);
      setInCall(false);
    }
  };

  // Leave Call cleanly
  const handleLeaveCall = () => {
    if (jitsiApiRef.current) {
      try {
        jitsiApiRef.current.dispose();
      } catch (_) {}
      jitsiApiRef.current = null;
    }
    setInCall(false);
    setIsLoadingCall(false);
    setCallDuration(0);
    showNotice("Вы покинули аудиторию.");
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (_) {}
        jitsiApiRef.current = null;
      }
    };
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast Notice */}
      {callNotice && (
        <div className="fixed top-20 right-6 z-50 bg-ink text-white px-4 py-2.5 rounded-[8px] border-2 border-line text-[13px] font-bold shadow-hard flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-highlight" />
          <span>{callNotice}</span>
        </div>
      )}

      {/* Top Header / Classroom Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-accent text-white flex items-center justify-center font-bold text-sm shadow-hard-xs">
              {currentAuditorium.icon}
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-ink tracking-tight flex items-center gap-2">
                <span>{currentAuditorium.name}</span>
                <span className="text-[12px] font-mono px-2 py-0.5 rounded-[4px] bg-accent/10 text-accent border border-accent/30">
                  {currentAuditorium.subject}
                </span>
              </h1>
              <p className="text-[12px] text-ink-muted">
                {currentAuditorium.desc}
              </p>
            </div>
          </div>

          {/* Quick Classroom Dropdown */}
          <div className="flex items-center gap-2 mt-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                className="btn sec text-[12px] h-7 px-2.5 flex items-center gap-1.5 font-bold"
              >
                <School className="w-3.5 h-3.5 text-accent" />
                <span>Сменить аудиторию</span>
                <ChevronDown className="w-3 h-3 text-ink-muted" />
              </button>

              {showRoomDropdown && (
                <div className="absolute left-0 top-full mt-1.5 w-80 bg-surface border-2 border-ink rounded-[8px] shadow-hard z-30 p-1.5 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-bold text-ink-muted uppercase tracking-wider">
                    Учебные аудитории Академии ТОП
                  </div>
                  {CALL_AUDITORIUMS.map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => handleSelectRoom(aud.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-[6px] text-left text-[12px] transition-colors cursor-pointer ${
                        aud.id === roomId
                          ? "bg-highlight text-on-highlight font-bold"
                          : "text-ink hover:bg-surface-2"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{aud.icon}</span>
                        <span className="truncate">{aud.shortName}</span>
                      </span>
                      {aud.id === roomId && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                  <div className="border-t border-line my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomDropdown(false);
                      setShowCustomModal(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-[6px] text-left text-[12px] text-accent font-bold hover:bg-surface-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Ввести код аудитории...</span>
                  </button>
                </div>
              )}
            </div>

            <span className="text-[12px] font-mono text-ink-muted hidden sm:inline flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
              <span>Jitsi Meet SFU · HD Видео · Демка · Микрофон</span>
            </span>
          </div>
        </div>

        {/* Quick Tabs to Whiteboard & Code */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (setRoomId) setRoomId(roomId);
              setActiveTab("whiteboard");
            }}
            className="btn sec h-9 text-[13px] flex items-center gap-2"
            title="Открыть доску этой аудитории"
          >
            <PenTool className="w-4 h-4 text-accent" strokeWidth={2} />
            <span>Электронная доска</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className="btn sec h-9 text-[13px] flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-ink" strokeWidth={2} />
            <span>Песочница кода</span>
          </button>
        </div>
      </div>

      {/* 1. Pre-call Screen (Auditorium Selector & Ready CTA) */}
      {!inCall ? (
        <div className="space-y-6">
          {/* Custom Room Modal */}
          {showCustomModal && (
            <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="win max-w-md w-full bg-surface border-2 border-ink shadow-hard">
                <header className="flex items-center justify-between">
                  <h2>Подключение к своей аудитории</h2>
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="text-ink hover:text-danger cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </header>
                <form onSubmit={handleCreateCustomRoom} className="p-4 space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-ink mb-1">
                      Код аудитории или проектной комнаты
                    </label>
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Например: group-web-22 или lab-room-7"
                      className="w-full h-10 px-3 rounded-[6px] bg-surface-2 border-2 border-ink text-[13px] text-ink font-mono"
                      autoFocus
                    />
                    <p className="text-[11px] text-ink-muted mt-1">
                      Все студенты и преподаватели с этим кодом подключаются к общему видеозвонку и доске.
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomModal(false)}
                      className="btn sec text-[13px] h-9"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      className="btn pri text-[13px] h-9"
                    >
                      Выбрать аудиторию
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Room Selection Grid */}
          <div className="win">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-accent" />
                <h2>Выбор учебной аудитории для звонка</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="btn sec text-[12px] h-7 px-2.5 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Свой код комнаты</span>
              </button>
            </header>

            <div className="p-4 sm:p-5">
              <p className="text-[13px] text-ink-muted mb-4">
                Выберите класс по расписанию для подключения к онлайн-занятию. У каждой аудитории отдельная комната связи и интерактивная доска:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {CALL_AUDITORIUMS.map((aud) => {
                  const isSelected = aud.id === roomId;
                  return (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => handleSelectRoom(aud.id)}
                      className={`p-3.5 rounded-[10px] border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-surface-2 border-accent shadow-hard ring-2 ring-accent"
                          : "bg-surface border-ink hover:border-accent hover:shadow-hard"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-2xl p-1 bg-surface rounded-[6px] border border-line">
                            {aud.icon}
                          </span>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded-[4px] border font-bold ${
                              isSelected
                                ? "bg-accent text-white border-accent"
                                : "bg-surface-2 text-ink-muted border-line"
                            }`}
                          >
                            {aud.subject}
                          </span>
                        </div>
                        <h4 className="font-bold text-[14px] text-ink leading-tight mb-1">
                          {aud.shortName}
                        </h4>
                        <p className="text-[12px] text-ink-muted leading-snug">
                          {aud.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-line/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-ink-muted truncate max-w-[130px]">{aud.id}</span>
                        {isSelected ? (
                          <span className="text-accent font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Выбрано
                          </span>
                        ) : (
                          <span className="text-ink-muted hover:text-ink font-semibold">Подключиться</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Auditorium Summary & Join CTA */}
          <div className="win bg-surface border-2 border-ink shadow-hard">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-accent" />
                <h2>Готовность к звонку</h2>
              </div>
              <span className="font-mono text-[12px] text-success font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
                <span>SFU Сервер Активен</span>
              </span>
            </header>

            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-3.5">
                <div className="w-13 h-13 rounded-[10px] bg-highlight text-on-highlight border-2 border-ink flex items-center justify-center text-2xl shrink-0 shadow-hard">
                  {currentAuditorium.icon}
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-ink leading-tight">
                    {currentAuditorium.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[12px] font-mono text-ink-muted">
                    <span>ID: <strong className="text-ink">{roomId}</strong></span>
                    <span>·</span>
                    <span>Предмет: <strong className="text-ink">{currentAuditorium.subject}</strong></span>
                    <span>·</span>
                    <span className="text-success font-bold">HD Камера · Микрофон · Демка Экрана</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 md:shrink-0">
                <button
                  type="button"
                  onClick={copyRoomLink}
                  className="btn sec h-11 px-3 text-[13px] flex items-center gap-2"
                  title="Скопировать ссылку для одногруппников"
                >
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-ink" />}
                  <span>{copied ? "Скопировано!" : "Ссылка"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (setRoomId) setRoomId(roomId);
                    setActiveTab("whiteboard");
                  }}
                  className="btn sec h-11 px-4 text-[13px] flex items-center gap-2"
                  title="Открыть электронную доску этой аудитории"
                >
                  <PenTool className="w-4 h-4 text-ink" />
                  <span>Доска</span>
                </button>

                <button
                  type="button"
                  onClick={handleJoinCall}
                  className="btn pri h-11 px-6 text-[14px] flex items-center gap-2 !bg-accent text-white font-bold shadow-hard cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Войти в {currentAuditorium.shortName}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Instructions Notice */}
          <div className="rounded-[10px] bg-surface-2 border border-line p-4 text-[13px] text-ink-muted flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <strong className="text-ink block mb-0.5">Новый высокостабильный видеодвижок Jitsi Meet SFU:</strong>
              При первом входе браузер запросит разрешение на камеру и микрофон — нажмите «Разрешить». Демонстрация экрана включается в один клик по иконке монитора в нижней панели звонка.
            </div>
          </div>
        </div>
      ) : (
        /* 2. Active Jitsi Meet Video Call Interface */
        <div className="space-y-4">
          {/* Helpful Host / Peripherals Hint */}
          <div className="rounded-[8px] bg-accent/10 border border-accent/30 px-3.5 py-2 text-[12px] text-ink flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent shrink-0" />
              <span>
                <strong>Подсказка:</strong> Если в окне звонка написано <em>«The conference has not yet started»</em> — нажмите синюю кнопку <strong>«I am the host»</strong> слева и подтвердите вход через Google или GitHub, чтобы открыть комнату для всех.
              </span>
            </span>
          </div>

          {/* Top In-Call Bar */}
          <div className="bg-surface border-2 border-ink rounded-[10px] shadow-hard p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[14px] text-ink flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
                <span>{currentAuditorium.shortName}</span>
              </span>
              <span className="text-ink-muted">·</span>
              <span className="font-mono text-[12px] text-accent font-bold flex items-center gap-1.5">
                <span>В эфире:</span>
                <span>{formatDuration(callDuration)}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (setRoomId) setRoomId(roomId);
                  setActiveTab("whiteboard");
                }}
                className="btn sec h-9 text-[12px] flex items-center gap-1.5"
                title="Открыть электронную доску этой аудитории"
              >
                <PenTool className="w-3.5 h-3.5 text-accent" />
                <span>Доска</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className="btn sec h-9 text-[12px] flex items-center gap-1.5"
                title="Открыть песочницу кода"
              >
                <Code2 className="w-3.5 h-3.5 text-ink" />
                <span>Песочница</span>
              </button>

              <button
                type="button"
                onClick={copyRoomLink}
                className="btn sec h-9 text-[12px] flex items-center gap-1.5"
                title="Скопировать ссылку аудитории"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Скопировано!" : "Поделиться"}</span>
              </button>

              <button
                type="button"
                onClick={handleLeaveCall}
                className="btn pri !bg-danger text-white h-9 px-4 text-[13px] font-bold flex items-center gap-1.5 ml-2 shadow-hard-xs cursor-pointer hover:opacity-95"
                title="Покинуть аудиторию"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Выйти</span>
              </button>
            </div>
          </div>

          {/* Call Container */}
          <div className="relative rounded-[12px] bg-ink border-2 border-ink shadow-hard overflow-hidden min-h-[640px] h-[78vh] flex items-center justify-center">
            {isLoadingCall && (
              <div className="absolute inset-0 bg-ink/90 z-20 flex flex-col items-center justify-center gap-3 text-white">
                <RefreshCw className="w-8 h-8 animate-spin text-accent" />
                <p className="text-[14px] font-bold">Подключение к аудитории {currentAuditorium.shortName}...</p>
                <p className="text-[12px] text-white/60">Инициализация защищенного медиа-канала Jitsi SFU</p>
              </div>
            )}

            {callError && (
              <div className="absolute inset-0 bg-ink/95 z-30 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
                <AlertCircle className="w-10 h-10 text-danger" />
                <h3 className="text-lg font-bold">Не удалось подключиться к видеоконференции</h3>
                <p className="text-xs text-white/70 max-w-md font-mono">{callError}</p>
                <button
                  type="button"
                  onClick={handleJoinCall}
                  className="btn pri !bg-accent text-white mt-2"
                >
                  Попробовать снова
                </button>
              </div>
            )}

            {/* Jitsi Iframe Parent Element */}
            <div
              ref={jitsiContainerRef}
              className="w-full h-full min-h-[640px]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
