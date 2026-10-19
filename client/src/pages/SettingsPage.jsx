import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Settings,
  Key,
  Globe,
  Save,
  CheckCircle2,
  Server,
  ShieldCheck,
  Cpu
} from "lucide-react";

export const SettingsPage = () => {
  const { user } = useAuth();
  const [tokenInput, setTokenInput] = useState("");
  const [appKey, setAppKey] = useState("6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6");
  const [apiBase, setApiBase] = useState("https://msapi.top-academy.ru/api/v2");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    fetch("/api/settings/token")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.applicationKey) setAppKey(data.applicationKey);
          if (data.apiBase) setApiBase(data.apiBase);
          setHasToken(data.hasToken);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSaveToken = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenInput || undefined,
          appKey,
          apiBase
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        setHasToken(data.hasToken);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Header */}
      <div className="pb-2 border-b-2 border-ink">
        <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-accent" strokeWidth={2} />
          <span>Настройки & API Академии ТОП</span>
        </h1>
        <p className="text-[13px] text-ink-muted mt-0.5">
          Конфигурация официального шлюза API (msapi.top-academy.ru) и ключа доступа
        </p>
      </div>

      <section className="win shadow-hard">
        <header>
          <div className="flex items-center gap-2 font-bold text-[14px] text-ink">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Шлюз синхронизации MyStat</span>
          </div>
          <span className="font-mono text-[11px] bg-highlight text-on-highlight border border-ink px-2 py-0.5 rounded-[4px] font-bold">
            Активен
          </span>
        </header>

        <div className="p-6 space-y-5">
          {isSaved && (
            <div className="p-3 rounded-[6px] bg-surface-2 border-2 border-success text-success text-[13px] font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Параметры API успешно сохранены и применены!</span>
            </div>
          )}

          <form onSubmit={handleSaveToken} className="space-y-4">
            {/* Application Key */}
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-ink flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent" />
                <span>Ключ приложения (application_key Академии ТОП)</span>
              </label>
              <input
                type="text"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                placeholder="6a56a5df2667e65aab73ce76d1dd737f7d1faef9c52e8b8c55ac75f565d8e8a6"
                className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink font-mono focus:outline-accent"
              />
              <span className="text-[12px] text-ink-muted block">
                Используется для сквозной авторизации через официальный API Академии.
              </span>
            </div>

            {/* Session Token */}
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-ink flex items-center gap-2">
                <Key className="w-4 h-4 text-accent" />
                <span>Сессионный токен студента (JWT Bearer, опционально)</span>
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder={hasToken ? "●●●●●●●●●●●● (Токен активен)" : "Вставьте Bearer токен если хотите переопределить сессию..."}
                className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted font-mono focus:outline-accent"
              />
            </div>

            {/* API Base URL */}
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-ink flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent" />
                <span>Базовый адрес API (Base Endpoint)</span>
              </label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-[13px] text-ink font-mono focus:outline-accent"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn pri h-10 text-[13px]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Сохранение..." : "Сохранить параметры"}</span>
            </button>
          </form>

          {/* Session Parameters Box */}
          <div className="pt-4 border-t-2 border-line space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-bold text-ink">
              <Server className="w-4 h-4 text-success" />
              <span>Параметры текущей сессии:</span>
            </div>
            <div className="p-3.5 rounded-[6px] bg-surface-2 border-2 border-ink text-[12px] space-y-1 font-mono text-ink">
              <div>Сервер: <span className="text-success font-bold">http://localhost:5000</span> (Active)</div>
              <div>Шлюз: <span className="text-ink font-bold">{apiBase}</span></div>
              <div>Ключ: <span className="text-success font-bold">Активен (6a56a5df...)</span></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
