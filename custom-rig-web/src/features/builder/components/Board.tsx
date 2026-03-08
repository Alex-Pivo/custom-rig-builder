'use client';

import React from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  useSensor, 
  useSensors, 
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useRigStore } from '@/store/useRigStore';
import { PedalItem } from './Pedaltem';
import { POWER_SUPPLIES } from '@/lib/constants';

export const Board = () => {
  const { selectedPedals, updatePosition, selectedPowerSupply, setPowerSupply, powerStatus } = useRigStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (active) {
      const pedal = selectedPedals.find((p) => p.id === active.id);
      if (pedal) {
        const newX = pedal.position.x + delta.x;
        const newY = pedal.position.y + delta.y;
        updatePosition(active.id.toString(), newX, newY);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 w-full max-w-5xl">
        
        {/* Панель управления (Выбор БП + Статус из Python) */}
        <div className="flex justify-between items-center p-5 bg-zinc-800 rounded-t-2xl border-x-2 border-t-2 border-zinc-700 shadow-lg">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Power Source</span>
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
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Consumption Analysis</span>
            <div className={`text-2xl font-mono font-bold ${powerStatus?.is_safe ? 'text-green-400' : 'text-red-500'}`}>
              {powerStatus?.total_ma || 0} / {selectedPowerSupply?.max_ma || 500} mA
            </div>
            <div className={`text-[10px] font-bold uppercase ${powerStatus?.is_safe ? 'text-green-600' : 'text-red-400'}`}>
              {powerStatus?.status || 'SYSTEM READY'}
            </div>
          </div>
        </div>

        {/* Рабочая область */}
        <div className="relative h-[600px] bg-zinc-900 border-2 border-zinc-800 rounded-b-2xl shadow-2xl overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', 
              backgroundSize: '24px 24px' 
            }} 
          />
          
          {selectedPedals.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-700 pointer-events-none">
              <p className="text-lg font-medium border-2 border-dashed border-zinc-800 p-8 rounded-xl text-center">
                Drag pedals here to start calculating power load
              </p>
            </div>
          )}

          {selectedPedals.map((pedal) => (
            <PedalItem 
              key={pedal.id} 
              id={pedal.id} 
              name={pedal.name} 
              color={pedal.color} 
              position={pedal.position} 
              maDraw={pedal.maDraw}
              voltage={pedal.voltage}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};