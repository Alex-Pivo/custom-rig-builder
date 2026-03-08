import { PowerSupply } from "@/store/useRigStore";

export const AVAILABLE_PEDALS = [
  { name: 'DS-1 Distortion', maDraw: 10, type: 'Overdrive', color: 'bg-blue-600' },
  { name: 'Tube Screamer', maDraw: 8, type: 'Overdrive', color: 'bg-green-600' },
  { name: 'DD-8 Delay', maDraw: 65, type: 'Delay', color: 'bg-white text-blue-900' },
  { name: 'RV-6 Reverb', maDraw: 95, type: 'Reverb', color: 'bg-zinc-500' },
  { name: 'CH-1 Chorus', maDraw: 22, type: 'Chorus', color: 'bg-cyan-500' },
  { name: 'MT-2 Metal Zone', maDraw: 30, type: 'Distortion', color: 'bg-zinc-900' },
];

export const POWER_SUPPLIES: PowerSupply[] = [
  { id: 'standard', name: 'Standard Adapter', max_ma: 500 },
  { id: 'voodoo-lab-2', name: 'Voodoo Lab PP2+', max_ma: 1100 },
  { id: 'strymon-zuma', name: 'Strymon Zuma', max_ma: 4500 },
  { id: '1spot-nw1', name: 'Truetone 1SPOT', max_ma: 1700 },
  { id: 'cioaks-dc7', name: 'CIOKS DC7', max_ma: 6600 },
];