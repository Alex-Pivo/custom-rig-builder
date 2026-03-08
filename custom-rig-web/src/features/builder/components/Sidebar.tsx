'use client';
import React from 'react';
import { AVAILABLE_PEDALS } from '@/lib/constants';
import { useRigStore } from '@/store/useRigStore';

export const Sidebar = () => {
  const addPedal = useRigStore((state) => state.addPedal);

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Pedal Library</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {AVAILABLE_PEDALS.map((pedal, index) => (
          <div
            key={index}
            onClick={() => addPedal({
              id: `${pedal.name}-${Date.now()}`, // Генерируем уникальный ID
              name: pedal.name,
              maDraw: pedal.maDraw,
              voltage: 9,
              color: pedal.color, 
              position: { x: 50, y: 50 } 
            })}
            className={`p-4 rounded-lg border border-zinc-700 ${pedal.color} 
                       cursor-pointer hover:scale-105 transition-transform active:opacity-70 shadow-lg`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-[9px] font-bold uppercase opacity-70">{pedal.type}</span>
              <span className="text-[9px] font-mono">{pedal.maDraw}mA</span>
            </div>
            <h3 className="font-bold text-sm">{pedal.name}</h3>
          </div>
        ))}
      </div>
    </aside>
  );
};