import { create } from "zustand";

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

// Структура ручного соединения
export interface ManualConnection {
  id: string;
  fromPedalId: string;
  toPedalId: string;
}

interface RigState {
  selectedPedals: Pedal[];
  selectedPowerSupply: PowerSupply | null;
  powerStatus: PowerStatus | null;
  manualConnections: ManualConnection[];

  addPedal: (pedal: Pedal) => void;
  removePedal: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  setPowerSupply: (ps: PowerSupply) => void;
  calculatePower: () => Promise<void>;

  addConnection: (fromId: string, toId: string) => void;
  removeConnection: (id: string) => void;
  // НОВОЕ: Удаление по паре ID (удобно для контекстного меню кабеля)
  removeManualConnection: (fromId: string, toId: string) => void;

  getConnections: () => {
    id: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
    fromPedalId: string;
    toPedalId: string;
    type: "manual";
  }[];
}

export const useRigStore = create<RigState>((set, get) => ({
  selectedPedals: [],
  selectedPowerSupply: {
    id: "default",
    name: "Standard 9V Adapter",
    max_ma: 500,
  },
  powerStatus: null,
  manualConnections: [],

  addPedal: (pedal) => {
    set((state) => ({ selectedPedals: [...state.selectedPedals, pedal] }));
    get().calculatePower();
  },

  removePedal: (id) => {
    set((state) => ({
      selectedPedals: state.selectedPedals.filter((p) => p.id !== id),
      manualConnections: state.manualConnections.filter(
        (c) => c.fromPedalId !== id && c.toPedalId !== id,
      ),
    }));
    get().calculatePower();
  },

  updatePosition: (id, x, y) =>
    set((state) => ({
      selectedPedals: state.selectedPedals.map((p) =>
        p.id === id ? { ...p, position: { x, y } } : p,
      ),
    })),

  setPowerSupply: (ps) => {
    set({ selectedPowerSupply: ps });
    get().calculatePower();
  },

  addConnection: (fromId, toId) => {
    if (fromId === toId) return;

    set((state) => {
      const exists = state.manualConnections.some(
        (c) => c.fromPedalId === fromId && c.toPedalId === toId,
      );
      if (exists) return state;

      const newConn: ManualConnection = {
        id: `${fromId}-${toId}`,
        fromPedalId: fromId,
        toPedalId: toId,
      };

      return { manualConnections: [...state.manualConnections, newConn] };
    });
  },

  removeConnection: (id) =>
    set((state) => ({
      manualConnections: state.manualConnections.filter((c) => c.id !== id),
    })),

  // НОВОЕ: Реализация удаления по паре ID
  removeManualConnection: (fromId, toId) =>
    set((state) => ({
      manualConnections: state.manualConnections.filter(
        (c) => !(c.fromPedalId === fromId && c.toPedalId === toId),
      ),
    })),

  calculatePower: async () => {
    const { selectedPedals, selectedPowerSupply } = get();
    if (selectedPedals.length === 0) {
      set({ powerStatus: null });
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedals: selectedPedals,
          power_supply: selectedPowerSupply,
        }),
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      set({ powerStatus: data });
    } catch (error) {
      console.error("Engineering check failed:", error);
    }
  },

  getConnections: () => {
    const { selectedPedals, manualConnections } = get();
    if (selectedPedals.length === 0) return [];

    const connections: any[] = [];

    // Смещения для портов
    const PORT_Y_OFFSET = 152;
    const INPUT_X_OFFSET = 25;
    const OUTPUT_X_OFFSET = 103;

    manualConnections.forEach((conn) => {
      const fromPedal = selectedPedals.find((p) => p.id === conn.fromPedalId);
      const toPedal = selectedPedals.find((p) => p.id === conn.toPedalId);

      if (fromPedal && toPedal) {
        connections.push({
          id: conn.id,
          fromPedalId: conn.fromPedalId, // Добавляем для удобства обработки в Cables
          toPedalId: conn.toPedalId,
          from: {
            x: fromPedal.position.x + OUTPUT_X_OFFSET,
            y: fromPedal.position.y + PORT_Y_OFFSET,
          },
          to: {
            x: toPedal.position.x + INPUT_X_OFFSET,
            y: toPedal.position.y + PORT_Y_OFFSET,
          },
          type: "manual",
        });
      }
    });

    return connections;
  },
}));
