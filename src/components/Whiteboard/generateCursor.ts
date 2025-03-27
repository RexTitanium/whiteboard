import { Shapes, Tool } from "../../types/types";

export function generateCursor(size: number, type: Tool | Shapes, color: string = '#000000'): string {
  let svg = '';
  const half = size / 2;

  if (type === 'pen') {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <circle cx='${half}' cy='${half}' r='${half}' fill='${color}' />
    </svg>`;
  }

  else if (type === 'eraser') {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
        <circle cx='${half}' cy='${half}' r='${half}' fill='white' stroke='gray' stroke-width='1'/>
    </svg>`;
  }

  else if (type === 'text') {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${size * 0.6}' fill='${color}'>I</text>
    </svg>`;
  }

  else if (type === 'rectangle' || type === 'circle' || type === 'line' || type === 'grid') {
    svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${size * 0.8}' fill='${color}'>+</text>
    </svg>`;
  }

  return svg;
}