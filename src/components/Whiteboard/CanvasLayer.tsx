import React from 'react';

const CanvasLayer = React.forwardRef<HTMLCanvasElement, React.CanvasHTMLAttributes<HTMLCanvasElement>>((props, ref) => {
  return <canvas ref={ref} {...props} />;
});

CanvasLayer.displayName = 'CanvasLayer';
export default CanvasLayer;