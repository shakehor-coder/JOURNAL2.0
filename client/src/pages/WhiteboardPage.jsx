import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PenTool,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Trash2,
  Download,
  Palette
} from "lucide-react";

export const WhiteboardPage = () => {
  const { socket } = useAuth();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const lastShapePosRef = useRef({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1917");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);

  const colors = [
    "#1a1917", // Ink Black
    "#e5322d", // Accent Red
    "#1f9d63", // Success Green
    "#b7791f", // Warning Amber
    "#2563eb", // Blue
    "#7c3aed", // Purple
    "#ffffff"  // White
  ];

  const bgColor = "#fffdf8";
  const gridColor = "rgba(26, 25, 23, 0.07)";

  const drawGrid = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridSize = 28;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;

    const ctx = canvas.getContext("2d");
    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    contextRef.current = ctx;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    drawGrid(ctx, rect.width, rect.height);

    if (socket) {
      socket.emit("join-board-room", { roomId: "global-board" });
      socket.on("board-init-state", (strokes) => {
        if (Array.isArray(strokes)) {
          strokes.forEach((s) => applyRemoteStroke(s));
        }
      });
      socket.on("board-draw-stroke", (stroke) => {
        applyRemoteStroke(stroke);
      });
      socket.on("board-cleared", () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, rect.width, rect.height);
        drawGrid(ctx, rect.width, rect.height);
      });
    }

    return () => {
      if (socket) {
        socket.off("board-init-state");
        socket.off("board-draw-stroke");
        socket.off("board-cleared");
      }
    };
  }, [socket]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches && e.touches[0] ? e.touches[0] : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null);
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (e.type && e.type.startsWith("touch")) {
      e.preventDefault();
    }
    const pos = getCoordinates(e);
    setIsDrawing(true);
    setStartPos(pos);
    lastPosRef.current = pos;

    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.strokeStyle = tool === "eraser" ? bgColor : color;
    ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;

    if (tool !== "pen" && tool !== "eraser") {
      const canvas = canvasRef.current;
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type && e.type.startsWith("touch")) {
      e.preventDefault();
    }
    const currentPos = getCoordinates(e);
    const ctx = contextRef.current;
    if (!ctx) return;

    if (tool === "pen" || tool === "eraser") {
      const fromPos = { ...lastPosRef.current };
      const toPos = currentPos;

      ctx.save();
      ctx.strokeStyle = tool === "eraser" ? bgColor : color;
      ctx.lineWidth = tool === "eraser" ? lineWidth * 4 : lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
      ctx.restore();

      lastPosRef.current = toPos;

      if (socket) {
        socket.emit("board-draw-stroke", {
          roomId: "global-board",
          stroke: {
            tool,
            from: fromPos,
            to: toPos,
            color: tool === "eraser" ? bgColor : color,
            lineWidth: tool === "eraser" ? lineWidth * 4 : lineWidth
          }
        });
      }
    } else if (snapshot) {
      lastShapePosRef.current = currentPos;
      ctx.putImageData(snapshot, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;

      if (tool === "rect") {
        ctx.strokeRect(startPos.x, startPos.y, currentPos.x - startPos.x, currentPos.y - startPos.y);
      } else if (tool === "circle") {
        const radius = Math.sqrt(
          Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2)
        );
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === "line") {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      } else if (tool === "arrow") {
        drawArrow(ctx, startPos.x, startPos.y, currentPos.x, currentPos.y);
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = contextRef.current;
    if (ctx) ctx.closePath();

    if (tool !== "pen" && tool !== "eraser" && socket && lastShapePosRef.current) {
      socket.emit("board-draw-stroke", {
        roomId: "global-board",
        stroke: {
          tool,
          from: startPos,
          to: lastShapePosRef.current,
          color,
          lineWidth
        }
      });
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headlen = 10;
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

  const applyRemoteStroke = (stroke) => {
    const ctx = contextRef.current;
    if (!ctx || !stroke || !stroke.from || !stroke.to) return;
    ctx.save();
    ctx.strokeStyle = stroke.color || color;
    ctx.lineWidth = stroke.lineWidth || lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    if (!stroke.tool || stroke.tool === "pen" || stroke.tool === "eraser") {
      ctx.moveTo(stroke.from.x, stroke.from.y);
      ctx.lineTo(stroke.to.x, stroke.to.y);
      ctx.stroke();
    } else if (stroke.tool === "rect") {
      ctx.strokeRect(stroke.from.x, stroke.from.y, stroke.to.x - stroke.from.x, stroke.to.y - stroke.from.y);
    } else if (stroke.tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(stroke.to.x - stroke.from.x, 2) + Math.pow(stroke.to.y - stroke.from.y, 2)
      );
      ctx.arc(stroke.from.x, stroke.from.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (stroke.tool === "line") {
      ctx.moveTo(stroke.from.x, stroke.from.y);
      ctx.lineTo(stroke.to.x, stroke.to.y);
      ctx.stroke();
    } else if (stroke.tool === "arrow") {
      drawArrow(ctx, stroke.from.x, stroke.from.y, stroke.to.x, stroke.to.y);
    }

    ctx.restore();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    drawGrid(ctx, rect.width, rect.height);

    if (socket) {
      socket.emit("board-clear", { roomId: "global-board" });
    }
  };

  const exportAsPng = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `TOP-Whiteboard-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6 space-y-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Toolbar */}
      <div className="bg-surface border-2 border-ink rounded-[10px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-hard">
        {/* Tool selector */}
        <div className="flex items-center gap-1 p-1 rounded-[6px] bg-surface-2 border-2 border-ink">
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

        {/* Color palette */}
        <div className="flex items-center gap-2 p-1.5 rounded-[6px] bg-surface-2 border-2 border-ink">
          <Palette className="w-4 h-4 text-ink-muted ml-1" />
          <div className="flex items-center gap-1.5">
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

        {/* Stroke width */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-surface-2 border-2 border-ink text-[12px] text-ink font-mono font-medium">
          <span className="text-ink-muted">Толщина:</span>
          <input
            type="range"
            min="1"
            max="16"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-16 accent-accent cursor-pointer"
          />
          <span className="w-5 text-accent font-bold">{lineWidth}px</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearCanvas}
            title="Очистить доску"
            className="ib w-9 h-9 rounded-[6px]"
          >
            <Trash2 className="w-4 h-4 text-danger" />
          </button>
          <button
            type="button"
            onClick={exportAsPng}
            className="btn pri h-9 text-[13px] px-3.5"
          >
            <Download className="w-4 h-4" />
            <span>Экспорт PNG</span>
          </button>
        </div>
      </div>

      {/* Main Board Surface */}
      <div className="relative flex-1 rounded-[10px] border-2 border-ink bg-[#fffdf8] overflow-hidden shadow-hard">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full cursor-crosshair block touch-none"
        />

        <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-surface border-2 border-ink text-[11px] font-mono text-ink font-bold shadow-hard-xs">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span>Синхронизация активна</span>
        </div>
      </div>
    </div>
  );
};
