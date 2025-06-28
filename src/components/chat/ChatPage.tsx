import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import AIHealthCoach from '../../components/chat/AIHealthCoach';
import { MessageCircle, Zap, Settings, Volume2, VolumeX, Moon, Brain, Heart, Activity, Coffee, Shield } from 'lucide-react';
import { useChatStore } from '../../store';
import VoicePreferences from '../../components/chat/VoicePreferences';
import ChatButton from '../../components/chat/ChatButton';
import QuickTipCard from './QuickTipCard';

const ChatPage = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedTip, setSelectedTip] = useState<string | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const location = useLocation();
  
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

  // Check if there's an initial question in the location state
  useEffect(() => {
    if (location.state?.initialQuestion) {
      setSelectedTip(location.state.initialQuestion);
      setActiveTab('chat');
    }
  }, [location]);

  // Map of tip icons
  const tipIcons: Record<string, React.ReactNode> = {
    "Sleep Optimization": <Moon className="h-5 w-5" />,
    "Stress Management": <Brain className="h-5 w-5" />,
    "Energy Boosters": <Zap className="h-5 w-5" />,
    "Nutrition Basics": <Coffee className="h-5 w-5" />,
    "Workout Recovery": <Activity className="h-5 w-5" />,
    "Focus Enhancement": <Brain className="h-5 w-5" />
  };

  // Quick tip definitions
  const quickTips = [
    { 
      title: "Sleep Optimization", 
      description: "Tips for better sleep quality",
      icon: <Moon className="h-4 w-4" />
    },
    { 
      title: "Stress Management", 
      description: "Techniques to reduce daily stress",
      icon: <Brain className="h-4 w-4" />
    },
    { 
      title: "Energy Boosters", 
      description: "Natural ways to increase energy",
      icon: <Zap className="h-4 w-4" />
    },
    { 
      title: "Nutrition Basics", 
      description: "Fundamentals of healthy eating",
      icon: <Coffee className="h-4 w-4" />
    },
    { 
      title: "Workout Recovery", 
      description: "Optimize your post-exercise recovery",
      icon: <Activity className="h-4 w-4" />
    },
    { 
      title: "Focus Enhancement", 
      description: "Improve concentration and mental clarity",
      icon: <Brain className="h-4 w-4" />
    }
  ];

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
            <AIHealthCoach initialQuestion={selectedTip} />
          </TabsContent>
          
          <TabsContent value="quick-tips">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))] p-6">
              <h2 className="mb-4 text-xl font-bold">Quick Health Tips</h2>
              <p className="mb-6 text-text-light">
                Get instant advice on common health topics
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {quickTips.map((tip, index) => (
                  <QuickTipCard
                    key={index}
                    title={tip.title}
                    description={tip.description}
                    icon={tip.icon}
                  />
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
                    <div className="flex items-center justify-between">
                      <label htmlFor="auto-scroll" className="text-sm">Auto-scroll to new messages</label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                        <input
                          type="checkbox"
                          id="auto-scroll"
                          className="absolute w-0 h-0 opacity-0"
                          defaultChecked={true}
                        />
                        <label
                          htmlFor="auto-scroll"
                          className="block h-6 overflow-hidden rounded-full bg-gray-300 cursor-pointer"
                        >
                          <span
                            className="absolute block w-4 h-4 mt-1 ml-1 rounded-full bg-white shadow inset-y-0 left-0 transition-transform duration-200 ease-in-out transform translate-x-0"
                          ></span>
                          <span
                            className="block h-full w-full rounded-full bg-primary transform translate-x-full"
                          ></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="show-timestamps" className="text-sm">Show message timestamps</label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                        <input
                          type="checkbox"
                          id="show-timestamps"
                          className="absolute w-0 h-0 opacity-0"
                          defaultChecked={true}
                        />
                        <label
                          htmlFor="show-timestamps"
                          className="block h-6 overflow-hidden rounded-full bg-gray-300 cursor-pointer"
                        >
                          <span
                            className="absolute block w-4 h-4 mt-1 ml-1 rounded-full bg-white shadow inset-y-0 left-0 transition-transform duration-200 ease-in-out transform translate-x-0"
                          ></span>
                          <span
                            className="block h-full w-full rounded-full bg-primary transform translate-x-full"
                          ></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="show-suggestions" className="text-sm">Show suggested questions</label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                        <input
                          type="checkbox"
                          id="show-suggestions"
                          className="absolute w-0 h-0 opacity-0"
                          defaultChecked={true}
                        />
                        <label
                          htmlFor="show-suggestions"
                          className="block h-6 overflow-hidden rounded-full bg-gray-300 cursor-pointer"
                        >
                          <span
                            className="absolute block w-4 h-4 mt-1 ml-1 rounded-full bg-white shadow inset-y-0 left-0 transition-transform duration-200 ease-in-out transform translate-x-0"
                          ></span>
                          <span
                            className="block h-full w-full rounded-full bg-primary transform translate-x-full"
                          ></span>
                        </label>
                      </div>
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