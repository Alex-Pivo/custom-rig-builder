'use client';
import React from 'react';
import { useRigStore } from '@/store/useRigStore';

interface CablesProps {
  activeId: string | null;
  dragDelta: { x: number; y: number };
}

export const Cables = ({ activeId, dragDelta }: CablesProps) => {
  const { selectedPedals } = useRigStore();
  const W = 128; // w-32
  const H = 176; // h-44

  if (selectedPedals.length === 0) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <filter id="cable-shadow"><feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.5"/></filter>
      </defs>

      {selectedPedals.map((pedal, index) => {
        // Если это перетаскиваемая педаль, добавляем к её координатам delta
        const isDragging = pedal.id === activeId;
        const pX = isDragging ? pedal.position.x + dragDelta.x : pedal.position.x;
        const pY = isDragging ? pedal.position.y + dragDelta.y : pedal.position.y;

        const startX = pX + W;
        const startY = pY + H / 2;

        const cables = [];

        // Входной кабель
        if (index === 0) {
          cables.push(
            <path key="input" d={`M -20,${pY + H/2} C 40,${pY + H/2} ${pX - 40},${pY + H/2} ${pX},${pY + H/2}`}
              stroke="#111" strokeWidth="6" fill="none" filter="url(#cable-shadow)" />
          );
        }

        // Патч-корды
        if (index < selectedPedals.length - 1) {
          const next = selectedPedals[index + 1];
          const nextIsDragging = next.id === activeId;
          const nextX = nextIsDragging ? next.position.x + dragDelta.x : next.position.x;
          const nextY = nextIsDragging ? next.position.y + dragDelta.y : next.position.y;

          cables.push(
            <path key={`p-${pedal.id}`} d={`M ${startX},${startY} C ${startX + 50},${startY} ${nextX - 50},${nextY + H/2} ${nextX},${nextY + H/2}`}
              stroke="#111" strokeWidth="8" fill="none" filter="url(#cable-shadow)" strokeLinecap="round" />
          );
        }

        return cables;
      })}
    </svg>
  );
};