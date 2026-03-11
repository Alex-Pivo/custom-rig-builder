import { create } from 'zustand';

// Структура педали
export interface Pedal {
  id: string;
  name: string;
  maDraw: number;
  voltage: number;
  color: string;
  position: { x: number; y: number };
}

// Структура блока питания
export interface PowerSupply {
  id: string;
  name: string;
  max_ma: number;
}

// Ответ от бэкенда
interface PowerStatus {
  total_ma: number;
  limit: number;
  is_safe: boolean;
  status: string;
  recommendation: string;
}

interface RigState {
  selectedPedals: Pedal[];
  selectedPowerSupply: PowerSupply | null;
  powerStatus: PowerStatus | null;
  addPedal: (pedal: Pedal) => void;
  removePedal: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  setPowerSupply: (ps: PowerSupply) => void;
  calculatePower: () => Promise<void>;
  // ДОБАВЛЕНО: Функция для получения координат соединений
  getConnections: () => { from: { x: number, y: number }, to: { x: number, y: number }, type: 'input' | 'patch' | 'output' }[];
}

export const useRigStore = create<RigState>((set, get) => ({
  selectedPedals: [],
  selectedPowerSupply: { id: 'default', name: 'Standard 9V Adapter', max_ma: 500 },
  powerStatus: null,

  addPedal: (pedal) => {
    set((state) => ({ selectedPedals: [...state.selectedPedals, pedal] }));
    get().calculatePower();
  },

  removePedal: (id) => {
    set((state) => ({ selectedPedals: state.selectedPedals.filter((p) => p.id !== id) }));
    get().calculatePower();
  },

  updatePosition: (id, x, y) => set((state) => ({
    selectedPedals: state.selectedPedals.map((p) => 
      p.id === id ? { ...p, position: { x, y } } : p
    )
  })),

  setPowerSupply: (ps) => {
    set({ selectedPowerSupply: ps });
    get().calculatePower();
  },

  calculatePower: async () => {
    const { selectedPedals, selectedPowerSupply } = get();

    if (selectedPedals.length === 0) {
      set({ powerStatus: null });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedals: selectedPedals,
          power_supply: selectedPowerSupply
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      set({ powerStatus: data });
    } catch (error) {
      console.error("Engineering check failed:", error);
    }
  },

  // ДОБАВЛЕНО: Логика расчета соединений
  getConnections: () => {
    const { selectedPedals } = get();
    if (selectedPedals.length === 0) return [];

    const connections: any[] = [];
    const PEDAL_WIDTH = 128; // Твой w-32 из PedalItem
    const PEDAL_HEIGHT = 176; // Твой h-44 из PedalItem

    selectedPedals.forEach((pedal, index) => {
      // 1. Входной провод (от левого края до первой педали)
      if (index === 0) {
        connections.push({
          from: { x: 0, y: pedal.position.y + PEDAL_HEIGHT / 2 },
          to: { x: pedal.position.x, y: pedal.position.y + PEDAL_HEIGHT / 2 },
          type: 'input'
        });
      }

      // 2. Межпедальные провода (Patch cables)
      if (index < selectedPedals.length - 1) {
        const nextPedal = selectedPedals[index + 1];
        connections.push({
          from: { x: pedal.position.x + PEDAL_WIDTH, y: pedal.position.y + PEDAL_HEIGHT / 2 },
          to: { x: nextPedal.position.x, y: nextPedal.position.y + PEDAL_HEIGHT / 2 },
          type: 'patch'
        });
      }

      // 3. Выходной провод (от последней педали до правого края)
      if (index === selectedPedals.length - 1) {
        connections.push({
          from: { x: pedal.position.x + PEDAL_WIDTH, y: pedal.position.y + PEDAL_HEIGHT / 2 },
          to: { x: 2000, y: pedal.position.y + PEDAL_HEIGHT / 2 }, // Запас по ширине
          type: 'output'
        });
      }
    });

    return connections;
  }
}));