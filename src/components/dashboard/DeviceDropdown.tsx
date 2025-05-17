import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Watch, ChevronDown, ChevronUp, Plus, Check, Loader, AlertCircle } from 'lucide-react';
import { getDeviceImage } from '../../utils/deviceImages';
import ImageWithFallback from '../common/ImageWithFallback';

interface Device {
  id: string;
  name: string;
  description: string;
  category: string;
  connected: boolean;
  imageUrl?: string;
}

const DeviceDropdown = () => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'apple-watch',
      name: 'Apple Watch',
      description: 'Sync activity, heart rate, sleep, and more',
      category: 'wearable',
      connected: false,
      imageUrl: getDeviceImage('apple-watch')
    },
    {
      id: 'oura-ring',
      name: 'Oura Ring',
      description: 'Track sleep, readiness, and activity scores',
      category: 'wearable',
      connected: false,
      imageUrl: getDeviceImage('oura-ring')
    },
    {
      id: 'freestyle-libre',
      name: 'FreeStyle Libre',
      description: 'Continuous glucose monitoring system',
      category: 'cgm',
      connected: false,
      imageUrl: getDeviceImage('freestyle-libre')
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Sync data from multiple sources',
      category: 'health-app',
      connected: false,
      imageUrl: getDeviceImage('apple-health')
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      description: 'Track steps, sleep, and heart rate',
      category: 'wearable',
      connected: false,
      imageUrl: getDeviceImage('fitbit')
    }
  ]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { supabase } = useSupabase();
  const { user, isDemo } = useAuth();
  
  useEffect(() => {
    const fetchConnectedDevices = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('wearable_connections')
          .select('provider')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          const connectedDeviceIds = data.map(d => d.provider);
          setDevices(devices.map(device => ({
            ...device,
            connected: connectedDeviceIds.includes(device.id) || (isDemo && device.id === 'apple-watch')
          })));
        }
      } catch (error) {
        console.error('Error fetching connected devices:', error);
      }
    };
    
    fetchConnectedDevices();
  }, [user, supabase, isDemo]);
  
  const handleConnect = async (deviceId: string) => {
    if (!user) return;
    
    setConnecting(deviceId);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isDemo) {
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: true } : device
        ));
        setSuccessMessage(`Successfully connected to ${devices.find(d => d.id === deviceId)?.name}`);
      } else {
        // In a real app, this would be an OAuth flow
        const { error } = await supabase
          .from('wearable_connections')
          .insert({
            user_id: user.id,
            provider: deviceId,
            access_token: 'demo-token',
            refresh_token: 'demo-refresh-token',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        
        if (error) throw error;
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: true } : device
        ));
        setSuccessMessage(`Successfully connected to ${devices.find(d => d.id === deviceId)?.name}`);
      }
    } catch (error) {
      console.error('Error connecting device:', error);
      setErrorMessage(`Failed to connect to ${devices.find(d => d.id === deviceId)?.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };
  
  const handleDisconnect = async (deviceId: string) => {
    if (!user) return;
    
    setConnecting(deviceId);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isDemo) {
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: false } : device
        ));
        setSuccessMessage(`Successfully disconnected from ${devices.find(d => d.id === deviceId)?.name}`);
      } else {
        const { error } = await supabase
          .from('wearable_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('provider', deviceId);
        
        if (error) throw error;
        
        setDevices(devices.map(device => 
          device.id === deviceId ? { ...device, connected: false } : device
        ));
        setSuccessMessage(`Successfully disconnected from ${devices.find(d => d.id === deviceId)?.name}`);
      }
    } catch (error) {
      console.error('Error disconnecting device:', error);
      setErrorMessage(`Failed to disconnect from ${devices.find(d => d.id === deviceId)?.name}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };
  
  const connectedDevices = devices.filter(device => device.connected);
  
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Connected Devices</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-sm text-primary hover:text-primary-dark"
        >
          {isOpen ? 'Hide' : 'Manage'}
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Connected devices summary */}
      <div className="mb-2 flex flex-wrap gap-2">
        {connectedDevices.length > 0 ? (
          connectedDevices.map(device => (
            <div 
              key={device.id}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              <Check className="h-3 w-3" />
              {device.name}
            </div>
          ))
        ) : (
          <div className="w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 text-center text-xs text-text-light">
            No devices connected
          </div>
        )}
      </div>
      
      {/* Success/Error messages */}
      {successMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-success/10 p-2 text-xs text-success">
          <Check className="h-3 w-3 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}
      
      {errorMessage && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-error/10 p-2 text-xs text-error">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      {/* Expanded device list */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-card))]"
          >
            <div className="max-h-64 overflow-y-auto p-2">
              {devices.map(device => (
                <div 
                  key={device.id}
                  className="mb-2 flex items-center justify-between rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface-1))] p-2 last:mb-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                      <ImageWithFallback
                        src={device.imageUrl}
                        alt={device.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{device.name}</h4>
                      <p className="text-xs text-text-light">{device.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => device.connected ? handleDisconnect(device.id) : handleConnect(device.id)}
                    disabled={connecting === device.id}
                    className={`ml-2 flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                      device.connected
                        ? 'bg-error/10 text-error hover:bg-error/20'
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    {connecting === device.id ? (
                      <Loader className="h-3 w-3 animate-spin" />
                    ) : device.connected ? (
                      'Disconnect'
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Connect
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="border-t border-[hsl(var(--color-border))] p-2">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full rounded-lg bg-[hsl(var(--color-surface-1))] px-3 py-2 text-xs text-text-light hover:bg-[hsl(var(--color-card-hover))] hover:text-text"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceDropdown;