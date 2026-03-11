"use client";

import React, { useState, useEffect } from "react";
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
// snapCenterToCursor для центрирования, restrictToParentElement для границ
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
  } = useRigStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
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
        // Ограничиваем координаты при сохранении, чтобы педаль не сохранялась за краем
        // (Ширина контейнера 1024 - ширина педали 128, Высота 600 - высота педали 176)
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
      <div className="flex flex-col gap-4 w-full max-w-5xl">
        {/* Панель управления */}
        <div className="flex justify-between items-center p-5 bg-zinc-800 rounded-t-2xl border-x-2 border-t-2 border-zinc-700 shadow-lg">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
              Power Source
            </span>
            <div className="flex gap-2">
              {POWER_SUPPLIES.map((ps) => (
                <button
                  key={ps.id}
                  onClick={() => setPowerSupply(ps)}
                  className={`px-3 py-1 text-[10px] font-bold rounded border transition-all ${
                    selectedPowerSupply?.id === ps.id
                      ? "bg-yellow-400 text-black border-yellow-400"
                      : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {ps.name}
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
              Consumption Analysis
            </span>
            <div
              className={`text-2xl font-mono font-bold ${powerStatus?.is_safe ? "text-green-400" : "text-red-500"}`}
            >
              {powerStatus?.total_ma || 0} /{" "}
              {selectedPowerSupply?.max_ma || 500} mA
            </div>
            <div
              className={`text-[10px] font-bold uppercase ${powerStatus?.is_safe ? "text-green-600" : "text-red-400"}`}
            >
              {powerStatus?.status || "SYSTEM READY"}
            </div>
          </div>
        </div>

        <div className="relative h-[600px] bg-zinc-900 border-2 border-zinc-800 rounded-b-2xl shadow-2xl overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(#ffffff 0.5px, transparent 0.5px)",
              backgroundSize: "24px 24px",
            }}
          />

          <Cables activeId={activeId} dragDelta={dragDelta} />

          {selectedPedals.map((pedal) => (
            <PedalItem
              key={pedal.id}
              id={pedal.id}
              name={pedal.name}
              color={pedal.color}
              position={pedal.position}
              maDraw={pedal.maDraw}
              voltage={pedal.voltage}
              isHidden={pedal.id === activeId}
              isDraggingElsewhere={activeId !== null && activeId !== pedal.id}
            />
          ))}

          {/* Оверлей теперь ограничен родителем (Board) */}
          <DragOverlay modifiers={[snapCenterToCursor, restrictToParentElement]} dropAnimation={null}>
            {activeId && activePedal ? (
              <PedalItem
                id={activeId}
                name={activePedal.name}
                color={activePedal.color}
                position={{ x: 0, y: 0 }}
                maDraw={activePedal.maDraw}
                voltage={activePedal.voltage}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </div>
      </div>
    </DndContext>
  );
};