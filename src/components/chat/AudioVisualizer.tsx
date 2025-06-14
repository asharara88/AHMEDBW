import { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  active: boolean;
  height?: number;
  width?: number;
  className?: string;
  barColor?: string;
  barCount?: number;
  barSpacing?: number;
  backgroundColor?: string;
  responsive?: boolean;
}

export default function AudioVisualizer({
  active,
  height = 60,
  width = 300,
  className = '',
  barColor = '#3b82f6', // Blue
  barCount = 12,
  barSpacing = 2,
  backgroundColor = 'rgba(59, 130, 246, 0.1)',
  responsive = true
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    if (responsive) {
      // Make canvas responsive to container size
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          canvas.width = width;
          canvas.height = height;
        }
      });
      
      resizeObserver.observe(canvas.parentElement || canvas);
      
      // Clean up observer
      return () => resizeObserver.disconnect();
    } else {
      // Use fixed dimensions
      canvas.width = width;
      canvas.height = height;
    }
  }, [width, height, responsive]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate bar width based on canvas size and settings
    const calculatedBarWidth = (canvasWidth / barCount) - barSpacing;
    
    // Amplitude histories for smoother animation
    const amplitudeHistory: number[] = Array(barCount).fill(0);
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      
      // Draw background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      if (!active) {
        // Draw flat line if not active
        ctx.beginPath();
        ctx.moveTo(0, canvasHeight / 2);
        ctx.lineTo(canvasWidth, canvasHeight / 2);
        ctx.strokeStyle = barColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Draw active visualization
        for (let i = 0; i < barCount; i++) {
          // Calculate new random amplitude
          // Use sine wave with random offset for smoother looking animation
          const targetAmplitude = 0.1 + 0.5 * Math.abs(Math.sin(Date.now() / 500 + i * 0.2) + (Math.random() * 0.2 - 0.1));
          
          // Smooth transition to new amplitude (easing)
          amplitudeHistory[i] = amplitudeHistory[i] * 0.7 + targetAmplitude * 0.3;
          
          // Calculate bar height
          const barHeight = amplitudeHistory[i] * canvasHeight * 0.8;
          
          // Position
          const x = i * (calculatedBarWidth + barSpacing) + barSpacing;
          const y = (canvasHeight - barHeight) / 2;
          
          // Draw rounded rectangle
          const radius = Math.min(barHeight / 2, calculatedBarWidth / 2, 4);
          
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + calculatedBarWidth - radius, y);
          ctx.quadraticCurveTo(x + calculatedBarWidth, y, x + calculatedBarWidth, y + radius);
          ctx.lineTo(x + calculatedBarWidth, y + barHeight - radius);
          ctx.quadraticCurveTo(x + calculatedBarWidth, y + barHeight, x + calculatedBarWidth - radius, y + barHeight);
          ctx.lineTo(x + radius, y + barHeight);
          ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          
          // Fill with gradient
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, barColor);
          gradient.addColorStop(1, barColor + '88'); // Semi-transparent
          
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
      
      animationFrameId.current = requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
    
    // Clean up
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [active, barColor, barCount, barSpacing, backgroundColor]);
  
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height, width: responsive ? '100%' : width }}>
      <canvas 
        ref={canvasRef} 
        className="h-full w-full"
        aria-hidden="true"
      />
      {!active && <div className="absolute inset-0 bg-transparent"></div>}
    </div>
  );
}