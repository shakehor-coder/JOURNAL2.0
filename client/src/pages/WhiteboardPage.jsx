import React, { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Image as ImageIcon,
  Hand,
  Trash2,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Palette,
  Check,
  X,
  Plus,
  School,
  ChevronDown,
  AlertCircle,
  MousePointer2,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export const DEFAULT_AUDITORIUMS = [
  { id: "group-9-3-rpo", name: "Аудитория 9/3-РПО — Разработка программного обеспечения", shortName: "9/3-РПО", icon: "💻" },
  { id: "group-9-1-rpo", name: "Аудитория 9/1-РПО — Разработка программного обеспечения", shortName: "9/1-РПО", icon: "⚡" },
  { id: "group-9-2-rpo", name: "Аудитория 9/2-РПО — Разработка программного обеспечения", shortName: "9/2-РПО", icon: "🚀" },
  { id: "group-gd-9-1", name: "Аудитория ГД 9/1 — Компьютерная графика и дизайн", shortName: "ГД 9/1", icon: "🎨" },
  { id: "group-gd-9-2-sub1", name: "Аудитория ГД 9/2 (1 группа) — Компьютерная графика и дизайн", shortName: "ГД 9/2 (1 группа)", icon: "🖌️" },
  { id: "group-gd-9-2-sub2", name: "Аудитория ГД 9/2 (2 группа) — Компьютерная графика и дизайн", shortName: "ГД 9/2 (2 группа)", icon: "✨" },
  { id: "group-gd-9-3", name: "Аудитория ГД 9/3 — Компьютерная графика и дизайн", shortName: "ГД 9/3", icon: "🎮" },
  { id: "global-board", name: "Главный зал — Общая студенческая доска (Все потоки)", shortName: "Главный зал", icon: "🌐" }
];

export const WhiteboardPage = ({ roomId: externalRoomId, setRoomId: setExternalRoomId }) => {
  const { socket, user } = useAuth();

  // Classroom / Auditorium State
  const [currentRoomId, setCurrentRoomId] = useState(externalRoomId || "group-9-3-rpo");
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [customRoomInput, setCustomRoomInput] = useState("");
  const [showCustomRoomModal, setShowCustomRoomModal] = useState(false);
  const [notice, setNotice] = useState(null);

  // Sync with external room prop if provided
  useEffect(() => {
    if (externalRoomId && externalRoomId !== currentRoomId) {
      setCurrentRoomId(externalRoomId);
    }
  }, [externalRoomId]);

  // DOM Refs
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const contextRef = useRef(null);
  const previewContextRef = useRef(null);
  const fileInputRef = useRef(null);

  // Drawing & Navigation State
  const [tool, setTool] = useState("pen"); // 'select' | 'pen' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'line' | 'text' | 'hand'
  const [color, setColor] = useState("#1a1917");
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(24);
  const [isDrawing, setIsDrawing] = useState(false);

  // Selected Element & Transformation State (Move / Resize Photos)
  const [selectedElementId, setSelectedElementId] = useState(null);
  const dragModeRef = useRef(null); // { type: 'move'|'resize', handle, startScreenPos, startWorldPos, origElement, origAspect }
  const [hoverCursor, setHoverCursor] = useState("crosshair");

  // Pan & Zoom
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const isSpacePressedRef = useRef(false);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Touch & Coordinates Tracking
  const activeTouchIdRef = useRef(null);
  const lastWorldPosRef = useRef({ x: 0, y: 0 });
  const startWorldPosRef = useRef({ x: 0, y: 0 });
  const lastShapeWorldPosRef = useRef({ x: 0, y: 0 });

  // Board Stored Elements (All World Coordinates)
  const elementsRef = useRef([]);
  const [elementsCount, setElementsCount] = useState(0);

  // Text Prompt Modal / Inline Dialog
  const [textDialog, setTextDialog] = useState(null); // { screenX, screenY, worldX, worldY, text, color, fontSize }
  const [textInputVal, setTextInputVal] = useState("");

  // Cached HTML5 Image objects to render smoothly
  const imageCacheRef = useRef(new Map());

  const colors = [
    "#1a1917", // Ink Black
    "#e5322d", // Accent Red
    "#1f9d63", // Success Green
    "#b7791f", // Warning Amber
    "#2563eb", // Blue
    "#7c3aed", // Purple
    "#ffffff"  // White
  ];

  const fontSizes = [16, 24, 32, 48];
  const bgColor = "#fffdf8";
  const gridColor = "rgba(26, 25, 23, 0.08)";

  const showToast = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Convert screen coordinates to world coordinates
  const toWorld = useCallback(
    (screenX, screenY) => {
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom
      };
    },
    [pan, zoom]
  );

  // Convert world coordinates to screen coordinates
  const toScreen = useCallback(
    (worldX, worldY) => {
      return {
        x: worldX * zoom + pan.x,
        y: worldY * zoom + pan.y
      };
    },
    [pan, zoom]
  );

  // Draw arrow utility
  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headlen = Math.max(10, 14 / zoom);
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
  };

  // Helper to get or create cached Image
  const getCachedImage = useCallback((src) => {
    if (imageCacheRef.current.has(src)) {
      return imageCacheRef.current.get(src);
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
      // Trigger canvas re-render when image finishes loading
      redraw();
    };
    imageCacheRef.current.set(src, img);
    return img;
  }, []);

  // Hit-test element at world position (reverse iteration: topmost element first)
  const getElementAtWorldPos = useCallback((worldX, worldY) => {
    for (let i = elementsRef.current.length - 1; i >= 0; i--) {
      const el = elementsRef.current[i];
      if (el.tool === "image") {
        if (
          worldX >= el.x &&
          worldX <= el.x + el.width &&
          worldY >= el.y &&
          worldY <= el.y + el.height
        ) {
          return el;
        }
      } else if (el.tool === "text") {
        const size = el.fontSize || 24;
        const lines = (el.text || "").split("\n");
        const maxLen = Math.max(...lines.map((l) => l.length), 1);
        const w = maxLen * (size * 0.65);
        const h = lines.length * (size * 1.3);
        if (
          worldX >= el.x &&
          worldX <= el.x + w &&
          worldY >= el.y - size &&
          worldY <= el.y + h
        ) {
          return el;
        }
      } else if (el.tool === "rect") {
        if (el.from && el.to) {
          const minX = Math.min(el.from.x, el.to.x);
          const maxX = Math.max(el.from.x, el.to.x);
          const minY = Math.min(el.from.y, el.to.y);
          const maxY = Math.max(el.from.y, el.to.y);
          if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
            return el;
          }
        }
      }
    }
    return null;
  }, []);

  // Hit-test resize handles of a selected element (in screen pixels for precision)
  const getResizeHandleAtScreenPos = useCallback(
    (screenX, screenY, el) => {
      if (!el || el.tool !== "image") return null;
      const sTL = toScreen(el.x, el.y);
      const sTR = toScreen(el.x + el.width, el.y);
      const sBR = toScreen(el.x + el.width, el.y + el.height);
      const sBL = toScreen(el.x, el.y + el.height);
      const sTC = toScreen(el.x + el.width / 2, el.y);
      const sBC = toScreen(el.x + el.width / 2, el.y + el.height);
      const sML = toScreen(el.x, el.y + el.height / 2);
      const sMR = toScreen(el.x + el.width, el.y + el.height / 2);

      const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const threshold = 16; // 16px touch & mouse hit radius

      const p = { x: screenX, y: screenY };
      if (dist(p, sTL) <= threshold) return "nw";
      if (dist(p, sTR) <= threshold) return "ne";
      if (dist(p, sBR) <= threshold) return "se";
      if (dist(p, sBL) <= threshold) return "sw";
      if (dist(p, sTC) <= threshold) return "n";
      if (dist(p, sBC) <= threshold) return "s";
      if (dist(p, sML) <= threshold) return "w";
      if (dist(p, sMR) <= threshold) return "e";
      return null;
    },
    [toScreen]
  );

  // Draw selection box and 8 handles around an active element
  const drawSelectionBoxAndHandles = (ctx, el, currentZoom) => {
    ctx.save();
    // Bounding Box
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(1.5, 2 / currentZoom);
    ctx.setLineDash([6 / currentZoom, 4 / currentZoom]);
    ctx.strokeRect(el.x, el.y, el.width, el.height);
    ctx.setLineDash([]);

    // 8 Handles
    const handleSize = Math.max(10, 14 / currentZoom);
    const halfH = handleSize / 2;

    const handles = [
      { x: el.x, y: el.y, type: "nw" },
      { x: el.x + el.width, y: el.y, type: "ne" },
      { x: el.x + el.width, y: el.y + el.height, type: "se" },
      { x: el.x, y: el.y + el.height, type: "sw" },
      { x: el.x + el.width / 2, y: el.y, type: "n" },
      { x: el.x + el.width / 2, y: el.y + el.height, type: "s" },
      { x: el.x, y: el.y + el.height / 2, type: "w" },
      { x: el.x + el.width, y: el.y + el.height / 2, type: "e" }
    ];

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(1.5, 2.5 / currentZoom);

    handles.forEach((h) => {
      ctx.fillRect(h.x - halfH, h.y - halfH, handleSize, handleSize);
      ctx.strokeRect(h.x - halfH, h.y - halfH, handleSize, handleSize);
    });

    ctx.restore();
  };

  // Infinite Grid that moves and scales with Pan & Zoom
  const drawGrid = (ctx, width, height, currentPan, currentZoom) => {
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    const baseStep = 32;
    const step = baseStep * currentZoom;
    if (step < 8) {
      ctx.restore();
      return;
    }

    const startX = ((currentPan.x % step) + step) % step;
    const startY = ((currentPan.y % step) + step) % step;

    for (let x = startX - step; x < width + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = startY - step; y < height + step; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Render a single element in world coordinates
  const renderElement = useCallback(
    (ctx, el) => {
      if (!el || !el.tool) return;

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (el.tool === "pen" || el.tool === "eraser") {
        if (!el.from || !el.to) {
          ctx.restore();
          return;
        }
        ctx.strokeStyle = el.tool === "eraser" ? bgColor : el.color || color;
        ctx.lineWidth = el.lineWidth || lineWidth;
        ctx.beginPath();
        ctx.moveTo(el.from.x, el.from.y);
        ctx.lineTo(el.to.x, el.to.y);
        ctx.stroke();
      } else if (el.tool === "rect") {
        if (!el.from || !el.to) {
          ctx.restore();
          return;
        }
        ctx.strokeStyle = el.color || color;
        ctx.lineWidth = el.lineWidth || lineWidth;
        ctx.strokeRect(el.from.x, el.from.y, el.to.x - el.from.x, el.to.y - el.from.y);
      } else if (el.tool === "circle") {
        if (!el.from || !el.to) {
          ctx.restore();
          return;
        }
        ctx.strokeStyle = el.color || color;
        ctx.lineWidth = el.lineWidth || lineWidth;
        const radius = Math.sqrt(
          Math.pow(el.to.x - el.from.x, 2) + Math.pow(el.to.y - el.from.y, 2)
        );
        ctx.beginPath();
        ctx.arc(el.from.x, el.from.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (el.tool === "line") {
        if (!el.from || !el.to) {
          ctx.restore();
          return;
        }
        ctx.strokeStyle = el.color || color;
        ctx.lineWidth = el.lineWidth || lineWidth;
        ctx.beginPath();
        ctx.moveTo(el.from.x, el.from.y);
        ctx.lineTo(el.to.x, el.to.y);
        ctx.stroke();
      } else if (el.tool === "arrow") {
        if (!el.from || !el.to) {
          ctx.restore();
          return;
        }
        ctx.strokeStyle = el.color || color;
        ctx.lineWidth = el.lineWidth || lineWidth;
        ctx.beginPath();
        drawArrow(ctx, el.from.x, el.from.y, el.to.x, el.to.y);
      } else if (el.tool === "image") {
        if (el.src && el.width && el.height) {
          const img = getCachedImage(el.src);
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, el.x, el.y, el.width, el.height);
            // Border around image
            ctx.strokeStyle = "rgba(26, 25, 23, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        }
      } else if (el.tool === "text") {
        if (el.text) {
          const size = el.fontSize || 24;
          ctx.font = `bold ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif`;
          ctx.fillStyle = el.color || color;
          const lines = el.text.split("\n");
          lines.forEach((line, index) => {
            ctx.fillText(line, el.x, el.y + index * (size * 1.3));
          });
        }
      }

      ctx.restore();
    },
    [bgColor, color, lineWidth, getCachedImage]
  );

  // Full Canvas Redraw
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const width = canvas.width / 2;
    const height = canvas.height / 2;

    // Reset transform to draw background
    ctx.save();
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Infinite grid
    drawGrid(ctx, width, height, pan, zoom);

    // Apply Camera Transform
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Render all elements in order
    for (const el of elementsRef.current) {
      renderElement(ctx, el);
    }

    // Render selection box & handles for selected element
    if (selectedElementId) {
      const selectedEl = elementsRef.current.find((e) => e.id === selectedElementId);
      if (selectedEl && selectedEl.tool === "image") {
        drawSelectionBoxAndHandles(ctx, selectedEl, zoom);
      }
    }

    ctx.restore();
  }, [bgColor, pan, zoom, renderElement, selectedElementId]);

  // Handle Resize & Canvas Initialization
  const setupCanvases = useCallback(() => {
    const canvas = canvasRef.current;
    const pCanvas = previewCanvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = 2; // High-DPI crisp rendering

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    contextRef.current = ctx;

    if (pCanvas) {
      pCanvas.width = rect.width * dpr;
      pCanvas.height = rect.height * dpr;
      const pCtx = pCanvas.getContext("2d");
      pCtx.scale(dpr, dpr);
      previewContextRef.current = pCtx;
    }

    redraw();
  }, [redraw]);

  useEffect(() => {
    setupCanvases();
    window.addEventListener("resize", setupCanvases);
    return () => window.removeEventListener("resize", setupCanvases);
  }, [setupCanvases]);

  // Redraw when Pan or Zoom changes
  useEffect(() => {
    redraw();
  }, [pan, zoom, redraw]);

  // ==========================================
  // Socket Room Management (Per Classroom / Auditorium)
  // ==========================================
  useEffect(() => {
    if (!socket) return;

    // Join Board Room for Current Auditorium
    socket.emit("join-board-room", { roomId: currentRoomId });

    const handleInitState = (strokes) => {
      if (Array.isArray(strokes)) {
        elementsRef.current = strokes;
        setElementsCount(strokes.length);
        redraw();
      }
    };

    const handleDrawStroke = (stroke) => {
      elementsRef.current.push(stroke);
      setElementsCount(elementsRef.current.length);
      redraw();
    };

    const handleUpdateStroke = (stroke) => {
      if (stroke?.id) {
        const idx = elementsRef.current.findIndex((s) => s.id === stroke.id);
        if (idx !== -1) {
          elementsRef.current[idx] = stroke;
        } else {
          elementsRef.current.push(stroke);
        }
        redraw();
      }
    };

    const handleDeleteStroke = ({ strokeId }) => {
      elementsRef.current = elementsRef.current.filter((s) => s.id !== strokeId);
      setElementsCount(elementsRef.current.length);
      setSelectedElementId((prev) => (prev === strokeId ? null : prev));
      redraw();
    };

    const handleBoardCleared = () => {
      elementsRef.current = [];
      setElementsCount(0);
      setSelectedElementId(null);
      redraw();
      showToast("Доска очищена преподавателем");
    };

    socket.on("board-init-state", handleInitState);
    socket.on("board-draw-stroke", handleDrawStroke);
    socket.on("board-update-stroke", handleUpdateStroke);
    socket.on("board-delete-stroke", handleDeleteStroke);
    socket.on("board-cleared", handleBoardCleared);

    return () => {
      socket.emit("leave-board-room", { roomId: currentRoomId });
      socket.off("board-init-state", handleInitState);
      socket.off("board-draw-stroke", handleDrawStroke);
      socket.off("board-update-stroke", handleUpdateStroke);
      socket.off("board-delete-stroke", handleDeleteStroke);
      socket.off("board-cleared", handleBoardCleared);
    };
  }, [socket, currentRoomId, redraw]);

  // Spacebar Hand Navigation key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        isSpacePressedRef.current = true;
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        isSpacePressedRef.current = false;
        isPanningRef.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const scaleSelectedImage = (factor) => {
    if (!selectedElementId) return;
    const el = elementsRef.current.find((e) => e.id === selectedElementId);
    if (!el || el.tool !== "image") return;
    const newW = Math.max(40, Math.round(el.width * factor));
    const newH = Math.max(40, Math.round(el.height * factor));
    const dx = (newW - el.width) / 2;
    const dy = (newH - el.height) / 2;
    el.x = Math.round(el.x - dx);
    el.y = Math.round(el.y - dy);
    el.width = newW;
    el.height = newH;
    redraw();
    if (socket) {
      socket.emit("board-draw-stroke", { roomId: currentRoomId, stroke: el });
    }
    showToast(`Масштаб фото: ${factor > 1 ? "+" : "-"}${Math.round(Math.abs(factor - 1) * 100)}%`);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    const idToDelete = selectedElementId;
    elementsRef.current = elementsRef.current.filter((e) => e.id !== idToDelete);
    setElementsCount(elementsRef.current.length);
    setSelectedElementId(null);
    redraw();
    if (socket) {
      socket.emit("board-delete-stroke", { roomId: currentRoomId, strokeId: idToDelete });
    }
    showToast("Фото удалено с доски");
  };

  const bringSelectedForward = () => {
    if (!selectedElementId) return;
    const idx = elementsRef.current.findIndex((e) => e.id === selectedElementId);
    if (idx === -1 || idx === elementsRef.current.length - 1) return;
    const [item] = elementsRef.current.splice(idx, 1);
    elementsRef.current.push(item);
    redraw();
    if (socket) {
      socket.emit("board-draw-stroke", { roomId: currentRoomId, stroke: item });
    }
    showToast("На передний план");
  };

  const sendSelectedBackward = () => {
    if (!selectedElementId) return;
    const idx = elementsRef.current.findIndex((e) => e.id === selectedElementId);
    if (idx <= 0) return;
    const [item] = elementsRef.current.splice(idx, 1);
    elementsRef.current.unshift(item);
    redraw();
    if (socket) {
      socket.emit("board-draw-stroke", { roomId: currentRoomId, stroke: item });
    }
    showToast("На задний план");
  };

  // Keyboard Shortcuts (Undo, Delete, Clear, Zoom)
  useEffect(() => {
    const handleShortcuts = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId) {
          e.preventDefault();
          deleteSelectedElement();
        }
      } else if (e.key === "Escape") {
        setSelectedElementId(null);
      } else if (e.key.toLowerCase() === "v") {
        setTool("select");
      } else if (e.key.toLowerCase() === "h") {
        setTool("hand");
      }
    };
    window.addEventListener("keydown", handleShortcuts);
    return () => window.removeEventListener("keydown", handleShortcuts);
  }, [currentRoomId, socket, selectedElementId]);

  // ==========================================
  // Image Upload / Drag & Drop / Clipboard Paste
  // ==========================================
  const processImageFile = (file, dropScreenPos = null) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Пожалуйста, выберите файл изображения (PNG, JPG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onload = () => {
        // Compress & scale to sensible whiteboard dimensions
        const maxDim = 800;
        let w = img.naturalWidth || 400;
        let h = img.naturalHeight || 300;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const offCtx = offscreen.getContext("2d");
        offCtx.drawImage(img, 0, 0, w, h);
        const compressedSrc = offscreen.toDataURL("image/jpeg", 0.85);

        const canvas = canvasRef.current;
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 800, height: 600 };
        const screenPos = dropScreenPos || { x: rect.width / 2, y: rect.height / 2 };
        const worldPos = toWorld(screenPos.x, screenPos.y);

        const imageElement = {
          tool: "image",
          id: "img-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
          x: Math.round(worldPos.x - w / 2),
          y: Math.round(worldPos.y - h / 2),
          width: w,
          height: h,
          src: compressedSrc
        };

        elementsRef.current.push(imageElement);
        setElementsCount(elementsRef.current.length);
        setSelectedElementId(imageElement.id);
        setTool("select");
        redraw();

        if (socket) {
          socket.emit("board-draw-stroke", {
            roomId: currentRoomId,
            stroke: imageElement
          });
        }
        showToast("Фото добавлено! Тяните за углы для изменения размера или перемещайте по доске");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste (Ctrl+V) anywhere on page
  useEffect(() => {
    const handlePaste = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          processImageFile(file);
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [currentRoomId, socket, toWorld]);

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      const rect = canvasRef.current?.getBoundingClientRect();
      const dropScreenPos = rect
        ? { x: e.clientX - rect.left, y: e.clientY - rect.top }
        : null;
      processImageFile(e.dataTransfer.files[0], dropScreenPos);
    }
  };

  // ==========================================
  // Mouse & Touch Pointer Handlers (Pan, Zoom, Draw)
  // ==========================================
  const getScreenCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      let touch = null;
      if (activeTouchIdRef.current !== null) {
        touch = Array.from(e.touches).find((t) => t.identifier === activeTouchIdRef.current);
      }
      if (!touch) touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handlePointerDown = (e) => {
    if (e.type && e.type.startsWith("touch")) {
      e.preventDefault();
      if (e.touches && e.touches.length > 0) {
        activeTouchIdRef.current = e.touches[0].identifier;
      }
    }

    const screenPos = getScreenCoordinates(e);

    // 0. Check Resize Handles of currently selected image first!
    if (selectedElementId) {
      const selectedEl = elementsRef.current.find((item) => item.id === selectedElementId);
      if (selectedEl && selectedEl.tool === "image") {
        const handle = getResizeHandleAtScreenPos(screenPos.x, screenPos.y, selectedEl);
        if (handle) {
          const worldPos = toWorld(screenPos.x, screenPos.y);
          dragModeRef.current = {
            type: "resize",
            handle,
            startScreenPos: screenPos,
            startWorldPos: worldPos,
            origElement: { ...selectedEl },
            origAspect: (selectedEl.width || 400) / (selectedEl.height || 300)
          };
          return;
        }
      }
    }

    // 1. Pan / Hand tool OR Spacebar held OR Middle Mouse Button
    if (tool === "hand" || isSpacePressedRef.current || e.button === 1) {
      isPanningRef.current = true;
      startPanRef.current = {
        x: screenPos.x - pan.x,
        y: screenPos.y - pan.y
      };
      return;
    }

    const worldPos = toWorld(screenPos.x, screenPos.y);

    // 2. Select tool OR direct click on an image
    const clickedEl = getElementAtWorldPos(worldPos.x, worldPos.y);
    if (tool === "select" || (clickedEl && clickedEl.tool === "image")) {
      if (clickedEl) {
        setSelectedElementId(clickedEl.id);
        dragModeRef.current = {
          type: "move",
          startScreenPos: screenPos,
          startWorldPos: worldPos,
          origElement: { ...clickedEl }
        };
        redraw();
        return;
      } else {
        if (selectedElementId) {
          setSelectedElementId(null);
          redraw();
        }
        if (tool === "select") {
          return;
        }
      }
    }

    // 3. Text tool click
    if (tool === "text") {
      setTextDialog({
        screenX: screenPos.x,
        screenY: screenPos.y,
        worldX: Math.round(worldPos.x),
        worldY: Math.round(worldPos.y)
      });
      setTextInputVal("");
      return;
    }

    // 4. Regular Drawing (Pen, Eraser, Shapes)
    setIsDrawing(true);
    startWorldPosRef.current = worldPos;
    lastWorldPosRef.current = worldPos;
    lastShapeWorldPosRef.current = worldPos;
  };

  const handlePointerMove = (e) => {
    if (e.type && e.type.startsWith("touch")) {
      e.preventDefault();
    }

    const screenPos = getScreenCoordinates(e);

    // 1. Panning the Board
    if (isPanningRef.current) {
      setPan({
        x: screenPos.x - startPanRef.current.x,
        y: screenPos.y - startPanRef.current.y
      });
      return;
    }

    // 2. Resizing or Moving Element
    if (dragModeRef.current) {
      const currentWorldPos = toWorld(screenPos.x, screenPos.y);
      const el = elementsRef.current.find((item) => item.id === selectedElementId);
      if (!el) return;

      if (dragModeRef.current.type === "move") {
        const dx = currentWorldPos.x - dragModeRef.current.startWorldPos.x;
        const dy = currentWorldPos.y - dragModeRef.current.startWorldPos.y;
        el.x = Math.round(dragModeRef.current.origElement.x + dx);
        el.y = Math.round(dragModeRef.current.origElement.y + dy);
        redraw();
        return;
      }

      if (dragModeRef.current.type === "resize") {
        const { handle, startWorldPos, origElement, origAspect } = dragModeRef.current;
        const dx = currentWorldPos.x - startWorldPos.x;
        const dy = currentWorldPos.y - startWorldPos.y;
        const minSize = 40;

        let newW = origElement.width;
        let newH = origElement.height;
        let newX = origElement.x;
        let newY = origElement.y;

        if (handle === "se") {
          newW = Math.max(minSize, origElement.width + dx);
          newH = Math.round(newW / origAspect);
        } else if (handle === "sw") {
          newW = Math.max(minSize, origElement.width - dx);
          newH = Math.round(newW / origAspect);
          newX = origElement.x + (origElement.width - newW);
        } else if (handle === "ne") {
          newW = Math.max(minSize, origElement.width + dx);
          newH = Math.round(newW / origAspect);
          newY = origElement.y + (origElement.height - newH);
        } else if (handle === "nw") {
          newW = Math.max(minSize, origElement.width - dx);
          newH = Math.round(newW / origAspect);
          newX = origElement.x + (origElement.width - newW);
          newY = origElement.y + (origElement.height - newH);
        } else if (handle === "e") {
          newW = Math.max(minSize, origElement.width + dx);
        } else if (handle === "w") {
          newW = Math.max(minSize, origElement.width - dx);
          newX = origElement.x + (origElement.width - newW);
        } else if (handle === "s") {
          newH = Math.max(minSize, origElement.height + dy);
        } else if (handle === "n") {
          newH = Math.max(minSize, origElement.height - dy);
          newY = origElement.y + (origElement.height - newH);
        }

        el.x = Math.round(newX);
        el.y = Math.round(newY);
        el.width = Math.round(newW);
        el.height = Math.round(newH);
        redraw();
        return;
      }
    }

    // Dynamic Hover Cursor
    if (selectedElementId) {
      const selectedEl = elementsRef.current.find((item) => item.id === selectedElementId);
      if (selectedEl && selectedEl.tool === "image") {
        const handle = getResizeHandleAtScreenPos(screenPos.x, screenPos.y, selectedEl);
        if (handle) {
          if (handle === "nw" || handle === "se") setHoverCursor("nwse-resize");
          else if (handle === "ne" || handle === "sw") setHoverCursor("nesw-resize");
          else if (handle === "n" || handle === "s") setHoverCursor("ns-resize");
          else if (handle === "w" || handle === "e") setHoverCursor("ew-resize");
          return;
        }
      }
    }

    const worldPos = toWorld(screenPos.x, screenPos.y);
    const hoveredEl = getElementAtWorldPos(worldPos.x, worldPos.y);
    if (hoveredEl && (hoveredEl.tool === "image" || tool === "select")) {
      setHoverCursor("move");
    } else if (tool === "hand" || isSpacePressedRef.current) {
      setHoverCursor(isPanningRef.current ? "grabbing" : "grab");
    } else if (tool === "select") {
      setHoverCursor("default");
    } else if (tool === "text") {
      setHoverCursor("text");
    } else {
      setHoverCursor("crosshair");
    }

    if (!isDrawing) return;

    // 3. Drawing
    const currentWorldPos = toWorld(screenPos.x, screenPos.y);
    const ctx = contextRef.current;
    const pCtx = previewContextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    if (tool === "pen" || tool === "eraser") {
      const fromPos = { ...lastWorldPosRef.current };
      const toPos = currentWorldPos;

      const strokeEl = {
        tool,
        from: fromPos,
        to: toPos,
        color: tool === "eraser" ? bgColor : color,
        lineWidth: tool === "eraser" ? lineWidth * 4 : lineWidth
      };

      // Draw immediately on transformed canvas
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      renderElement(ctx, strokeEl);
      ctx.restore();

      elementsRef.current.push(strokeEl);
      lastWorldPosRef.current = toPos;

      if (socket) {
        socket.emit("board-draw-stroke", {
          roomId: currentRoomId,
          stroke: strokeEl
        });
      }
    } else if (pCtx) {
      // Draw temporary shape on isolated preview canvas
      lastShapeWorldPosRef.current = currentWorldPos;
      const width = canvas.width / 2;
      const height = canvas.height / 2;

      pCtx.save();
      pCtx.setTransform(2, 0, 0, 2, 0, 0);
      pCtx.clearRect(0, 0, width, height);

      pCtx.translate(pan.x, pan.y);
      pCtx.scale(zoom, zoom);

      const previewShape = {
        tool,
        from: startWorldPosRef.current,
        to: currentWorldPos,
        color,
        lineWidth
      };
      renderElement(pCtx, previewShape);
      pCtx.restore();
    }
  };

  const handlePointerUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (dragModeRef.current) {
      const el = elementsRef.current.find((item) => item.id === selectedElementId);
      if (el && socket) {
        socket.emit("board-draw-stroke", {
          roomId: currentRoomId,
          stroke: el
        });
      }
      dragModeRef.current = null;
      redraw();
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    activeTouchIdRef.current = null;

    const ctx = contextRef.current;
    const pCtx = previewContextRef.current;
    const canvas = canvasRef.current;

    // Clear preview canvas
    if (pCtx && canvas) {
      const width = canvas.width / 2;
      const height = canvas.height / 2;
      pCtx.save();
      pCtx.setTransform(2, 0, 0, 2, 0, 0);
      pCtx.clearRect(0, 0, width, height);
      pCtx.restore();
    }

    // Commit shape to main canvas and socket
    if (tool !== "pen" && tool !== "eraser" && tool !== "hand" && tool !== "text") {
      const finalShape = {
        tool,
        from: startWorldPosRef.current,
        to: lastShapeWorldPosRef.current,
        color,
        lineWidth
      };

      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);
      renderElement(ctx, finalShape);
      ctx.restore();

      elementsRef.current.push(finalShape);
      setElementsCount(elementsRef.current.length);

      if (socket) {
        socket.emit("board-draw-stroke", {
          roomId: currentRoomId,
          stroke: finalShape
        });
      }
    }
  };

  // Wheel Zoom & Pan
  const handleWheel = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.ctrlKey || tool === "hand") {
      // Zoom centered on mouse pointer
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      const newZoom = Math.min(3.0, Math.max(0.25, Number((zoom * zoomFactor).toFixed(2))));

      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      setZoom(newZoom);
      setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    } else {
      // Normal pan scroll
      setPan((prev) => ({
        x: Math.round(prev.x - e.deltaX),
        y: Math.round(prev.y - e.deltaY)
      }));
    }
  };

  // Zoom Button Controls
  const zoomIn = () => {
    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 800, height: 600 };
    const center = { x: rect.width / 2, y: rect.height / 2 };
    const newZoom = Math.min(3.0, Number((zoom * 1.25).toFixed(2)));
    const newPanX = center.x - (center.x - pan.x) * (newZoom / zoom);
    const newPanY = center.y - (center.y - pan.y) * (newZoom / zoom);
    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    const rect = canvas ? canvas.getBoundingClientRect() : { width: 800, height: 600 };
    const center = { x: rect.width / 2, y: rect.height / 2 };
    const newZoom = Math.max(0.25, Number((zoom * 0.8).toFixed(2)));
    const newPanX = center.x - (center.x - pan.x) * (newZoom / zoom);
    const newPanY = center.y - (center.y - pan.y) * (newZoom / zoom);
    setZoom(newZoom);
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  const resetZoomAndPan = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    showToast("Вид доски возвращен по центру (100%)");
  };

  // Submit Text Input
  const handleAddText = (e) => {
    e?.preventDefault();
    if (!textInputVal.trim() || !textDialog) {
      setTextDialog(null);
      return;
    }

    const textEl = {
      tool: "text",
      id: "txt-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      x: textDialog.worldX,
      y: textDialog.worldY,
      text: textInputVal.trim(),
      color,
      fontSize
    };

    elementsRef.current.push(textEl);
    setElementsCount(elementsRef.current.length);
    redraw();

    if (socket) {
      socket.emit("board-draw-stroke", {
        roomId: currentRoomId,
        stroke: textEl
      });
    }

    setTextDialog(null);
    setTextInputVal("");
    showToast("Текст нанесен на доску");
  };

  // Undo Last Stroke
  const handleUndo = () => {
    if (socket) {
      socket.emit("board-undo", { roomId: currentRoomId });
    } else {
      elementsRef.current.pop();
      setElementsCount(elementsRef.current.length);
      redraw();
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (window.confirm("Очистить электронную доску этой аудитории для всех участников?")) {
      if (socket) {
        socket.emit("board-clear", { roomId: currentRoomId });
      }
      elementsRef.current = [];
      setElementsCount(0);
      redraw();
      showToast("Доска очищена");
    }
  };

  // Export Board snapshot
  const exportAsPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `TOP-Board-${currentRoomId}-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Снимок доски сохранен в PNG!");
  };

  // Room Switch
  const handleSwitchRoom = (roomId) => {
    if (roomId === currentRoomId) {
      setShowRoomDropdown(false);
      return;
    }
    setCurrentRoomId(roomId);
    if (setExternalRoomId) setExternalRoomId(roomId);
    setShowRoomDropdown(false);
    elementsRef.current = [];
    setElementsCount(0);
    resetZoomAndPan();
    const aud = DEFAULT_AUDITORIUMS.find((a) => a.id === roomId);
    showToast(`Подключена доска: ${aud ? aud.shortName : roomId}`);
  };

  const handleCustomRoomSubmit = (e) => {
    e.preventDefault();
    if (!customRoomInput.trim()) return;
    const formattedId = customRoomInput.trim().toLowerCase().replace(/\s+/g, "-");
    handleSwitchRoom(formattedId);
    setCustomRoomInput("");
    setShowCustomRoomModal(false);
  };

  const currentAuditorium = DEFAULT_AUDITORIUMS.find((a) => a.id === currentRoomId) || {
    id: currentRoomId,
    name: `Аудитория: ${currentRoomId}`,
    shortName: currentRoomId,
    icon: "🏫"
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-3 flex flex-col h-[calc(100vh-4.5rem)] select-none">
      {/* Toast Notification */}
      {notice && (
        <div className="fixed top-6 right-6 z-50 p-3 rounded-[6px] bg-surface border-2 border-ink text-ink font-bold text-xs shadow-hard flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-accent" />
          <span>{notice}</span>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImageFile(e.target.files[0]);
            e.target.value = "";
          }
        }}
      />

      {/* 1. Header Toolbar: Auditorium Selector & Tools */}
      <div className="bg-surface border-2 border-ink rounded-[10px] p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-hard">
        {/* Left: Auditorium / Classroom Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoomDropdown(!showRoomDropdown)}
            className="btn sec h-9 text-xs font-bold flex items-center gap-2 px-3 shadow-hard-xs"
            title="Сменить аудиторию / класс"
          >
            <span className="text-sm">{currentAuditorium.icon}</span>
            <span className="text-ink font-mono font-bold max-w-[200px] sm:max-w-xs truncate">
              {currentAuditorium.shortName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted ml-0.5" />
          </button>

          {showRoomDropdown && (
            <div className="absolute top-11 left-0 z-50 w-72 sm:w-80 bg-surface border-2 border-ink rounded-[8px] shadow-hard p-1.5 space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono font-bold text-ink-muted uppercase border-b border-ink/20 mb-1">
                Выберите аудиторию класса:
              </div>

              {DEFAULT_AUDITORIUMS.map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => handleSwitchRoom(aud.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-[6px] text-xs font-bold flex items-center gap-2.5 transition-colors ${
                    currentRoomId === aud.id
                      ? "bg-accent text-white"
                      : "text-ink hover:bg-surface-2"
                  }`}
                >
                  <span>{aud.icon}</span>
                  <div className="flex-1 truncate">
                    <div className="truncate">{aud.name}</div>
                  </div>
                  {currentRoomId === aud.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))}

              <div className="border-t border-ink/20 pt-1 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoomDropdown(false);
                    setShowCustomRoomModal(true);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-[6px] text-xs font-bold text-ink hover:bg-surface-2 flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-accent" />
                  <span>Ввести свою аудиторию / класс...</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Tools Selector */}
        <div className="flex items-center gap-1 p-1 rounded-[6px] bg-surface-2 border-2 border-ink overflow-x-auto">
          {/* Select & Move Tool */}
          <button
            type="button"
            onClick={() => {
              setTool("select");
              showToast("Выбор фото: кликните на картинку для перемещения и масштабирования (V)");
            }}
            title="Выбор и перемещение фото (V)"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "select" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <MousePointer2 className="w-4 h-4" />
          </button>

          {/* Hand / Pan Tool */}
          <button
            type="button"
            onClick={() => setTool("hand")}
            title="Рука (Двигать доску) [Зажмите Пробел]"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "hand" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Hand className="w-4 h-4" />
          </button>

          {/* Pen */}
          <button
            type="button"
            onClick={() => setTool("pen")}
            title="Карандаш"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "pen" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <PenTool className="w-4 h-4" />
          </button>

          {/* Eraser */}
          <button
            type="button"
            onClick={() => setTool("eraser")}
            title="Ластик"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "eraser" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Eraser className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-ink/20 mx-0.5" />

          {/* Text Tool */}
          <button
            type="button"
            onClick={() => setTool("text")}
            title="Текст (Кликните на доску)"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "text" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Image Upload Tool */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Добавить фото или картинку (или перетащите на доску)"
            className="p-2 rounded-[4px] cursor-pointer text-ink hover:bg-surface hover:text-accent transition-all"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <span className="w-px h-5 bg-ink/20 mx-0.5" />

          {/* Shapes */}
          <button
            type="button"
            onClick={() => setTool("rect")}
            title="Прямоугольник"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "rect" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("circle")}
            title="Окружность"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "circle" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Circle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("arrow")}
            title="Стрелка"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "arrow" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTool("line")}
            title="Линия"
            className={`p-2 rounded-[4px] cursor-pointer transition-all ${
              tool === "line" ? "bg-accent text-white" : "text-ink hover:bg-surface"
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Color Palette & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Colors */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-[6px] bg-surface-2 border-2 border-ink">
            <Palette className="w-3.5 h-3.5 text-ink-muted ml-0.5" />
            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setColor(c);
                    if (tool === "eraser") setTool("pen");
                  }}
                  className={`w-5 h-5 rounded-full border border-ink transition-transform cursor-pointer ${
                    color === c && tool !== "eraser" ? "scale-125 ring-2 ring-accent" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Stroke Width Slider */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] bg-surface-2 border-2 border-ink text-xs font-mono">
            <span className="text-ink-muted">Толщина:</span>
            <input
              type="range"
              min="1"
              max="16"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-14 accent-accent cursor-pointer"
            />
            <span className="text-accent font-bold">{lineWidth}px</span>
          </div>

          {/* Action Buttons: Undo, Clear, Export */}
          <button
            type="button"
            onClick={handleUndo}
            title="Отменить действие (Ctrl+Z)"
            className="ib w-9 h-9 rounded-[6px]"
          >
            <RotateCcw className="w-4 h-4 text-ink" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Очистить доску аудитории"
            className="ib w-9 h-9 rounded-[6px]"
          >
            <Trash2 className="w-4 h-4 text-danger" />
          </button>

          <button
            type="button"
            onClick={exportAsPng}
            title="Сохранить снимок доски в PNG"
            className="btn pri h-9 text-xs font-bold px-3"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PNG</span>
          </button>
        </div>
      </div>

      {/* 2. Main Canvas Interactive Viewport */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onWheel={handleWheel}
        className="relative flex-1 rounded-[10px] border-2 border-ink bg-[#fffdf8] overflow-hidden shadow-hard"
      >
        {/* Main Canvas: Committed lines, shapes, images, and text */}
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ cursor: hoverCursor }}
          className="w-full h-full block touch-none"
        />

        {/* Overlay Preview Canvas for Shapes */}
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0 pointer-events-none w-full h-full block"
        />

        {/* Floating Quick Action Toolbar for Selected Image */}
        {selectedElementId && (() => {
          const selEl = elementsRef.current.find((e) => e.id === selectedElementId);
          if (!selEl || selEl.tool !== "image") return null;
          const sPos = toScreen(selEl.x, selEl.y);
          return (
            <div
              style={{
                left: Math.max(16, sPos.x),
                top: Math.max(16, sPos.y - 48)
              }}
              className="absolute z-40 flex items-center gap-1.5 p-1.5 bg-surface border-2 border-ink rounded-[8px] shadow-hard text-xs select-none backdrop-blur-xs"
            >
              <span className="font-mono font-bold text-[11px] px-1 text-ink-muted">
                {Math.round(selEl.width)}×{Math.round(selEl.height)}px
              </span>
              <span className="w-px h-4 bg-ink/20" />
              <button
                type="button"
                onClick={() => scaleSelectedImage(1.2)}
                title="Увеличить фото (+20%)"
                className="btn sec h-7 px-2 text-xs flex items-center gap-1 cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>+20%</span>
              </button>
              <button
                type="button"
                onClick={() => scaleSelectedImage(0.8)}
                title="Уменьшить фото (-20%)"
                className="btn sec h-7 px-2 text-xs flex items-center gap-1 cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
                <span>-20%</span>
              </button>
              <span className="w-px h-4 bg-ink/20" />
              <button
                type="button"
                onClick={bringSelectedForward}
                title="На передний план"
                className="btn sec h-7 px-1.5 text-xs flex items-center cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={sendSelectedBackward}
                title="На задний план"
                className="btn sec h-7 px-1.5 text-xs flex items-center cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <span className="w-px h-4 bg-ink/20" />
              <button
                type="button"
                onClick={deleteSelectedElement}
                title="Удалить фото (Delete)"
                className="btn pri !bg-danger text-white h-7 px-2 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Удалить</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedElementId(null)}
                title="Снять выбор (Esc)"
                className="p-1 rounded-[4px] hover:bg-surface-2 text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}

        {/* Floating Top-Right Room & Sync Pill */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border-2 border-ink text-[11px] font-mono text-ink font-bold shadow-hard-xs">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>{currentAuditorium.shortName}</span>
            <span className="text-ink-muted">·</span>
            <span className="text-ink-muted">{elementsCount} эл.</span>
          </div>
        </div>

        {/* Floating Bottom-Right Zoom & Pan Navigation Controls */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 p-1.5 bg-surface border-2 border-ink rounded-[8px] shadow-hard z-30">
          <button
            type="button"
            onClick={zoomOut}
            title="Уменьшить доску (−)"
            className="w-7 h-7 rounded-[4px] border border-ink bg-surface-2 flex items-center justify-center font-bold text-ink hover:bg-highlight hover:text-on-highlight cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetZoomAndPan}
            title="Кликните для сброса зума (100%) и центрирования"
            className="px-2 h-7 rounded-[4px] border border-ink bg-surface text-ink font-mono text-xs font-bold hover:bg-surface-2 cursor-pointer"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            title="Увеличить доску (+)"
            className="w-7 h-7 rounded-[4px] border border-ink bg-surface-2 flex items-center justify-center font-bold text-ink hover:bg-highlight hover:text-on-highlight cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={resetZoomAndPan}
            title="Вернуть в центр"
            className="w-7 h-7 rounded-[4px] border border-ink bg-surface-2 flex items-center justify-center text-ink hover:bg-surface cursor-pointer ml-0.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom-Left Keyboard Helper Pill */}
        <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface/90 border-2 border-ink text-[11px] font-mono text-ink-muted shadow-hard-xs backdrop-blur-xs">
          <span>🖐️ Пробел + Драг — двигать доску</span>
          <span>•</span>
          <span>Ctrl + Колесо — зум</span>
          <span>•</span>
          <span>Ctrl + V — вставить скриншот</span>
        </div>

        {/* Inline Text Input Popover */}
        {textDialog && (
          <div
            className="absolute z-40 bg-surface border-2 border-ink rounded-[8px] p-3 shadow-hard w-72 space-y-2 animate-in fade-in zoom-in-95 duration-100"
            style={{
              left: Math.min(window.innerWidth - 320, Math.max(16, textDialog.screenX)),
              top: Math.min(window.innerHeight - 200, Math.max(16, textDialog.screenY))
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold text-ink border-b border-ink/20 pb-1.5">
              <span>Добавить текст на доску</span>
              <button
                type="button"
                onClick={() => setTextDialog(null)}
                className="text-ink-muted hover:text-ink cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              autoFocus
              rows={2}
              value={textInputVal}
              onChange={(e) => setTextInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddText();
                } else if (e.key === "Escape") {
                  setTextDialog(null);
                }
              }}
              placeholder="Введите текст (формулу, пояснение)..."
              className="w-full p-2 rounded-[4px] bg-paper border-2 border-ink text-xs font-mono text-ink focus:outline-accent resize-none"
            />

            <div className="flex items-center justify-between gap-2 pt-1">
              {/* Font Size Selector */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                {fontSizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setFontSize(sz)}
                    className={`px-1.5 py-0.5 rounded-[4px] border border-ink text-[10px] font-bold cursor-pointer ${
                      fontSize === sz ? "bg-accent text-white" : "bg-surface-2 text-ink"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTextDialog(null)}
                  className="btn sec h-7 px-2 text-[11px]"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleAddText}
                  className="btn pri h-7 px-2.5 text-[11px] font-bold"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Custom Room Input Modal */}
      {showCustomRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface border-2 border-ink rounded-[10px] shadow-hard max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-ink pb-2">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <School className="w-4 h-4 text-accent" />
                <span>Подключение к аудитории класса</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomRoomModal(false)}
                className="ib w-7 h-7 rounded-[4px]"
              >
                <X className="w-4 h-4 text-ink" />
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Введите номер аудитории или идентификатор класса (например: <code className="font-bold text-ink">10-А</code>, <code className="font-bold text-ink">aud-102</code>, <code className="font-bold text-ink">lab-it</code>). Все участники с этим ID будут рисовать на одной доске.
            </p>

            <form onSubmit={handleCustomRoomSubmit} className="space-y-3">
              <input
                type="text"
                autoFocus
                value={customRoomInput}
                onChange={(e) => setCustomRoomInput(e.target.value)}
                placeholder="Название или номер аудитории..."
                className="w-full h-10 px-3 rounded-[6px] bg-paper border-2 border-ink text-xs font-mono font-bold text-ink placeholder:text-ink-muted focus:outline-accent"
              />

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomRoomModal(false)}
                  className="btn sec h-9 text-xs"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={!customRoomInput.trim()}
                  className="btn pri h-9 text-xs font-bold"
                >
                  Перейти на доску
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
