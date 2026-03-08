'use client';
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useRigStore } from '@/store/useRigStore';

interface PedalProps {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  maDraw: number; // Добавлено для отображения
  voltage: number; // Добавлено для отображения
}

export const PedalItem = ({ id, name, color, position, maDraw, voltage }: PedalProps) => {
  const removePedal = useRigStore((state) => state.removePedal);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    top: `${position.y}px`,
    left: `${position.x}px`,
  };

  const isWhitePedal = color.includes('bg-white');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onDoubleClick={() => removePedal(id)}
      className={`absolute z-10 w-32 h-44 ${color} rounded-lg shadow-xl cursor-grab active:cursor-grabbing 
                 flex flex-col items-center justify-between p-3 border-2 border-white/20`}
    >
      <div className="text-center w-full">
        <h3 className={`text-sm font-black leading-tight uppercase tracking-tighter ${isWhitePedal ? 'text-black' : 'text-white'}`}>
          {name}
        </h3>
      </div>
      
      {/* Лампочка индикатора */}
      <div className="w-10 h-10 bg-zinc-300 rounded-full border-4 border-zinc-500 flex items-center justify-center shadow-inner">
        <div className={`w-2 h-2 rounded-full ${isWhitePedal ? 'bg-blue-600' : 'bg-red-600'} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
      </div>

      {/* Технические характеристики (Инженерный слой) */}
      <div className={`w-full flex justify-between px-1 font-mono text-[10px] font-bold ${isWhitePedal ? 'text-zinc-800' : 'text-white/60'}`}>
        <span>{maDraw}mA</span>
        <span>{voltage}V</span>
      </div>

      <div className="w-full flex justify-between px-1 opacity-40">
        <div className={`w-3 h-3 rounded-full ${isWhitePedal ? 'bg-zinc-800' : 'bg-black'}`} />
        <div className={`w-3 h-3 rounded-full ${isWhitePedal ? 'bg-zinc-800' : 'bg-black'}`} />
      </div>
    </div>
  );
};