import { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioUrl: string | null;
  isPlaying: boolean;
  className?: string;
}

const AudioVisualizer = ({ audioUrl, isPlaying, className = '' }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up previous audio elements and animation
    const cleanup = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
        audioContextRef.current = null;
      }
    };

    // Set up new audio visualization if we have a URL and are playing
    if (audioUrl && isPlaying) {
      // Clean up first
      cleanup();
      
      // Create new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Connect audio to analyser
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      sourceRef.current = source;
      
      // Start playing
      audio.play();
      
      // Start visualization
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const draw = () => {
            if (!isPlaying) return;
            
            animationRef.current = requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * canvas.height;
              
              // Use a gradient from primary color to a lighter shade
              const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');
              
              ctx.fillStyle = gradient;
              ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              
              x += barWidth + 1;
            }
          };
          
          draw();
        }
      }
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [audioUrl, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      className={`h-12 w-full rounded-lg ${className}`}
      width={300}
      height={48}
    />
  );
};

export default AudioVisualizer;