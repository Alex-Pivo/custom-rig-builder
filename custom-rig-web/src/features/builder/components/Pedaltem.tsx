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
}: PedalProps) => {
  const removePedal = useRigStore((state) => state.removePedal);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      disabled: isOverlay,
    });

  const style: React.CSSProperties = {
    // ВАЖНО: snapCenterToCursor работает правильно только когда мы используем transform
    transform: CSS.Translate.toString(transform),
    top: isOverlay ? 0 : `${position.y}px`,
    left: isOverlay ? 0 : `${position.x}px`,
    transition:
      isDragging || isOverlay
        ? "none"
        : "transform 0.2s ease, opacity 0.2s ease",
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
      {...(!isOverlay ? listeners : {})}
      {...(!isOverlay ? attributes : {})}
      onDoubleClick={() => !isOverlay && removePedal(id)}
      className={`w-32 h-44 ${color} rounded-lg shadow-xl flex flex-col items-center justify-between p-3 border-2 border-white/20
                  ${isOverlay ? "cursor-grabbing scale-105 shadow-2xl ring-2 ring-yellow-400/50" : "cursor-grab"}
                  ${isDraggingElsewhere ? "opacity-40" : "opacity-100"}
                  ${isDragging ? "opacity-0 pointer-events-none" : "opacity-100"}
                 `}
    >
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

      <div className="w-full flex justify-between px-1 opacity-40">
        <div
          className={`w-3 h-3 rounded-full ${isWhitePedal ? "bg-zinc-800" : "bg-black"}`}
        />
        <div
          className={`w-3 h-3 rounded-full ${isWhitePedal ? "bg-zinc-800" : "bg-black"}`}
        />
      </div>
    </div>
  );
};