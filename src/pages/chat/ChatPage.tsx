 codex/refine-coach-function-with-text-and-voice-chat
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
.or(
  `goal.ilike.%${keyword}%,mechanism.ilike.%${keyword}%,evidence_summary.ilike.%${keyword}%`
)
.limit(1);

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

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import AIHealthCoach from '../../components/chat/AIHealthCoach';
import { MessageCircle, Zap, History, Settings, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChatStore } from '../../store';
import VoicePreferences from "../../components/chat/VoicePreferences";

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { user } = useAuth();
  const { 
    preferSpeech, 
    setPreferSpeech, 
    selectedVoice, 
    setSelectedVoice,
    voiceSettings,
    updateVoiceSettings
  } = useChatStore();

  return (
    <div className="p-4 space-y-4">
      {messages.map((m, i) => (
        <div
<div className="container mx-auto px-4 py-6">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-6">
      <h1 className="text-2xl font-bold">Health Coach</h1>
      <p className="text-text-light">
        Chat with your AI health coach for personalized guidance and recommendations
      </p>
          <div className="mb-6 flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </TabsTrigger>
              <TabsTrigger value="quick-tips" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Quick Tips</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="h-[calc(100vh-220px)] min-h-[500px]">
            <AIHealthCoach />
          </TabsContent>
          
          <TabsContent value="quick-tips">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h2 className="mb-4 text-xl font-bold">Quick Health Tips</h2>
              <p className="mb-6 text-text-light">
                Get instant advice on common health topics
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Sleep Optimization", description: "Tips for better sleep quality" },
                  { title: "Stress Management", description: "Techniques to reduce daily stress" },
                  { title: "Energy Boosters", description: "Natural ways to increase energy" },
                  { title: "Nutrition Basics", description: "Fundamentals of healthy eating" },
                  { title: "Workout Recovery", description: "Optimize your post-exercise recovery" },
                  { title: "Focus Enhancement", description: "Improve concentration and mental clarity" }
                ].map((tip, index) => (
                  <div 
                    key={index}
                    className="rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-4 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      setActiveTab('chat');
                      // In a real implementation, this would pre-fill the chat with a question about this topic
                    }}
                  >
                    <h3 className="mb-2 font-medium">{tip.title}</h3>
                    <p className="text-sm text-text-light">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h2 className="mb-4 text-xl font-bold">Chat History</h2>
              <p className="mb-6 text-text-light">
                Review your previous conversations with your health coach
              </p>
              
              {user ? (
                <div className="space-y-4">
                  <p className="text-center text-text-light">
                    Your chat history will appear here as you have more conversations.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4 text-center">
                  <p className="text-text-light">
                    Please sign in to view your chat history.
                  </p>
                </div>
              )}
 codex/refine-coach-function-with-text-and-voice-chat
            </span>
          </div>
        </div>
      ))}
=======
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
>>>>>>> main
      <div className="flex gap-2">
          onChange={(e) => setInput(e.target.value)}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your goal?"
          className="flex-1 rounded border p-2"
        />
        <button
          Send
        </button>
      </div>
<<<<<<< codex/update-chat.tsx-with-supplement-search-and-styling
=======

            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h2 className="mb-4 text-xl font-bold">Chat Settings</h2>
              <p className="mb-6 text-text-light">
                Customize your chat experience
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-lg font-medium">Voice Settings</h3>
                  <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <label htmlFor="enable-voice" className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          id="enable-voice" 
                          className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                          checked={preferSpeech}
                          onChange={() => setPreferSpeech(!preferSpeech)}
                        />
                        Enable voice responses
                      </label>
                      <div className="flex items-center gap-2">
                        {preferSpeech ? (
                          <Volume2 className="h-4 w-4 text-primary" />
                        ) : (
                          <VolumeX className="h-4 w-4 text-text-light" />
                        )}
                      </div>
                    </div>
                    
                    {preferSpeech && (
                      <VoicePreferences
                        preferSpeech={preferSpeech}
                        onToggleSpeech={() => setPreferSpeech(!preferSpeech)}
                        selectedVoice={selectedVoice}
                        onSelectVoice={setSelectedVoice}
                        voiceSettings={voiceSettings}
                        onUpdateVoiceSettings={updateVoiceSettings}
                      />
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-3 text-lg font-medium">Chat Preferences</h3>
                  <div className="rounded-lg bg-[hsl(var(--color-surface-1))] p-4 space-y-4">
                    <div>
                      <label htmlFor="chat-style" className="mb-2 block text-sm font-medium">Coach Style</label>
                      <select 
                        id="chat-style" 
                        className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] px-3 py-2 text-sm"
                      >
                        <option value="balanced">Balanced</option>
                        <option value="detailed">Detailed</option>
                        <option value="concise">Concise</option>
                      </select>
                      <p className="mt-1 text-xs text-text-light">
                        Choose how detailed you want your coach's responses to be
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="show-suggestions" className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          id="show-suggestions" 
                          className="h-4 w-4 rounded border-[hsl(var(--color-border))] text-primary focus:ring-primary"
                          defaultChecked={true}
                        />
                        Show suggested questions
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
 main
>>>>>>> main
    </div>
  );
};

export default ChatPage;