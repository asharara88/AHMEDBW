import { useState, useEffect, useRef } from 'react';
import { Headphones, Play, Pause, SkipBack, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  src: string | null;
  onEnded?: () => void;
  className?: string;
}

const AudioPlayer = ({ src, onEnded, className = '' }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!src) return;
    
    const audio = new Audio(src);
    audioRef.current = audio;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (onEnded) onEnded();
    };
    
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src, onEnded]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!src) return null;

  return (
    <div className={`rounded-lg bg-[hsl(var(--color-surface-2))] p-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Voice Response</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={restart}
            className="rounded-full p-1 text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text"
            aria-label="Restart"
          >
            <SkipBack className="h-3 w-3" />
          </button>
          
          <button
            onClick={togglePlayback}
            className="rounded-full bg-primary/10 p-1 text-primary hover:bg-primary/20"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative h-1 w-24 rounded-full bg-[hsl(var(--color-border))]">
              <div 
                className="absolute h-full rounded-full bg-primary" 
                style={{ width: `${(progress / duration) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-text-light">
              {formatTime(progress)}/{formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;