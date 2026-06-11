import type { CapacityThreshold } from '../types/gym.js';

const THRESHOLDS: CapacityThreshold[] = [
  { level: 'low',    label: 'Quiet',    color: '#22c55e', ringColor: '#16a34a' },
  { level: 'medium', label: 'Moderate', color: '#f59e0b', ringColor: '#d97706' },
  { level: 'high',   label: 'Busy',     color: '#ef4444', ringColor: '#dc2626' },
  { level: 'full',   label: 'Full',     color: '#7f1d1d', ringColor: '#450a0a' },
];

export function getCapacityThreshold(percentageFull: number): CapacityThreshold {
  if (percentageFull >= 100) return THRESHOLDS[3]!;
  if (percentageFull >= 80)  return THRESHOLDS[2]!;
  if (percentageFull >= 50)  return THRESHOLDS[1]!;
  return THRESHOLDS[0]!;
}

export function getNextSlotTime(): string {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = minutes < 30 ? 30 : 60;
  now.setMinutes(roundedMinutes, 0, 0);
  if (roundedMinutes === 60) now.setHours(now.getHours() + 1);
  return now.toISOString();
}