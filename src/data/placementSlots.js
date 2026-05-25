export const placementSlots = [
  { x: 18, y: 68, scale: 0.72, zIndex: 3 },
  { x: 32, y: 66, scale: 0.78, zIndex: 4 },
  { x: 48, y: 64, scale: 0.85, zIndex: 5 },
  { x: 63, y: 66, scale: 0.78, zIndex: 4 },
  { x: 78, y: 68, scale: 0.72, zIndex: 3 },
  { x: 40, y: 72, scale: 0.65, zIndex: 6 },
  { x: 58, y: 72, scale: 0.65, zIndex: 6 },
];

export function resolveSlot(index) {
  if (index < placementSlots.length) return placementSlots[index];

  const base = placementSlots[index % placementSlots.length];
  const direction = index % 2 === 0 ? 1 : -1;
  const offset = Math.min(5, 1.8 + Math.floor(index / placementSlots.length) * 1.2);
  return {
    ...base,
    x: Math.max(10, Math.min(88, base.x + direction * offset)),
    y: Math.max(60, Math.min(76, base.y + ((index % 3) - 1) * 1.4)),
    scale: Math.max(0.58, base.scale - 0.05),
    zIndex: base.zIndex + Math.floor(index / placementSlots.length),
  };
}
