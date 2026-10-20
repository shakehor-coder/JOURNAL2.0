import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Hand,
  MessageSquare,
  Users,
  PenTool,
  Code2,
  Send,
  Copy,
  Check,
  AlertCircle,
  School,
  Plus,
  X,
  ChevronDown,
  Sparkles,
  ExternalLink
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

/**
 * Clean Remote Video Participant
 */
const RemoteParticipantCard = ({ participant, stream }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Always keep audio playing through dedicated element
  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
      audioRef.current.play?.().catch(() => {});
    }
  }, [stream]);

  const isShowingVideo = Boolean(stream && (participant.hasVideo || participant.isScreenSharing));

  useEffect(() => {
    if (videoRef.current && stream && isShowingVideo) {
      videoRef.current.srcObject = stream;
      videoRef.current.play?.().catch((e) => console.log("Remote play err:", e));
    }
  }, [stream, isShowingVideo, participant.isScreenSharing, participant.hasVideo]);

  const initials = participant.name
    ? participant.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "СТ";

  const toggleFullscreen = () => {
    if (!fullscreen) {
      const el = videoRef.current;
      if (el?.requestFullscreen) {
        el.requestFullscreen().catch(() => setFullscreen(true));
      } else {
        setFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setFullscreen(false));
      }
      setFullscreen(false);
    }
  };

  return (
    <div className={`relative rounded-[10px] bg-surface border-2 border-ink overflow-hidden aspect-video flex items-center justify-center shadow-hard ${participant.isScreenSharing ? "ring-4 ring-accent" : ""}`}>
      {/* Hidden audio element ensuring audio stream is ALWAYS heard */}
      <audio
        ref={(el) => {
          audioRef.current = el;
          if (el && stream && el.srcObject !== stream) {
            el.srcObject = stream;
            el.play?.().catch(() => {});
          }
        }}
        autoPlay
        playsInline
      />

      {isShowingVideo ? (
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && stream && el.srcObject !== stream) {
              el.srcObject = stream;
              el.play?.().catch(() => {});
            }
          }}
          autoPlay
          playsInline
          className={`w-full h-full ${participant.isScreenSharing ? "object-contain bg-black" : "object-cover"}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-highlight text-on-highlight border-2 border-ink flex items-center justify-center font-bold text-xl mb-2">
            {initials}
          </div>
          <span className="text-[14px] font-bold text-ink">{participant.name}</span>
          <span className="text-[12px] text-ink-muted">Камера выключена</span>
        </div>
      )}

      {/* Participant Name Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
        <span className="px-2.5 py-1 rounded-[6px] bg-surface text-ink border-2 border-ink text-[12px] font-bold flex items-center gap-1.5 shadow-hard-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              participant.isSpeaking ? "bg-success scale-125" : "bg-ink-muted"
            }`}
          />
          <span>{participant.name}</span>
        </span>
        {participant.isScreenSharing && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-2 py-0.5 rounded-[6px] bg-accent text-white border-2 border-ink text-[12px] font-bold shadow-hard-xs animate-pulse cursor-pointer hover:bg-accent/90"
            title="Развернуть демонстрацию экрана"
          >
            🖥️ Экран (Во весь экран)
          </button>
        )}
        {participant.handRaised && (
          <span className="px-2 py-0.5 rounded-[6px] bg-highlight text-on-highlight border-2 border-ink text-[12px] font-bold">
            ✋ Рука
          </span>
        )}
      </div>

      {/* Mic status indicator */}
      <div className="absolute bottom-3 right-3">
        <span
          className={`p-1.5 rounded-[6px] border-2 border-ink flex items-center justify-center shadow-hard-xs ${
            participant.hasMic ? "bg-surface text-success" : "bg-danger text-white"
          }`}
        >
          {participant.hasMic ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </span>
      </div>
    </div>
  );
};

