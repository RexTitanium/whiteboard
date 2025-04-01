export const snapAngle = (angle: number): number => {
  const angles = [0, 45, 90, 135, 180, -45, -90, -135, -180];
  return angles.reduce((prev, curr) =>
    Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev
  );
};

export const getSnappedEndpoint = (
  x: number,
  y: number,
  length: number,
  angleDeg: number
): [number, number] => {
  const angleRad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(angleRad) * length;
  const dy = Math.sin(angleRad) * length;
  return [x + dx, y + dy];
};