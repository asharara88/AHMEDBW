import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import AIHealthCoach from '../../components/chat/AIHealthCoach';
import { MessageCircle, Zap, Settings, Volume2, VolumeX, Moon, Brain, Heart, Activity, Coffee, Shield } from 'lucide-react';
import { useChatStore } from '../../store';
import VoicePreferences from '../../components/chat/VoicePreferences';
import ChatButton from '../../components/chat/ChatButton';

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { 
    preferSpeech, 
    setPreferSpeech, 
    selectedVoice, 
    setSelectedVoice,
    voiceSettings,
    updateVoiceSettings
  } = useChatStore();

  // Handle tab value change - keep track of the active tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Ensure the component rerenders when the activeTab changes
  useEffect(() => {
    // This effect ensures the component rerenders when activeTab changes
    console.log(`Active tab changed to: ${activeTab}`);
  }, [activeTab]);

  // Map of tip icons
  const tipIcons: Record<string, React.ReactNode> = {
    "Sleep Optimization": <Moon className="h-5 w-5" />,
    "Stress Management": <Brain className="h-5 w-5" />,
    "Energy Boosters": <Zap className="h-5 w-5" />,
    "Nutrition Basics": <Coffee className="h-5 w-5" />,
    "Workout Recovery": <Activity className="h-5 w-5" />,
    "Focus Enhancement": <Brain className="h-5 w-5" />
  };

  return (
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
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="chat">
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
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {tipIcons[tip.title] || <Shield className="h-5 w-5" />}
                      </div>
                      <h3 className="font-medium text-sm leading-tight">{tip.title}</h3>
                    </div>
                    <p className="text-sm text-text-light line-clamp-2">{tip.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <ChatButton />
              </div>
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
    </div>
  );
};

export default ChatPage;