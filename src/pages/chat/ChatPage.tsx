// pages/chat.tsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { elevenlabsApi } from '../../api/elevenlabsApi';
import AudioPlayer from '../../components/chat/AudioPlayer';

export default function ChatCoach() {
  const [messages, setMessages] = useState([] as any[]);
  const [input, setInput] = useState('');
  const [preferVoice, setPreferVoice] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoice = async (text: string) => {
    if (!elevenlabsApi.isConfigured()) return;

    try {
      const blob = await elevenlabsApi.textToSpeech(text);
      const url = URL.createObjectURL(blob);

      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      setAudioUrl(url);

      await audio.play();
    } catch (err) {
      console.error('Voice playback failed:', err);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const fetchSupplement = async (keyword: string) => {
    const { data } = await supabase
      .from('supplements')
      .select('*')
      .ilike('goal', `%${keyword.toLowerCase()}%`);

    if (data && data.length > 0) {
      const s = data[0];
      const coachText = `Got it! Based on your goal, I suggest ${s.name}. ${s.evidence_summary}.`;
      setMessages((prev) => [
        ...prev,
        {
          role: 'coach',
          text: coachText,
          link: s.source_link,
        },
      ]);

      if (preferVoice) {
        playVoice(coachText);
      }
    } else {
      const coachText = "Hmm, I couldn't find a supplement for that goal yet.";
      setMessages((prev) => [
        ...prev,
        { role: 'coach', text: coachText },
      ]);

      if (preferVoice) {
        playVoice(coachText);
      }
    }
  };

  useEffect(() => {
    const storedGoal = localStorage.getItem('goal');
    if (storedGoal && messages.length === 0) {
      fetchSupplement(storedGoal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', text: input }]);
    await fetchSupplement(input);
    setInput('');
  };

  return (
    <div className="p-4 space-y-4">
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            <span>
              {m.text}{' '}
              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  Study ↗
                </a>
              )}
            </span>
          </div>
        </div>
      ))}
      {audioUrl && preferVoice && (
        <AudioPlayer src={audioUrl} className="max-w-xs" />
      )}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="voice-toggle"
          checked={preferVoice}
          onChange={(e) => setPreferVoice(e.target.checked)}
        />
        <label htmlFor="voice-toggle" className="text-sm">
          Voice reply
        </label>
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your goal?"
          className="flex-1 rounded border p-2"
        />
        <button
          onClick={handleSend}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}