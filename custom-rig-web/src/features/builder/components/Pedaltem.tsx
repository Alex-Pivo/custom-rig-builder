"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useRigStore } from "@/store/useRigStore";

interface PedalProps {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  maDraw: number;
  voltage: number;
  isDraggingElsewhere?: boolean;
  isOverlay?: boolean;
  isHidden?: boolean;
  onPortMouseDown?: (type: "input" | "output", e: React.MouseEvent) => void;
  onPortMouseUp?: (type: "input" | "output") => void;
}

export const PedalItem = ({
  id,
  name,
  color,
  position,
  maDraw,
  voltage,
  isDraggingElsewhere,
  isOverlay,
  isHidden,
  onPortMouseDown,
  onPortMouseUp,
}: PedalProps) => {
  const removePedal = useRigStore((state) => state.removePedal);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: isOverlay,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    top: isOverlay ? 0 : `${position.y}px`,
    left: isOverlay ? 0 : `${position.x}px`,
    transition:
      isDragging || isOverlay
        ? "none"
        : "transform 0.2s ease, opacity 0.2s ease",
    // Педаль на базовом слое 10, оверлей — 1000. 
    // Кабели в Cables.tsx должны иметь z-50, чтобы быть ПОВЕРХ корпуса, но ПОД портами
    zIndex: isOverlay ? 1000 : isDragging ? 0 : 10,
    position: "absolute",
    display: isHidden ? "none" : "flex",
    pointerEvents: isOverlay ? "none" : "auto",
  };

  const isWhitePedal = color.includes("bg-white");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-32 h-44 ${color} rounded-lg shadow-xl flex flex-col items-center justify-between p-3 border-2 border-white/20
                  ${isOverlay ? "scale-105 shadow-2xl ring-2 ring-yellow-400/50" : ""}
                  ${isDraggingElsewhere ? "opacity-40" : "opacity-100"}
                  ${isDragging ? "opacity-0 pointer-events-none" : "opacity-100"}
                  `}
    >
      {/* СЛОЙ 1: Драг-зона (Корпус). z-10 */}
      <div 
        {...(!isOverlay ? listeners : {})}
        {...(!isOverlay ? attributes : {})}
        onDoubleClick={() => !isOverlay && removePedal(id)}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing rounded-lg"
      />

      {/* СЛОЙ 2: Контент. z-20. pointer-events-none пропускает клики к Слою 1 */}
      <div className="relative z-20 pointer-events-none flex flex-col items-center justify-between h-full w-full">
        <div className="text-center w-full">
          <h3
            className={`text-sm font-black leading-tight uppercase tracking-tighter ${isWhitePedal ? "text-black" : "text-white"}`}
          >
            {name}
          </h3>
        </div>

        <div className="w-10 h-10 bg-zinc-300 rounded-full border-4 border-zinc-500 flex items-center justify-center shadow-inner">
          <div
            className={`w-2 h-2 rounded-full ${isWhitePedal ? "bg-blue-600" : "bg-red-600"} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}
          />
        </div>

        <div
          className={`w-full flex justify-between px-1 font-mono text-[10px] font-bold ${isWhitePedal ? "text-zinc-800" : "text-white/60"}`}
        >
          <span>{maDraw}mA</span>
          <span>{voltage}V</span>
        </div>
      </div>

      {/* СЛОЙ 3: Порты. Поднимаем z-index до 60, чтобы они были ВЫШЕ кабелей (у которых z-50) */}
      <div className="relative z-[60] w-full flex justify-between px-1 pointer-events-none">
        {/* Вход (Input) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onPortMouseDown?.("input", e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onPortMouseUp?.("input");
          }}
          className={`port-node pointer-events-auto w-6 h-6 rounded-full cursor-crosshair transition-all hover:scale-125 hover:brightness-125 flex items-center justify-center
            ${isWhitePedal ? "bg-zinc-800" : "bg-black"} 
            border-2 border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        >
          <div className="w-2 h-2 bg-blue-400/80 rounded-full animate-pulse pointer-events-none" />
        </div>

        {/* Выход (Output) */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            onPortMouseDown?.("output", e);
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            onPortMouseUp?.("output");
          }}
          className={`port-node pointer-events-auto w-6 h-6 rounded-full cursor-crosshair transition-all hover:scale-125 hover:brightness-125 flex items-center justify-center
            ${isWhitePedal ? "bg-zinc-800" : "bg-black"} 
            border-2 border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
        >
          <div className="w-2 h-2 bg-blue-400/80 rounded-full animate-pulse pointer-events-none" />
        </div>
      </div>
    </div>
  );
};