export const AuditoriumCallPage = ({ setActiveTab, roomId: initialRoomId, setRoomId }) => {
  const { user, socket } = useAuth();
  const [roomId, setLocalRoomId] = useState(initialRoomId || "group-9-3-rpo");

  useEffect(() => {
    if (initialRoomId) setLocalRoomId(initialRoomId);
  }, [initialRoomId]);
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callNotice, setCallNotice] = useState(null);
  const [copied, setCopied] = useState(false);

  // Auditorium selection & modal
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Real Microphone Audio Level state (0 - 100)
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Real connected peers ONLY (no fake participants!)
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState({});

  const [chatMessages, setChatMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const isSpeakingRef = useRef(false);
  const screenStreamRef = useRef(null);

  const userName = user?.fullName || user?.username || "Студент";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
    if (inCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

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

  // Real Web Audio API Microphone Volume Detection
  const setupAudioMeter = (stream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!localStreamRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));

        setAudioLevel(normalized);
        const speaking = normalized > 12;
        setIsSpeaking(speaking);

        if (socket && socket.connected && isSpeakingRef.current !== speaking) {
          isSpeakingRef.current = speaking;
          socket.emit("update-media-state", {
            roomId,
            mediaState: { isSpeaking: speaking }
          });
        }

        animFrameIdRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Audio meter setup error:", e);
    }
  };

  // Helper: Create a lightweight silent dummy video track for headless or no-webcam PCs
  const createDummyVideoTrack = () => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, 640, 360);
      }
      const stream = canvas.captureStream ? canvas.captureStream(5) : null;
      if (stream && stream.getVideoTracks().length > 0) {
        const track = stream.getVideoTracks()[0];
        track.enabled = false;
        return track;
      }
    } catch (e) {
      console.warn("Dummy track creation failed:", e);
    }
    return null;
  };

  // Start real user media (camera + microphone)
  const startMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setupAudioMeter(stream);
      return stream;
    } catch (err) {
      console.warn("Could not acquire video+audio. Trying audio only:", err.message);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const dummyTrack = createDummyVideoTrack();
        if (dummyTrack) {
          audioStream.addTrack(dummyTrack);
        }
        localStreamRef.current = audioStream;
        setCameraOn(false);
        setupAudioMeter(audioStream);
        return audioStream;
      } catch (err2) {
        console.warn("No physical mic/camera found:", err2.message);
        showNotice("Камера или микрофон не обнаружены (включен режим просмотра)");
        const fallbackStream = new MediaStream();
        const dummyTrack = createDummyVideoTrack();
        if (dummyTrack) {
          fallbackStream.addTrack(dummyTrack);
        }
        localStreamRef.current = fallbackStream;
        setCameraOn(false);
        setMicOn(false);
        return fallbackStream;
      }
    }
  };

  // Toggle Microphone
  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = next));
    }
    if (!next) {
      setAudioLevel(0);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
    if (socket) {
      socket.emit("update-media-state", {
        roomId,
        mediaState: { mic: next, isSpeaking: false }
      });
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    const next = !cameraOn;
    setCameraOn(next);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => (t.enabled = next));
    }
    if (socket) {
      socket.emit("update-media-state", {
        roomId,
        mediaState: { video: next }
      });
    }
  };

  // Replace video track across all active RTCPeerConnections (or renegotiate if needed)
  const replaceVideoTrack = async (newTrack) => {
    for (const [targetSocketId, pc] of Object.entries(peerConnectionsRef.current)) {
      try {
        const senders = pc.getSenders ? pc.getSenders() : [];
        let videoSender = senders.find((s) => s.track && s.track.kind === "video");
        if (!videoSender) {
          videoSender = senders.find((s) => s.kind === "video" || s.track === null);
        }

        if (videoSender && newTrack) {
          await videoSender.replaceTrack(newTrack);
        } else if (newTrack) {
          pc.addTrack(newTrack, screenStreamRef.current || localStreamRef.current || new MediaStream([newTrack]));
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (socket) {
            socket.emit("call-signal", {
              targetSocketId,
              signal: { sdp: pc.localDescription },
              senderUser: user
            });
          }
        }
      } catch (err) {
        console.warn("replaceVideoTrack error:", err);
      }
    }
  };

  // Stop Screen Share cleanly
  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    let revertTrack = localStreamRef.current?.getVideoTracks().find((t) => t.readyState === "live");
    if (!revertTrack) {
      revertTrack = createDummyVideoTrack();
      if (revertTrack && localStreamRef.current) {
        localStreamRef.current.addTrack(revertTrack);
      }
    }
    if (revertTrack) {
      replaceVideoTrack(revertTrack);
    }
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (socket) {
      socket.emit("update-media-state", { roomId, mediaState: { screen: false, video: cameraOn } });
    }
    showNotice("Демонстрация экрана остановлена");
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always"
          },
          audio: false
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        // Replace track for all existing remote WebRTC peers!
        await replaceVideoTrack(screenTrack);

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
        if (socket) {
          socket.emit("update-media-state", { roomId, mediaState: { screen: true, video: true } });
        }
        showNotice("Демонстрация экрана запущена!");
      } catch (e) {
        console.warn("Screen share cancelled or failed:", e);
      }
    } else {
      stopScreenShare();
    }
  };

  // Toggle Hand
  const toggleHand = () => {
    const next = !handRaised;
    setHandRaised(next);
    if (socket) {
      socket.emit("update-media-state", {
        roomId,
        mediaState: { handRaised: next }
      });
    }
    showNotice(next ? "Вы подняли руку" : "Вы опустили руку");
  };

  // WebRTC Peer Connection Helper
  const createPeerConnection = (targetSocketId) => {
    if (peerConnectionsRef.current[targetSocketId]) {
      return peerConnectionsRef.current[targetSocketId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        if (track.kind === "video" && screenStreamRef.current) {
          const screenTrack = screenStreamRef.current.getVideoTracks()[0];
          pc.addTrack(screenTrack || track, localStreamRef.current);
        } else {
          pc.addTrack(track, localStreamRef.current);
        }
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("call-signal", {
          targetSocketId,
          signal: { candidate: event.candidate },
          senderUser: user
        });
      }
    };

    pc.ontrack = (event) => {
      let stream = event.streams && event.streams[0];
      if (!stream && event.track) {
        stream = new MediaStream([event.track]);
      }
      if (stream) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: stream
        }));
      }
    };

    peerConnectionsRef.current[targetSocketId] = pc;
    return pc;
  };

  // Join Call Room
  const handleJoinCall = async () => {
    setInCall(true);
    const stream = await startMedia();

    if (socket) {
      socket.emit("join-call-room", {
        roomId,
        user: {
          id: user?.id || "student-" + Date.now(),
          fullName: userName,
          name: userName,
          role: "Студент"
        }
      });
    }
    showNotice("Вы вошли в аудиторию!");
  };

  // Leave Call Room
  const handleLeaveCall = () => {
    setInCall(false);
    if (socket) {
      socket.emit("leave-call-room", { roomId });
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    setIsScreenSharing(false);
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
    peerConnectionsRef.current = {};
    setParticipants([]);
    setRemoteStreams({});
    setAudioLevel(0);
    setIsSpeaking(false);
    showNotice("Вы вышли из аудитории.");
  };

  // Send Chat Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const msg = {
      id: Date.now().toString(),
      sender: userName,
      text: newMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, msg]);
    if (socket) {
      socket.emit("send-call-message", { roomId, message: msg });
    }
    setNewMsg("");
  };

  // Socket Events: Only Real Connected Users!
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    const handleUserJoined = async (data) => {
      const newPeer = {
        id: data.socketId,
        socketId: data.socketId,
        name: data.user?.fullName || data.user?.name || "Одногруппник",
        role: data.user?.role || "Студент",
        isSpeaking: false,
        hasVideo: data.mediaState?.video ?? true,
        isScreenSharing: data.mediaState?.screen ?? false,
        hasMic: data.mediaState?.mic ?? true,
        handRaised: data.mediaState?.handRaised ?? false
      };

      setParticipants((prev) => {
        if (prev.some((p) => p.socketId === data.socketId)) return prev;
        return [...prev, newPeer];
      });

      showNotice(`${newPeer.name} подключился к аудитории!`);

      // Initiate WebRTC Offer
      try {
        const pc = createPeerConnection(data.socketId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call-signal", {
          targetSocketId: data.socketId,
          signal: { sdp: pc.localDescription },
          senderUser: user
        });
      } catch (err) {
        console.warn("WebRTC offer error:", err);
      }
    };

    const handleExistingParticipants = (list) => {
      if (Array.isArray(list) && list.length > 0) {
        const peers = list.map((item) => ({
          id: item.socketId,
          socketId: item.socketId,
          name: item.user?.fullName || item.user?.name || "Студент",
          role: item.user?.role || "Студент",
          isSpeaking: false,
          hasVideo: item.mediaState?.video ?? true,
          isScreenSharing: item.mediaState?.screen ?? false,
          hasMic: item.mediaState?.mic ?? true,
          handRaised: item.mediaState?.handRaised ?? false
        }));

        setParticipants(peers);
      } else {
        setParticipants([]);
      }
    };

    const handleCallSignal = async ({ senderSocketId, signal }) => {
      try {
        const pc = createPeerConnection(senderSocketId);

        if (signal.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          if (signal.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("call-signal", {
              targetSocketId: senderSocketId,
              signal: { sdp: pc.localDescription },
              senderUser: user
            });
          }
        } else if (signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.warn("Signal handling error:", err);
      }
    };

    const handlePeerMediaUpdated = ({ socketId, mediaState }) => {
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.socketId === socketId) {
            return {
              ...p,
              hasMic: mediaState.mic !== undefined ? mediaState.mic : p.hasMic,
              hasVideo: mediaState.video !== undefined ? mediaState.video : p.hasVideo,
              isScreenSharing: mediaState.screen !== undefined ? mediaState.screen : p.isScreenSharing,
              handRaised: mediaState.handRaised !== undefined ? mediaState.handRaised : p.handRaised,
              isSpeaking: mediaState.isSpeaking !== undefined ? mediaState.isSpeaking : p.isSpeaking
            };
          }
          return p;
        })
      );
    };

    const handleUserLeft = ({ socketId }) => {
      setParticipants((prev) => {
        const leaving = prev.find((p) => p.socketId === socketId);
        if (leaving) {
          showNotice(`${leaving.name} покинул аудиторию`);
        }
        return prev.filter((p) => p.socketId !== socketId);
      });

      if (peerConnectionsRef.current[socketId]) {
        peerConnectionsRef.current[socketId].close();
        delete peerConnectionsRef.current[socketId];
      }

      setRemoteStreams((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    };

    socket.on("new-call-message", handleNewMessage);
    socket.on("user-joined-call", handleUserJoined);
    socket.on("existing-participants", handleExistingParticipants);
    socket.on("call-signal", handleCallSignal);
    socket.on("peer-media-updated", handlePeerMediaUpdated);
    socket.on("user-left-call", handleUserLeft);

    return () => {
      socket.off("new-call-message", handleNewMessage);
      socket.off("user-joined-call", handleUserJoined);
      socket.off("existing-participants", handleExistingParticipants);
      socket.off("call-signal", handleCallSignal);
      socket.off("peer-media-updated", handlePeerMediaUpdated);
      socket.off("user-left-call", handleUserLeft);
    };
  }, [socket, user]);

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 grid gap-6">
      {/* Toast Notice */}
      {callNotice && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded-[6px] bg-surface border-2 border-ink text-ink font-medium text-[13px] shadow-hard flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-accent" />
          <span>{callNotice}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b-2 border-ink">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-bold text-ink tracking-tight flex items-center gap-2">
              <span>Аудитория (Звонок)</span>
            </h1>
            {inCall && (
              <span className="font-mono text-[12px] bg-highlight text-on-highlight border-2 border-ink rounded-full px-2.5 py-0.5 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span>В эфире · {formatDuration(callDuration)}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] text-ink-muted">
              Текущий класс:
            </span>
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-surface-2 border border-ink text-[12px] font-bold text-ink hover:bg-highlight hover:text-on-highlight transition-colors cursor-pointer"
              >
                <span>{currentAuditorium.icon}</span>
                <span>{currentAuditorium.shortName}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showRoomDropdown && (
                <div className="absolute left-0 mt-1.5 w-72 bg-surface border-2 border-ink rounded-[10px] shadow-hard z-50 p-2 space-y-1">
                  <div className="px-2 py-1 text-[11px] font-mono text-ink-muted uppercase tracking-wider">
                    Сменить аудиторию
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
            <span className="text-[12px] font-mono text-ink-muted hidden sm:inline">
              · Full-Duplex WebRTC
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
            className="btn sec h-9 text-[13px]"
            title="Открыть доску этой аудитории"
          >
            <PenTool className="w-4 h-4 text-ink" strokeWidth={2} />
            <span>Электронная доска</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("code")}
            className="btn sec h-9 text-[13px]"
          >
            <Code2 className="w-4 h-4 text-ink" strokeWidth={2} />
            <span>Песочница кода</span>
          </button>
        </div>
      </div>

      {/* 1. Pre-call Join Screen */}
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
                <span className="w-2 h-2 rounded-full bg-success" />
                <span>WebRTC Готов</span>
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
                    <span className="text-success font-bold">P2P Audio/Video/Screen</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 md:shrink-0">
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
                  <span>Доска аудитории</span>
                </button>

                <button
                  type="button"
                  onClick={handleJoinCall}
                  className="btn pri h-11 px-6 text-[14px] flex items-center gap-2 !bg-accent text-white font-bold shadow-hard cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Войти в {currentAuditorium.shortName}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Active Call Grid */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className={`${chatOpen ? "lg:col-span-3" : "lg:col-span-4"} space-y-4`}>
            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-h-[380px]">
              {/* Local Participant Card */}
              <div className="relative rounded-[10px] bg-ink border-2 border-ink overflow-hidden aspect-video flex items-center justify-center shadow-hard">
                {cameraOn || isScreenSharing ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full ${isScreenSharing ? "object-contain bg-black" : "object-cover -scale-x-100"}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-highlight text-on-highlight border-2 border-ink flex items-center justify-center font-bold text-xl mb-2">
                      {userInitials}
                    </div>
                    <span className="text-[14px] font-bold text-on-ink">{userName}</span>
                    <span className="text-[12px] text-side-text/70">Камера выключена</span>
                  </div>
                )}

                {/* Top Name Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-[6px] bg-surface text-ink border-2 border-ink text-[12px] font-bold flex items-center gap-2 shadow-hard-xs">
                    <span
                      className={`w-2 h-2 rounded-full transition-transform ${
                        isSpeaking ? "bg-success scale-125" : "bg-ink-muted"
                      }`}
                    />
                    <span>Вы ({userName})</span>
                  </span>

                  {handRaised && (
                    <span className="px-2 py-0.5 rounded-[6px] bg-highlight text-on-highlight border-2 border-ink text-[12px] font-bold">
                      ✋ Рука
                    </span>
                  )}

                  {isScreenSharing && (
                    <span className="px-2 py-0.5 rounded-[6px] bg-accent text-white border-2 border-ink text-[12px] font-bold">
                      Экран
                    </span>
                  )}
                </div>

                {/* Bottom: Real Microphone Activity Meter & Status */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  {micOn && (
                    <div
                      className="flex items-end gap-0.5 h-6 px-1.5 py-1 rounded-[6px] bg-surface border-2 border-ink shadow-hard-xs"
                      title={`Уровень микрофона: ${audioLevel}%`}
                    >
                      <span
                        className={`w-1 rounded-xs transition-colors ${
                          audioLevel > 5 ? "bg-success" : "bg-line"
                        }`}
                        style={{ height: "6px" }}
                      />
                      <span
                        className={`w-1 rounded-xs transition-colors ${
                          audioLevel > 20 ? "bg-success" : "bg-line"
                        }`}
                        style={{ height: "10px" }}
                      />
                      <span
                        className={`w-1 rounded-xs transition-colors ${
                          audioLevel > 45 ? "bg-success" : "bg-line"
                        }`}
                        style={{ height: "14px" }}
                      />
                      <span
                        className={`w-1 rounded-xs transition-colors ${
                          audioLevel > 70 ? "bg-warning" : "bg-line"
                        }`}
                        style={{ height: "18px" }}
                      />
                    </div>
                  )}

                  <span
                    className={`p-1.5 rounded-[6px] border-2 border-ink flex items-center justify-center shadow-hard-xs ${
                      micOn ? "bg-surface text-success" : "bg-danger text-white"
                    }`}
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </span>
                </div>
              </div>

              {/* Real Remote Participants */}
              {participants.map((p) => (
                <RemoteParticipantCard
                  key={p.socketId}
                  participant={p}
                  stream={remoteStreams[p.socketId]}
                />
              ))}

              {/* Waiting notice if no other participants yet */}
              {participants.length === 0 && (
                <div className="rounded-[10px] bg-surface border-2 border-ink p-6 text-center flex flex-col items-center justify-center space-y-3 shadow-hard min-h-[220px]">
                  <div className="w-12 h-12 rounded-[6px] bg-surface-2 border-2 border-ink flex items-center justify-center text-ink">
                    <Users className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-ink">В аудитории пока только вы</h3>
                    <p className="text-[13px] text-ink-muted max-w-sm mx-auto">
                      Микрофон и камера работают. Ожидание подключения преподавателя и одногруппников.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={copyRoomLink}
                    className="btn sec text-[12px] h-8 mt-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Ссылка скопирована!" : "Скопировать ссылку аудитории"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* In-Call Controls Bar */}
            <div className="bg-surface border-2 border-ink rounded-[10px] shadow-hard p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[13px] text-ink flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span>{currentAuditorium.shortName}</span>
                </span>
                <span className="text-ink-muted">·</span>
                <span className="font-mono text-[12px] text-ink-muted">
                  {participants.length + 1} в эфире
                </span>
                <span className="text-ink-muted">·</span>
                <span className="font-mono text-[12px] text-accent font-bold">
                  {formatDuration(callDuration)}
                </span>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (setRoomId) setRoomId(roomId);
                    setActiveTab("whiteboard");
                  }}
                  className="btn sec h-10 text-[12px] hidden md:flex items-center gap-1.5"
                  title="Открыть электронную доску этой аудитории"
                >
                  <PenTool className="w-3.5 h-3.5 text-accent" />
                  <span>Доска</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`btn h-10 ${micOn ? "sec" : "pri !bg-danger text-white"}`}
                  title={micOn ? "Выключить микрофон" : "Включить микрофон"}
                >
                  {micOn ? <Mic className="w-4 h-4 text-success" /> : <MicOff className="w-4 h-4" />}
                  <span className="hidden sm:inline">{micOn ? "Микрофон вкл" : "Микрофон выкл"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`btn h-10 ${cameraOn ? "sec" : "pri !bg-danger text-white"}`}
                  title={cameraOn ? "Выключить камеру" : "Включить камеру"}
                >
                  {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleScreenShare}
                  className={`btn h-10 ${isScreenSharing ? "pri !bg-accent" : "sec"}`}
                  title="Демонстрация экрана"
                >
                  <Monitor className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleHand}
                  className={`btn h-10 ${handRaised ? "pri !bg-highlight !text-on-highlight" : "sec"}`}
                  title="Поднять руку"
                >
                  <Hand className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleLeaveCall}
                  className="btn pri !bg-danger text-white h-10 ml-2"
                  title="Покинуть аудиторию"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setChatOpen(!chatOpen)}
                className={`btn h-10 ${chatOpen ? "pri !bg-surface-2 !text-ink" : "sec"}`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Чат ({chatMessages.length})</span>
              </button>
            </div>
          </div>

          {/* Right Column: In-Call Chat Window */}
          {chatOpen && (
            <div className="lg:col-span-1 win flex flex-col justify-between h-[480px]">
              <header>
                <h2>Чат аудитории</h2>
                <span className="font-mono text-[12px] text-ink-muted">
                  {chatMessages.length} сообщ.
                </span>
              </header>

              <div className="p-3 space-y-2 overflow-y-auto flex-1">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-ink-muted text-[13px]">
                    Сообщений пока нет. Напишите первое сообщение!
                  </div>
                ) : (
                  chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-[6px] bg-surface-2 border border-line text-[13px] space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-ink-muted">
                        <span className="font-bold text-ink">{m.sender}</span>
                        <span className="font-mono">{m.time}</span>
                      </div>
                      <p className="text-ink leading-snug">{m.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-2.5 bg-surface-2 border-t-2 border-ink flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Сообщение в чат..."
                  className="flex-1 h-9 px-3 rounded-[6px] bg-surface border-2 border-ink text-[13px] text-ink placeholder:text-ink-muted focus:outline-accent"
                />
                <button
                  type="submit"
                  className="btn pri h-9 px-3"
                  aria-label="Отправить"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
