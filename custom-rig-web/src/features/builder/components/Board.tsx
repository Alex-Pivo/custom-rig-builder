"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { snapCenterToCursor, restrictToParentElement } from "@dnd-kit/modifiers";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useRigStore } from "@/store/useRigStore";
import { PedalItem } from "./Pedaltem"; 
import { POWER_SUPPLIES } from "@/lib/constants";
import { Cables } from "./Cabels";

export const Board = () => {
  const {
    selectedPedals,
    updatePosition,
    selectedPowerSupply,
    setPowerSupply,
    powerStatus,
    addConnection, 
  } = useRigStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // --- ОПТИМИЗИРОВАННАЯ ЛОГИКА КАБЕЛЕЙ ---
  const [activeCable, setActiveCable] = useState<{
    pedalId: string;
    type: "input" | "output";
    startPos: { x: number; y: number };
  } | null>(null);
  
  // mousePos оставляем для начальной инициализации, но Cables будет использовать его как fallback
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Высокопроизводительный обработчик движения мыши
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (activeCable && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Обновляем CSS переменные на контейнере. 
      // Это позволяет Cables.tsx рисовать провод через CSS/SVG мгновенно.
      boardRef.current.style.setProperty('--mouse-x', `${x}px`);
      boardRef.current.style.setProperty('--mouse-y', `${y}px`);
      
      // Опционально обновляем стейт реже или только для синхронизации
      // setMousePos({ x, y }); 
    }
  }, [activeCable]);

  useEffect(() => {
    const handleMouseUpGlobal = () => {
      if (activeCable) setActiveCable(null);
    };

    if (activeCable) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUpGlobal);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUpGlobal);
    };
  }, [activeCable, handleMouseMove]);

  const handlePortMouseDown = (pedalId: string, type: "input" | "output", e: React.MouseEvent) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Устанавливаем начальные координаты в CSS
    boardRef.current.style.setProperty('--mouse-x', `${x}px`);
    boardRef.current.style.setProperty('--mouse-y', `${y}px`);

    setActiveCable({
      pedalId,
      type,
      startPos: { x, y },
    });
    setMousePos({ x, y });
  };

  const handlePortMouseUp = (pedalId: string, type: "input" | "output") => {
    if (activeCable && activeCable.pedalId !== pedalId) {
      if (activeCable.type === "output" && type === "input") {
        addConnection(activeCable.pedalId, pedalId);
      }
    }
    setActiveCable(null);
  };

  // --- СЕНСОРЫ ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Уменьшаем дистанцию активации до минимума для мгновенного отклика
      activationConstraint: { distance: 2 }, 
      onActivation: ({ event }) => {
        const target = event.target as HTMLElement;
        if (target && target.closest('.port-node')) return false; 
        return true; 
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragDelta(event.delta);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActiveId(null);
    setDragDelta({ x: 0, y: 0 });

    if (active) {
      const pedal = selectedPedals.find((p) => p.id === active.id);
      if (pedal) {
        const newX = Math.max(0, Math.min(pedal.position.x + delta.x, 1024 - 128));
        const newY = Math.max(0, Math.min(pedal.position.y + delta.y, 600 - 176));
        updatePosition(active.id.toString(), newX, newY);
      }
    }
  };

  const activePedal = selectedPedals.find((p) => p.id === activeId);

  if (!mounted) return null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-4 w-full max-w-5xl select-none">
        {/* Панель управления */}
        <div className="flex justify-between items-center p-5 bg-zinc-800 rounded-t-2xl border-x-2 border-t-2 border-zinc-700 shadow-lg">
           <div className="flex flex-col gap-2">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Power Source</span>
            <div className="flex gap-2">
              {POWER_SUPPLIES.map((ps) => (
                <button key={ps.id} onClick={() => setPowerSupply(ps)} className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${selectedPowerSupply?.id === ps.id ? "bg-yellow-400 text-black border-yellow-400" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}>
                  {ps.name}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Consumption Analysis</span>
            <div className={`text-2xl font-mono font-bold ${powerStatus?.is_safe ? "text-green-400" : "text-red-500"}`}>{powerStatus?.total_ma || 0} / {selectedPowerSupply?.max_ma || 500} mA</div>
          </div>
        </div>

        {/* Игровое поле */}
        <div 
          ref={boardRef}
          className="relative h-[600px] bg-zinc-900 border-2 border-zinc-800 rounded-b-2xl shadow-2xl overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
          // Слой для высокопроизводительной отрисовки
          style={{ 
            contain: 'paint' 
          } as React.CSSProperties}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "radial-gradient(#ffffff 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Педали */}
          {selectedPedals.map((pedal) => (
            <PedalItem
              key={pedal.id}
              {...pedal}
              isHidden={pedal.id === activeId}
              isDraggingElsewhere={activeId !== null && activeId !== pedal.id}
              onPortMouseDown={(type, e) => handlePortMouseDown(pedal.id, type, e)}
              onPortMouseUp={(type) => handlePortMouseUp(pedal.id, type)}
            />
          ))}

          {/* Кабели */}
          <Cables 
            activeId={activeId} 
            dragDelta={dragDelta} 
            activeCable={activeCable}
            // mousePos передаем как fallback
            mousePos={mousePos}
          />

          <DragOverlay modifiers={[snapCenterToCursor, restrictToParentElement]} dropAnimation={null}>
            {activeId && activePedal ? (
              <PedalItem
                {...activePedal}
                position={{ x: 0, y: 0 }}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  );
};