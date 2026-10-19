import React, { useState, useEffect } from "react";
import {
  QrCode,
  X,
  RefreshCw,
  CheckCircle2,
  Laptop
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const QrModal = ({ isOpen, onClose }) => {
  const { socket } = useAuth();
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [expiresIn, setExpiresIn] = useState(120);
  const [status, setStatus] = useState("pending");

  const generateNewQr = async () => {
    try {
      setStatus("pending");
      const res = await fetch("/api/auth/qr/generate");
      const data = await res.json();
      if (data.success) {
        setQrDataUrl(data.qrDataUrl);
        setSessionId(data.sessionId);
        setExpiresIn(120);
        if (socket) {
          socket.emit("join-qr-room", data.sessionId);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateNewQr();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || expiresIn <= 0) {
      if (expiresIn <= 0) setStatus("expired");
      return;
    }
    const t = setInterval(() => setExpiresIn((prev) => prev - 1), 1000);
    return () => clearInterval(t);
  }, [isOpen, expiresIn]);

  const handleSimulateApprove = async () => {
    if (!sessionId) return;
    try {
      await fetch("/api/auth/qr/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });
      setStatus("approved");
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 animate-in fade-in">
      <div className="win bg-surface border-2 border-ink rounded-[10px] shadow-hard w-full max-w-sm overflow-hidden">
        <div className="bg-surface-2 border-b-2 border-ink px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase font-mono">
            <QrCode className="w-4 h-4 text-accent" />
            <span>Привязка устройства • MyStat</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-ink-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="relative p-3 rounded-[8px] border-2 border-ink bg-white shadow-hard-xs mx-auto w-fit">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className={`w-48 h-48 rounded-[4px] transition-all ${
                  status === "expired" ? "blur-xs opacity-20" : ""
                }`}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-ink animate-spin" />
              </div>
            )}

            {status === "approved" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-[4px] text-success">
                <CheckCircle2 className="w-12 h-12 mb-2" />
                <span className="font-bold text-xs text-ink">Устройство привязано!</span>
              </div>
            )}

            {status === "expired" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-[4px]">
                <button
                  onClick={generateNewQr}
                  className="btn pri px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Обновить код</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-xs space-y-1">
            <p className="font-bold text-ink">Отсканируйте камерой смартфона</p>
            <p className="inline-flex items-center justify-center text-xs font-mono font-bold bg-highlight text-ink px-2.5 py-1 rounded-[4px] border border-ink whitespace-nowrap">
              Действителен: {expiresIn} сек.
            </p>
          </div>

          <div className="pt-3 border-t-2 border-ink">
            <button
              onClick={handleSimulateApprove}
              className="btn sec w-full h-10 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Laptop className="w-4 h-4 text-ink" />
              <span>⚡ Симулировать сканирование</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
