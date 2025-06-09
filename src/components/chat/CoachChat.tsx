import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, MessageCircle, Volume2, VolumeX, Settings, Headphones } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { openaiApi } from '../../api/openaiApi';
import { elevenlabsApi } from '../../api/elevenlabsApi';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { ApiError, ErrorType } from '../../api/apiClient';
import VoiceSettingsPanel from './VoiceSettingsPanel';

export default function CoachChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [preferSpeech, setPreferSpeech] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM"); // Default voice ID (Rachel)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const { user, isDemo } = useAuth();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse('');
    
    // Clear previous audio
    if (audioUrl) {
      if (audioElement) {
        audioElement.pause();
        audioElement.onended = null;
      }
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setAudioElement(null);
    }

    try {
      const userId = user?.id || (isDemo ? '00000000-0000-0000-0000-000000000000' : undefined);
      
      const content = await openaiApi.generateResponse(input, { userId });
      setResponse(content);
      
      // Generate speech if preferred
      if (preferSpeech && elevenlabsApi.isConfigured()) {
        generateSpeech(content, selectedVoice);
      }
    } catch (err: any) {
      const apiError: ApiError = {
        type: ErrorType.UNKNOWN,
        message: err.message || "Failed to fetch"
      };
      setError(apiError);
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const generateSpeech = async (text: string, voiceId: string) => {
    setSpeechLoading(true);
    try {
      const audioBlob = await elevenlabsApi.textToSpeech(text, voiceId);
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Play the audio
      const audio = new Audio(url);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      
      setAudioElement(audio);
      audio.play();
    } catch (err) {
      console.error("Speech generation error:", err);
    } finally {
      setSpeechLoading(false);
    }
  };
  
  const toggleSpeech = () => {
    setPreferSpeech(!preferSpeech);
  };
  
  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };
  
  const playAudio = () => {
    if (audioElement && !isPlaying) {
      audioElement.play();
    }
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] shadow-sm">
      <div className="border-b border-[hsl(var(--color-border))] bg-[hsl(var(--color-card-hover))] p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium">Quick Coach Chat</h3>
            <p className="text-xs text-text-light">Ask a health question</p>
          </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className={`rounded-full p-1 ${preferSpeech ? 'text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
              title={preferSpeech ? "Turn off voice" : "Turn on voice"}
              onClick={toggleSpeech}
            >
              {preferSpeech ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button 
              className={`rounded-full p-1 ${showVoiceSettings ? 'text-primary' : 'text-text-light hover:bg-[hsl(var(--color-card))] hover:text-text'}`}
              title="Voice settings"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Voice Settings Panel */}
        <AnimatePresence mode="wait">
          {showVoiceSettings && (
            <VoiceSettingsPanel
              isOpen={showVoiceSettings}
              onClose={() => setShowVoiceSettings(false)}
              preferSpeech={preferSpeech}
              onToggleSpeech={toggleSpeech}
              selectedVoice={selectedVoice}
              onSelectVoice={setSelectedVoice}
            />
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <input
            className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] px-3 py-2 text-text placeholder:text-text-light focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g. give me a supplement stack for sleep"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>

        {error && <ApiErrorDisplay error={error} className="mt-4" />}
        
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4"
          >
            <h4 className="mb-2 text-sm font-medium">Coach Response:</h4>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-text-light">
              {response}
            </div>
            
            {/* Speech loading indicator */}
            {speechLoading && preferSpeech && (
              <div className="mt-2 flex items-center justify-center rounded-lg bg-[hsl(var(--color-surface-2))] p-2">
                <div className="flex items-center gap-2 text-xs text-text-light">
                  <Loader className="h-3 w-3 animate-spin" />
                  <span>Generating voice response...</span>
                </div>
              </div>
            )}
            
            {/* Audio controls */}
            {audioUrl && preferSpeech && !speechLoading && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-[hsl(var(--color-surface-2))] p-2">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">Voice Response</span>
                </div>
                <div className="flex items-center gap-2">
                  {isPlaying ? (
                    <button 
                      onClick={stopAudio}
                      className="rounded-full bg-primary/10 p-1 text-primary hover:bg-primary/20"
                    >
                      <span className="sr-only">Stop</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                      </svg>
                    </button>
                  ) : (
                    <button 
                      onClick={playAudio}
                      className="rounded-full bg-primary/10 p-1 text-primary hover:bg-primary/20"
                    >
                      <span className="sr-only">Play</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}