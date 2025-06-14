import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizationProps {
  isActive: boolean;
  className?: string;
  compact?: boolean;
}

export default function VoiceVisualization({ 
  isActive, 
  className = '',
  compact = false
}: VoiceVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set up the visualization
    const width = canvas.width;
    const height = canvas.height;
    const barCount = compact ? 6 : 15;
    const barWidth = width / barCount;
    const maxBarHeight = height * 0.9;
    
    // Animation function
    const animate = () => {
      if (!isActive) {
        // Clear canvas when not active
        context.clearRect(0, 0, width, height);
        context.fillStyle = 'rgba(59, 130, 246, 0.1)'; // light blue background
        context.fillRect(0, 0, width, height);
        return;
      }
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Draw light background
      context.fillStyle = 'rgba(59, 130, 246, 0.1)'; // light blue background
      context.fillRect(0, 0, width, height);
      
      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Generate a random height for each bar that changes over time
        // This is a simulation - in a real app, this would use microphone data
        const randomHeight = Math.sin(Date.now() / 200 + i) * 0.3 + 0.5;
        const barHeight = randomHeight * maxBarHeight;
        
        // Bar gradient
        const gradient = context.createLinearGradient(0, height - barHeight, 0, height);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)'); // Primary color at top
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.4)'); // Lighter at bottom
        
        context.fillStyle = gradient;
        
        // Draw bar with rounded corners
        const x = i * barWidth + 2; // Add small gap between bars
        const y = height - barHeight;
        const width = barWidth - 4; // Subtract for gap
        const cornerRadius = 2;
        
        // Draw rounded rectangle
        context.beginPath();
        context.moveTo(x + cornerRadius, y);
        context.lineTo(x + width - cornerRadius, y);
        context.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        context.lineTo(x + width, height - cornerRadius);
        context.quadraticCurveTo(x + width, height, x + width - cornerRadius, height);
        context.lineTo(x + cornerRadius, height);
        context.quadraticCurveTo(x, height, x, height - cornerRadius);
        context.lineTo(x, y + cornerRadius);
        context.quadraticCurveTo(x, y, x + cornerRadius, y);
        context.closePath();
        
        context.fill();
      }
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, compact]);

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <canvas 
        ref={canvasRef} 
        width={compact ? 120 : 300} 
        height={compact ? 30 : 60}
        className="w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
}