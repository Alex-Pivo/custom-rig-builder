'use client';
import React, { useMemo } from 'react';
import { useRigStore } from '@/store/useRigStore';

interface CablesProps {
  activeId: string | null;
  dragDelta: { x: number; y: number };
  activeCable?: {
    pedalId: string;
    type: "input" | "output";
    startPos: { x: number; y: number };
  } | null;
  mousePos?: { x: number; y: number };
}

export const Cables = ({ activeId, dragDelta, activeCable, mousePos }: CablesProps) => {
  const { selectedPedals, getConnections, removeManualConnection } = useRigStore();
  
  // Координаты портов
  const PORT_Y_OFFSET = 152;
  const INPUT_X_OFFSET = 25;
  const OUTPUT_X_OFFSET = 103;

  // Используем useMemo, чтобы не пересчитывать все связи, если ничего не меняется
  // Но для реалтайма мы будем прибавлять дельту прямо в рендере
  const allConnections = getConnections();

  if (selectedPedals.length === 0 && !activeCable) return null;

  const renderBezier = (x1: number, y1: number, x2: number, y2: number, key: string, isDraft = false, onRemove?: () => void) => {
    const sag = isDraft ? 40 : 70; // Уменьшим провисание для отзывчивости
    
    return (
      <path
        key={key}
        d={`M ${x1},${y1} C ${x1},${y1 + sag} ${x2},${y2 + sag} ${x2},${y2}`}
        stroke={isDraft ? "#3b82f6" : "#111"}
        strokeWidth="10"
        strokeDasharray={isDraft ? "4,4" : "none"}
        fill="none"
        strokeLinecap="round"
        // pointer-events-auto позволяет кликать по проводу
        className={`pointer-events-auto transition-colors duration-150 ${
          isDraft ? "opacity-60" : "opacity-100 cursor-pointer hover:stroke-red-500"
        }`}
        onContextMenu={(e) => {
          if (!isDraft && onRemove) {
            e.preventDefault();
            onRemove();
          }
        }}
      />
    );
  };

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none z-[50]" 
      style={{ 
        overflow: 'visible',
        // Это заставляет браузер использовать видеокарту для отрисовки SVG
        transform: 'translate3d(0,0,0)',
        willChange: 'transform'
      }}
    >
      <defs>
        <filter id="cable-shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* РУЧНЫЕ СОЕДИНЕНИЯ */}
      {allConnections.map((conn) => {
        // Если педаль 'откуда' или 'куда' сейчас тащится, 
        // мы мгновенно применяем dragDelta к её координатам прямо здесь
        const fromX = conn.fromPedalId === activeId ? conn.from.x + dragDelta.x : conn.from.x;
        const fromY = conn.fromPedalId === activeId ? conn.from.y + dragDelta.y : conn.from.y;
        
        const toX = conn.toPedalId === activeId ? conn.to.x + dragDelta.x : conn.to.x;
        const toY = conn.toPedalId === activeId ? conn.to.y + dragDelta.y : conn.to.y;

        return renderBezier(
          fromX, fromY, 
          toX, toY, 
          conn.id,
          false,
          () => removeManualConnection(conn.fromPedalId, conn.toPedalId)
        );
      })}

      {/* ВРЕМЕННЫЙ ПРОВОД (Тянется за мышкой) */}
      {activeCable && mousePos && (
        renderBezier(
          // Если педаль старта сейчас тащится (редкий случай, но учтем), добавляем дельту
          activeCable.pedalId === activeId ? activeCable.startPos.x + dragDelta.x : activeCable.startPos.x,
          activeCable.pedalId === activeId ? activeCable.startPos.y + dragDelta.y : activeCable.startPos.y,
          mousePos.x,
          mousePos.y,
          "draft-cable",
          true
        )
      )}
    </svg>
  );
};