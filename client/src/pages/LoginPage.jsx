import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  QrCode,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileText,
  Calendar,
  GraduationCap,
  Sparkles,
  Key,
  UserCheck,
  AlertCircle,
  Laptop
} from "lucide-react";

export const LoginPage = () => {
  const { loginWithCredentials, loginWithToken, loginWithCustomProfile, loginAsDemo, approveLoginFromQR, socket } = useAuth();
  const [activeTab, setActiveTab] = useState("password"); // 'password', 'custom', 'token', 'qr'

  // Credentials Form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Custom Name Form
  const [customName, setCustomName] = useState("");
  const [customGroup, setCustomGroup] = useState("");
  const [customBranch, setCustomBranch] = useState("Центральный филиал");

  // Token Form
  const [customToken, setCustomToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // QR Session state
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiresIn, setExpiresIn] = useState(300);
  const [qrStatus, setQrStatus] = useState("pending");

  const fetchNewQr = async () => {
    try {
      setQrStatus("pending");
      const res = await fetch("/api/auth/qr/generate");
      const data = await res.json();
      if (data.success) {
        setQrDataUrl(data.qrDataUrl);
        setSessionId(data.sessionId);
        setExpiresIn(300);

        if (socket) {
          socket.emit("join-qr-room", data.sessionId);
        }
      }
    } catch (err) {
      console.error("Failed to fetch QR:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "qr") {
      fetchNewQr();
    }
  }, [activeTab, socket]);

  useEffect(() => {
    if (expiresIn <= 0) {
      setQrStatus("expired");
      return;
    }
    const timer = setInterval(() => {
      setExpiresIn((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresIn]);

  useEffect(() => {
    if (!socket) return;
    const handleQrApproved = (data) => {
      setQrStatus("approved");
      setTimeout(() => {
        approveLoginFromQR(data.user, data.token);
      }, 500);
    };

    socket.on("qr-approved", handleQrApproved);
    return () => {
      socket.off("qr-approved", handleQrApproved);
    };
  }, [socket, approveLoginFromQR]);

  const handleSimulateApprove = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/auth/qr/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Пожалуйста, введите логин и пароль");
      return;
    }
    setLoading(true);
    setError("");
    const result = await loginWithCredentials(username.trim(), password.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Неверный логин или пароль студента Академии ТОП");
    }
  };

  // Custom Profile Submit
  const handleCustomProfileSubmit = async (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setError("Пожалуйста, введите ваше имя или ФИО");
      return;
    }
    setLoading(true);
    setError("");
    const result = await loginWithCustomProfile({
      fullName: customName.trim(),
      group: customGroup.trim() || "ВЕБ-22/3",
      branch: customBranch.trim()
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
  };

  // Token Submit
  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!customToken.trim()) {
      setError("Пожалуйста, вставьте токен");
      return;
    }
    setLoading(true);
    setError("");
    const result = await loginWithToken(customToken.trim());
    setLoading(false);
    if (!result.success) {
      setError(result.error || "Недействительный токен");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-paper text-ink font-sans">
      {/* 1. Top Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between pb-5 border-b-2 border-ink">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[6px] bg-ink text-paper flex items-center justify-center font-bold text-base border-2 border-ink shadow-hard-xs">
            TOP
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-ink uppercase leading-none">
              JOURNAL 2.0
            </div>
            <div className="text-xs text-ink-muted font-mono mt-1">
              Компьютерная Академия ТОП
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface border-2 border-ink text-xs font-mono font-bold text-ink shadow-hard-xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
            <span>Личный кабинет студента</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="w-full max-w-5xl mx-auto my-auto py-8">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[6px] bg-highlight border-2 border-ink text-xs font-mono font-bold text-ink mb-3 shadow-hard-xs">
            <Sparkles className="w-3.5 h-3.5 text-ink" />
            <span>Официальный дневник успеваемости</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Вход в студенческий дневник
          </h1>
          <p className="text-sm text-ink-muted mt-1 leading-relaxed">
            Подключение к базе Академии ТОП по логину MyStat или быстрый персональный вход
          </p>
        </div>

        {/* Central Retro Window Card */}
        <div className="max-w-lg w-full mx-auto">
          <div className="win bg-surface border-2 border-ink rounded-[10px] shadow-hard overflow-hidden">
            {/* Window Header */}
            <div className="bg-surface-2 border-b-2 border-ink px-4 py-2.5 flex items-center justify-between">
              <div className="font-mono text-xs font-bold uppercase text-ink flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-accent" />
                <span>АВТОРИЗАЦИЯ СТУДЕНТА</span>
              </div>
              <div className="font-mono text-[11px] text-ink-muted">
                msapi.top-academy.ru
              </div>
            </div>

            {/* Window Body */}
            <div className="p-5 sm:p-7 space-y-5">
              {/* Segmented Switcher (4 tabs) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 p-1 rounded-[8px] bg-surface-2 border-2 border-ink gap-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab("password"); setError(""); }}
                  className={`py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 ${
                    activeTab === "password"
                      ? "bg-accent text-white border-ink shadow-hard-xs"
                      : "border-transparent text-ink hover:bg-surface/60"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>MyStat</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("custom"); setError(""); }}
                  className={`py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 ${
                    activeTab === "custom"
                      ? "bg-accent text-white border-ink shadow-hard-xs"
                      : "border-transparent text-ink hover:bg-surface/60"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Своё имя</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("token"); setError(""); }}
                  className={`py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 ${
                    activeTab === "token"
                      ? "bg-accent text-white border-ink shadow-hard-xs"
                      : "border-transparent text-ink hover:bg-surface/60"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Токен</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("qr"); setError(""); }}
                  className={`py-2 rounded-[5px] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-2 ${
                    activeTab === "qr"
                      ? "bg-accent text-white border-ink shadow-hard-xs"
                      : "border-transparent text-ink hover:bg-surface/60"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR-код</span>
                </button>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3 rounded-[6px] bg-danger/10 border-2 border-danger text-danger text-xs font-semibold flex items-start gap-2 shadow-hard-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: MYSTAT CLOUD LOGIN */}
              {activeTab === "password" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-ink/20 text-xs text-ink-muted leading-relaxed">
                    🔐 Вход через официальный сервер Академии ТОП (<span className="text-ink font-mono font-bold">msapi.top-academy.ru</span>). Загрузит настоящее имя, оценки и расписание.
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                      Логин студента в Академии ТОП
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="st-12345 или email"
                        className="w-full pl-9 pr-3 py-2.5 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs font-mono placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                      Пароль от дневника
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn pri w-full h-11 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Подключение к Академии ТОП...</span>
                      </>
                    ) : (
                      <>
                        <span>Войти в свой дневник</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: PERSONAL CUSTOM PROFILE */}
              {activeTab === "custom" && (
                <form onSubmit={handleCustomProfileSubmit} className="space-y-4">
                  <div className="p-3 rounded-[6px] bg-highlight/30 border-2 border-ink/30 text-xs text-ink leading-relaxed">
                    ✨ Быстрый персональный вход. Введите ваше имя и группу, чтобы сразу открыть дневник под вашим именем без ввода пароля от MyStat.
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                      Ваше Имя и Фамилия (ФИО)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Например: Иван Иванов"
                        className="w-full pl-9 pr-3 py-2.5 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs font-bold placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                        Учебная группа
                      </label>
                      <input
                        type="text"
                        value={customGroup}
                        onChange={(e) => setCustomGroup(e.target.value)}
                        placeholder="ВЕБ-22/3 или ПВ-21"
                        className="w-full px-3 py-2.5 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs font-mono placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                        Филиал Академии
                      </label>
                      <input
                        type="text"
                        value={customBranch}
                        onChange={(e) => setCustomBranch(e.target.value)}
                        placeholder="Филиал"
                        className="w-full px-3 py-2.5 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn pri w-full h-11 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Открыть дневник под своим именем</span>
                  </button>
                </form>
              )}

              {/* TAB 3: BEARER TOKEN LOGIN */}
              {activeTab === "token" && (
                <form onSubmit={handleTokenSubmit} className="space-y-4">
                  <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-ink/20 text-xs text-ink-muted leading-relaxed">
                    🔑 Вставьте действующий JWT Bearer Token из DevTools (заголовок Authorization или localStorage MyStat).
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
                      Bearer Token
                    </label>
                    <textarea
                      rows={3}
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full p-3 rounded-[6px] bg-paper border-2 border-ink text-ink text-xs font-mono placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn pri w-full h-11 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Key className="w-4 h-4" />
                    <span>Авторизоваться по токену</span>
                  </button>
                </form>
              )}

              {/* TAB 4: QR CODE AUTHENTICATION */}
              {activeTab === "qr" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative p-3.5 rounded-[8px] bg-white border-2 border-ink shadow-hard-xs flex items-center justify-center overflow-hidden">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Login"
                        className={`w-48 h-48 sm:w-52 sm:h-52 rounded-[4px] transition-all ${
                          qrStatus === "expired" ? "blur-xs opacity-20" : ""
                        } ${qrStatus === "approved" ? "opacity-20" : ""}`}
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-8 h-8 text-ink animate-spin" />
                        <span className="text-xs text-ink-muted font-mono">Генерация кода...</span>
                      </div>
                    )}

                    {qrStatus === "approved" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-[4px] text-success p-4">
                        <CheckCircle2 className="w-12 h-12 mb-2 text-success" />
                        <span className="font-bold text-sm text-ink">Вход подтвержден!</span>
                      </div>
                    )}

                    {qrStatus === "expired" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-[4px] p-4">
                        <span className="font-bold text-xs text-ink mb-3">Срок действия истек</span>
                        <button
                          type="button"
                          onClick={fetchNewQr}
                          className="btn pri px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Обновить</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-highlight text-ink px-3 py-1 rounded-[6px] border-2 border-ink shadow-hard-xs whitespace-nowrap">
                    <span>Действителен: {expiresIn} сек.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSimulateApprove}
                    disabled={qrStatus !== "pending"}
                    className="btn sec w-full h-10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Laptop className="w-4 h-4 text-ink" />
                    <span>⚡ Симулировать вход телефоном</span>
                  </button>
                </div>
              )}

              {/* Quick Demo Mode */}
              <div className="pt-4 border-t-2 border-ink text-center">
                <button
                  type="button"
                  onClick={loginAsDemo}
                  className="btn sec w-full h-10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Войти как демо-студент (Алексей Смирнов)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bottom 3 Retro Feature Cards */}
        <div className="mt-10 max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="win bg-surface border-2 border-ink rounded-[10px] shadow-hard p-4 flex flex-col">
            <div className="w-9 h-9 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-center text-ink mb-3 shadow-hard-xs">
              <FileText className="w-5 h-5 text-accent" />
            </div>
            <h4 className="text-sm font-bold text-ink mb-1">Домашние задания</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Синхронизация выданных ДЗ с MyStat, контроль дедлайнов и прикрепление решений.
            </p>
          </div>

          <div className="win bg-surface border-2 border-ink rounded-[10px] shadow-hard p-4 flex flex-col">
            <div className="w-9 h-9 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-center text-ink mb-3 shadow-hard-xs">
              <Calendar className="w-5 h-5 text-highlight" />
            </div>
            <h4 className="text-sm font-bold text-ink mb-1">Расписание пар</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Пары на сегодня и всю неделю, аудитории, преподаватели и отметки присутствия.
            </p>
          </div>

          <div className="win bg-surface border-2 border-ink rounded-[10px] shadow-hard p-4 flex flex-col">
            <div className="w-9 h-9 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-center text-ink mb-3 shadow-hard-xs">
              <GraduationCap className="w-5 h-5 text-success" />
            </div>
            <h4 className="text-sm font-bold text-ink mb-1">12-балльная шкала</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Оценки за практику и лабораторные, статистика и средний балл студента ТОП.
            </p>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="w-full max-w-5xl mx-auto py-4 text-center text-xs font-mono text-ink-muted border-t-2 border-ink mt-8">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span>Компьютерная Академия ТОП</span>
          <span>•</span>
          <span>msapi.top-academy.ru</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-ink">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            Ключ приложения активен
          </span>
        </div>
      </footer>
    </div>
  );
};
